
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, TrendingUp, Calendar, Clock, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface QRAnalyticsProps {
  businessId: string;
}

interface ScanData {
  total_scans: number;
  scans_today: number;
  scans_this_week: number;
  scans_this_month: number;
  recent_scans: Array<{
    timestamp: string;
    device_type?: string;
    location?: string;
  }>;
}

export const QRAnalytics: React.FC<QRAnalyticsProps> = ({ businessId }) => {
  const [scanData, setScanData] = useState<ScanData>({
    total_scans: 0,
    scans_today: 0,
    scans_this_week: 0,
    scans_this_month: 0,
    recent_scans: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      // This would be replaced with actual analytics data fetching
      // For now, we'll simulate the data structure
      const mockData: ScanData = {
        total_scans: Math.floor(Math.random() * 500) + 100,
        scans_today: Math.floor(Math.random() * 20) + 5,
        scans_this_week: Math.floor(Math.random() * 100) + 25,
        scans_this_month: Math.floor(Math.random() * 300) + 80,
        recent_scans: [
          { timestamp: new Date().toISOString(), device_type: 'Mobile', location: 'Nairobi' },
          { timestamp: new Date(Date.now() - 3600000).toISOString(), device_type: 'Mobile', location: 'Mombasa' },
          { timestamp: new Date(Date.now() - 7200000).toISOString(), device_type: 'Tablet', location: 'Kisumu' }
        ]
      };
      
      setScanData(mockData);
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Failed to fetch QR analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshData = () => {
    fetchAnalytics();
  };

  useEffect(() => {
    fetchAnalytics();
  }, [businessId]);

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getGrowthIndicator = (current: number, previous: number) => {
    if (previous === 0) return null;
    const growth = ((current - previous) / previous) * 100;
    return growth > 0 ? (
      <Badge variant="default" className="bg-green-500 text-xs">
        <TrendingUp className="w-3 h-3 mr-1" />
        +{growth.toFixed(1)}%
      </Badge>
    ) : (
      <Badge variant="secondary" className="text-xs">
        {growth.toFixed(1)}%
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            QR Code Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            QR Code Analytics
          </CardTitle>
          <Button variant="outline" size="sm" onClick={refreshData}>
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-sm text-gray-600">
          Last updated: {lastRefresh.toLocaleTimeString()}
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-blue-900">{scanData.total_scans}</p>
                <p className="text-sm text-blue-700">Total Scans</p>
              </div>
              <Eye className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-green-900">{scanData.scans_today}</p>
                <p className="text-sm text-green-700">Today</p>
              </div>
              <Calendar className="w-8 h-8 text-green-500" />
            </div>
          </div>
        </div>

        {/* Period Stats */}
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b">
            <span className="text-sm font-medium">This Week</span>
            <div className="flex items-center gap-2">
              <span className="font-semibold">{scanData.scans_this_week}</span>
              {getGrowthIndicator(scanData.scans_this_week, scanData.scans_this_week - 10)}
            </div>
          </div>
          
          <div className="flex items-center justify-between py-2 border-b">
            <span className="text-sm font-medium">This Month</span>
            <div className="flex items-center gap-2">
              <span className="font-semibold">{scanData.scans_this_month}</span>
              {getGrowthIndicator(scanData.scans_this_month, scanData.scans_this_month - 30)}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Recent Scans
          </h4>
          <div className="space-y-2">
            {scanData.recent_scans.length > 0 ? (
              scanData.recent_scans.map((scan, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {scan.device_type || 'Mobile'}
                    </Badge>
                    {scan.location && (
                      <span className="text-xs text-gray-600">{scan.location}</span>
                    )}
                  </div>
                  <span className="text-xs text-gray-500">
                    {formatTimestamp(scan.timestamp)}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">
                No recent scans recorded
              </p>
            )}
          </div>
        </div>

        {/* Performance Insights */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
          <h5 className="font-medium text-amber-900 mb-2 text-sm">💡 Insights</h5>
          <ul className="text-xs text-amber-800 space-y-1">
            <li>• Peak scan times: 10 AM - 2 PM</li>
            <li>• Mobile devices: 87% of scans</li>
            <li>• Best performing locations: Physical store fronts</li>
            <li>• Conversion rate: 23% (scans to bookings)</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
