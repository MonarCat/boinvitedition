import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Settings, Truck, Currency, ImagePlus, Scissors, Briefcase, Hotel, CalendarDays } from 'lucide-react';
import { SERVICE_CATEGORIES } from './ServiceCategories';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ServiceImageUpload } from './ServiceImageUpload';
import { RealServiceImageUpload } from './RealServiceImageUpload';
import { useAuth } from '@/hooks/useAuth';

interface EnhancedServiceFormProps {
  service?: any;
  onSuccess: () => void;
  onCancel: () => void;
}

export const EnhancedServiceForm: React.FC<EnhancedServiceFormProps> = ({
  service,
  onSuccess,
  onCancel
}) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'general',
    // Transport specific fields
    transport_details: '',
    transport_service_type: 'taxi',
    transport_service_class: '',
    transport_details_text: '',
    // Salon & Beauty specific fields
    salon_details: '',
    salon_service_type: '',
    salon_staff_required: false,
    // Barbershop specific fields
    barbershop_details: '',
    barbershop_service_type: '',
    barbershop_service_duration: 30,
    // Hospitality specific fields
    hospitality_details: '',
    hospitality_check_in: '',
    hospitality_check_out: '',
    hospitality_room_type: '',
    hospitality_max_guests: 2,
    // Event specific fields
    event_details: '',
    event_capacity: 0,
    event_venue: '',
    event_date: '',
    // Common fields
    price: 0,
    duration_minutes: 60,
    currency: 'KES',
    is_active: true,
    service_images: [] as string[],
  });

  // Get business_id from the user's business
  const { data: business } = useQuery({
    queryKey: ['user-business', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('businesses')
        .select('id')
        .eq('user_id', user.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  useEffect(() => {
    if (service) {
      let transportServiceType = 'taxi';
      let transportServiceClass = '';
      let transportDetailsText = '';
      
      // Salon/Beauty details
      let salonServiceType = '';
      let salonStaffRequired = false;
      let salonDetails = '';
      
      // Barbershop details
      let barbershopServiceType = '';
      let barbershopDetails = '';
      let barbershopDuration = 30;
      
      // Hospitality details
      let hospitalityRoomType = '';
      let hospitalityMaxGuests = 2;
      let hospitalityCheckIn = '';
      let hospitalityCheckOut = '';
      let hospitalityDetails = '';
      
      // Event details
      let eventVenue = '';
      let eventCapacity = 0;
      let eventDate = '';
      let eventDetails = '';
      
      // Parse transport_details if exists
      if (service.transport_details) {
        try {
          const parsedDetails = JSON.parse(service.transport_details);
          
          // Generic fields that might be in any category
          const additionalInfo = parsedDetails.additional_info || '';
          
          // Extract category-specific fields
          if (['transport', 'taxi', 'matatu-shuttle', 'bus', 'train'].includes(service.category)) {
            transportServiceType = parsedDetails.service_type || 'taxi';
            transportServiceClass = parsedDetails.service_class || '';
            transportDetailsText = additionalInfo;
          } 
          else if (['beauty-wellness', 'salon', 'spa'].includes(service.category)) {
            salonServiceType = parsedDetails.service_type || '';
            salonStaffRequired = parsedDetails.staff_required || false;
            salonDetails = additionalInfo;
          }
          else if (service.category === 'barbershop') {
            barbershopServiceType = parsedDetails.service_type || '';
            salonStaffRequired = parsedDetails.staff_required || false;
            barbershopDuration = parsedDetails.service_duration || 30;
            barbershopDetails = additionalInfo;
          }
          else if (service.category === 'hospitality') {
            hospitalityRoomType = parsedDetails.room_type || '';
            hospitalityMaxGuests = parsedDetails.max_guests || 2;
            hospitalityCheckIn = parsedDetails.check_in || '';
            hospitalityCheckOut = parsedDetails.check_out || '';
            hospitalityDetails = additionalInfo;
          }
          else if (service.category === 'events') {
            eventVenue = parsedDetails.venue || '';
            eventCapacity = parsedDetails.capacity || 0;
            eventDate = parsedDetails.event_date || '';
            eventDetails = additionalInfo;
          }
        } catch (e) {
          // If parsing fails, use the raw string as additional info
          transportDetailsText = service.transport_details;
        }
      }
      
      setFormData({
        name: service.name || '',
        description: service.description || '',
        category: service.category || 'general',
        
        // Transport specific fields
        transport_details: service.transport_details || '',
        transport_service_type: transportServiceType,
        transport_service_class: transportServiceClass,
        transport_details_text: transportDetailsText,
        
        // Salon specific fields
        salon_service_type: salonServiceType,
        salon_staff_required: salonStaffRequired,
        salon_details: salonDetails,
        
        // Barbershop specific fields
        barbershop_service_type: barbershopServiceType,
        barbershop_details: barbershopDetails,
        barbershop_service_duration: barbershopDuration,
        
        // Hospitality specific fields
        hospitality_room_type: hospitalityRoomType,
        hospitality_max_guests: hospitalityMaxGuests,
        hospitality_check_in: hospitalityCheckIn,
        hospitality_check_out: hospitalityCheckOut,
        hospitality_details: hospitalityDetails,
        
        // Event specific fields
        event_venue: eventVenue,
        event_capacity: eventCapacity,
        event_date: eventDate,
        event_details: eventDetails,
        
        // Common fields
        price: service.price || 0,
        duration_minutes: service.duration_minutes || 60,
        currency: service.currency || 'KES',
        is_active: service.is_active !== false,
        service_images: service.service_images || [] as string[],
      });
    }
  }, [service]);

  const queryClient = useQueryClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.description || !formData.price) {
      toast.error('Please fill in all required fields.');
      return;
    }

    if (formData.price <= 0) {
      toast.error('Price must be greater than zero.');
      return;
    }

    if (!business?.id) {
      toast.error('Business not found. Please ensure you have a business setup.');
      return;
    }

    // Prepare category-specific details as JSON
    let categoryDetails = null;
    
    // Transport specific data
    if (['transport', 'taxi', 'matatu-shuttle', 'bus', 'train'].includes(formData.category)) {
      categoryDetails = JSON.stringify({
        service_type: formData.transport_service_type || 'taxi',
        service_class: formData.transport_service_class || '',
        additional_info: formData.transport_details_text || ''
      });
    } 
    // Beauty & Salon specific data
    else if (['beauty-wellness', 'salon', 'spa'].includes(formData.category)) {
      categoryDetails = JSON.stringify({
        service_type: formData.salon_service_type || '',
        staff_required: formData.salon_staff_required,
        additional_info: formData.salon_details || ''
      });
    }
    // Barbershop specific data
    else if (formData.category === 'barbershop') {
      categoryDetails = JSON.stringify({
        service_type: formData.barbershop_service_type || '',
        staff_required: formData.salon_staff_required,
        service_duration: formData.barbershop_service_duration || 30,
        additional_info: formData.barbershop_details || ''
      });
    }
    // Hospitality specific data
    else if (formData.category === 'hospitality') {
      categoryDetails = JSON.stringify({
        room_type: formData.hospitality_room_type || '',
        max_guests: formData.hospitality_max_guests || 2,
        check_in: formData.hospitality_check_in || '',
        check_out: formData.hospitality_check_out || '',
        additional_info: formData.hospitality_details || ''
      });
    }
    // Events specific data
    else if (formData.category === 'events') {
      categoryDetails = JSON.stringify({
        venue: formData.event_venue || '',
        capacity: formData.event_capacity || 0,
        event_date: formData.event_date || '',
        additional_info: formData.event_details || ''
      });
    }
    
    const serviceData = {
      name: formData.name,
      description: formData.description,
      category: formData.category,
      business_id: business.id,
      price: parseFloat(formData.price.toString()),
      duration_minutes: parseInt(formData.duration_minutes.toString()),
      currency: formData.currency,
      is_active: formData.is_active,
      service_images: formData.service_images,
      transport_details: categoryDetails,
    };

    try {
      if (service) {
        // Update existing service
        const { error } = await supabase
          .from('services')
          .update(serviceData)
          .eq('id', service.id);

        if (error) throw error;
        toast.success('Service updated successfully!');
      } else {
        // Create new service
        const { data, error } = await supabase
          .from('services')
          .insert([serviceData])
          .select();

        if (error) throw error;
        toast.success('Service created successfully!');
      }
      
      queryClient.invalidateQueries({ queryKey: ['services'] });
      onSuccess();
    } catch (error: any) {
      console.error('Service operation failed:', error);
      toast.error(error.message || 'Failed to save service');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Service Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Service Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="category">Category</Label>
            <Select 
              value={formData.category} 
              onValueChange={(value) => setFormData({ ...formData, category: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {SERVICE_CATEGORIES.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.icon} {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="duration">Duration (minutes) *</Label>
            <Input
              id="duration"
              type="number"
              value={formData.duration_minutes}
              onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) || 60 })}
              required
            />
          </div>
        </CardContent>
      </Card>

      {/* Replace ServiceImageUpload with RealServiceImageUpload */}
      <RealServiceImageUpload
        serviceId={service?.id}
        images={formData.service_images}
        onImagesChange={(images) => setFormData({ ...formData, service_images: images })}
        maxImages={5}
      />

      {/* Transport Details (Conditionally Rendered) */}
      {formData.category === 'transport' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="w-5 h-5" />
              Transport Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="transport_service_type">Service Type</Label>
                <Select 
                  value={formData.transport_service_type || 'taxi'} 
                  onValueChange={(value) => setFormData({
                    ...formData,
                    transport_service_type: value,
                    transport_details: JSON.stringify({
                      ...JSON.parse(formData.transport_details || '{}'),
                      service_type: value
                    })
                  })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select service type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="taxi">Taxi Service</SelectItem>
                    <SelectItem value="shuttle">Shuttle Service</SelectItem>
                    <SelectItem value="bus">Bus Service</SelectItem>
                    <SelectItem value="train">Train Service</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="transport_service_class">Service Class</Label>
                <Select 
                  value={formData.transport_service_class || ''} 
                  onValueChange={(value) => setFormData({
                    ...formData,
                    transport_service_class: value,
                    transport_details: JSON.stringify({
                      ...JSON.parse(formData.transport_details || '{}'),
                      service_class: value
                    })
                  })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select service class" />
                  </SelectTrigger>
                  <SelectContent>
                    {formData.transport_service_type === 'taxi' && [
                      <SelectItem key="standard" value="Standard">Standard</SelectItem>,
                      <SelectItem key="premium" value="Premium">Premium</SelectItem>,
                      <SelectItem key="executive" value="Executive">Executive</SelectItem>,
                      <SelectItem key="xl" value="XL">XL</SelectItem>,
                      <SelectItem key="eco-friendly" value="Eco-friendly">Eco-friendly</SelectItem>
                    ]}
                    {formData.transport_service_type === 'shuttle' && [
                      <SelectItem key="14-seater" value="14-Seater">14-Seater</SelectItem>,
                      <SelectItem key="17-seater" value="17-Seater">17-Seater</SelectItem>,
                      <SelectItem key="24-seater" value="24-Seater">24-Seater</SelectItem>,
                      <SelectItem key="33-seater" value="33-Seater">33-Seater</SelectItem>
                    ]}
                    {formData.transport_service_type === 'bus' && [
                      <SelectItem key="economy" value="Economy">Economy</SelectItem>,
                      <SelectItem key="vip" value="VIP">VIP</SelectItem>,
                      <SelectItem key="premium" value="Premium">Premium</SelectItem>,
                      <SelectItem key="sleeper" value="Sleeper">Sleeper</SelectItem>
                    ]}
                    {formData.transport_service_type === 'train' && [
                      <SelectItem key="economy" value="Economy">Economy</SelectItem>,
                      <SelectItem key="business" value="Business">Business</SelectItem>,
                      <SelectItem key="first-class" value="First Class">First Class</SelectItem>
                    ]}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="transport_details">Additional Details</Label>
              <Textarea
                id="transport_details"
                placeholder="e.g., Vehicle type, capacity, route"
                value={formData.transport_details_text || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  transport_details_text: e.target.value,
                  transport_details: JSON.stringify({
                    ...JSON.parse(formData.transport_details || '{}'),
                    additional_info: e.target.value
                  })
                })}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Salon & Beauty Details (Conditionally Rendered) */}
      {['beauty-wellness', 'salon', 'spa'].includes(formData.category) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scissors className="w-5 h-5" />
              {formData.category === 'beauty-wellness' ? 'Beauty & Wellness Details' :
                formData.category === 'salon' ? 'Salon Details' : 'Spa Details'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="salon_service_type">Service Type</Label>
                <Select 
                  value={formData.salon_service_type || ''} 
                  onValueChange={(value) => setFormData({
                    ...formData,
                    salon_service_type: value
                  })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select service type" />
                  </SelectTrigger>
                  <SelectContent>
                    {formData.category === 'beauty-wellness' && [
                      <SelectItem key="facial" value="Facial">Facial Treatment</SelectItem>,
                      <SelectItem key="massage" value="Massage">Massage</SelectItem>,
                      <SelectItem key="manicure" value="Manicure">Manicure</SelectItem>,
                      <SelectItem key="pedicure" value="Pedicure">Pedicure</SelectItem>,
                      <SelectItem key="makeup" value="Makeup">Makeup</SelectItem>
                    ]}
                    {formData.category === 'salon' && [
                      <SelectItem key="haircut" value="Haircut">Haircut</SelectItem>,
                      <SelectItem key="haircolor" value="Hair Color">Hair Color</SelectItem>,
                      <SelectItem key="blowdry" value="Blowdry">Blowdry</SelectItem>,
                      <SelectItem key="braiding" value="Braiding">Braiding</SelectItem>,
                      <SelectItem key="hairstyling" value="Hairstyling">Hairstyling</SelectItem>
                    ]}
                    {formData.category === 'spa' && [
                      <SelectItem key="fullbody" value="Full Body Massage">Full Body Massage</SelectItem>,
                      <SelectItem key="hotstone" value="Hot Stone Massage">Hot Stone Massage</SelectItem>,
                      <SelectItem key="facial" value="Facial">Facial</SelectItem>,
                      <SelectItem key="bodyscrub" value="Body Scrub">Body Scrub</SelectItem>,
                      <SelectItem key="aromatherapy" value="Aromatherapy">Aromatherapy</SelectItem>
                    ]}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="salon_staff_required">Staff Required</Label>
                  <Switch
                    id="salon_staff_required"
                    checked={formData.salon_staff_required}
                    onCheckedChange={(checked) => setFormData({
                      ...formData,
                      salon_staff_required: checked
                    })}
                  />
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Does this service require a specific staff member?
                </p>
              </div>
            </div>
            
            <div>
              <Label htmlFor="salon_details">Additional Details</Label>
              <Textarea
                id="salon_details"
                placeholder="e.g., Materials used, process, aftercare instructions"
                value={formData.salon_details || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  salon_details: e.target.value
                })}
              />
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Barbershop Details */}
      {formData.category === 'barbershop' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scissors className="w-5 h-5" />
              Barbershop Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="barbershop_service_type">Service Type</Label>
                <Select 
                  value={formData.barbershop_service_type || ''} 
                  onValueChange={(value) => setFormData({
                    ...formData,
                    barbershop_service_type: value
                  })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select service type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="haircut">Classic Haircut</SelectItem>
                    <SelectItem value="beard_trim">Beard Trim & Shape</SelectItem>
                    <SelectItem value="shave">Hot Towel Shave</SelectItem>
                    <SelectItem value="wash_style">Hair Wash & Style</SelectItem>
                    <SelectItem value="full_grooming">Full Grooming Package</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="barbershop_service_duration">Service Duration (minutes)</Label>
                <Input
                  id="barbershop_service_duration"
                  type="number"
                  placeholder="30"
                  value={formData.barbershop_service_duration}
                  onChange={(e) => setFormData({
                    ...formData,
                    barbershop_service_duration: parseInt(e.target.value) || 30
                  })}
                />
              </div>
            </div>
            
            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="salon_staff_required">Staff Required</Label>
                <Switch
                  id="salon_staff_required"
                  checked={formData.salon_staff_required}
                  onCheckedChange={(checked) => setFormData({
                    ...formData,
                    salon_staff_required: checked
                  })}
                />
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Does this service require a specific barber?
              </p>
            </div>
            
            <div>
              <Label htmlFor="barbershop_details">Additional Details</Label>
              <Textarea
                id="barbershop_details"
                placeholder="e.g., Styling preferences, tools used, experience required"
                value={formData.barbershop_details || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  barbershop_details: e.target.value
                })}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Hospitality Details */}
      {formData.category === 'hospitality' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Hotel className="w-5 h-5" />
              Hospitality Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="hospitality_room_type">Room/Service Type</Label>
                <Select 
                  value={formData.hospitality_room_type || ''} 
                  onValueChange={(value) => setFormData({
                    ...formData,
                    hospitality_room_type: value
                  })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select room type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard Room</SelectItem>
                    <SelectItem value="deluxe">Deluxe Room</SelectItem>
                    <SelectItem value="suite">Suite</SelectItem>
                    <SelectItem value="executive">Executive Suite</SelectItem>
                    <SelectItem value="service">Room Service</SelectItem>
                    <SelectItem value="concierge">Concierge Service</SelectItem>
                    <SelectItem value="event">Event Space</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="hospitality_max_guests">Maximum Guests</Label>
                <Input
                  id="hospitality_max_guests"
                  type="number"
                  placeholder="2"
                  value={formData.hospitality_max_guests}
                  onChange={(e) => setFormData({
                    ...formData,
                    hospitality_max_guests: parseInt(e.target.value) || 2
                  })}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="hospitality_check_in">Standard Check-in Time</Label>
                <Input
                  id="hospitality_check_in"
                  type="time"
                  value={formData.hospitality_check_in || '14:00'}
                  onChange={(e) => setFormData({
                    ...formData,
                    hospitality_check_in: e.target.value
                  })}
                />
              </div>
              
              <div>
                <Label htmlFor="hospitality_check_out">Standard Check-out Time</Label>
                <Input
                  id="hospitality_check_out"
                  type="time"
                  value={formData.hospitality_check_out || '11:00'}
                  onChange={(e) => setFormData({
                    ...formData,
                    hospitality_check_out: e.target.value
                  })}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="hospitality_details">Amenities & Additional Details</Label>
              <Textarea
                id="hospitality_details"
                placeholder="e.g., Wifi, breakfast included, pool access, etc."
                value={formData.hospitality_details || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  hospitality_details: e.target.value
                })}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Events Details */}
      {formData.category === 'events' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="w-5 h-5" />
              Events Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="event_venue">Venue</Label>
                <Input
                  id="event_venue"
                  type="text"
                  placeholder="e.g., Main Hall, Garden, Rooftop"
                  value={formData.event_venue || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    event_venue: e.target.value
                  })}
                />
              </div>
              
              <div>
                <Label htmlFor="event_capacity">Maximum Capacity</Label>
                <Input
                  id="event_capacity"
                  type="number"
                  placeholder="100"
                  value={formData.event_capacity}
                  onChange={(e) => setFormData({
                    ...formData,
                    event_capacity: parseInt(e.target.value) || 0
                  })}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="event_date">Default Event Date (if applicable)</Label>
              <Input
                id="event_date"
                type="date"
                value={formData.event_date || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  event_date: e.target.value
                })}
              />
            </div>
            
            <div>
              <Label htmlFor="event_details">Event Details & Inclusions</Label>
              <Textarea
                id="event_details"
                placeholder="e.g., Catering options, equipment provided, setup/teardown services"
                value={formData.event_details || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  event_details: e.target.value
                })}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pricing and Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Currency className="w-5 h-5" />
            Pricing
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price">Price *</Label>
              <Input
                id="price"
                type="number"
                placeholder="0.00"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                required
              />
            </div>
            <div>
              <Label htmlFor="currency">Currency</Label>
              <Select onValueChange={(value) => setFormData({ ...formData, currency: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select currency" defaultValue={formData.currency} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="KES">KES</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="active"
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
            />
            <Label htmlFor="active">Active</Label>
          </div>
        </CardContent>
      </Card>

      {/* Submit Section */}
      <div className="flex justify-end space-x-2">
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {service ? 'Update Service' : 'Create Service'}
        </Button>
      </div>
    </form>
  );
};
