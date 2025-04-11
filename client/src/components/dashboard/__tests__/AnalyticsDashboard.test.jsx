import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import axios from 'axios';
import AnalyticsDashboard from '../AnalyticsDashboard';

// Mock axios
jest.mock('axios');

// Mock recharts as it doesn't work well in test environment
jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }) => <div>{children}</div>,
  LineChart: ({ children }) => <div>{children}</div>,
  Line: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
}));

describe('AnalyticsDashboard', () => {
  const mockAnalyticsData = {
    propertyViews: [{ date: '2023-01-01', views: 100 }],
    inquiries: [{ date: '2023-01-01', count: 50 }],
    totalProperties: 150,
    activeListings: 120,
    totalInquiries: 75,
    conversionRate: 25
  };

  beforeEach(() => {
    axios.get.mockReset();
  });

  test('renders loading state initially', () => {
    axios.get.mockImplementation(() => new Promise(() => {}));
    render(<AnalyticsDashboard />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  test('renders analytics data after successful API call', async () => {
    axios.get.mockResolvedValue({ data: mockAnalyticsData });
    render(<AnalyticsDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Total Properties')).toBeInTheDocument();
      expect(screen.getByText('150')).toBeInTheDocument();
      expect(screen.getByText('Active Listings')).toBeInTheDocument();
      expect(screen.getByText('120')).toBeInTheDocument();
      expect(screen.getByText('Total Inquiries')).toBeInTheDocument();
      expect(screen.getByText('75')).toBeInTheDocument();
      expect(screen.getByText('25%')).toBeInTheDocument();
    });
  });

  test('renders charts with correct titles', async () => {
    axios.get.mockResolvedValue({ data: mockAnalyticsData });
    render(<AnalyticsDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Property Views Trend')).toBeInTheDocument();
      expect(screen.getByText('Inquiries Trend')).toBeInTheDocument();
    });
  });

  test('handles API error gracefully', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    axios.get.mockRejectedValue(new Error('API Error'));
    
    render(<AnalyticsDashboard />);
    
    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalled();
    });
    
    consoleErrorSpy.mockRestore();
  });
});