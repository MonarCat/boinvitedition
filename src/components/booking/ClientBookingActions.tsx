import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Calendar, Clock, PenSquare, Search, ArrowRight } from 'lucide-react';

export const ClientBookingActions = () => {
  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      <h1 className="text-3xl font-bold mb-8 text-center">Manage Your Bookings</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-2">
              <Search className="h-6 w-6 text-blue-600" />
            </div>
            <CardTitle>View Your Bookings</CardTitle>
            <CardDescription>
              View details for your past and upcoming appointments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 text-sm">
              Enter your name and phone number to access all of your booking details, including dates, times, and service information.
            </p>
          </CardContent>
          <CardFooter className="flex justify-between items-center">
            <Link to="/booking/history" className="w-full">
              <Button className="w-full">
                Find My Bookings
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardFooter>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mb-2">
              <Calendar className="h-6 w-6 text-amber-600" />
            </div>
            <CardTitle>Reschedule Appointment</CardTitle>
            <CardDescription>
              Change the date or time of your upcoming appointment
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 text-sm">
              Need to change your appointment? You can reschedule a confirmed booking at least 2 hours before the appointment time.
            </p>
          </CardContent>
          <CardFooter className="flex justify-between items-center">
            <Link to="/booking/history" className="w-full">
              <Button variant="outline" className="w-full">
                Reschedule Booking
                <Clock className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardFooter>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-2">
              <PenSquare className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle>Leave a Review</CardTitle>
            <CardDescription>
              Share your feedback about your completed service
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 text-sm">
              Your feedback helps other clients make informed decisions and helps businesses improve their services.
            </p>
          </CardContent>
          <CardFooter className="flex justify-between items-center">
            <Link to="/booking/history" className="w-full">
              <Button variant="outline" className="w-full">
                Write a Review
                <PenSquare className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>

      <div className="mt-12 bg-gray-50 rounded-lg p-6 border">
        <h2 className="text-xl font-semibold mb-4">How It Works</h2>
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
              1
            </div>
            <div>
              <h3 className="font-medium">Find Your Booking</h3>
              <p className="text-gray-600 text-sm">Enter the name and phone number you used when booking</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
              2
            </div>
            <div>
              <h3 className="font-medium">View Details</h3>
              <p className="text-gray-600 text-sm">See your appointment details, including date, time, and service information</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
              3
            </div>
            <div>
              <h3 className="font-medium">Take Action</h3>
              <p className="text-gray-600 text-sm">Reschedule eligible appointments or leave reviews for completed services</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="text-center mt-8">
        <p className="text-sm text-gray-500">
          Need help? Contact the business directly for assistance with your booking
        </p>
      </div>
    </div>
  );
};
