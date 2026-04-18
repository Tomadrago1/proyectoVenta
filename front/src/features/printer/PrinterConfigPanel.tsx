import React, { useState, useEffect, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPrint, faPlug, faCog, faCheck, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import toast from 'react-hot-toast';
import { useWebUSBPrinter, ConnectedPrinterInfo } from './useWebUSBPrinter';
import { printerConfigService } from './printerConfigService';
import { encodeTestTicket } from './ticketEncoder';
import { PaperWidth, PrinterConfig } from './printerConfig.interface';
import './PrinterConfigPanel.css';

type WizardStep = 1 | 2 | 3;

const PrinterConfigPanel: React.FC = () => {
  const printer = useWebUSBPrinter();

  // ── Estado del wizard ─────────────────────────────────────
  const [step, setStep] = useState<WizardStep>(1);
  const [paperWidth, setPaperWidth] = useState<PaperWidth>('80mm');
  const [printerName, setPrinterName] = useState('');
  const [saving, setSaving] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);

  // ── Config existente ──────────────────────────────────────
  const [existingConfig, setExistingConfig] = useState<PrinterConfig | null>(null);
  const [loading, setLoading] = useState(true);

  // Cargar config existente al montar
  useEffect(() => {
    const load = async () => {
      try {
        const config = await printerConfigService.get();
        setExistingConfig(config);
        if (config) {
          setPaperWidth(config.paper_width);
          setPrinterName(config.printer_name || '');
        }
      } catch (err) {
        console.error('Error cargando config de impresora:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Intentar auto-reconexión si hay config guardada
  useEffect(() => {
    if (existingConfig && printer.status === 'disconnected') {
      printer.reconnect();
    }
  }, [existingConfig]);

  // ── Handlers ──────────────────────────────────────────────

  const handleConnect = useCallback(async () => {
    const success = await printer.connect();
    if (success) {
      setStep(2);
      // Pre-llenar nombre con el nombre del producto USB
      if (printer.info?.productName && !printerName) {
        setPrinterName(printer.info.productName);
      }
    }
  }, [printer, printerName]);

  // Actualizar nombre cuando el printer.info cambie
  useEffect(() => {
    if (printer.info?.productName && !printerName) {
      setPrinterName(printer.info.productName);
    }
  }, [printer.info]);

  const handleTestPrint = useCallback(async () => {
    setTestResult(null);
    const cols = paperWidth === '58mm' ? 32 : 48;
    const data = encodeTestTicket(cols);
    const success = await printer.print(data);
    setTestResult(success ? 'success' : 'error');
  }, [printer, paperWidth]);

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      const config = await printerConfigService.save({
        paper_width: paperWidth,
        vendor_id: printer.info?.vendorId ?? null,
        product_id: printer.info?.productId ?? null,
        printer_name: printerName || null,
      });
      setExistingConfig(config);
      toast.success('Configuración de impresora guardada correctamente.');
      setStep(1);
    } catch (err: any) {
      console.error('Error guardando config:', err);
      toast.error('Error al guardar la configuración.');
    } finally {
      setSaving(false);
    }
  }, [paperWidth, printerName, printer.info]);

  const handleReconfigure = useCallback(() => {
    setExistingConfig(null);
    setStep(1);
    setTestResult(null);
  }, []);

  // ── Render: WebUSB no soportado ───────────────────────────
  if (!printer.isSupported) {
    return (
      <div className="admin-content-section">
        <div className="admin-section-header">
          <div>
            <h1>Configuración de Impresora</h1>
            <p className="admin-section-subtitle">Configurá tu impresora térmica</p>
          </div>
        </div>
        <div className="printer-not-supported">
          <span className="warning-icon">⚠️</span>
          <h3>Navegador no compatible</h3>
          <p>
            La impresión directa requiere <strong>Google Chrome</strong> o{' '}
            <strong>Microsoft Edge</strong> con conexión <strong>HTTPS</strong>.
            <br />
            Verificá que estés usando un navegador compatible.
          </p>
        </div>
      </div>
    );
  }

  // ── Render: Ya hay config guardada ────────────────────────
  if (existingConfig && step === 1 && !loading) {
    return (
      <div className="admin-content-section">
        <div className="admin-section-header">
          <div>
            <h1>Configuración de Impresora</h1>
            <p className="admin-section-subtitle">Impresora configurada para tu negocio</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span className={`printer-status-badge ${printer.status}`}>
              <span className={`printer-status-dot ${printer.status}`}></span>
              {printer.status === 'connected' ? 'Conectada' :
               printer.status === 'connecting' ? 'Conectando...' : 'Desconectada'}
            </span>
          </div>
        </div>

        {/* Tarjeta de configuración actual */}
        <div className="printer-current-config">
          <h3>⚙️ Configuración actual</h3>
          <div className="printer-config-grid">
            <div className="printer-config-item">
              <div className="config-label">Nombre</div>
              <div className="config-value">{existingConfig.printer_name || 'Sin nombre'}</div>
            </div>
            <div className="printer-config-item">
              <div className="config-label">Ancho de papel</div>
              <div className="config-value">{existingConfig.paper_width}</div>
            </div>
            <div className="printer-config-item">
              <div className="config-label">Columnas</div>
              <div className="config-value">{existingConfig.columns_count}</div>
            </div>
            <div className="printer-config-item">
              <div className="config-label">USB IDs</div>
              <div className="config-value">
                <code>{existingConfig.vendor_id || '—'}:{existingConfig.product_id || '—'}</code>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {printer.status === 'connected' && (
              <button className="printer-btn-success" onClick={handleTestPrint} id="btn-test-print">
                <FontAwesomeIcon icon={faPrint} /> Imprimir prueba
              </button>
            )}
            {printer.status === 'disconnected' && (
              <button className="printer-btn-primary" onClick={() => printer.connect()} id="btn-reconnect-printer">
                <FontAwesomeIcon icon={faPlug} /> Conectar impresora
              </button>
            )}
            <button className="printer-btn-secondary" onClick={handleReconfigure} id="btn-reconfigure-printer">
              <FontAwesomeIcon icon={faCog} /> Reconfigurar
            </button>
          </div>

          {testResult && (
            <div className={`printer-test-result ${testResult}`}>
              {testResult === 'success' ? '✅ Prueba de impresión exitosa' : '❌ Error al imprimir. Verificá la conexión.'}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="admin-content-section">
        <div className="admin-loading">Cargando configuración de impresora...</div>
      </div>
    );
  }

  // ── Render: Wizard de configuración ───────────────────────
  return (
    <div className="admin-content-section">
      <div className="admin-section-header">
        <div>
          <h1>Configuración de Impresora</h1>
          <p className="admin-section-subtitle">Conectá y configurá tu impresora térmica</p>
        </div>
      </div>

      {/* Error global */}
      {printer.error && (
        <div className="printer-error-alert">
          <FontAwesomeIcon icon={faExclamationTriangle} />
          {printer.error}
        </div>
      )}

      {/* Stepper */}
      <div className="printer-wizard-steps">
        <div className={`printer-step ${step === 1 ? 'active' : step > 1 ? 'completed' : 'pending'}`}>
          <span className="printer-step-number">{step > 1 ? '✓' : '1'}</span>
          <span className="printer-step-label">Conectar</span>
        </div>
        <div className={`printer-step-connector ${step > 1 ? 'done' : ''}`}></div>
        <div className={`printer-step ${step === 2 ? 'active' : step > 2 ? 'completed' : 'pending'}`}>
          <span className="printer-step-number">{step > 2 ? '✓' : '2'}</span>
          <span className="printer-step-label">Configurar</span>
        </div>
        <div className={`printer-step-connector ${step > 2 ? 'done' : ''}`}></div>
        <div className={`printer-step ${step === 3 ? 'active' : 'pending'}`}>
          <span className="printer-step-number">3</span>
          <span className="printer-step-label">Probar y Guardar</span>
        </div>
      </div>

      {/* ═══ PASO 1: Conectar ═══ */}
      {step === 1 && (
        <div className="printer-step-card">
          <h3>🔌 Paso 1: Conectar impresora</h3>
          <p className="step-description">
            Conectá tu impresora térmica por USB y hacé click en el botón.
            El navegador te pedirá seleccionar el dispositivo.
          </p>

          <button
            className="printer-connect-btn"
            onClick={handleConnect}
            disabled={printer.status === 'connecting'}
            id="btn-connect-printer"
          >
            <span className="btn-icon">🖨️</span>
            {printer.status === 'connecting' ? 'Conectando...' : 'Seleccionar impresora USB'}
          </button>

          {printer.status === 'connected' && printer.info && (
            <div style={{ marginTop: '20px' }}>
              <PrinterInfoDisplay info={printer.info} />
              <div className="printer-actions">
                <button className="printer-btn-primary" onClick={() => setStep(2)}>
                  Siguiente →
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ═══ PASO 2: Configurar ═══ */}
      {step === 2 && (
        <div className="printer-step-card">
          <h3>⚙️ Paso 2: Configurar papel</h3>
          <p className="step-description">
            Seleccioná el ancho del rollo de papel que usa tu impresora.
          </p>

          {printer.info && <PrinterInfoDisplay info={printer.info} />}

          <div className="printer-paper-selector">
            <button
              className={`printer-paper-option ${paperWidth === '58mm' ? 'selected' : ''}`}
              onClick={() => setPaperWidth('58mm')}
              id="btn-paper-58mm"
            >
              <span className="printer-paper-icon">📄</span>
              <span className="printer-paper-label">58mm</span>
              <span className="printer-paper-desc">32 columnas</span>
            </button>
            <button
              className={`printer-paper-option ${paperWidth === '80mm' ? 'selected' : ''}`}
              onClick={() => setPaperWidth('80mm')}
              id="btn-paper-80mm"
            >
              <span className="printer-paper-icon">📋</span>
              <span className="printer-paper-label">80mm</span>
              <span className="printer-paper-desc">48 columnas</span>
            </button>
          </div>

          <div className="printer-name-group">
            <label htmlFor="printer-name-input">Nombre de la impresora (opcional)</label>
            <input
              id="printer-name-input"
              type="text"
              value={printerName}
              onChange={e => setPrinterName(e.target.value)}
              placeholder="Ej: Impresora Caja 1"
              maxLength={100}
            />
          </div>

          <div className="printer-actions">
            <button className="printer-btn-secondary" onClick={() => setStep(1)}>
              ← Atrás
            </button>
            <button className="printer-btn-primary" onClick={() => setStep(3)}>
              Siguiente →
            </button>
          </div>
        </div>
      )}

      {/* ═══ PASO 3: Probar y Guardar ═══ */}
      {step === 3 && (
        <div className="printer-step-card">
          <h3>🧪 Paso 3: Probar y Guardar</h3>
          <p className="step-description">
            Probá que la impresora funcione correctamente antes de guardar.
          </p>

          {/* Resumen */}
          <div className="printer-config-grid" style={{ marginBottom: '24px' }}>
            <div className="printer-config-item">
              <div className="config-label">Impresora</div>
              <div className="config-value">{printerName || printer.info?.productName || '—'}</div>
            </div>
            <div className="printer-config-item">
              <div className="config-label">Papel</div>
              <div className="config-value">{paperWidth} ({paperWidth === '58mm' ? 32 : 48} cols)</div>
            </div>
          </div>

          <button
            className="printer-btn-success"
            onClick={handleTestPrint}
            disabled={printer.status !== 'connected'}
            style={{ width: '100%', justifyContent: 'center', marginBottom: '16px' }}
            id="btn-test-print-wizard"
          >
            <FontAwesomeIcon icon={faPrint} /> Imprimir página de prueba
          </button>

          {printer.status !== 'connected' && (
            <div className="printer-error-alert">
              <FontAwesomeIcon icon={faExclamationTriangle} />
              La impresora se desconectó. Volvé al paso 1 para reconectar.
            </div>
          )}

          {testResult && (
            <div className={`printer-test-result ${testResult}`}>
              {testResult === 'success'
                ? '✅ ¡Impresión exitosa! Podés guardar la configuración.'
                : '❌ Error al imprimir. Verificá la conexión y volvé a intentar.'}
            </div>
          )}

          <div className="printer-actions">
            <button className="printer-btn-secondary" onClick={() => { setStep(2); setTestResult(null); }}>
              ← Atrás
            </button>
            <button
              className="printer-btn-primary"
              onClick={handleSave}
              disabled={saving}
              id="btn-save-printer-config"
            >
              <FontAwesomeIcon icon={faCheck} />
              {saving ? 'Guardando...' : 'Guardar configuración'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ── Sub-componente: Info de la impresora conectada ──────────
const PrinterInfoDisplay: React.FC<{ info: ConnectedPrinterInfo }> = ({ info }) => (
  <div className="printer-info-card">
    <div className="printer-info-row">
      <span className="printer-info-label">Dispositivo</span>
      <span className="printer-info-value">{info.productName}</span>
    </div>
    <div className="printer-info-row">
      <span className="printer-info-label">Fabricante</span>
      <span className="printer-info-value">{info.manufacturerName}</span>
    </div>
    <div className="printer-info-row">
      <span className="printer-info-label">IDs USB</span>
      <span className="printer-info-value">
        <code>VID: 0x{info.vendorId.toString(16).toUpperCase().padStart(4, '0')}</code>{' '}
        <code>PID: 0x{info.productId.toString(16).toUpperCase().padStart(4, '0')}</code>
      </span>
    </div>
  </div>
);

export default PrinterConfigPanel;
