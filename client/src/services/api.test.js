import api from './api';

/**
 * Test backend API endpoints.
 */
const testEndpoints = async () => {
  console.log('%c[API TEST] Running backend API tests...', 'color: teal; font-weight: bold');

  const endpoints = [
    { name: 'Notifications', url: '/notifications' },
    { name: 'Dashboard Stats', url: '/dashboard' },
    { name: 'User Profile', url: '/users/profile' }
  ];

  for (const { name, url } of endpoints) {
    try {
      const res = await api.get(url);
      console.log(`✅ ${name} [${url}]`, res.data);
    } catch (error) {
      console.error(`❌ ${name} [${url}] FAILED`, {
        status: error.response?.status,
        message: error.response?.data?.message,
        url: error.config?.url
      });
    }
  }
};

// Auto-run tests in development mode
if (import.meta.env.DEV) {
  testEndpoints();
}

export { testEndpoints };
