import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, X, User, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

interface StaffAvatarUploadProps {
  staffId?: string;
  avatarUrl?: string;
  onAvatarChange: (url: string) => void;
  name?: string;
}

export const StaffAvatarUpload: React.FC<StaffAvatarUploadProps> = ({
  staffId,
  avatarUrl,
  onAvatarChange,
  name
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getInitials = (name?: string): string => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      toast.error('Selected file is not an image');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image is too large. Maximum size is 5MB');
      return;
    }

    setIsUploading(true);
    setUploadProgress(10);
    
    try {
      // Generate unique file path
      const fileExt = file.name.split('.').pop();
      const fileName = `${staffId || 'temp'}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
      // Using dedicated 'staff-avatars' bucket for staff profile images
      const filePath = fileName;

      // Upload to Supabase Storage
      setUploadProgress(30);
      const { data, error } = await supabase.storage
        .from('staff-avatars')  // Using dedicated bucket for staff avatars
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        throw new Error(`Upload failed: ${error.message}`);
      }

      // Update progress
      setUploadProgress(70);

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('staff-avatars')  // Use the same bucket as for upload
        .getPublicUrl(filePath);

      if (!urlData?.publicUrl) {
        throw new Error('Failed to get public URL');
      }

      // Complete progress
      setUploadProgress(100);
      onAvatarChange(urlData.publicUrl);
      toast.success('Profile picture uploaded successfully');
      
    } catch (error: unknown) {
      console.error('Error uploading avatar:', error);
      let errorMessage = 'Failed to upload image';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeAvatar = async () => {
    if (!avatarUrl) return;
    
    try {
      // Extract file path from URL for storage deletion
      if (avatarUrl.includes('staff-avatars')) {
        const pathMatch = avatarUrl.match(/staff-avatars\/(.+)$/);
        if (pathMatch) {
          const filePath = pathMatch[1];
          await supabase.storage
            .from('staff-avatars')
            .remove([filePath]);
        }
      }
      
      onAvatarChange('');
      toast.success('Profile picture removed');
    } catch (error) {
      console.error('Error removing avatar:', error);
      toast.error('Failed to remove profile picture');
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative group">
        <Avatar className="w-24 h-24 border-2 border-white shadow-md">
          {avatarUrl ? (
            <AvatarImage 
              src={avatarUrl} 
              alt="Staff avatar" 
              className="object-cover"
              onError={(e) => {
                console.error('Avatar failed to load:', avatarUrl);
                e.currentTarget.src = '/placeholder.svg';
              }}
            />
          ) : null}
          <AvatarFallback className="bg-blue-100 text-blue-600 text-xl">
            {getInitials(name)}
          </AvatarFallback>
        </Avatar>

        {avatarUrl && (
          <Button
            onClick={removeAvatar}
            size="icon"
            variant="destructive"
            className="absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="h-3 w-3" />
          </Button>
        )}

        {isUploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
            <div className="text-white text-xs font-medium">{uploadProgress}%</div>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        aria-label="Upload staff avatar"
        title="Upload staff avatar"
      />

      <Button
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
        variant="outline"
        size="sm"
        className="text-xs"
      >
        <Upload className="w-3 h-3 mr-1" />
        {avatarUrl ? 'Change Photo' : 'Upload Photo'}
      </Button>
      
      <p className="text-xs text-gray-500 text-center max-w-xs">
        Upload a professional profile picture (max 5MB)
      </p>
    </div>
  );
};
