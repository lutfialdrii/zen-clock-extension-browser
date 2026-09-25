import React from 'react';
import ReactDOM from 'react-dom/client';

function ReminderPage() {
  const urlParams = new URLSearchParams(window.location.search);
  const prayerName = urlParams.get('prayer') || 'Sholat';
  const prayerTime = urlParams.get('time') || '--:--';
  const location = urlParams.get('location') || 'Lokasi Anda';

  return (
    <div style={{ textAlign: 'center', padding: '2rem', maxWidth: '600px' }}>
      <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🕌</div>
      <h1 style={{ fontSize: '2.2rem', marginBottom: '0.5rem', color: '#fbbf24' }}>
        Panggilan Sholat {prayerName}
      </h1>
      <p style={{ fontSize: '1.25rem', color: '#cbd5e1', marginBottom: '2rem' }}>
        {prayerTime} • {location}
      </p>
      <blockquote style={{ fontStyle: 'italic', color: '#94a3b8', borderLeft: '3px solid #fbbf24', paddingLeft: '1rem', margin: '2rem auto', textAlign: 'left', lineHeight: '1.6' }}>
        “Maka dirikanlah shalat itu (sebagaimana biasa). Sungguh, shalat itu adalah kewajiban yang ditentukan waktunya atas orang-orang yang beriman.”
        <footer style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: '#64748b' }}>— QS. An-Nisa': 103</footer>
      </blockquote>
      <div style={{ marginTop: '2.5rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
        <button 
          onClick={() => window.close()} 
          style={{ padding: '0.85rem 1.75rem', background: '#fbbf24', color: '#0f172a', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem' }}
        >
          ✓ Saya Siap Sholat (Tutup Tab)
        </button>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<ReminderPage />);
