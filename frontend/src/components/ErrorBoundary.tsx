import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Alert, Button } from './ui';

interface Props {
  children: ReactNode;
}

interface State {
  crashed: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { crashed: false };

  static getDerivedStateFromError(): State {
    return { crashed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('A screen crashed', error, info.componentStack);
  }

  render() {
    if (!this.state.crashed) {
      return this.props.children;
    }

    return (
      <div className="mx-auto max-w-lg py-16">
        <Alert>Something on this screen broke.</Alert>
        <Button variant="primary" onClick={() => window.location.assign('/')}>
          Back to your notes
        </Button>
      </div>
    );
  }
}
