import React, { Component } from 'react';
import {
  Typography,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error', error, errorInfo);
  }

  handleDismiss = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <Dialog
          open={this.state.hasError}
          onClose={this.handleDismiss}
          aria-labelledby="error-dialog-title"
          aria-describedby="error-dialog-description"
        >
          <DialogTitle id="error-dialog-title">
            Oops! Something went wrong.
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="error-dialog-description">
              We encountered an error related to CodeMirror. However, this will
              not cause any real issues, and you can safely proceed.
            </DialogContentText>
            {this.state.error && (
              <DialogContentText color="textSecondary">
                {this.state.error.toString()}
              </DialogContentText>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleDismiss} color="primary">
              Dismiss
            </Button>
          </DialogActions>
        </Dialog>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
