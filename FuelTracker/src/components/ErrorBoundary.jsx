import { Component } from "react";
import { Navigate } from "react-router-dom";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorInfo: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  componentDidCatch(error, errorInfo) {
    // Log client-side; your backend would log with correlation IDs.
    console.error("UI ErrorBoundary caught:", { error, errorInfo });
    this.setState({
      errorInfo: {
        message: String(error?.message || error),
        stack: String(errorInfo?.componentStack || ""),
      },
    });
  }
  render() {
    if (this.state.hasError) {
      return (
        <Navigate
          to="/error"
          replace
          state={{ errorInfo: this.state.errorInfo }}
        />
      );
    }
    return this.props.children;
  }
}
