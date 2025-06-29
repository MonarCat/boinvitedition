import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Download, Smartphone, CheckCircle, Sparkles } from 'lucide-react';

const AppDownloadPage = () => {
  return (
    <div className="container mx-auto py-12 px-4 md:px-6 lg:px-8 max-w-4xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">
          Get the Boinvit Mobile App
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Book services, manage appointments, and make payments on the go with our mobile app.
        </p>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl">Boinvit App</CardTitle>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              Latest Version
            </Badge>
          </div>
          <CardDescription>Fast, secure, and convenient booking experience</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex flex-col space-y-4">
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <h3 className="font-medium">Simple Booking Process</h3>
                  <p className="text-sm text-muted-foreground">
                    Book services in just a few taps with our streamlined interface
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <h3 className="font-medium">Secure Payments</h3>
                  <p className="text-sm text-muted-foreground">
                    Pay safely with integrated Paystack payment processing
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <h3 className="font-medium">Booking History</h3>
                  <p className="text-sm text-muted-foreground">
                    View and manage all your bookings in one place
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex justify-center items-center">
              <div className="bg-gray-100 rounded-xl p-6 w-48 h-80 flex items-center justify-center">
                <div className="text-center">
                  <Smartphone className="h-12 w-12 mx-auto text-primary mb-2" />
                  <p className="text-sm text-muted-foreground">
                    App Preview Image
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col items-stretch space-y-4">
          <Button 
            className="w-full bg-primary" 
            size="lg"
            onClick={() => window.location.href = '/downloads/boinvit-app.apk'}
          >
            <Download className="mr-2 h-4 w-4" /> Download APK (Android)
          </Button>
          <p className="text-xs text-center text-muted-foreground" id="version-info">
            Version 0.1.0 | Released: June 29, 2025
          </p>
          
          {/* Fetch and display latest version info */}
          <script dangerouslySetInnerHTML={{ __html: `
            fetch('/downloads/app-version.json')
              .then(response => response.json())
              .then(data => {
                document.getElementById('version-info').textContent = 
                  'Version ' + data.version + ' | Released: ' + 
                  new Date(data.buildDate).toLocaleDateString();
              })
              .catch(error => console.error('Error fetching version info:', error));
          `}} />
          
        </CardFooter>
      </Card>
      
      <div className="bg-blue-50 border border-blue-100 rounded-lg p-6 mb-8">
        <div className="flex items-start space-x-3">
          <Sparkles className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-blue-800">Installation Instructions</h3>
            <ol className="mt-2 space-y-2 text-sm text-blue-700">
              <li>1. Download the APK file to your Android device</li>
              <li>2. Open the downloaded file</li>
              <li>3. If prompted, allow installation from unknown sources</li>
              <li>4. Follow the on-screen instructions to complete installation</li>
              <li>5. Open the app and sign in or create a new account</li>
            </ol>
          </div>
        </div>
      </div>
      
      <Separator className="my-8" />
      
      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          Having trouble? <a href="#" className="text-primary hover:underline">Contact our support team</a>
        </p>
      </div>
    </div>
  );
};

export default AppDownloadPage;
