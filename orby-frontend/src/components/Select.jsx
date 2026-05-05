import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

function Select({ value, onChange, options, placeholder = "Selecione...", required = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.value === value) || null;

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      {required && (
        <input 
          type="text" 
          value={value || ''} 
          onChange={() => {}} 
          required 
          tabIndex={-1}
          style={{ opacity: 0, position: 'absolute', top: '50%', left: '50%', height: 0, width: 0, padding: 0, margin: 0, border: 'none', pointerEvents: 'none' }} 
        />
      )}
      
      <div 
        className="form-control"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsOpen(!isOpen);
          }
        }}
        style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          cursor: 'pointer', 
          userSelect: 'none',
          borderColor: isOpen ? 'var(--border-focus)' : 'var(--border-color)'
        }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span style={{ color: selectedOption ? 'var(--text-primary)' : 'var(--text-muted)', fontSize: '0.875rem' }}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown 
          size={14} 
          style={{ 
            color: 'var(--text-muted)', 
            transform: isOpen ? 'rotate(180deg)' : 'none', 
            transition: 'transform 0.2s ease',
            flexShrink: 0
          }} 
        />
      </div>
      
      {isOpen && (
        <div 
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            background: 'var(--bg-panel)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-sm)',
            boxShadow: 'var(--shadow-lg)',
            zIndex: 50,
            maxHeight: '200px',
            overflowY: 'auto',
            animation: 'fadeIn 0.15s ease-out'
          }}
        >
          {options.map((opt) => (
            <div
              key={opt.value}
              style={{
                padding: '0.5rem 0.75rem',
                cursor: 'pointer',
                fontSize: '0.8125rem',
                color: value === opt.value ? 'var(--text-primary)' : 'var(--text-secondary)',
                background: value === opt.value ? 'var(--bg-active)' : 'transparent',
                fontWeight: value === opt.value ? 500 : 400,
                transition: 'background 0.1s ease',
              }}
              onClick={() => {
                if (onChange) onChange(opt.value);
                setIsOpen(false);
              }}
              onMouseEnter={(e) => {
                if (value !== opt.value) e.target.style.background = 'var(--bg-hover)';
              }}
              onMouseLeave={(e) => {
                if (value !== opt.value) e.target.style.background = 'transparent';
              }}
            >
              {opt.label}
            </div>
          ))}
          {options.length === 0 && (
            <div style={{ padding: '0.75rem', color: 'var(--text-muted)', fontSize: '0.8125rem', textAlign: 'center' }}>
              Nenhuma opção disponível
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Select;
