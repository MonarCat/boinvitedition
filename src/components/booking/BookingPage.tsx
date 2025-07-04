import React, { useState } from 'react';
import { useBooking } from '@/hooks/useBooking';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Separator } from '@/components/ui/separator';
import { StaffMember, Service } from '@/types/models';
import { ChevronRight, Clock, CalendarDays, User, Sparkles } from 'lucide-react';

export function BookingPage() {
  const {
    services,
    staff,
    selectedService,
    selectedDate,
    selectedTime,
    selectedStaff,
    isLoading,
    isBookingInProgress,
    setSelectedService,
    setSelectedDate,
    setSelectedTime,
    setSelectedStaff,
    createBooking,
    getAvailableTimeSlots,
  } = useBooking();

  const [activeStep, setActiveStep] = useState(0);
  const [clientData, setClientData] = useState({
    name: '',
    email: '',
    phone: '',
    notes: '',
  });

  const availableTimeSlots = selectedDate && selectedService
    ? getAvailableTimeSlots(selectedDate, selectedService.id)
    : [];

  const handleSelectService = (service: Service) => {
    setSelectedService(service);
    setActiveStep(1);
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      setActiveStep(2);
    }
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    setActiveStep(3);
  };

  const handleStaffSelect = (staffId: string) => {
    const staffMember = staff.find(s => s.id === staffId);
    if (staffMember) {
      setSelectedStaff(staffMember);
      setActiveStep(4);
    } else {
      setSelectedStaff(null);
      setActiveStep(4);
    }
  };

  const handleClientDataChange = (field: string, value: string) => {
    setClientData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCreateBooking = async () => {
    if (!clientData.name || !clientData.email) {
      toast.error('Please provide your name and email');
      return;
    }

    try {
      await createBooking(clientData);
      toast.success('Booking created successfully!');
      setActiveStep(5);
    } catch (error) {
      toast.error('Failed to create booking');
      console.error(error);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-96">Loading booking data...</div>;
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Book Your Appointment</h1>

      <div className="flex items-center mb-8 overflow-x-auto pb-2">
        <div className={`flex items-center ${activeStep >= 0 ? 'text-primary' : 'text-muted-foreground'}`}>
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-2">
            <Sparkles className="h-4 w-4" />
          </div>
          <span className="text-sm font-medium">Service</span>
        </div>
        <ChevronRight className="mx-2 h-4 w-4 text-muted-foreground" />
        <div className={`flex items-center ${activeStep >= 1 ? 'text-primary' : 'text-muted-foreground'}`}>
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-2">
            <CalendarDays className="h-4 w-4" />
          </div>
          <span className="text-sm font-medium">Date</span>
        </div>
        <ChevronRight className="mx-2 h-4 w-4 text-muted-foreground" />
        <div className={`flex items-center ${activeStep >= 2 ? 'text-primary' : 'text-muted-foreground'}`}>
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-2">
            <Clock className="h-4 w-4" />
          </div>
          <span className="text-sm font-medium">Time</span>
        </div>
        <ChevronRight className="mx-2 h-4 w-4 text-muted-foreground" />
        <div className={`flex items-center ${activeStep >= 3 ? 'text-primary' : 'text-muted-foreground'}`}>
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-2">
            <User className="h-4 w-4" />
          </div>
          <span className="text-sm font-medium">Staff</span>
        </div>
        <ChevronRight className="mx-2 h-4 w-4 text-muted-foreground" />
        <div className={`flex items-center ${activeStep >= 4 ? 'text-primary' : 'text-muted-foreground'}`}>
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-2">
            <span className="text-xs font-medium">5</span>
          </div>
          <span className="text-sm font-medium">Confirm</span>
        </div>
      </div>

      {/* Step 1: Select Service */}
      <div className={activeStep === 0 ? 'block' : 'hidden'}>
        <h2 className="text-xl font-semibold mb-4">Select a Service</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {services.map((service) => (
            <Card 
              key={service.id}
              className={`cursor-pointer hover:shadow-md transition-all ${
                selectedService?.id === service.id ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => handleSelectService(service)}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{service.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-1">{service.description}</p>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-sm">{service.duration} min</span>
                  <span className="font-medium">${parseFloat(service.price.toString()).toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Step 2: Select Date */}
      <div className={activeStep === 1 ? 'block' : 'hidden'}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Select a Date</h2>
          <Button variant="ghost" onClick={() => setActiveStep(0)}>
            Back to Services
          </Button>
        </div>

        <Card>
          <CardContent className="p-4">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              className="rounded-md border"
              disabled={(date) => 
                date < new Date() || // Disable past dates
                date > new Date(new Date().setMonth(new Date().getMonth() + 2)) // Allow booking up to 2 months ahead
              }
            />
          </CardContent>
        </Card>
      </div>

      {/* Step 3: Select Time */}
      <div className={activeStep === 2 ? 'block' : 'hidden'}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Select a Time</h2>
          <Button variant="ghost" onClick={() => setActiveStep(1)}>
            Back to Calendar
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Available Time Slots</CardTitle>
          </CardHeader>
          <CardContent>
            {availableTimeSlots.length > 0 ? (
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                {availableTimeSlots.map(time => (
                  <Button
                    key={time}
                    variant={selectedTime === time ? "default" : "outline"}
                    className="text-center py-2"
                    onClick={() => handleTimeSelect(time)}
                  >
                    {time}
                  </Button>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No available time slots for this date.
                <br />
                Please select another date.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Step 4: Select Staff (Optional) */}
      <div className={activeStep === 3 ? 'block' : 'hidden'}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Select Staff (Optional)</h2>
          <Button variant="ghost" onClick={() => setActiveStep(2)}>
            Back to Time Selection
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Choose a Staff Member</CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup value={selectedStaff?.id} onValueChange={handleStaffSelect}>
              <div className="grid gap-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="any" id="any" />
                  <Label htmlFor="any">Any Available Staff</Label>
                </div>
                
                <Separator />
                
                {staff.map((staffMember) => (
                  <div key={staffMember.id} className="flex items-center space-x-2">
                    <RadioGroupItem value={staffMember.id} id={staffMember.id} />
                    <Label htmlFor={staffMember.id}>{staffMember.name}</Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full" 
              onClick={() => setActiveStep(4)}
            >
              Continue
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Step 5: Confirm and Pay */}
      <div className={activeStep === 4 ? 'block' : 'hidden'}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Confirm Booking</h2>
          <Button variant="ghost" onClick={() => setActiveStep(3)}>
            Back to Staff Selection
          </Button>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Booking Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Service:</span>
                <span className="font-medium">{selectedService?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Date:</span>
                <span className="font-medium">{selectedDate?.toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Time:</span>
                <span className="font-medium">{selectedTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Staff:</span>
                <span className="font-medium">{selectedStaff?.name || 'Any available staff'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Duration:</span>
                <span className="font-medium">{selectedService?.duration} minutes</span>
              </div>
              
              <Separator />
              
              <div className="flex justify-between font-bold">
                <span>Total:</span>
                <span>${selectedService ? parseFloat(selectedService.price.toString()).toFixed(2) : '0.00'}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Your Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name*</Label>
                <Input
                  id="name"
                  value={clientData.name}
                  onChange={(e) => handleClientDataChange('name', e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email*</Label>
                <Input
                  id="email"
                  type="email"
                  value={clientData.email}
                  onChange={(e) => handleClientDataChange('email', e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={clientData.phone}
                  onChange={(e) => handleClientDataChange('phone', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes">Special Notes</Label>
                <Textarea
                  id="notes"
                  value={clientData.notes}
                  onChange={(e) => handleClientDataChange('notes', e.target.value)}
                  placeholder="Any special requests or notes for your appointment"
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                onClick={handleCreateBooking}
                disabled={isBookingInProgress || !clientData.name || !clientData.email}
              >
                {isBookingInProgress ? 'Processing...' : 'Confirm & Pay'}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* Step 6: Success */}
      <div className={activeStep === 5 ? 'block' : 'hidden'}>
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-800 flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Booking Confirmed!
            </CardTitle>
          </CardHeader>
          <CardContent className="text-green-800">
            <p className="mb-4">
              Your appointment has been successfully booked. A confirmation email has been sent to {clientData.email}.
            </p>
            <div className="bg-white rounded-lg p-4 mb-4">
              <h3 className="font-semibold mb-2">Appointment Details</h3>
              <div className="space-y-1 text-sm">
                <p><strong>Service:</strong> {selectedService?.name}</p>
                <p><strong>Date:</strong> {selectedDate?.toLocaleDateString()}</p>
                <p><strong>Time:</strong> {selectedTime}</p>
                {selectedStaff && <p><strong>Staff:</strong> {selectedStaff.name}</p>}
                <p><strong>Total:</strong> ${selectedService ? parseFloat(selectedService.price.toString()).toFixed(2) : '0.00'}</p>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <div className="flex flex-col gap-2 w-full">
              <Button 
                className="w-full"
                onClick={() => {
                  // Reset form and go back to step 1
                  setSelectedService(null);
                  setSelectedDate(null);
                  setSelectedTime('');
                  setSelectedStaff(null);
                  setClientData({
                    name: '',
                    email: '',
                    phone: '',
                    notes: '',
                  });
                  setActiveStep(0);
                }}
              >
                Book Another Appointment
              </Button>
              
              <Button 
                variant="outline"
                className="w-full"
                onClick={() => {
                  // Navigate to dashboard or home
                  window.location.href = '/app/dashboard';
                }}
              >
                Return to Dashboard
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
