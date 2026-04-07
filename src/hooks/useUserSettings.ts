'use client';

import { useState, useEffect, useCallback } from 'react';

export function useCurrentTime() {
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  const [currentDayOfWeek, setCurrentDayOfWeek] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const timeString = now.toLocaleTimeString('zh-CN', { 
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
      const dateString = now.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
      const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
      
      setCurrentTime(timeString);
      setCurrentDate(dateString);
      setCurrentDayOfWeek(days[now.getDay()]);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return { currentTime, currentDate, currentDayOfWeek };
}

export function useTestMode() {
  const [useCustomTime, setUseCustomTime] = useState(false);
  const [customTime, setCustomTime] = useState('');
  const [customDate, setCustomDate] = useState('');
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') {
      setInitialized(true);
      return;
    }

    const savedUseCustom = localStorage.getItem('commute-use-custom-time') === 'true';
    const savedDate = localStorage.getItem('commute-custom-date') || '';
    const savedTime = localStorage.getItem('commute-custom-time') || '';

    setUseCustomTime(savedUseCustom);
    setCustomDate(savedDate);
    setCustomTime(savedTime);
    setInitialized(true);
  }, []);

  useEffect(() => {
    if (!initialized) return;
    if (process.env.NODE_ENV !== 'development') return;

    localStorage.setItem('commute-use-custom-time', useCustomTime.toString());
    localStorage.setItem('commute-custom-date', customDate);
    localStorage.setItem('commute-custom-time', customTime);
  }, [useCustomTime, customDate, customTime, initialized]);

  const getEffectiveTime = useCallback(() => {
    if (process.env.NODE_ENV !== 'development') {
      return new Date().toLocaleTimeString('en-US', { 
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    }

    if (useCustomTime && customTime) {
      return customTime;
    }

    return new Date().toLocaleTimeString('en-US', { 
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }, [useCustomTime, customTime]);

  const getEffectiveDate = useCallback(() => {
    if (process.env.NODE_ENV !== 'development') {
      return new Date();
    }

    if (useCustomTime && customDate) {
      return new Date(`${customDate}T${customTime || '00:00:00'}`);
    }

    return new Date();
  }, [useCustomTime, customDate, customTime]);

  return {
    useCustomTime,
    setUseCustomTime,
    customTime,
    setCustomTime,
    customDate,
    setCustomDate,
    initialized,
    getEffectiveTime,
    getEffectiveDate,
    isTestMode: process.env.NODE_ENV === 'development'
  };
}
