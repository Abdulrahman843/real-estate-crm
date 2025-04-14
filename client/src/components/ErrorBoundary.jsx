import React from 'react';
import { Box, Typography, Button, Collapse, Alert } from '@mui/material';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  toggleDetails = () => {
    this.setState(prev => ({ showDetails: !prev.showDetails }));
  };

  render() {
    if (this.state.hasError) {
      return (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            px: 3,
            textAlign: 'center',
            bgcolor: 'background.default',
            color: 'text.primary'
          }}
        >
          <Typography variant="h4" gutterBottom>
            🚧 Oops! Something went wrong
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            We apologize for the inconvenience. Please try again or report the issue.
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <Button variant="contained" color="primary" onClick={this.handleReset}>
              Reload Page
            </Button>
            <Button variant="outlined" onClick={this.toggleDetails}>
              {this.state.showDetails ? 'Hide Details' : 'Show Details'}
            </Button>
          </Box>

          <Collapse in={this.state.showDetails}>
            <Box sx={{ textAlign: 'left', maxWidth: 600, mt: 2 }}>
              <Alert severity="error">
                <Typography variant="subtitle2">Error:</Typography>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                  {this.state.error?.toString()}
                </Typography>
                {this.state.errorInfo?.componentStack && (
                  <>
                    <Typography variant="subtitle2" sx={{ mt: 1 }}>Stack Trace:</Typography>
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                      {this.state.errorInfo.componentStack}
                    </Typography>
                  </>
                )}
              </Alert>
            </Box>
          </Collapse>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
