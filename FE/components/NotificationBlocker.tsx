'use client';

import { useEffect } from 'react';

export default function NotificationBlocker() {
  useEffect(() => {
    if ('Notification' in window) {
      Notification.requestPermission = () => Promise.resolve('denied' as NotificationPermission);
    }
  }, []);

  return null;
}
