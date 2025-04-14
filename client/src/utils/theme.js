import { createTheme } from '@mui/material/styles';

// You can pass 'light' or 'dark' from ThemeContext
export const getAppTheme = (mode = 'light') =>
  createTheme({
    palette: {
      mode,
      primary: {
        main: '#1976d2',
        contrastText: '#fff',
      },
      secondary: {
        main: '#dc004e',
        contrastText: '#fff',
      },
      background: {
        default: mode === 'dark' ? '#121212' : '#f9f9f9',
        paper: mode === 'dark' ? '#1e1e1e' : '#fff',
      },
    },
    typography: {
      fontFamily: 'Roboto, sans-serif',
      button: {
        textTransform: 'none',
      },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            fontWeight: 500,
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: 12,
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          },
        },
      },
    },
    shape: {
      borderRadius: 10,
    },
    spacing: 8,
  });

// This creates and exports the default theme
const theme = getAppTheme('light');
export default theme;
