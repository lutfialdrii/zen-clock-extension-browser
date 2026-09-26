import React, { useState, useMemo } from 'react';
import { Search, X, Check, MapPin, Navigation, Globe, Loader2, AlertCircle } from 'lucide-react';
import { searchCities, ALL_CITIES } from '../utils/citiesData.js';
import { getTranslations } from '../utils/i18n.js';
import './Modals.css';

function formatTzBadge(timezone) {
  if (!timezone) return null;
  if (timezone === 'Asia/Jakarta') return 'WIB';
  if (timezone === 'Asia/Makassar') return 'WITA';
  if (timezone === 'Asia/Jayapura') return 'WIT';
  const parts = timezone.split('/');
  return parts[parts.length - 1].replace(/_/g, ' ');
}

export default function CityPickerModal({
  isOpen,
  onClose,
  currentCity,
  onSelectCity,
  language = 'id',
}) {
  const [search, setSearch] = useState('');
  const [isDetectingGps, setIsDetectingGps] = useState(false);
  const [gpsError, setGpsError] = useState(null);
  const [isSearchingOnline, setIsSearchingOnline] = useState(false);
  const [onlineResults, setOnlineResults] = useState(null);
  const [onlineError, setOnlineError] = useState(null);

  const t = getTranslations(language);

  // Filter in-memory catalog (539+ cities across 38 provinces + popular global)
  const localResults = useMemo(() => {
    return searchCities(search, 50);
  }, [search]);

  if (!isOpen) return null;

  // Handle GPS Auto-Detection
  const handleDetectGps = () => {
    if (!navigator.geolocation) {
      setGpsError(language === 'en' ? 'Geolocation is not supported by your browser' : 'Geolocation tidak didukung browser ini');
      return;
    }

    setIsDetectingGps(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        let name = language === 'en' ? 'My Location' : 'Lokasi Saya';
        let region = language === 'en' ? 'GPS Detected' : 'Terdeteksi via GPS';
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Jakarta';

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=12&addressdetails=1`
          );
          if (res.ok) {
            const data = await res.json();
            if (data && data.address) {
              const addr = data.address;
              const locality = addr.city || addr.regency || addr.town || addr.village || addr.county || addr.state_district;
              const country = addr.country || '';
              if (locality) name = locality;
              if (country) region = country;
            }
          }
        } catch {
          // If offline / geocode fails, fallback to default name & detected coords
        }

        const detected = {
          name,
          region,
          lat,
          lng,
          timezone,
          isGps: true,
        };

        setIsDetectingGps(false);
        onSelectCity(detected);
        onClose();
      },
      (err) => {
        setIsDetectingGps(false);
        let msg = t.ui.gpsDenied;
        if (err.code === 2) msg = language === 'en' ? 'Position unavailable' : 'Posisi tidak ditemukan';
        if (err.code === 3) msg = language === 'en' ? 'Request timed out' : 'Permintaan GPS kedaluwarsa';
        setGpsError(msg);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Handle Global Search via OpenStreetMap Nominatim
  const handleSearchOnline = async () => {
    const q = search.trim();
    if (!q) return;

    setIsSearchingOnline(true);
    setOnlineError(null);
    setOnlineResults(null);

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=8&addressdetails=1`
      );

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const parsed = data.map((item) => {
          const lat = parseFloat(item.lat);
          const lng = parseFloat(item.lon);
          const addr = item.address || {};
          const name = addr.city || addr.town || addr.municipality || addr.village || item.display_name.split(',')[0].trim();
          const country = addr.country || '';
          const state = addr.state || addr.region || '';
          const region = [state, country].filter(Boolean).join(', ') || item.display_name.split(',').slice(1, 3).join(',').trim();

          // Infer timezone for Indonesian cities from longitude or use resolved timezone
          let timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Jakarta';
          if (addr.country_code === 'id') {
            if (lng < 110) timezone = 'Asia/Jakarta';
            else if (lng < 125) timezone = 'Asia/Makassar';
            else timezone = 'Asia/Jayapura';
          }

          return {
            name,
            region,
            lat,
            lng,
            timezone,
            isOnline: true,
          };
        });

        setOnlineResults(parsed);
      } else {
        setOnlineResults([]);
      }
    } catch {
      setOnlineError(language === 'en' ? 'Failed to fetch global search. Please check your internet connection.' : 'Gagal mencari lokasi online. Periksa koneksi internet Anda.');
    } finally {
      setIsSearchingOnline(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog city-picker-dialog" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title-wrap">
            <MapPin size={16} className="modal-title-icon" />
            <h3 className="modal-title">{t.ui.cityPickerTitle}</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close">
            <X size={16} />
          </button>
        </div>

        {/* GPS Quick Action */}
        <div className="gps-action-container">
          <button
            type="button"
            className={`gps-detect-btn ${isDetectingGps ? 'loading' : ''}`}
            onClick={handleDetectGps}
            disabled={isDetectingGps}
          >
            {isDetectingGps ? (
              <Loader2 size={14} className="spin-icon" />
            ) : (
              <Navigation size={14} className="gps-icon" />
            )}
            <span>{isDetectingGps ? t.ui.detectingGps : t.ui.useGps}</span>
          </button>
          {gpsError && (
            <div className="modal-error-banner">
              <AlertCircle size={12} />
              <span>{gpsError}</span>
            </div>
          )}
        </div>

        {/* Search Box */}
        <div className="modal-search-box">
          <Search size={14} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder={
              language === 'en'
                ? 'Search 500+ cities, regencies, or worldwide...'
                : 'Cari 500+ kota, kabupaten, atau seluruh dunia...'
            }
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setOnlineResults(null);
              setOnlineError(null);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && search.trim()) {
                handleSearchOnline();
              }
            }}
            autoFocus
          />
          {search && (
            <button
              type="button"
              className="search-clear-btn"
              onClick={() => {
                setSearch('');
                setOnlineResults(null);
                setOnlineError(null);
              }}
            >
              <X size={12} />
            </button>
          )}
        </div>

        {/* Global Online Search Trigger Button */}
        {search.trim().length >= 2 && (
          <div className="online-search-trigger-wrap">
            <button
              type="button"
              className="online-search-trigger-btn"
              onClick={handleSearchOnline}
              disabled={isSearchingOnline}
            >
              {isSearchingOnline ? (
                <Loader2 size={13} className="spin-icon" />
              ) : (
                <Globe size={13} className="globe-icon" />
              )}
              <span>
                {isSearchingOnline
                  ? t.ui.searchingOnline
                  : `${t.ui.searchWorldwide} ("${search}")`}
              </span>
            </button>
          </div>
        )}

        {/* Results Container */}
        <div className="city-list-container">
          {/* Online Results Section if user triggered global search */}
          {onlineResults && onlineResults.length > 0 && (
            <div className="results-group">
              <div className="results-group-title">
                <Globe size={12} />
                <span>{t.ui.globalResults}</span>
              </div>
              {onlineResults.map((city, idx) => {
                const isSelected =
                  currentCity?.lat === city.lat && currentCity?.lng === city.lng;
                const tzBadge = formatTzBadge(city.timezone);
                return (
                  <div
                    key={`online-${idx}-${city.lat}-${city.lng}`}
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
                    <div className="city-meta">
                      {tzBadge && <span className="city-tz-badge">{tzBadge}</span>}
                      {isSelected && <Check size={15} className="city-check-icon" />}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {onlineError && (
            <div className="modal-error-banner">
              <AlertCircle size={12} />
              <span>{onlineError}</span>
            </div>
          )}

          {onlineResults && onlineResults.length === 0 && (
            <div className="empty-search-state">
              {language === 'en'
                ? `No online results found for "${search}"`
                : `Tidak ada hasil online untuk "${search}"`}
            </div>
          )}

          {/* Local Catalog Results */}
          <div className="results-group">
            {search && onlineResults && onlineResults.length > 0 && (
              <div className="results-group-title">
                <MapPin size={12} />
                <span>{language === 'en' ? 'Local Catalog' : 'Katalog Lokal (Indonesia & Populer)'}</span>
              </div>
            )}

            {localResults.length === 0 && (!onlineResults || onlineResults.length === 0) ? (
              <div className="empty-search-state">
                <p>{t.ui.noCitiesFound}</p>
                {search.trim().length >= 2 && !isSearchingOnline && (
                  <button
                    type="button"
                    className="empty-state-search-btn"
                    onClick={handleSearchOnline}
                  >
                    <Globe size={13} />
                    <span>{t.ui.searchWorldwide}</span>
                  </button>
                )}
              </div>
            ) : (
              localResults.map((city) => {
                const isSelected =
                  currentCity?.name === city.name &&
                  (!currentCity?.region || currentCity?.region === city.region);
                const tzBadge = formatTzBadge(city.timezone);

                return (
                  <div
                    key={`${city.name}-${city.region}-${city.lat}`}
                    className={`city-list-item ${isSelected ? 'selected' : ''}`}
                    onClick={() => {
                      onSelectCity(city);
                      onClose();
                    }}
                  >
                    <div className="city-info">
                      <div className="city-title-row">
                        <span className="city-name">{city.name}</span>
                        {tzBadge && <span className="city-tz-badge">{tzBadge}</span>}
                      </div>
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
    </div>
  );
}
