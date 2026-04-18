import React, { useState, useMemo, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faPen, faTrash } from '@fortawesome/free-solid-svg-icons';
import { useBarcodeConfigs } from './useBarcodeConfigs';
import { barcodeConfigService } from './barcodeConfigService';
import { BarcodeConfig, BarcodeConfigFormData } from './barcode.interface';
import toast from 'react-hot-toast';
import './BarcodeConfigPanel.css';

// ══════════════════════════════════════════════════════════════════════
// Valores iniciales del formulario
// ══════════════════════════════════════════════════════════════════════

const EMPTY_FORM: BarcodeConfigFormData = {
  prefix: '20',
  plu_length: 5,
  value_length: 5,
  value_type: 'PRICE',
  decimal_places: 2,
  descripcion: '',
};

// ══════════════════════════════════════════════════════════════════════
// Componente principal
// ══════════════════════════════════════════════════════════════════════

const BarcodeConfigPanel: React.FC = () => {
  const { configs, loading, error, fetchConfigs } = useBarcodeConfigs();
  const [formData, setFormData] = useState<BarcodeConfigFormData>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [testCode, setTestCode] = useState('');
  const formRef = useRef<HTMLDivElement | null>(null);

  // ── Helpers ────────────────────────────────────────────────────────

  const totalLength = formData.prefix.length + formData.plu_length + formData.value_length;
  const isValidLength = totalLength === 12;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === 'plu_length' || name === 'value_length' || name === 'decimal_places'
          ? parseInt(value) || 0
          : value,
    }));
  };

  const resetForm = () => {
    setFormData(EMPTY_FORM);
    setEditingId(null);
    setShowForm(false);
  };

  const scrollToForm = () => {
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  // ── CRUD ───────────────────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValidLength) {
      toast.error(`La suma de longitudes debe ser 12 (actual: ${totalLength})`);
      return;
    }

    try {
      if (editingId) {
        await barcodeConfigService.update(editingId, formData);
        toast.success('Configuración actualizada');
      } else {
        await barcodeConfigService.create(formData);
        toast.success('Configuración creada');
      }
      resetForm();
      fetchConfigs();
    } catch (err: any) {
      const msg = err.response?.data?.errorMessage || err.response?.data?.message || 'Error al guardar';
      toast.error(msg);
    }
  };

  const handleEdit = (config: BarcodeConfig) => {
    setFormData({
      prefix: config.prefix,
      plu_length: config.plu_length,
      value_length: config.value_length,
      value_type: config.value_type,
      decimal_places: config.decimal_places,
      descripcion: config.descripcion || '',
    });
    setEditingId(config.id_config);
    setShowForm(true);
    scrollToForm();
  };

  const handleDelete = async (id: number) => {
    try {
      await barcodeConfigService.delete(id);
      toast.success('Configuración eliminada');
      fetchConfigs();
    } catch (err: any) {
      const msg = err.response?.data?.errorMessage || 'Error al eliminar';
      toast.error(msg);
    }
  };

  const handleNew = () => {
    resetForm();
    setShowForm(true);
    scrollToForm();
  };

  // ── Live Preview (parsing local) ──────────────────────────────────

  const previewResult = useMemo(() => {
    if (testCode.length !== 13 || !/^\d+$/.test(testCode)) {
      return null;
    }

    const prefix = formData.prefix;
    if (!testCode.startsWith(prefix)) {
      return { type: 'STANDARD' as const };
    }

    const prefixLen = prefix.length;
    const pluStart = prefixLen;
    const pluEnd = pluStart + formData.plu_length;
    const valueStart = pluEnd;
    const valueEnd = valueStart + formData.value_length;
    const checkDigit = testCode.charAt(12);

    const plu = testCode.substring(pluStart, pluEnd);
    const rawValue = testCode.substring(valueStart, valueEnd);

    const intValue = parseInt(rawValue, 10);
    const divisor = Math.pow(10, formData.decimal_places);
    const decodedValue = intValue / divisor;

    return {
      type: 'WEIGHTED' as const,
      prefix: testCode.substring(0, prefixLen),
      plu,
      rawValue,
      checkDigit,
      decodedValue,
    };
  }, [testCode, formData]);

  // ══════════════════════════════════════════════════════════════════
  // Render
  // ══════════════════════════════════════════════════════════════════

  return (
    <div>
      {/* ── Header + botón crear ──────────────────────────────────── */}
      <div className="admin-section-header">
        <div>
          <h1>Configuración de Balanza</h1>
          <p className="admin-section-subtitle">
            Configurá cómo se interpretan los códigos EAN-13 de circulación restringida
          </p>
        </div>
        <button className="admin-btn-primary" onClick={handleNew}>
          <FontAwesomeIcon icon={faPlus} /> Nueva Configuración
        </button>
      </div>

      {/* ── Estados de carga ──────────────────────────────────────── */}
      {loading && <div className="admin-loading">Cargando configuraciones...</div>}
      {error && <div className="admin-error">Error: {error}</div>}

      {/* ── Tabla de configuraciones ──────────────────────────────── */}
      {!loading && !error && (
        <div className="barcode-table-wrapper">
          <table className="barcode-table">
            <thead>
              <tr>
                <th>Prefijo</th>
                <th>PLU</th>
                <th>Valor</th>
                <th>Tipo</th>
                <th>Decimales</th>
                <th>Descripción</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {configs.map((cfg) => (
                <tr key={cfg.id_config}>
                  <td>
                    <span className="barcode-prefix-chip">{cfg.prefix}</span>
                  </td>
                  <td>{cfg.plu_length} dígitos</td>
                  <td>{cfg.value_length} dígitos</td>
                  <td>
                    <span className={`barcode-type-chip ${cfg.value_type === 'PRICE' ? 'price' : 'weight'}`}>
                      {cfg.value_type === 'PRICE' ? '💰 Precio' : '⚖️ Peso'}
                    </span>
                  </td>
                  <td>{cfg.decimal_places}</td>
                  <td>{cfg.descripcion || '—'}</td>
                  <td>
                    <span className={`barcode-status-chip ${cfg.activo ? 'active' : 'inactive'}`}>
                      {cfg.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td>
                    <div className="barcode-actions-cell">
                      <button
                        className="admin-btn-icon edit"
                        onClick={() => handleEdit(cfg)}
                        title="Editar"
                      >
                        <FontAwesomeIcon icon={faPen} />
                      </button>
                      <button
                        className="admin-btn-icon delete"
                        onClick={() => handleDelete(cfg.id_config)}
                        title="Eliminar"
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {configs.length === 0 && (
                <tr>
                  <td colSpan={8} className="barcode-empty-row">
                    No hay configuraciones de balanza. Creá una para empezar.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Formulario crear/editar ──────────────────────────────── */}
      {showForm && (
        <div ref={formRef}>
          <div className="barcode-form-panel">
            <h2>
              {editingId ? '✏️ Editar configuración' : '➕ Nueva configuración'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="barcode-form-grid">
                <div className="barcode-form-group">
                  <label htmlFor="barcode-prefix">Prefijo</label>
                  <input
                    id="barcode-prefix"
                    type="text"
                    name="prefix"
                    value={formData.prefix}
                    onChange={handleChange}
                    maxLength={5}
                    placeholder="20"
                    required
                  />
                  <span className="barcode-form-hint">
                    Primeros dígitos del EAN-13 (ej: 20, 21, 22)
                  </span>
                </div>

                <div className="barcode-form-group">
                  <label htmlFor="barcode-plu-length">Longitud PLU</label>
                  <input
                    id="barcode-plu-length"
                    type="number"
                    name="plu_length"
                    value={formData.plu_length}
                    onChange={handleChange}
                    min={1}
                    max={10}
                    required
                  />
                  <span className="barcode-form-hint">
                    Dígitos del código interno del producto
                  </span>
                </div>

                <div className="barcode-form-group">
                  <label htmlFor="barcode-value-length">Longitud Valor</label>
                  <input
                    id="barcode-value-length"
                    type="number"
                    name="value_length"
                    value={formData.value_length}
                    onChange={handleChange}
                    min={1}
                    max={10}
                    required
                  />
                  <span className="barcode-form-hint">
                    Dígitos del precio/peso embebido
                  </span>
                </div>

                <div className="barcode-form-group">
                  <label htmlFor="barcode-value-type">Tipo de Valor</label>
                  <select
                    id="barcode-value-type"
                    name="value_type"
                    value={formData.value_type}
                    onChange={handleChange}
                  >
                    <option value="PRICE">💰 Precio</option>
                    <option value="WEIGHT">⚖️ Peso</option>
                  </select>
                </div>

                <div className="barcode-form-group">
                  <label htmlFor="barcode-decimal-places">Decimales</label>
                  <input
                    id="barcode-decimal-places"
                    type="number"
                    name="decimal_places"
                    value={formData.decimal_places}
                    onChange={handleChange}
                    min={0}
                    max={5}
                    required
                  />
                  <span className="barcode-form-hint">
                    Para Precio: cuántos dígitos son centavos (ej: 2).<br/>
                    Para Peso: si la balanza devuelve gramos (ej: 1250), <strong>poné 3 decimales</strong> para que en caja se cobre como 1.250 kg.
                  </span>
                </div>

                <div className="barcode-form-group">
                  <label htmlFor="barcode-descripcion">Descripción</label>
                  <input
                    id="barcode-descripcion"
                    type="text"
                    name="descripcion"
                    value={formData.descripcion}
                    onChange={handleChange}
                    placeholder="Ej: Balanza Systel"
                  />
                </div>

                {/* ── Indicador de longitud ──── */}
                <div className="barcode-length-indicator">
                  <span>
                    Prefijo ({formData.prefix.length}) + PLU ({formData.plu_length}) + Valor ({formData.value_length}) + Check (1)
                  </span>
                  <span className={`length-sum ${isValidLength ? 'length-ok' : 'length-error'}`}>
                    = {totalLength + 1} / 13 {isValidLength ? '✓' : '✗'}
                  </span>
                </div>

                <div className="barcode-form-actions">
                  <button type="button" className="btn-secondary" onClick={resetForm}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn-primary" disabled={!isValidLength}>
                    {editingId ? 'Actualizar' : 'Crear'}
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* ═══ LIVE PREVIEW ═══════════════════════════════════════ */}
          <div className="barcode-preview">
            <h3>
              <span className="preview-icon">🔍</span>
              Simulador en Vivo
            </h3>

            <input
              type="text"
              className="barcode-preview-input"
              value={testCode}
              onChange={(e) => setTestCode(e.target.value.replace(/\D/g, '').slice(0, 13))}
              placeholder="Pegá un código de 13 dígitos para probar..."
              maxLength={13}
            />

            {/* Sin input aún */}
            {testCode.length === 0 && (
              <div className="barcode-preview-placeholder">
                Ingresá un código EAN-13 para ver cómo se parsea con la configuración actual
              </div>
            )}

            {/* Input incompleto */}
            {testCode.length > 0 && testCode.length < 13 && (
              <div className="barcode-preview-placeholder">
                Faltan {13 - testCode.length} dígitos...
              </div>
            )}

            {/* Código estándar (no coincide con prefijo) */}
            {previewResult && previewResult.type === 'STANDARD' && (
              <div className="barcode-preview-standard">
                <span className="standard-icon">📦</span>
                <strong>Código Estándar</strong>
                <br />
                El prefijo "{testCode.substring(0, formData.prefix.length)}" no coincide con "{formData.prefix}".
                <br />
                Se buscará el producto por código de barras completo.
              </div>
            )}

            {/* Código de balanza → segmentos de colores */}
            {previewResult && previewResult.type === 'WEIGHTED' && (
              <>
                <div className="barcode-segments">
                  <div className="barcode-segment prefix" style={{ width: `${(formData.prefix.length / 13) * 100}%` }}>
                    <span className="barcode-segment-digits">{previewResult.prefix}</span>
                    <span className="barcode-segment-label">Prefijo</span>
                  </div>
                  <div className="barcode-segment plu" style={{ width: `${(formData.plu_length / 13) * 100}%` }}>
                    <span className="barcode-segment-digits">{previewResult.plu}</span>
                    <span className="barcode-segment-label">PLU</span>
                  </div>
                  <div className="barcode-segment value" style={{ width: `${(formData.value_length / 13) * 100}%` }}>
                    <span className="barcode-segment-digits">{previewResult.rawValue}</span>
                    <span className="barcode-segment-label">
                      {formData.value_type === 'PRICE' ? 'Precio' : 'Peso'}
                    </span>
                  </div>
                  <div className="barcode-segment check">
                    <span className="barcode-segment-digits">{previewResult.checkDigit}</span>
                    <span className="barcode-segment-label">Check</span>
                  </div>
                </div>

                <div className="barcode-decoded-result">
                  <div className="barcode-decoded-card">
                    <div className="decoded-label">Código PLU</div>
                    <div className="decoded-value plu-value">{previewResult.plu}</div>
                  </div>
                  <div className="barcode-decoded-card">
                    <div className="decoded-label">
                      {formData.value_type === 'PRICE' ? 'Precio Decodificado' : 'Peso Decodificado'}
                    </div>
                    <div className="decoded-value price-value">
                      {formData.value_type === 'PRICE'
                        ? `$${previewResult.decodedValue.toFixed(formData.decimal_places)}`
                        : formData.decimal_places === 0
                          ? `${previewResult.decodedValue} kg (⚠ Asegurate de usar decimales si esto debería ser gramos)`
                          : `${previewResult.decodedValue.toFixed(formData.decimal_places)} kg`
                      }
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BarcodeConfigPanel;
