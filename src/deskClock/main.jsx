import React from 'react';
import ReactDOM from 'react-dom/client';

function DeskClock() {
  return (
    <div style={{ textAlign: 'center', color: '#f0f2f5', padding: '2rem' }}>
      <h1 style={{ color: '#fbbf24' }}>Zen Clock — Fullscreen Desk Clock</h1>
      <p style={{ color: '#94a3b8' }}>Component will be mounted here in the implementation phase.</p>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<DeskClock />);
