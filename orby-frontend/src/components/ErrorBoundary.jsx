import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, errorMessage: error?.message || 'Erro desconhecido' };
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary] Erro capturado:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          minHeight: '300px',
          gap: '1rem',
          color: 'var(--text-secondary)',
          padding: '2rem'
        }}>
          <div style={{ fontSize: '2rem' }}>⚠️</div>
          <h3 style={{ color: 'var(--text-primary)', margin: 0 }}>Algo deu errado</h3>
          <p style={{ margin: 0, fontSize: '0.875rem', textAlign: 'center', maxWidth: '400px' }}>
            Um erro inesperado ocorreu nesta seção.
          </p>
          <button
            onClick={() => this.setState({ hasError: false, errorMessage: '' })}
            style={{
              padding: '0.5rem 1rem',
              background: 'var(--accent-color)',
              color: 'var(--accent-text)',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontFamily: 'var(--font-sans)',
              fontWeight: 600
            }}
          >
            Tentar novamente
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
