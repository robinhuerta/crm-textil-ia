import React from 'react';

interface State {
  hasError: boolean;
}

class ErrorBoundary extends React.Component<React.PropsWithChildren<{}>, State> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error('[ErrorBoundary] Error en componente:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-[40vh] text-center p-8">
          <div className="space-y-4">
            <p className="text-5xl">📻</p>
            <p className="text-white font-black text-xl uppercase">Se cruzó la señal</p>
            <p className="text-slate-400 text-sm">Error al cargar esta sección.</p>
            <button
              onClick={() => this.setState({ hasError: false })}
              className="px-6 py-3 bg-[#a3cf33] text-black font-black rounded-2xl text-sm uppercase tracking-widest hover:scale-105 transition-all"
            >
              Reintentar
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
