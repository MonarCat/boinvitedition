import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useSupabase } from '@/hooks/useSupabase';
import { toast } from 'sonner';
import { Check, Clock, MapPin, Store, Users, Calendar, FileText, CreditCard, ArrowRight, Settings } from 'lucide-react';
import { TimePicker } from '@/components/ui/time-picker';

export function OnboardingWizard() {
  const { supabase } = useSupabase();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  
  const [data, setData] = useState({
    // Business Info
    businessName: '',
    businessDescription: '',
    logoUrl: '',
    coverImageUrl: '',
    
    // Location
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    
    // Contact
    phone: '',
    email: '',
    website: '',
    
    // Business Hours
    businessHours: {
      monday: { isOpen: true, open: '09:00', close: '17:00' },
      tuesday: { isOpen: true, open: '09:00', close: '17:00' },
      wednesday: { isOpen: true, open: '09:00', close: '17:00' },
      thursday: { isOpen: true, open: '09:00', close: '17:00' },
      friday: { isOpen: true, open: '09:00', close: '17:00' },
      saturday: { isOpen: false, open: '10:00', close: '15:00' },
      sunday: { isOpen: false, open: '10:00', close: '15:00' },
    },
    
    // Services
    services: [
      { name: '', description: '', duration: 30, price: 0 }
    ],
    
    // Staff
    staff: [
      { name: '', email: '', phone: '', role: 'Staff Member' }
    ],
    
    // Booking Settings
    appointmentBuffer: 15,
    allowCancellation: true,
    cancellationPeriod: 24,
    allowRescheduling: true,
    reschedulePeriod: 12,
    
    // Payment Settings
    currency: 'USD',
    acceptOnlinePayments: false,
    requireDeposit: false,
    depositAmount: 0,
    depositType: 'percentage',
  });
  
  const steps = [
    'Business Information',
    'Location',
    'Business Hours',
    'Services',
    'Staff Members',
    'Booking Settings',
    'Complete'
  ];

  const handleChange = (field, value) => {
    setData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const handleNestedChange = (parent, field, value) => {
    setData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value
      }
    }));
  };
  
  const handleBusinessHoursChange = (day, field, value) => {
    setData(prev => ({
      ...prev,
      businessHours: {
        ...prev.businessHours,
        [day]: {
          ...prev.businessHours[day],
          [field]: value
        }
      }
    }));
  };
  
  const handleArrayChange = (arrayName, index, field, value) => {
    setData(prev => {
      const newArray = [...prev[arrayName]];
      newArray[index] = {
        ...newArray[index],
        [field]: value
      };
      return {
        ...prev,
        [arrayName]: newArray
      };
    });
  };
  
  const addItem = (arrayName, defaultItem) => {
    setData(prev => ({
      ...prev,
      [arrayName]: [...prev[arrayName], defaultItem]
    }));
  };
  
  const removeItem = (arrayName, index) => {
    setData(prev => ({
      ...prev,
      [arrayName]: prev[arrayName].filter((_, i) => i !== index)
    }));
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      if (step < steps.length - 1) {
        setStep(step + 1);
      }
    }
  };

  const handlePrev = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };
  
  const validateCurrentStep = () => {
    switch (step) {
      case 0: // Business Info
        if (!data.businessName) {
          toast.error("Business name is required");
          return false;
        }
        return true;
        
      case 1: // Location
        return true; // Optional
        
      case 2: // Hours
        return true;
        
      case 3: // Services
        if (data.services.some(service => !service.name)) {
          toast.error("All services must have a name");
          return false;
        }
        return true;
        
      case 4: // Staff
        if (data.staff.some(person => !person.name || !person.email)) {
          toast.error("Staff members must have name and email");
          return false;
        }
        return true;
        
      case 5: // Booking Settings
        return true;
        
      default:
        return true;
    }
  };
  
  const completeOnboarding = async () => {
    setLoading(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      
      if (!userData?.user) {
        toast.error("You must be logged in to complete onboarding");
        return;
      }
      
      // Save business data
      const { data: business, error: businessError } = await supabase
        .from('businesses')
        .insert({
          name: data.businessName,
          description: data.businessDescription,
          logo_url: data.logoUrl,
          cover_image_url: data.coverImageUrl,
          address: data.address,
          city: data.city,
          state: data.state,
          country: data.country,
          postal_code: data.postalCode,
          phone: data.phone,
          email: data.email,
          website: data.website,
          business_hours: data.businessHours,
          user_id: userData.user.id
        })
        .select()
        .single();
      
      if (businessError) {
        throw businessError;
      }
      
      // Save services
      if (data.services.length > 0) {
        const servicesData = data.services
          .filter(service => service.name)
          .map(service => ({
            name: service.name,
            description: service.description || service.name,
            duration: service.duration,
            price: service.price,
            business_id: business.id,
            is_active: true
          }));
          
        if (servicesData.length > 0) {
          const { error: servicesError } = await supabase
            .from('services')
            .insert(servicesData);
          
          if (servicesError) throw servicesError;
        }
      }
      
      // Save staff
      if (data.staff.length > 0) {
        const staffData = data.staff
          .filter(person => person.name && person.email)
          .map(person => ({
            name: person.name,
            email: person.email,
            phone: person.phone || null,
            role: person.role || 'Staff Member',
            business_id: business.id,
            is_active: true
          }));
          
        if (staffData.length > 0) {
          const { error: staffError } = await supabase
            .from('staff')
            .insert(staffData);
          
          if (staffError) throw staffError;
        }
      }
      
      // Mark user as onboarded
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ is_onboarded: true })
        .eq('id', userData.user.id);
        
      if (profileError) throw profileError;
      
      toast.success("Business setup completed successfully!");
      setStep(6); // Move to success step
      
    } catch (error) {
      console.error("Onboarding error:", error);
      toast.error("There was an error setting up your business");
    } finally {
      setLoading(false);
    }
  };
  
  // Render progress indicator
  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {steps.map((stepName, i) => (
        <React.Fragment key={i}>
          <div 
            className={`flex flex-col items-center ${
              i === step 
                ? 'text-primary' 
                : i < step 
                  ? 'text-primary/70' 
                  : 'text-muted-foreground'
            }`}
          >
            <div className={`
              w-10 h-10 rounded-full flex items-center justify-center mb-1
              ${i === step ? 'bg-primary text-primary-foreground' : i < step ? 'bg-primary/20' : 'bg-muted'}
            `}>
              {i < step ? <Check className="h-5 w-5" /> : i + 1}
            </div>
            <span className="text-xs hidden md:block">{stepName}</span>
          </div>
          
          {i < steps.length - 1 && (
            <div className={`
              w-12 h-1 mx-1 
              ${i < step ? 'bg-primary/70' : 'bg-muted'}
            `} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
  
  return (
    <div className="container mx-auto py-8 px-4 max-w-3xl">
      <h1 className="text-3xl font-bold text-center mb-2">Welcome to Boinvit</h1>
      <p className="text-center text-muted-foreground mb-8">
        Let's set up your business profile in just a few steps
      </p>
      
      {renderStepIndicator()}
      
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="flex items-center">
            {step === 0 && <Store className="mr-2 h-5 w-5" />}
            {step === 1 && <MapPin className="mr-2 h-5 w-5" />}
            {step === 2 && <Clock className="mr-2 h-5 w-5" />}
            {step === 3 && <FileText className="mr-2 h-5 w-5" />}
            {step === 4 && <Users className="mr-2 h-5 w-5" />}
            {step === 5 && <Settings className="mr-2 h-5 w-5" />}
            {step === 6 && <Check className="mr-2 h-5 w-5" />}
            {steps[step]}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Step 1: Business Information */}
          {step === 0 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="businessName">Business Name*</Label>
                <Input
                  id="businessName"
                  value={data.businessName}
                  onChange={(e) => handleChange('businessName', e.target.value)}
                  placeholder="Your Business Name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="businessDescription">Description</Label>
                <Textarea
                  id="businessDescription"
                  value={data.businessDescription}
                  onChange={(e) => handleChange('businessDescription', e.target.value)}
                  placeholder="Brief description of your business"
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="logoUrl">Logo URL</Label>
                <Input
                  id="logoUrl"
                  value={data.logoUrl}
                  onChange={(e) => handleChange('logoUrl', e.target.value)}
                  placeholder="https://example.com/your-logo.png"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="coverImageUrl">Cover Image URL</Label>
                <Input
                  id="coverImageUrl"
                  value={data.coverImageUrl}
                  onChange={(e) => handleChange('coverImageUrl', e.target.value)}
                  placeholder="https://example.com/your-cover-image.jpg"
                />
              </div>
            </div>
          )}
          
          {/* Step 2: Location */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="address">Street Address</Label>
                <Input
                  id="address"
                  value={data.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  placeholder="123 Business St."
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={data.city}
                    onChange={(e) => handleChange('city', e.target.value)}
                    placeholder="City"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="state">State/Province</Label>
                  <Input
                    id="state"
                    value={data.state}
                    onChange={(e) => handleChange('state', e.target.value)}
                    placeholder="State"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="postalCode">Postal Code</Label>
                  <Input
                    id="postalCode"
                    value={data.postalCode}
                    onChange={(e) => handleChange('postalCode', e.target.value)}
                    placeholder="Postal Code"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    value={data.country}
                    onChange={(e) => handleChange('country', e.target.value)}
                    placeholder="Country"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={data.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="Phone Number"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={data.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    placeholder="business@example.com"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={data.website}
                    onChange={(e) => handleChange('website', e.target.value)}
                    placeholder="https://yourbusiness.com"
                  />
                </div>
              </div>
            </div>
          )}
          
          {/* Step 3: Business Hours */}
          {step === 2 && (
            <div className="space-y-4">
              {Object.entries(data.businessHours).map(([day, hours]) => (
                <div key={day} className="flex flex-wrap items-center gap-3 py-2">
                  <div className="w-24">
                    <Label>{day.charAt(0).toUpperCase() + day.slice(1)}</Label>
                  </div>
                  
                  <div className="flex items-center gap-2 mr-3">
                    <Switch 
                      id={`${day}-open`}
                      checked={hours.isOpen}
                      onCheckedChange={(checked) => 
                        handleBusinessHoursChange(day, 'isOpen', checked)
                      }
                    />
                    <Label htmlFor={`${day}-open`} className="cursor-pointer">
                      {hours.isOpen ? 'Open' : 'Closed'}
                    </Label>
                  </div>
                  
                  {hours.isOpen && (
                    <>
                      <div className="flex items-center gap-2">
                        <Input 
                          type="time"
                          value={hours.open}
                          onChange={(e) => 
                            handleBusinessHoursChange(day, 'open', e.target.value)
                          }
                          className="w-32"
                        />
                        <span>to</span>
                        <Input
                          type="time"
                          value={hours.close}
                          onChange={(e) => 
                            handleBusinessHoursChange(day, 'close', e.target.value)
                          }
                          className="w-32"
                        />
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
          
          {/* Step 4: Services */}
          {step === 3 && (
            <div className="space-y-6">
              {data.services.map((service, index) => (
                <Card key={index} className="p-4">
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <h3 className="font-medium">Service #{index + 1}</h3>
                      {index > 0 && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => removeItem('services', index)}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor={`service-name-${index}`}>Service Name*</Label>
                      <Input
                        id={`service-name-${index}`}
                        value={service.name}
                        onChange={(e) => 
                          handleArrayChange('services', index, 'name', e.target.value)
                        }
                        placeholder="e.g. Haircut, Massage, Consultation"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor={`service-description-${index}`}>Description</Label>
                      <Textarea
                        id={`service-description-${index}`}
                        value={service.description}
                        onChange={(e) => 
                          handleArrayChange('services', index, 'description', e.target.value)
                        }
                        placeholder="Brief description of the service"
                        rows={2}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`service-duration-${index}`}>Duration (minutes)</Label>
                        <Input
                          id={`service-duration-${index}`}
                          type="number"
                          value={service.duration}
                          onChange={(e) => 
                            handleArrayChange('services', index, 'duration', Number(e.target.value))
                          }
                          min="5"
                          step="5"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor={`service-price-${index}`}>Price</Label>
                        <Input
                          id={`service-price-${index}`}
                          type="number"
                          value={service.price}
                          onChange={(e) => 
                            handleArrayChange('services', index, 'price', Number(e.target.value))
                          }
                          min="0"
                          step="0.01"
                        />
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
              
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => 
                  addItem('services', { name: '', description: '', duration: 30, price: 0 })
                }
              >
                Add Another Service
              </Button>
            </div>
          )}
          
          {/* Step 5: Staff */}
          {step === 4 && (
            <div className="space-y-6">
              {data.staff.map((person, index) => (
                <Card key={index} className="p-4">
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <h3 className="font-medium">Staff Member #{index + 1}</h3>
                      {index > 0 && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => removeItem('staff', index)}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor={`staff-name-${index}`}>Name*</Label>
                      <Input
                        id={`staff-name-${index}`}
                        value={person.name}
                        onChange={(e) => 
                          handleArrayChange('staff', index, 'name', e.target.value)
                        }
                        placeholder="Staff Member Name"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor={`staff-email-${index}`}>Email*</Label>
                      <Input
                        id={`staff-email-${index}`}
                        type="email"
                        value={person.email}
                        onChange={(e) => 
                          handleArrayChange('staff', index, 'email', e.target.value)
                        }
                        placeholder="email@example.com"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`staff-phone-${index}`}>Phone</Label>
                        <Input
                          id={`staff-phone-${index}`}
                          value={person.phone}
                          onChange={(e) => 
                            handleArrayChange('staff', index, 'phone', e.target.value)
                          }
                          placeholder="Phone Number"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor={`staff-role-${index}`}>Role</Label>
                        <Select
                          value={person.role}
                          onValueChange={(value) => 
                            handleArrayChange('staff', index, 'role', value)
                          }
                        >
                          <SelectTrigger id={`staff-role-${index}`}>
                            <SelectValue placeholder="Select a role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Owner">Owner</SelectItem>
                            <SelectItem value="Manager">Manager</SelectItem>
                            <SelectItem value="Staff Member">Staff Member</SelectItem>
                            <SelectItem value="Receptionist">Receptionist</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
              
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => 
                  addItem('staff', { name: '', email: '', phone: '', role: 'Staff Member' })
                }
              >
                Add Another Staff Member
              </Button>
            </div>
          )}
          
          {/* Step 6: Booking Settings */}
          {step === 5 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="appointmentBuffer">
                  Appointment Buffer (minutes between bookings)
                </Label>
                <Select
                  value={data.appointmentBuffer.toString()}
                  onValueChange={(value) => handleChange('appointmentBuffer', Number(value))}
                >
                  <SelectTrigger id="appointmentBuffer">
                    <SelectValue placeholder="Select buffer time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">No Buffer</SelectItem>
                    <SelectItem value="5">5 minutes</SelectItem>
                    <SelectItem value="10">10 minutes</SelectItem>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="allowCancellation" className="block mb-1">
                      Allow Cancellations
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Let clients cancel their appointments
                    </p>
                  </div>
                  <Switch 
                    id="allowCancellation"
                    checked={data.allowCancellation}
                    onCheckedChange={(checked) => handleChange('allowCancellation', checked)}
                  />
                </div>
                
                {data.allowCancellation && (
                  <div className="space-y-2">
                    <Label htmlFor="cancellationPeriod">
                      Cancellation Period (hours before appointment)
                    </Label>
                    <Select
                      value={data.cancellationPeriod.toString()}
                      onValueChange={(value) => handleChange('cancellationPeriod', Number(value))}
                    >
                      <SelectTrigger id="cancellationPeriod">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 hour</SelectItem>
                        <SelectItem value="2">2 hours</SelectItem>
                        <SelectItem value="4">4 hours</SelectItem>
                        <SelectItem value="12">12 hours</SelectItem>
                        <SelectItem value="24">24 hours (1 day)</SelectItem>
                        <SelectItem value="48">48 hours (2 days)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="allowRescheduling" className="block mb-1">
                      Allow Rescheduling
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Let clients reschedule their appointments
                    </p>
                  </div>
                  <Switch 
                    id="allowRescheduling"
                    checked={data.allowRescheduling}
                    onCheckedChange={(checked) => handleChange('allowRescheduling', checked)}
                  />
                </div>
                
                {data.allowRescheduling && (
                  <div className="space-y-2">
                    <Label htmlFor="reschedulePeriod">
                      Reschedule Period (hours before appointment)
                    </Label>
                    <Select
                      value={data.reschedulePeriod.toString()}
                      onValueChange={(value) => handleChange('reschedulePeriod', Number(value))}
                    >
                      <SelectTrigger id="reschedulePeriod">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 hour</SelectItem>
                        <SelectItem value="2">2 hours</SelectItem>
                        <SelectItem value="4">4 hours</SelectItem>
                        <SelectItem value="12">12 hours</SelectItem>
                        <SelectItem value="24">24 hours (1 day)</SelectItem>
                        <SelectItem value="48">48 hours (2 days)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Step 7: Success */}
          {step === 6 && (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center mb-4">
                <Check className="h-10 w-10 text-green-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Setup Complete!</h3>
              <p className="text-center mb-6 text-muted-foreground">
                Your business is now ready to accept bookings. You can customize more settings in your dashboard.
              </p>
              <Button 
                className="w-full"
                onClick={() => window.location.href = '/app/dashboard'}
              >
                Go to Dashboard
              </Button>
            </div>
          )}
        </CardContent>
        
        {step < 6 && (
          <CardFooter className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={handlePrev}
              disabled={step === 0}
            >
              Previous
            </Button>
            
            {step < 5 ? (
              <Button type="button" onClick={handleNext}>
                Next <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button 
                type="button"
                onClick={completeOnboarding}
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Complete Setup'}
              </Button>
            )}
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
