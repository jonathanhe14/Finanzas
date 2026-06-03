import { Component } from "react";

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    // Log para depuración; en producción podría enviarse a un servicio.
    console.error("ErrorBoundary atrapó:", error, info);
  }

  handleReload = () => {
    this.setState({ error: null });
    window.location.assign("/home");
  };

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div className="min-h-screen w-full flex items-center justify-center p-6 text-primary">
        <div className="card-glow-border bg-surface rounded-3xl shadow-modal max-w-md w-full p-8 text-center">
          <div className="w-12 h-12 rounded-2xl bg-danger/10 border border-danger/30 flex items-center justify-center mx-auto mb-4">
            <span className="text-danger text-2xl leading-none">!</span>
          </div>
          <h1 className="font-display text-h2 text-primary mb-2">Algo salió mal</h1>
          <p className="text-sm text-muted mb-6">
            Ocurrió un error inesperado en la aplicación. Podés volver al inicio e intentar de nuevo.
          </p>
          <button
            type="button"
            onClick={this.handleReload}
            className="bg-brand-gradient text-white text-[13px] font-semibold rounded-md px-4 py-2.5 hover:shadow-glow-lg active:scale-[0.98] transition-all duration-base"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }
}
