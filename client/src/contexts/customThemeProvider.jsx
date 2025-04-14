// src/contexts/CustomThemeProvider.jsx
import React, { useEffect, useState } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import ThemeContext from './ThemeContext';

const CustomThemeProvider = ({ children }) => {
  const getInitialTheme = () => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  };

  const [mode, setMode] = useState(getInitialTheme());

  useEffect(() => {
    localStorage.setItem('theme', mode);
  }, [mode]);

  const toggleDarkMode = () => setMode(prev => (prev === 'dark' ? 'light' : 'dark'));

  const theme = createTheme({
    palette: {
      mode,
      primary: { main: '#1976d2' },
      secondary: { main: '#dc004e' },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: mode === 'dark' ? '#121212' : '#f5f5f5',
          },
        },
      },
    },
  });

  return (
    <ThemeContext.Provider value={{ mode, toggleDarkMode }}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

export default CustomThemeProvider;
