const baseFeatures = {
    enableChat: true,
    enableNotifications: true,
    enableAnalytics: true,
    enablePropertyComparison: false
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
  
  export const getFeatureFlags = () => {
    const env = import.meta.env.VITE_APP_ENV || 'development';
    return environmentFeatures[env];
  };