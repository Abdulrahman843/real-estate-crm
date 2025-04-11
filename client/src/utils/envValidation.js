const requiredEnvVars = [
    'VITE_API_URL',
    'VITE_WEBSOCKET_URL',
    'VITE_PUBLIC_URL'
  ];
  
  export const validateEnv = () => {
    const missingVars = requiredEnvVars.filter(
      varName => !import.meta.env[varName]
    );
  
    if (missingVars.length > 0) {
      throw new Error(
        `Missing required environment variables: ${missingVars.join(', ')}`
      );
    }
  
    return {
      apiUrl: import.meta.env.VITE_API_URL,
      wsUrl: import.meta.env.VITE_WEBSOCKET_URL,
      publicUrl: import.meta.env.VITE_PUBLIC_URL,
      isDev: import.meta.env.VITE_APP_ENV === 'development',
      debug: import.meta.env.VITE_DEBUG === 'true'
    };
  };