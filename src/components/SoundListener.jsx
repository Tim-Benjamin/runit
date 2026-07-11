// src/components/SoundListener.jsx
// Listens to Service Worker messages and plays appropriate sounds
import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { playOrderRingtone, playNotificationSound, playSuccessSound } from '../utils/soundEngine';

export default function SoundListener() {
  var auth = useAuth();
  var user = auth && auth.user;

  useEffect(function() {
    if (!('serviceWorker' in navigator)) return;

    var handler = function(event) {
      if (!event.data || !event.data.type) return;

      var type    = event.data.type;
      var payload = event.data.payload || {};

      if (type === 'PLAY_ORDER_RINGTONE') {
        // Only play ringtone for runners
        if (user && user.role === 'runner') {
          playOrderRingtone();
        }
      } else if (type === 'PLAY_NOTIFICATION_SOUND') {
        var status = payload.data && payload.data.status;
        if (status === 'delivered') {
          playSuccessSound();
        } else {
          playNotificationSound();
        }
      }
    };

    navigator.serviceWorker.addEventListener('message', handler);
    return function() {
      navigator.serviceWorker.removeEventListener('message', handler);
    };
  }, [user]);

  return null;
}