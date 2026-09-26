import React, { useState, useEffect } from 'react';
import FlipUnit from './FlipUnit.jsx';
import './FlipClock.css';

export default function FlipClock({ language = 'id', variant = 'popup' }) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    let interval = null;
    // Synchronize to the start of the next second
    const syncTimeout = setTimeout(() => {
      setTime(new Date());
      interval = setInterval(() => {
        setTime(new Date());
      }, 1000);
    }, 1000 - new Date().getMilliseconds());

    return () => {
      clearTimeout(syncTimeout);
      if (interval) clearInterval(interval);
    };
  }, []);

  const hours = time.getHours();
  const minutes = time.getMinutes();
  const seconds = time.getSeconds();

  const locale = language === 'en' ? 'en-US' : 'id-ID';

  return (
    <div className={`clock-wrapper ${variant === 'full' ? 'clock-wrapper-full' : 'clock-wrapper-popup'}`}>
      <div className="flip-clock">
        <FlipUnit digit={hours} />
        <FlipUnit digit={minutes} />
        <FlipUnit digit={seconds} />
      </div>
      <div className="date-display">
        {time.toLocaleDateString(locale, {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })}
      </div>
    </div>
  );
}
