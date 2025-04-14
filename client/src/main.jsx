import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { LoadScript } from '@react-google-maps/api'; // ✅ Add this line

import App from './App';
import theme from './utils/theme';
import './index.css';

import { AuthProvider } from './contexts/AuthProvider';
import NotificationProvider from './contexts/NotificationProvider';
import CustomThemeProvider from './contexts/CustomThemeProvider';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <MuiThemeProvider theme={theme}>
        <AuthProvider>
          <CustomThemeProvider>
            <NotificationProvider>
              <LoadScript
                googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY} // ✅ Must be in .env
                libraries={['places', 'visualization']} // ✅ Optional: useful for autocomplete or heatmap
              >
                <App />
              </LoadScript>
            </NotificationProvider>
          </CustomThemeProvider>
        </AuthProvider>
      </MuiThemeProvider>
    </BrowserRouter>
  </StrictMode>
);
