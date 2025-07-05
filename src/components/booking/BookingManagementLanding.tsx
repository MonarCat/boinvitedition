import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Search, Calendar, PenSquare, ChevronLeft, ArrowRight } from 'lucide-react';
import { ClientBookingActions } from './ClientBookingActions';
import { CleanBookingLayout } from './CleanBookingLayout';

export const BookingManagementLanding = () => {
  const navigate = useNavigate();
  
  const goBack = () => {
    navigate(-1);
  };
  
  return (
    <CleanBookingLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex items-center">
          <Button variant="ghost" size="sm" onClick={goBack} className="text-gray-600">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
        </div>
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Manage Your Bookings</h1>
          <p className="text-gray-600">Find, view, or modify your appointments</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Link to="/booking/history" className="no-underline">
            <Card className="h-full hover:shadow-md transition-all border-blue-100 hover:border-blue-300">
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <Search className="h-6 w-6 text-blue-600" />
                </div>
                <h2 className="text-lg font-semibold mb-2">Find Your Booking</h2>
                <p className="text-gray-600 text-sm mb-4">
                  View your booking details by entering your name and phone number
                </p>
                <Button variant="outline" className="mt-auto w-full">
                  Find Booking
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </Link>
          
          <Link to="/booking/history" className="no-underline">
            <Card className="h-full hover:shadow-md transition-all border-amber-100 hover:border-amber-300">
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                  <Calendar className="h-6 w-6 text-amber-600" />
                </div>
                <h2 className="text-lg font-semibold mb-2">Reschedule</h2>
                <p className="text-gray-600 text-sm mb-4">
                  Change the date or time of your upcoming appointment
                </p>
                <Button variant="outline" className="mt-auto w-full">
                  Reschedule Booking
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </Link>
          
          <Link to="/booking/history" className="no-underline">
            <Card className="h-full hover:shadow-md transition-all border-green-100 hover:border-green-300">
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <PenSquare className="h-6 w-6 text-green-600" />
                </div>
                <h2 className="text-lg font-semibold mb-2">Write a Review</h2>
                <p className="text-gray-600 text-sm mb-4">
                  Share your feedback about a completed service
                </p>
                <Button variant="outline" className="mt-auto w-full">
                  Leave Feedback
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </Link>
        </div>
        
        <div className="bg-gray-50 p-6 rounded-lg border">
          <h2 className="text-xl font-semibold mb-4">How It Works</h2>
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                1
              </div>
              <div>
                <h3 className="font-medium">Enter Your Details</h3>
                <p className="text-gray-600 text-sm">Provide the name and phone number you used when booking</p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                2
              </div>
              <div>
                <h3 className="font-medium">Find Your Booking</h3>
                <p className="text-gray-600 text-sm">We'll show you all your bookings matching the information you provided</p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                3
              </div>
              <div>
                <h3 className="font-medium">Take Action</h3>
                <p className="text-gray-600 text-sm">View details, reschedule your appointment, or leave a review</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </CleanBookingLayout>
  );
};
