
import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Building, MapPin, Phone, Mail, Globe, Camera } from 'lucide-react';
import { toast } from 'sonner';

interface BusinessSetupData {
  name: string;
  description: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  country: string;
  currency: string;
  subdomain: string;
  website: string;
}

export const ProductionBusinessSetup = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const [businessData, setBusinessData] = useState<BusinessSetupData>({
    name: '',
    description: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    country: 'Kenya',
    currency: 'KES',
    subdomain: '',
    website: ''
  });

  const handleInputChange = (field: keyof BusinessSetupData, value: string) => {
    setBusinessData(prev => ({ ...prev, [field]: value }));
    
    // Auto-generate subdomain from business name
    if (field === 'name') {
      const subdomain = value
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .trim();
      setBusinessData(prev => ({ ...prev, subdomain }));
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('Logo file size should be less than 5MB');
        return;
      }
      
      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = (): boolean => {
    if (!businessData.name.trim()) {
      setError('Business name is required');
      return false;
    }
    
    if (!businessData.description.trim()) {
      setError('Business description is required');
      return false;
    }
    
    if (!businessData.phone.trim()) {
      setError('Phone number is required');
      return false;
    }
    
    if (!businessData.city.trim()) {
      setError('City is required');
      return false;
    }
    
    // Validate subdomain
    if (businessData.subdomain && !/^[a-z0-9-]+$/.test(businessData.subdomain)) {
      setError('Subdomain can only contain lowercase letters, numbers, and hyphens');
      return false;
    }
    
    return true;
  };

  const uploadLogo = async (): Promise<string | null> => {
    if (!logoFile || !user) return null;
    
    try {
      const fileExt = logoFile.name.split('.').pop();
      const fileName = `${user.id}/logo-${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('business-assets')
        .upload(fileName, logoFile);
      
      if (uploadError) throw uploadError;
      
      const { data } = supabase.storage
        .from('business-assets')
        .getPublicUrl(fileName);
      
      return data.publicUrl;
    } catch (error) {
      console.error('Logo upload error:', error);
      toast.error('Failed to upload logo');
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !validateForm()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Check if subdomain is already taken
      if (businessData.subdomain) {
        const { data: existingBusiness } = await supabase
          .from('businesses')
          .select('id')
          .eq('subdomain', businessData.subdomain)
          .single();
          
        if (existingBusiness) {
          setError('This subdomain is already taken. Please choose another one.');
          setLoading(false);
          return;
        }
      }
      
      // Upload logo if provided
      const logoUrl = await uploadLogo();
      
      // Create business
      const { data: business, error: businessError } = await supabase
        .from('businesses')
        .insert({
          user_id: user.id,
          name: businessData.name.trim(),
          description: businessData.description.trim(),
          phone: businessData.phone.trim(),
          email: businessData.email.trim() || user.email,
          address: businessData.address.trim(),
          city: businessData.city.trim(),
          country: businessData.country,
          currency: businessData.currency,
          subdomain: businessData.subdomain || null,
          website: businessData.website.trim() || null,
          logo_url: logoUrl,
          is_active: true
        })
        .select()
        .single();
      
      if (businessError) throw businessError;
      
      // Create default business settings
      const { error: settingsError } = await supabase
        .from('business_settings')
        .insert({
          business_id: business.id,
          currency: businessData.currency,
          timezone: 'Africa/Nairobi',
          auto_confirm_bookings: true,
          send_reminders: true,
          reminder_hours_before: 2,
          booking_advance_days: 7,
          booking_slot_duration_minutes: 60,
          max_bookings_per_slot: 1,
          show_on_map: true
        });
      
      if (settingsError) throw settingsError;
      
      toast.success('Business profile created successfully!');
      
      // Redirect to dashboard
      window.location.href = '/dashboard';
      
    } catch (error: any) {
      console.error('Business setup error:', error);
      setError(error.message || 'Failed to create business profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-900 flex items-center justify-center gap-2">
              <Building className="w-6 h-6" />
              Set Up Your Business Profile
            </CardTitle>
            <p className="text-gray-600">Create your business profile to start accepting bookings</p>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert className="mb-6 border-red-200 bg-red-50">
                <AlertDescription className="text-red-800">{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Logo Upload */}
              <div className="space-y-2">
                <Label>Business Logo (Optional)</Label>
                <div className="flex items-center gap-4">
                  {logoPreview ? (
                    <img src={logoPreview} alt="Logo preview" className="w-16 h-16 rounded-lg object-cover" />
                  ) : (
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Camera className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                  <div>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoChange}
                      className="hidden"
                      id="logo-upload"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('logo-upload')?.click()}
                      disabled={loading}
                    >
                      Choose Logo
                    </Button>
                    <p className="text-xs text-gray-500 mt-1">Max 5MB, JPG or PNG</p>
                  </div>
                </div>
              </div>

              {/* Business Name */}
              <div className="space-y-2">
                <Label htmlFor="business-name">Business Name *</Label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="business-name"
                    type="text"
                    placeholder="Your business name"
                    value={businessData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="pl-10"
                    disabled={loading}
                    required
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Business Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your business and services"
                  value={businessData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  disabled={loading}
                  rows={3}
                  required
                />
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+254700000000"
                      value={businessData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="pl-10"
                      disabled={loading}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email (Optional)</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="business@example.com"
                      value={businessData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="pl-10"
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="address"
                      type="text"
                      placeholder="Street address"
                      value={businessData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      className="pl-10"
                      disabled={loading}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      type="text"
                      placeholder="City"
                      value={businessData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      disabled={loading}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Select value={businessData.country} onValueChange={(value) => handleInputChange('country', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Kenya">Kenya</SelectItem>
                        <SelectItem value="Uganda">Uganda</SelectItem>
                        <SelectItem value="Tanzania">Tanzania</SelectItem>
                        <SelectItem value="Rwanda">Rwanda</SelectItem>
                        <SelectItem value="Nigeria">Nigeria</SelectItem>
                        <SelectItem value="Ghana">Ghana</SelectItem>
                        <SelectItem value="South Africa">South Africa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Currency */}
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Select value={businessData.currency} onValueChange={(value) => handleInputChange('currency', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="KES">KES - Kenyan Shilling</SelectItem>
                    <SelectItem value="UGX">UGX - Ugandan Shilling</SelectItem>
                    <SelectItem value="TZS">TZS - Tanzanian Shilling</SelectItem>
                    <SelectItem value="RWF">RWF - Rwandan Franc</SelectItem>
                    <SelectItem value="NGN">NGN - Nigerian Naira</SelectItem>
                    <SelectItem value="GHS">GHS - Ghanaian Cedi</SelectItem>
                    <SelectItem value="ZAR">ZAR - South African Rand</SelectItem>
                    <SelectItem value="USD">USD - US Dollar</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Website & Subdomain */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="website">Website (Optional)</Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="website"
                      type="url"
                      placeholder="https://yourwebsite.com"
                      value={businessData.website}
                      onChange={(e) => handleInputChange('website', e.target.value)}
                      className="pl-10"
                      disabled={loading}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subdomain">Booking Subdomain</Label>
                  <div className="flex">
                    <Input
                      id="subdomain"
                      type="text"
                      placeholder="your-business"
                      value={businessData.subdomain}
                      onChange={(e) => handleInputChange('subdomain', e.target.value)}
                      disabled={loading}
                      className="rounded-r-none"
                    />
                    <div className="bg-gray-100 border border-l-0 rounded-r-md px-3 py-2 text-sm text-gray-600 flex items-center">
                      .boinvit.com
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">Your unique booking URL</p>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Business Profile...
                  </>
                ) : (
                  'Create Business Profile'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
