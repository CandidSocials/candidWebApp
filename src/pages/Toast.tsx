import React, { useEffect } from 'react';
import { CheckCircle, X } from 'lucide-react';

export function Toast({ message, onClose, duration = 5000 }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [onClose, duration]);

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-slide-up">
      <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded shadow-lg flex items-center space-x-3">
        <CheckCircle className="h-5 w-5 text-green-500" />
        <span>{message}</span>
        <button onClick={onClose} className="text-green-700 hover:text-green-900">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}