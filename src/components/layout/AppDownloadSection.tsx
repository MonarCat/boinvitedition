
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Smartphone, Briefcase, CalendarClock } from 'lucide-react';

interface AppDownloadData {
  name: string;
  description: string;
  icon: React.ReactNode;
  appUrl: string;
  features: string[];
  isPrimary?: boolean;
}

export const AppDownloadSection = () => {
  const apps: AppDownloadData[] = [
    {
      name: "Boinvit for Business",
      description: "Manage your business bookings, staff, and services",
      icon: <Briefcase className="w-8 h-8 text-indigo-600" />,
      appUrl: "/downloads/boinvit-app.apk",
      features: [
        "Manage bookings and appointments",
        "Staff scheduling and management",
        "Service configuration",
        "Business analytics",
        "Client database",
        "Payment tracking",
      ],
      isPrimary: true
    },
    {
      name: "Boinvit for Booking",
      description: "Book and manage your appointments with ease",
      icon: <CalendarClock className="w-8 h-8 text-emerald-600" />,
      appUrl: "/downloads/boinvit-client.apk",
      features: [
        "Book services quickly",
        "Track appointment status",
        "Reschedule appointments",
        "QR code scanner",
        "Payment integration",
        "Saved booking details",
      ],
    }
  ];

  return (
    <div className="py-16 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-bold text-3xl md:text-4xl mb-4">
            Download Our Mobile Apps
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Enhance your Boinvit experience with our mobile applications. Choose the app that fits your needs.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {apps.map((app, index) => (
            <Card key={index} className={`overflow-hidden border-2 ${app.isPrimary ? 'border-indigo-500' : 'border-emerald-500'}`}>
              <CardHeader className={`${app.isPrimary ? 'bg-indigo-500' : 'bg-emerald-500'} text-white p-6`}>
                <div className="flex items-center gap-4">
                  {app.icon}
                  <div>
                    <CardTitle className="text-xl font-bold">{app.name}</CardTitle>
                    <CardDescription className="text-white/90">{app.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <ul className="mb-6 space-y-2">
                  {app.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <div className={`w-5 h-5 rounded-full mt-1 flex items-center justify-center text-white ${app.isPrimary ? 'bg-indigo-500' : 'bg-emerald-500'}`}>
                        ✓
                      </div>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button 
                  className={`w-full ${app.isPrimary ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}
                  onClick={() => window.location.href = app.appUrl}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download App
                </Button>
                <p className="text-xs text-gray-500 text-center mt-4">
                  Android only. iOS version coming soon.
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <p className="text-gray-600 flex items-center justify-center gap-2">
            <Smartphone className="w-4 h-4" />
            Both apps require Android 7.0 or higher
          </p>
        </div>
      </div>
    </div>
  );
};
