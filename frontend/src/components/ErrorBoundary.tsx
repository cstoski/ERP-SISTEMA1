import React, { ReactNode, ReactElement } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render(): ReactElement {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          padding: '2rem',
          backgroundColor: '#f3f4f6'
        }}>
          <div style={{
            maxWidth: '500px',
            width: '100%',
            backgroundColor: '#ffffff',
            borderRadius: '0.5rem',
            padding: '2rem',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
          }}>
            <h2 style={{ color: '#ef4444', marginBottom: '1rem' }}>
              Erro na aplicação
            </h2>
            <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
              Ocorreu um erro inesperado. Por favor, recarregue a página.
            </p>
            <details style={{ 
              marginBottom: '1rem', 
              padding: '1rem', 
              backgroundColor: '#fee2e2', 
              borderRadius: '0.375rem',
              cursor: 'pointer'
            }}>
              <summary style={{ color: '#b91c1c', fontWeight: 600 }}>
                Detalhes do erro
              </summary>
              <pre style={{
                marginTop: '0.5rem',
                fontSize: '0.75rem',
                color: '#7f1d1d',
                overflow: 'auto'
              }}>
                {this.state.error?.toString()}
              </pre>
            </details>
            <button
              onClick={() => window.location.reload()}
              style={{
                display: 'inline-block',
                padding: '0.625rem 1.25rem',
                backgroundColor: '#3b82f6',
                color: '#ffffff',
                border: 'none',
                borderRadius: '0.375rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#3b82f6'}
            >
              Recarregar página
            </button>
          </div>
        </div>
      );
    }

    return <>{this.props.children}</>;
  }
}

export default ErrorBoundary;
