import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Pipette } from 'lucide-react';

/* ── Color conversion utils ──────────────────────────── */
function hexToHSL(hex) {
  hex = hex.replace('#', '');
  if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function hslToHex(h, s, l) {
  s /= 100; l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = n => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

function isValidHex(hex) {
  return /^#?([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(hex);
}

function normalizeHex(hex) {
  hex = hex.replace('#', '');
  if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
  return '#' + hex.toLowerCase();
}

/* ── Main Component ──────────────────────────────────── */
function ColorPicker({ value, onChange, label, presets = [] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [hexInput, setHexInput] = useState(value || '#EAEAEA');
  const [hsl, setHsl] = useState(() => hexToHSL(value || '#EAEAEA'));
  const containerRef = useRef(null);
  const satPanelRef = useRef(null);
  const hueBarRef = useRef(null);
  const isDraggingSat = useRef(false);
  const isDraggingHue = useRef(false);

  useEffect(() => {
    if (value && isValidHex(value)) {
      const normalized = normalizeHex(value);
      setHexInput(normalized);
      setHsl(hexToHSL(normalized));
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const commitColor = useCallback((h, s, l) => {
    const hex = hslToHex(h, s, l);
    setHsl({ h, s, l });
    setHexInput(hex);
    onChange?.(hex);
  }, [onChange]);

  const handleHexChange = (e) => {
    let val = e.target.value;
    if (!val.startsWith('#')) val = '#' + val;
    setHexInput(val);
    if (isValidHex(val)) {
      const normalized = normalizeHex(val);
      const newHsl = hexToHSL(normalized);
      setHsl(newHsl);
      onChange?.(normalized);
    }
  };

  /* Saturation/Lightness panel drag */
  const handleSatMove = useCallback((e) => {
    if (!satPanelRef.current) return;
    const rect = satPanelRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const y = Math.max(0, Math.min(e.clientY - rect.top, rect.height));
    const s = Math.round((x / rect.width) * 100);
    const l = Math.round(100 - (y / rect.height) * 100);
    commitColor(hsl.h, s, l);
  }, [hsl.h, commitColor]);

  const startSatDrag = (e) => {
    isDraggingSat.current = true;
    handleSatMove(e);
    const onMove = (ev) => { if (isDraggingSat.current) handleSatMove(ev); };
    const onUp = () => { isDraggingSat.current = false; document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  };

  /* Hue bar drag */
  const handleHueMove = useCallback((e) => {
    if (!hueBarRef.current) return;
    const rect = hueBarRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const h = Math.round((x / rect.width) * 360);
    commitColor(h, hsl.s, hsl.l);
  }, [hsl.s, hsl.l, commitColor]);

  const startHueDrag = (e) => {
    isDraggingHue.current = true;
    handleHueMove(e);
    const onMove = (ev) => { if (isDraggingHue.current) handleHueMove(ev); };
    const onUp = () => { isDraggingHue.current = false; document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  };

  const currentHex = isValidHex(hexInput) ? normalizeHex(hexInput) : value;

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      {label && <label className="form-label">{label}</label>}

      {/* Trigger */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          padding: '0.5rem 0.875rem',
          background: 'var(--bg-app)',
          border: `1px solid ${isOpen ? 'var(--border-focus)' : 'var(--border-color)'}`,
          borderRadius: 'var(--radius-sm)',
          cursor: 'pointer',
          transition: 'border-color 0.15s ease',
        }}
      >
        <div style={{
          width: 24, height: 24, borderRadius: 'var(--radius-sm)',
          background: currentHex, border: '1px solid rgba(255,255,255,0.1)',
          flexShrink: 0, boxShadow: `0 0 8px ${currentHex}33`,
        }} />
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', color: 'var(--text-primary)', flex: 1 }}>
          {currentHex}
        </span>
        <Pipette size={14} style={{ color: 'var(--text-muted)' }} />
      </div>

      {/* Dropdown Picker */}
      {isOpen && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 6px)',
          left: 0,
          width: '280px',
          background: 'var(--bg-panel)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-lg)',
          zIndex: 100,
          padding: '1rem',
          animation: 'fadeIn 0.15s ease-out',
        }}>
          {/* Saturation / Lightness panel */}
          <div
            ref={satPanelRef}
            onMouseDown={startSatDrag}
            style={{
              width: '100%',
              height: '140px',
              borderRadius: 'var(--radius-sm)',
              position: 'relative',
              cursor: 'crosshair',
              background: `linear-gradient(to bottom, white, black), linear-gradient(to right, gray, hsl(${hsl.h}, 100%, 50%))`,
              backgroundBlendMode: 'multiply',
              overflow: 'hidden',
              marginBottom: '0.75rem',
            }}
          >
            {/* Thumb */}
            <div style={{
              position: 'absolute',
              left: `${hsl.s}%`,
              top: `${100 - hsl.l}%`,
              width: 14, height: 14,
              borderRadius: '50%',
              border: '2px solid white',
              boxShadow: '0 0 4px rgba(0,0,0,0.5)',
              transform: 'translate(-50%, -50%)',
              pointerEvents: 'none',
            }} />
          </div>

          {/* Hue bar */}
          <div
            ref={hueBarRef}
            onMouseDown={startHueDrag}
            style={{
              width: '100%',
              height: '14px',
              borderRadius: '100px',
              background: 'linear-gradient(to right, #ff0000, #ff8000, #ffff00, #80ff00, #00ff00, #00ff80, #00ffff, #0080ff, #0000ff, #8000ff, #ff00ff, #ff0080, #ff0000)',
              position: 'relative',
              cursor: 'pointer',
              marginBottom: '0.875rem',
            }}
          >
            <div style={{
              position: 'absolute',
              left: `${(hsl.h / 360) * 100}%`,
              top: '50%',
              width: 16, height: 16,
              borderRadius: '50%',
              border: '2px solid white',
              boxShadow: '0 0 4px rgba(0,0,0,0.4)',
              transform: 'translate(-50%, -50%)',
              pointerEvents: 'none',
              background: `hsl(${hsl.h}, 100%, 50%)`,
            }} />
          </div>

          {/* Hex Input */}
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.75rem' }}>
            <div style={{
              width: 32, height: 32, borderRadius: 'var(--radius-sm)',
              background: currentHex, border: '1px solid rgba(255,255,255,0.08)',
              flexShrink: 0,
            }} />
            <div style={{ flex: 1, position: 'relative' }}>
              <span style={{
                position: 'absolute', left: '0.625rem', top: '50%', transform: 'translateY(-50%)',
                color: 'var(--text-muted)', fontSize: '0.8125rem', fontFamily: 'var(--font-mono)', pointerEvents: 'none',
              }}>#</span>
              <input
                type="text"
                value={hexInput.replace('#', '')}
                onChange={(e) => {
                  const val = '#' + e.target.value.replace(/[^0-9a-fA-F]/g, '').slice(0, 6);
                  handleHexChange({ target: { value: val } });
                }}
                maxLength={6}
                spellCheck={false}
                style={{
                  width: '100%',
                  background: 'var(--bg-app)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.4375rem 0.625rem 0.4375rem 1.375rem',
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.8125rem',
                  outline: 'none',
                  textTransform: 'lowercase',
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--border-focus)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
              />
            </div>
          </div>

          {/* Presets */}
          {presets.length > 0 && (
            <>
              <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                Predefinidos
              </div>
              <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
                {presets.map(color => (
                  <div
                    key={color}
                    onClick={() => {
                      const normalized = normalizeHex(color);
                      setHexInput(normalized);
                      setHsl(hexToHSL(normalized));
                      onChange?.(normalized);
                    }}
                    style={{
                      width: 26, height: 26,
                      borderRadius: 'var(--radius-sm)',
                      background: color,
                      cursor: 'pointer',
                      border: currentHex === normalizeHex(color)
                        ? '2px solid var(--text-primary)'
                        : '2px solid transparent',
                      boxShadow: currentHex === normalizeHex(color)
                        ? `0 0 0 2px var(--bg-panel)`
                        : 'none',
                      transition: 'all 0.1s ease',
                    }}
                    title={color}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default ColorPicker;
