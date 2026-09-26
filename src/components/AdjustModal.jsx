import React, { useState, useMemo, useEffect } from 'react';
import { SlidersHorizontal, X, Plus, Minus, RotateCcw, Clock } from 'lucide-react';
import { calculatePrayerTimes, getPrayerName } from '../utils/prayerHelper.js';
import { getTranslations } from '../utils/i18n.js';
import './Modals.css';

export default function AdjustModal({
  isOpen,
  onClose,
  city,
  adjustments,
  onSaveAdjustments,
  language = 'id',
}) {
  const [localAdjustments, setLocalAdjustments] = useState(
    adjustments || { fajr: 0, sunrise: 0, dhuhr: 0, asr: 0, maghrib: 0, isha: 0 }
  );
  const t = getTranslations(language);

  // Sync adjustments when modal opens or adjustments prop changes
  useEffect(() => {
    if (adjustments) {
      setLocalAdjustments(adjustments);
    }
  }, [adjustments, isOpen]);

  const targetCity = useMemo(() => {
    return (
      city || {
        name: 'Jakarta',
        region: 'DKI Jakarta',
        lat: -6.2088,
        lng: 106.8456,
        timezone: 'Asia/Jakarta',
      }
    );
  }, [city]);

  // Base prayer times (without any custom adjustments)
  const baseCalc = useMemo(() => {
    return calculatePrayerTimes(targetCity, new Date(), {}, language);
  }, [targetCity, language]);

  // Dynamically adjusted prayer times (with current localAdjustments)
  const adjustedCalc = useMemo(() => {
    return calculatePrayerTimes(targetCity, new Date(), localAdjustments, language);
  }, [targetCity, localAdjustments, language]);

  if (!isOpen) return null;

  const prayers = [
    { key: 'fajr' },
    { key: 'sunrise' },
    { key: 'dhuhr' },
    { key: 'asr' },
    { key: 'maghrib' },
    { key: 'isha' },
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
      <div className="modal-dialog adjust-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-wrap">
            <SlidersHorizontal size={16} className="modal-title-icon" />
            <h3 className="modal-title">{t.ui.adjustTime}</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close">
            <X size={16} />
          </button>
        </div>

        <div className="modal-subtitle adjust-modal-subtitle">
          <span>{language === 'en' ? 'Location: ' : 'Lokasi: '}</span>
          <strong className="adjust-city-highlight">{targetCity.name}</strong>
          {targetCity.region && <span> ({targetCity.region})</span>}
          <div className="adjust-subtitle-hint">
            {language === 'en'
              ? 'Preview and fine-tune exact prayer times (-15m to +15m).'
              : 'Pantau dan sesuaikan jam sholat secara langsung (-15m s/d +15m).'}
          </div>
        </div>

        <div className="adjust-list">
          {prayers.map(({ key }) => {
            const val = Number(localAdjustments[key]) || 0;
            const sign = val > 0 ? `+${val}` : `${val}`;
            const label = getPrayerName(key, language);

            const baseTime =
              baseCalc?.allPrayers?.find((p) => p.key === key)?.time || '--:--';
            const adjustedTime =
              adjustedCalc?.allPrayers?.find((p) => p.key === key)?.time || '--:--';
            const isModified = val !== 0;

            return (
              <div
                key={key}
                className={`adjust-item ${isModified ? 'modified-row' : ''}`}
              >
                <div className="adjust-item-label-col">
                  <span className="adjust-label">{label}</span>
                  {isModified && (
                    <span className="adjust-base-hint">
                      {language === 'en' ? 'base: ' : 'asli: '}
                      {baseTime}
                    </span>
                  )}
                </div>

                <div className="adjust-time-preview-wrap">
                  <div className={`adjust-time-pill ${isModified ? 'modified' : ''}`}>
                    <Clock size={11} className="adjust-time-icon" />
                    <span className="adjust-time-text">{adjustedTime}</span>
                  </div>
                </div>

                <div className="adjust-stepper">
                  <button
                    className="stepper-btn"
                    onClick={() => updateOffset(key, -1)}
                    disabled={val <= -15}
                    aria-label="Decrease 1 minute"
                  >
                    <Minus size={13} />
                  </button>
                  <span className={`stepper-val ${isModified ? 'modified' : ''}`}>
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
