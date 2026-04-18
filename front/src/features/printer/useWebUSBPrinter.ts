/**
 * useWebUSBPrinter.ts
 * 
 * Hook de React para gestionar la conexión WebUSB con la impresora térmica.
 * Permite conectar, desconectar, imprimir y probar una impresora USB
 * directamente desde el navegador (Chrome/Edge).
 */

import { useState, useCallback, useRef, useEffect } from 'react';

// ── Tipos ─────────────────────────────────────────────────────────

export type PrinterStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

export interface ConnectedPrinterInfo {
  vendorId: number;
  productId: number;
  productName: string;
  manufacturerName: string;
}

interface PrinterState {
  status: PrinterStatus;
  info: ConnectedPrinterInfo | null;
  error: string | null;
}

// ── Constantes ────────────────────────────────────────────────────

// Clase USB para impresoras
const USB_PRINTER_CLASS = 0x07;

// Filtros conocidos de impresoras térmicas (vendorIds comunes)
const KNOWN_PRINTER_FILTERS: USBDeviceFilter[] = [
  { classCode: USB_PRINTER_CLASS },
];

// ── Utilidades ────────────────────────────────────────────────────

function findOutEndpoint(device: USBDevice): USBEndpoint | null {
  for (const iface of device.configuration?.interfaces ?? []) {
    for (const alt of iface.alternates) {
      if (alt.interfaceClass === USB_PRINTER_CLASS) {
        const ep = alt.endpoints.find(e => e.direction === 'out');
        if (ep) return ep;
      }
    }
  }
  // Fallback: buscar en cualquier interfaz
  for (const iface of device.configuration?.interfaces ?? []) {
    for (const alt of iface.alternates) {
      const ep = alt.endpoints.find(e => e.direction === 'out');
      if (ep) return ep;
    }
  }
  return null;
}

function findPrinterInterface(device: USBDevice): number {
  for (const iface of device.configuration?.interfaces ?? []) {
    for (const alt of iface.alternates) {
      if (alt.interfaceClass === USB_PRINTER_CLASS) {
        return iface.interfaceNumber;
      }
    }
  }
  // Fallback: primera interfaz
  return device.configuration?.interfaces?.[0]?.interfaceNumber ?? 0;
}

// ── Hook ──────────────────────────────────────────────────────────

export function useWebUSBPrinter() {
  const [state, setState] = useState<PrinterState>({
    status: 'disconnected',
    info: null,
    error: null,
  });

  const deviceRef = useRef<USBDevice | null>(null);
  const endpointRef = useRef<USBEndpoint | null>(null);

  // Limpiar al desmontar
  useEffect(() => {
    return () => {
      if (deviceRef.current) {
        deviceRef.current.close().catch(() => {});
      }
    };
  }, []);

  // Listener de desconexión USB
  useEffect(() => {
    const handleDisconnect = (event: USBConnectionEvent) => {
      if (event.device === deviceRef.current) {
        deviceRef.current = null;
        endpointRef.current = null;
        setState({ status: 'disconnected', info: null, error: null });
      }
    };

    navigator.usb?.addEventListener('disconnect', handleDisconnect);
    return () => {
      navigator.usb?.removeEventListener('disconnect', handleDisconnect);
    };
  }, []);

  /**
   * Abre y configura un dispositivo USB ya seleccionado.
   */
  const openDevice = useCallback(async (device: USBDevice): Promise<boolean> => {
    try {
      await device.open();

      if (device.configuration === null) {
        await device.selectConfiguration(1);
      }

      const ifaceNum = findPrinterInterface(device);
      await device.claimInterface(ifaceNum);

      const endpoint = findOutEndpoint(device);
      if (!endpoint) {
        throw new Error('No se encontró endpoint de salida en la impresora');
      }

      deviceRef.current = device;
      endpointRef.current = endpoint;

      const info: ConnectedPrinterInfo = {
        vendorId: device.vendorId,
        productId: device.productId,
        productName: device.productName || 'Impresora USB',
        manufacturerName: device.manufacturerName || 'Desconocido',
      };

      // Guardar en localStorage para auto-reconexión
      localStorage.setItem('printer_vendorId', String(device.vendorId));
      localStorage.setItem('printer_productId', String(device.productId));

      setState({ status: 'connected', info, error: null });
      return true;
    } catch (err: any) {
      setState({
        status: 'error',
        info: null,
        error: err.message || 'Error al abrir la impresora',
      });
      return false;
    }
  }, []);

  /**
   * Conectar: muestra el diálogo de selección USB del navegador.
   * Debe ser llamado desde un gesto del usuario (click).
   */
  const connect = useCallback(async (): Promise<boolean> => {
    if (!navigator.usb) {
      setState({
        status: 'error',
        info: null,
        error: 'WebUSB no está disponible. Usá Chrome o Edge con HTTPS.',
      });
      return false;
    }

    setState(prev => ({ ...prev, status: 'connecting', error: null }));

    try {
      const device = await navigator.usb.requestDevice({
        filters: KNOWN_PRINTER_FILTERS,
      });

      return await openDevice(device);
    } catch (err: any) {
      // El usuario canceló el diálogo
      if (err.name === 'NotFoundError') {
        setState({ status: 'disconnected', info: null, error: null });
        return false;
      }
      setState({
        status: 'error',
        info: null,
        error: err.message || 'Error al conectar la impresora',
      });
      return false;
    }
  }, [openDevice]);

  /**
   * Intenta reconectar a una impresora previamente pareada.
   */
  const reconnect = useCallback(async (): Promise<boolean> => {
    if (!navigator.usb) return false;

    const vendorId = parseInt(localStorage.getItem('printer_vendorId') || '0', 10);
    const productId = parseInt(localStorage.getItem('printer_productId') || '0', 10);

    if (!vendorId) return false;

    try {
      const devices = await navigator.usb.getDevices();
      const device = devices.find(
        d => d.vendorId === vendorId && d.productId === productId
      );

      if (!device) return false;

      setState(prev => ({ ...prev, status: 'connecting' }));
      return await openDevice(device);
    } catch {
      return false;
    }
  }, [openDevice]);

  /**
   * Desconectar la impresora.
   */
  const disconnect = useCallback(async () => {
    if (deviceRef.current) {
      try {
        await deviceRef.current.close();
      } catch { /* ignore */ }
      deviceRef.current = null;
      endpointRef.current = null;
    }
    setState({ status: 'disconnected', info: null, error: null });
  }, []);

  /**
   * Envía bytes a la impresora.
   */
  const print = useCallback(async (data: Uint8Array): Promise<boolean> => {
    if (!deviceRef.current || !endpointRef.current) {
      setState(prev => ({
        ...prev,
        error: 'Impresora no conectada',
      }));
      return false;
    }

    try {
      await deviceRef.current.transferOut(
        endpointRef.current.endpointNumber,
        data,
      );
      return true;
    } catch (err: any) {
      setState(prev => ({
        ...prev,
        status: 'error',
        error: `Error al imprimir: ${err.message}`,
      }));
      return false;
    }
  }, []);

  return {
    ...state,
    connect,
    reconnect,
    disconnect,
    print,
    isSupported: !!navigator.usb,
  };
}
