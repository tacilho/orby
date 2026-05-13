import React, { useState, useRef, useEffect } from 'react';
import { Calendar, Clock, ChevronLeft, ChevronRight, X } from 'lucide-react';

const MONTHS_PT = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
const WEEKDAYS = ['D','S','T','Q','Q','S','S'];

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDayOfWeek(year, month) {
  return new Date(year, month, 1).getDay();
}

function DateTimePicker({ value, onChange, placeholder = 'Selecionar data e hora...', align = 'left' }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());
  const [selectedDate, setSelectedDate] = useState(null);
  const [hours, setHours] = useState('00');
  const [minutes, setMinutes] = useState('00');

  useEffect(() => {
    if (value) {
      const d = new Date(value);
      if (!isNaN(d)) {
        setSelectedDate(d);
        setHours(d.getHours().toString().padStart(2, '0'));
        setMinutes(d.getMinutes().toString().padStart(2, '0'));
        setViewYear(d.getFullYear());
        setViewMonth(d.getMonth());
      }
    }
  }, []);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const selectDay = (day) => {
    const d = new Date(viewYear, viewMonth, day);
    setSelectedDate(d);
  };

  const confirm = () => {
    if (!selectedDate) return;
    const d = new Date(selectedDate);
    d.setHours(parseInt(hours) || 0);
    d.setMinutes(parseInt(minutes) || 0);
    d.setSeconds(0);
    onChange?.(d.toISOString());
    setOpen(false);
  };

  const clear = () => {
    setSelectedDate(null);
    setHours('00');
    setMinutes('00');
    onChange?.(null);
    setOpen(false);
  };

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfWeek(viewYear, viewMonth);

  const formatDisplay = () => {
    if (!value) return null;
    const d = new Date(value);
    if (isNaN(d)) return null;
    return `${d.getDate().toString().padStart(2,'0')}/${(d.getMonth()+1).toString().padStart(2,'0')}/${d.getFullYear()} ${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}`;
  };

  const display = formatDisplay();
  const isSelectedDay = (day) => {
    if (!selectedDate) return false;
    return selectedDate.getDate() === day && selectedDate.getMonth() === viewMonth && selectedDate.getFullYear() === viewYear;
  };
  const isToday = (day) => {
    return day === now.getDate() && viewMonth === now.getMonth() && viewYear === now.getFullYear();
  };

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <div
        onClick={() => setOpen(!open)}
        style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          padding: '0.375rem 0.75rem',
          background: 'var(--bg-panel)',
          border: `1px solid ${open ? 'var(--border-focus)' : 'var(--border-color)'}`,
          borderRadius: 'var(--radius-sm)', cursor: 'pointer',
          fontSize: '0.8125rem', color: display ? 'var(--text-primary)' : 'var(--text-muted)',
          transition: 'border-color 0.15s ease', minWidth: '180px',
        }}
      >
        <Calendar size={13} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
        <span style={{ flex: 1 }}>{display || placeholder}</span>
        {display && (
          <span onClick={(e) => { e.stopPropagation(); clear(); }} style={{ cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}>
            <X size={12} />
          </span>
        )}
      </div>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 4px)', 
          left: align === 'left' ? 0 : 'auto',
          right: align === 'right' ? 0 : 'auto',
          zIndex: 200,
          width: '280px', background: 'var(--bg-panel)', border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-lg)', padding: '1rem',
          animation: 'fadeIn 0.15s ease-out',
        }}>
          {/* Month nav */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <button type="button" onClick={prevMonth} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '0.25rem', display: 'flex' }}><ChevronLeft size={16} /></button>
            <span style={{ fontWeight: 600, fontSize: '0.8125rem' }}>{MONTHS_PT[viewMonth]} {viewYear}</span>
            <button type="button" onClick={nextMonth} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '0.25rem', display: 'flex' }}><ChevronRight size={16} /></button>
          </div>
          {/* Weekday headers */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px', textAlign: 'center', marginBottom: '0.25rem' }}>
            {WEEKDAYS.map((d, i) => (
              <div key={i} style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontWeight: 600, padding: '0.25rem 0' }}>{d}</div>
            ))}
          </div>
          {/* Days grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px' }}>
            {Array.from({ length: firstDay }).map((_, i) => <div key={'e' + i} />)}
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => (
              <button type="button" key={day} onClick={() => selectDay(day)} style={{
                padding: '0.3rem 0', border: 'none', cursor: 'pointer', borderRadius: 'var(--radius-sm)',
                fontSize: '0.8125rem', fontFamily: 'var(--font-sans)',
                background: isSelectedDay(day) ? 'var(--accent-color)' : 'transparent',
                color: isSelectedDay(day) ? 'var(--accent-text)' : isToday(day) ? 'var(--info)' : 'var(--text-primary)',
                fontWeight: isSelectedDay(day) || isToday(day) ? 600 : 400,
              }}>
                {day}
              </button>
            ))}
          </div>
          {/* Time */}
          <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '0.375rem', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Clock size={11} /> Horário
            </div>
            <div style={{ display: 'flex', gap: '0.375rem', alignItems: 'center' }}>
              <input type="text" maxLength={2} value={hours} onChange={e => setHours(e.target.value.replace(/\D/g, '').slice(0, 2))}
                style={{ width: '40px', textAlign: 'center', background: 'var(--bg-app)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '0.375rem', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', outline: 'none' }} />
              <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>:</span>
              <input type="text" maxLength={2} value={minutes} onChange={e => setMinutes(e.target.value.replace(/\D/g, '').slice(0, 2))}
                style={{ width: '40px', textAlign: 'center', background: 'var(--bg-app)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '0.375rem', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', outline: 'none' }} />
            </div>
          </div>
          {/* Actions */}
          <div style={{ display: 'flex', gap: '0.375rem', marginTop: '0.75rem' }}>
            <button type="button" onClick={clear} className="btn" style={{ flex: 1, padding: '0.375rem', fontSize: '0.75rem' }}>Limpar</button>
            <button type="button" onClick={confirm} className="btn primary" style={{ flex: 1, padding: '0.375rem', fontSize: '0.75rem' }}>Aplicar</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default DateTimePicker;
