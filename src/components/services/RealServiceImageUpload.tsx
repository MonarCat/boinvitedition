
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, X, Image as ImageIcon, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface RealServiceImageUploadProps {
  serviceId?: string;
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
}

export const RealServiceImageUpload: React.FC<RealServiceImageUploadProps> = ({
  serviceId,
  images = [],
  onImagesChange,
  maxImages = 5
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{[key: string]: number}>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.From(event.target.files || []);
    
    if (files.length === 0) return;
    
    if (images.length + files.length > maxImages) {
      toast.error(`Maximum ${maxImages} images allowed`);
      return;
    }

    setIsUploading(true);
    const newUploadProgress: {[key: string]: number} = {};
    
    try {
      const uploadPromises = files.map(async (file, index) => {
        const fileKey = `${file.name}-${Date.now()}-${index}`;
        
        // Validate file
        if (!file.type.startsWith('image/')) {
          throw new Error(`${file.name} is not an image file`);
        }

        if (file.size > 5 * 1024 * 1024) {
          throw new Error(`${file.name} is too large. Maximum size is 5MB`);
        }

        // Initialize progress
        newUploadProgress[fileKey] = 0;
        setUploadProgress({...newUploadProgress});

        // Generate unique file path
        const fileExt = file.name.split('.').pop();
        const fileName = `${serviceId || 'temp'}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
        const filePath = `services/${fileName}`;

        try {
          // Upload to Supabase Storage
          const { data, error } = await supabase.storage
            .from('service-images')
            .upload(filePath, file, {
              cacheControl: '3600',
              upsert: false
            });

          if (error) {
            throw new Error(`Upload failed: ${error.message}`);
          }

          // Update progress to 90%
          newUploadProgress[fileKey] = 90;
          setUploadProgress({...newUploadProgress});

          // Get public URL
          const { data: urlData } = supabase.storage
            .from('service-images')
            .getPublicUrl(filePath);

          if (!urlData?.publicUrl) {
            throw new Error('Failed to get public URL');
          }

          // Complete progress
          newUploadProgress[fileKey] = 100;
          setUploadProgress({...newUploadProgress});

          return urlData.publicUrl;
        } catch (error) {
          delete newUploadProgress[fileKey];
          setUploadProgress({...newUploadProgress});
          throw error;
        }
      });

      const uploadedImages = await Promise.all(uploadPromises);
      
      onImagesChange([...images, ...uploadedImages]);
      toast.success(`${uploadedImages.length} image(s) uploaded successfully`);
      
    } catch (error: any) {
      console.error('Error uploading images:', error);
      toast.error(error.message || 'Failed to upload images');
    } finally {
      setIsUploading(false);
      setUploadProgress({});
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeImage = async (index: number) => {
    const imageUrl = images[index];
    
    // Extract file path from URL for storage deletion
    if (imageUrl.includes('service-images')) {
      try {
        const pathMatch = imageUrl.match(/service-images\/(.+)$/);
        if (pathMatch) {
          const filePath = pathMatch[1];
          await supabase.storage
            .from('service-images')
            .remove([`services/${filePath.split('/').pop()}`]);
        }
      } catch (error) {
        console.error('Error deleting image from storage:', error);
      }
    }

    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
    toast.success('Image removed');
  };

  const hasActiveUploads = Object.keys(uploadProgress).length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="w-5 h-5" />
          Service Images ({images.length}/{maxImages})
          {isUploading && (
            <div className="flex items-center gap-1 text-sm text-blue-600">
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
              Uploading...
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {hasActiveUploads && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">Upload Progress:</h4>
            {Object.entries(uploadProgress).map(([fileKey, progress]) => (
              <div key={fileKey} className="space-y-1">
                <div className="flex justify-between text-xs text-gray-600">
                  <span>{fileKey.split('-')[0]}</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div 
                    className="bg-blue-600 h-1.5 rounded-full transition-all duration-300" 
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                {progress === 100 && (
                  <div className="flex items-center gap-1 text-xs text-green-600">
                    <CheckCircle className="w-3 h-3" />
                    Complete
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {images.length < maxImages && (
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              variant="outline"
              className="w-full"
            >
              <Upload className="w-4 h-4 mr-2" />
              {isUploading ? 'Uploading...' : 'Upload Images'}
            </Button>
            <p className="text-sm text-gray-600">
              Upload up to {maxImages} images. Max size: 5MB per image. Images are stored securely.
            </p>
          </>
        )}

        {images.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {images.map((image, index) => (
              <div key={index} className="relative group">
                <img
                  src={image}
                  alt={`Service image ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg border"
                  onError={(e) => {
                    console.error('Image failed to load:', image);
                    e.currentTarget.src = '/placeholder-image.png';
                  }}
                />
                <Button
                  onClick={() => removeImage(index)}
                  size="sm"
                  variant="destructive"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {images.length === 0 && !hasActiveUploads && (
          <div className="text-center py-8 text-gray-500">
            <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No images uploaded yet</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
