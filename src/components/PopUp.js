import React from 'react';
import './PopUp.css';

const PopUp = ({ title, children, isOpen, onClose }) => {
  return (
    <>
      {isOpen && (
        <div
          className={`overlay ${isOpen ? 'fade-in' : 'fade-out'}`}
          onClick={onClose}
        >
          <div
            className={`modal ${isOpen ? 'fade-in-up' : 'fade-out-down'}`}
            onClick={(e) => e.stopPropagation()}
          >
            {title && <h2 className="title">{title}</h2>}
            {children}
            <button className="close-button" onClick={onClose}>
              &times;
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default PopUp;
