import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Digital Medic Uncaught error:', error, errorInfo);
  }

  public handleReset = () => {
    try {
      window.location.hash = '';
      window.location.reload();
    } catch (e) {
      window.location.reload();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0f172a',
          color: '#ffffff',
          padding: '24px',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
          <div style={{
            maxWidth: '520px',
            backgroundColor: '#1e293b',
            borderRadius: '16px',
            padding: '28px',
            border: '1px solid #334155',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)'
          }}>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '12px', color: '#f87171' }}>
              Digital Medic - Recargando Sistema
            </h2>
            <p style={{ fontSize: '14px', color: '#cbd5e1', marginBottom: '16px', lineHeight: '1.5' }}>
              Ocurrió un problema al cargar los datos almacenados en este navegador. Haz clic en el botón para restaurar y abrir la aplicación limpiamente:
            </p>
            <div style={{
              backgroundColor: '#0f172a',
              padding: '12px',
              borderRadius: '8px',
              fontSize: '12px',
              color: '#94a3b8',
              fontFamily: 'monospace',
              marginBottom: '20px',
              overflowX: 'auto'
            }}>
              {this.state.error?.message || 'Error desconocido de renderizado'}
            </div>
            <button
              onClick={this.handleReset}
              style={{
                width: '100%',
                padding: '12px 20px',
                backgroundColor: '#2563eb',
                color: '#ffffff',
                border: 'none',
                borderRadius: '10px',
                fontWeight: 'bold',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Restaurar y Abrir Sistema
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
