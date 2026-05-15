import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Hexagon, Lock, Mail, AlertTriangle, Loader2, Eye, EyeOff } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

function Login() {
  const { login, loginError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState(null);
  const [retryTimer, setRetryTimer] = useState(0);
  const emailRef = useRef(null);

  useEffect(() => {
    emailRef.current?.focus();
  }, []);

  // Countdown timer for rate limit
  useEffect(() => {
    if (retryTimer <= 0) return;
    const interval = setInterval(() => {
      setRetryTimer(prev => {
        if (prev <= 1) { clearInterval(interval); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [retryTimer]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting || retryTimer > 0) return;

    setSubmitting(true);
    setLocalError(null);
    const result = await login(email, password);
    setSubmitting(false);

    if (!result.success) {
      setLocalError(result.error);
      if (result.retryAfter) {
        setRetryTimer(result.retryAfter);
      }
    }
  };

  const error = localError || loginError;

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-app)',
      padding: '2rem',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '420px',
        animation: 'modalScaleIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
      }}>
        {/* Logo */}
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          marginBottom: '2.5rem', gap: '0.75rem',
        }}>
          <div style={{
            width: '56px', height: '56px', borderRadius: '16px',
            background: 'linear-gradient(135deg, var(--accent-color), color-mix(in srgb, var(--accent-color) 60%, #000))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 32px rgba(99, 144, 255, 0.25)',
          }}>
            <Hexagon size={28} style={{ color: 'var(--accent-text)' }} />
          </div>
          <h1 style={{
            margin: 0, fontSize: '1.5rem', fontWeight: 700,
            color: 'var(--text-primary)', letterSpacing: '-0.02em',
          }}>
            Entrar na Plataforma
          </h1>
          <p style={{
            margin: 0, fontSize: '0.875rem', color: 'var(--text-muted)',
            textAlign: 'center',
          }}>
            Faça login com suas credenciais para acessar o painel.
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: 'var(--bg-panel)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg, 12px)',
          padding: '2rem',
          boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
        }}>
          {/* Error */}
          {error && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.625rem',
              padding: '0.75rem 1rem', borderRadius: '8px',
              background: 'rgba(239, 68, 68, 0.08)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              marginBottom: '1.5rem',
              animation: 'fadeIn 0.2s ease-out',
            }}>
              <AlertTriangle size={16} style={{ color: '#ef4444', flexShrink: 0 }} />
              <span style={{ fontSize: '0.8125rem', color: '#ef4444', fontWeight: 500 }}>
                {error}
                {retryTimer > 0 && ` Tente novamente em ${formatTime(retryTimer)}.`}
              </span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Email */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label className="form-label" style={{ marginBottom: '0.5rem', display: 'block' }}>
                E-mail
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{
                  position: 'absolute', left: '0.875rem', top: '50%',
                  transform: 'translateY(-50%)', color: 'var(--text-muted)',
                }} />
                <input
                  ref={emailRef}
                  type="email"
                  className="form-control"
                  style={{ paddingLeft: '2.75rem' }}
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  disabled={submitting}
                />
              </div>
            </div>

            {/* Password */}
            <div style={{ marginBottom: '1.75rem' }}>
              <label className="form-label" style={{ marginBottom: '0.5rem', display: 'block' }}>
                Senha
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{
                  position: 'absolute', left: '0.875rem', top: '50%',
                  transform: 'translateY(-50%)', color: 'var(--text-muted)',
                }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-control"
                  style={{ paddingLeft: '2.75rem', paddingRight: '2.75rem' }}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  autoComplete="current-password"
                  disabled={submitting}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute', right: '0.5rem', top: '50%',
                    transform: 'translateY(-50%)', background: 'none', border: 'none',
                    cursor: 'pointer', color: 'var(--text-muted)', padding: '0.375rem',
                    borderRadius: '4px', display: 'flex', alignItems: 'center',
                  }}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="btn primary"
              disabled={submitting || retryTimer > 0}
              style={{
                width: '100%', padding: '0.75rem 1.5rem',
                fontSize: '0.9rem', fontWeight: 600,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                opacity: (submitting || retryTimer > 0) ? 0.6 : 1,
                cursor: (submitting || retryTimer > 0) ? 'not-allowed' : 'pointer',
              }}
            >
              {submitting ? (
                <>
                  <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                  Entrando...
                </>
              ) : retryTimer > 0 ? (
                `Bloqueado (${formatTime(retryTimer)})`
              ) : (
                'Entrar'
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p style={{
          textAlign: 'center', marginTop: '1.5rem',
          fontSize: '0.75rem', color: 'var(--text-muted)',
        }}>
          Acesso restrito. Se você não tem uma conta, solicite ao seu administrador.
        </p>
      </div>
    </div>
  );
}

export default Login;
