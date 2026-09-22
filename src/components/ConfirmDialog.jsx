import React from 'react';

const ConfirmDialog = ({ isOpen, onConfirm, onCancel, title, message, productName }) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '20px',
        padding: '40px',
        maxWidth: '500px',
        width: '90%',
        boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)',
        textAlign: 'center',
        animation: 'slideIn 0.3s ease-out'
      }}>
        <div style={{
          fontSize: '60px',
          marginBottom: '20px'
        }}>
          ⚠️
        </div>
        
        <h2 style={{
          fontSize: '24px',
          fontWeight: 'bold',
          color: '#dc2626',
          marginBottom: '15px'
        }}>
          {title}
        </h2>
        
        <p style={{
          fontSize: '16px',
          color: '#374151',
          marginBottom: '10px',
          lineHeight: '1.5'
        }}>
          {message}
        </p>
        
        {productName && (
          <p style={{
            fontSize: '18px',
            fontWeight: 'bold',
            color: '#0891b2',
            marginBottom: '30px',
            padding: '10px',
            backgroundColor: '#f0f9ff',
            borderRadius: '8px'
          }}>
            "{productName}"
          </p>
        )}
        
        <div style={{
          display: 'flex',
          gap: '15px',
          justifyContent: 'center'
        }}>
          <button
            onClick={onCancel}
            style={{
              padding: '12px 30px',
              fontSize: '16px',
              fontWeight: '500',
              border: '2px solid #d1d5db',
              backgroundColor: 'white',
              color: '#374151',
              borderRadius: '10px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              minWidth: '120px'
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = '#f9fafb';
              e.target.style.borderColor = '#9ca3af';
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = 'white';
              e.target.style.borderColor = '#d1d5db';
            }}
          >
            ביטול
          </button>
          
          <button
            onClick={onConfirm}
            style={{
              padding: '12px 30px',
              fontSize: '16px',
              fontWeight: '500',
              border: 'none',
              backgroundColor: '#dc2626',
              color: 'white',
              borderRadius: '10px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              minWidth: '120px'
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = '#b91c1c';
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = '#dc2626';
            }}
          >
            מחק
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
