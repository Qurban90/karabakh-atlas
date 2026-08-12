import { Component, type ReactNode } from 'react';
import { ErrorState } from './ui';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

/** Last-resort fallback so a rendering crash never blanks the whole app. */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error('[qdx] render crash:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ paddingTop: 80 }}>
          <ErrorState
            text="Gözlənilməz xəta baş verdi. Səhifəni yeniləyin."
            onRetry={() => {
              this.setState({ hasError: false });
              window.location.reload();
            }}
          />
        </div>
      );
    }
    return this.props.children;
  }
}
