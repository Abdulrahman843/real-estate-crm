const baseFeatures = {
  enableChat: true,
  enableNotifications: true,
  enableAnalytics: true,
  enablePropertyComparison: true, // You can toggle this as needed
  enableMapEnhancements: true,    // Optional extra flag for map controls
};

const environmentFeatures = {
  development: {
    ...baseFeatures,
    enableDebugTools: true,
    enableMockData: true
  },
  staging: {
    ...baseFeatures,
    enableDebugTools: true,
    enableMockData: false
  },
  production: {
    ...baseFeatures,
    enableDebugTools: false,
    enableMockData: false
  }
};

/**
 * Returns the feature flags based on the environment variable
 * Set VITE_APP_ENV to 'development' | 'staging' | 'production'
 */
export const getFeatureFlags = () => {
  const env = import.meta.env.VITE_APP_ENV || 'development';
  return environmentFeatures[env] || environmentFeatures['development'];
};
