import api from './api';

// Test API endpoints
const testEndpoints = async () => {
  try {
    console.log('Testing API endpoints...');
    
    // Test notifications endpoint
    const notificationsResponse = await api.get('/notifications');
    console.log('Notifications:', notificationsResponse.data);
    
    // Test dashboard endpoint
    const dashboardResponse = await api.get('/dashboard');
    console.log('Dashboard:', dashboardResponse.data);
    
  } catch (error) {
    console.error('Test failed:', {
      endpoint: error.config?.url,
      status: error.response?.status,
      message: error.response?.data?.message
    });
  }
};

// Run tests when in development
if (import.meta.env.DEV) {
  testEndpoints();
}

export { testEndpoints };