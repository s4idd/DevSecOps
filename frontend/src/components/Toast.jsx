import React, { useEffect } from 'react';

const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => onClose(), 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`toast ${type}`}>
      {/* Icônes Google dynamiques selon le type */}
      <span className="material-symbols-outlined toast-icon">
        {type === 'success' ? 'check_circle' : 'info'}
      </span>
      
      <div className="toast-message">{message}</div>
      
      <button className="toast-close" onClick={onClose}>
        <span className="material-symbols-outlined">close</span>
      </button>
    </div>
  );
};

export default Toast;