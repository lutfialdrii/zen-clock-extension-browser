import React, { useState } from 'react';
import { Search, X, Check, MapPin } from 'lucide-react';
import { POPULAR_CITIES } from '../utils/prayerHelper.js';
import { getTranslations } from '../utils/i18n.js';
import './Modals.css';

export default function CityPickerModal({
  isOpen,
  onClose,
  currentCity,
  onSelectCity,
  language = 'id',
}) {
  const [search, setSearch] = useState('');
  const t = getTranslations(language);

  if (!isOpen) return null;

  const filteredCities = POPULAR_CITIES.filter((city) => {
    const q = search.toLowerCase().trim();
    return (
      city.name.toLowerCase().includes(q) ||
      (city.region && city.region.toLowerCase().includes(q))
    );
  });

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-wrap">
            <MapPin size={16} className="modal-title-icon" />
            <h3 className="modal-title">{t.ui.cityPickerTitle}</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close">
            <X size={16} />
          </button>
        </div>

        <div className="modal-search-box">
          <Search size={14} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder={language === 'en' ? 'Search city or region...' : 'Cari nama kota atau provinsi...'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
          />
        </div>

        <div className="city-list-container">
          {filteredCities.length === 0 ? (
            <div className="empty-search-state">
              {language === 'en' ? 'No cities found' : 'Kota tidak ditemukan'}
            </div>
          ) : (
            filteredCities.map((city) => {
              const isSelected = currentCity?.name === city.name;
              return (
                <div
                  key={`${city.name}-${city.region}`}
                  className={`city-list-item ${isSelected ? 'selected' : ''}`}
                  onClick={() => {
                    onSelectCity(city);
                    onClose();
                  }}
                >
                  <div className="city-info">
                    <span className="city-name">{city.name}</span>
                    <span className="city-region">{city.region}</span>
                  </div>
                  {isSelected && <Check size={16} className="city-check-icon" />}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
