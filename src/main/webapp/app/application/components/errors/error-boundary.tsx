import React from 'react';
import { Alert } from 'antd';

interface IErrorBoundaryProps {
  readonly children: JSX.Element | JSX.Element[];
}

interface IErrorBoundaryState {
  readonly error: any;
  readonly errorInfo: any;
}

export class ErrorBoundary extends React.Component<IErrorBoundaryProps, IErrorBoundaryState> {
  readonly state: IErrorBoundaryState = { error: undefined, errorInfo: undefined };

  componentDidCatch(error, errorInfo) {
    this.setState({
      error,
      errorInfo
    });
  }

  render() {
    const { error, errorInfo } = this.state;
    if (errorInfo) {
      const errorDetails =
        process.env.NODE_ENV === 'development' ? (
          <span className="preserve-space">
            {error && error.toString()}
            <br />
            {errorInfo.componentStack}
          </span>
        ) : (
          undefined
        );
      return (
        <div className="padding-3rem">
          <Alert
            message="Erreur"
            description={
              <>
                <small>An unexpected error has occurred.</small>
                {!!errorDetails && <p>{errorDetails}</p>}
              </>
            }
            type="error"
            showIcon
          />
        </div>
      );
    }
    return <>{this.props.children}</>;
  }
}
