import React from 'react';

export default class ErrorBoundary extends React.Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return this.props.renderError ? this.props.renderError(this.state.error) : null;
    }

    return this.props.children;
  }
}
