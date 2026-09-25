import React, { useState } from 'react';
import { SlidersHorizontal, X, Plus, Minus, RotateCcw } from 'lucide-react';
import { getTranslations } from '../utils/i18n.js';
import './Modals.css';

export default function AdjustModal({
  isOpen,
  onClose,
  adjustments,
  onSaveAdjustments,
  language = 'id',
}) {
  const [localAdjustments, setLocalAdjustments] = useState(
    adjustments || { fajr: 0, sunrise: 0, dhuhr: 0, asr: 0, maghrib: 0, isha: 0 }
  );
  const t = getTranslations(language);

  if (!isOpen) return null;

  const prayers = [
    { key: 'fajr', label: t.prayers.fajr },
    { key: 'sunrise', label: t.prayers.sunrise },
    { key: 'dhuhr', label: t.prayers.dhuhr },
    { key: 'asr', label: t.prayers.asr },
    { key: 'maghrib', label: t.prayers.maghrib },
    { key: 'isha', label: t.prayers.isha },
  ];

  const updateOffset = (key, delta) => {
    setLocalAdjustments((prev) => {
      const current = Number(prev[key]) || 0;
      const updated = Math.max(-15, Math.min(15, current + delta));
      return { ...prev, [key]: updated };
    });
  };

  const handleReset = () => {
    setLocalAdjustments({ fajr: 0, sunrise: 0, dhuhr: 0, asr: 0, maghrib: 0, isha: 0 });
  };

  const handleSave = () => {
    onSaveAdjustments(localAdjustments);
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-wrap">
            <SlidersHorizontal size={16} className="modal-title-icon" />
            <h3 className="modal-title">{t.ui.adjustTime}</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close">
            <X size={16} />
          </button>
        </div>

        <div className="modal-subtitle">
          {language === 'en'
            ? 'Fine-tune prayer times with minute offsets (-15m to +15m).'
            : 'Sesuaikan jadwal waktu sholat dengan koreksi menit (-15m s/d +15m).'}
        </div>

        <div className="adjust-list">
          {prayers.map(({ key, label }) => {
            const val = Number(localAdjustments[key]) || 0;
            const sign = val > 0 ? `+${val}` : `${val}`;
            return (
              <div key={key} className="adjust-item">
                <span className="adjust-label">{label}</span>
                <div className="adjust-stepper">
                  <button
                    className="stepper-btn"
                    onClick={() => updateOffset(key, -1)}
                    disabled={val <= -15}
                    aria-label="Decrease 1 minute"
                  >
                    <Minus size={13} />
                  </button>
                  <span className={`stepper-val ${val !== 0 ? 'modified' : ''}`}>
                    {sign} m
                  </span>
                  <button
                    className="stepper-btn"
                    onClick={() => updateOffset(key, 1)}
                    disabled={val >= 15}
                    aria-label="Increase 1 minute"
                  >
                    <Plus size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="modal-footer-actions">
          <button className="modal-btn-secondary" onClick={handleReset}>
            <RotateCcw size={13} />
            <span>Reset (0)</span>
          </button>
          <button className="modal-btn-primary" onClick={handleSave}>
            {language === 'en' ? 'Save Adjustments' : 'Simpan Perubahan'}
          </button>
        </div>
      </div>
    </div>
  );
}
