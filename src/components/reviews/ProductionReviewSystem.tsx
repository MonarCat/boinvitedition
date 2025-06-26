
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Star, StarIcon, MessageSquare, ThumbsUp, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ProductionReviewSystemProps {
  businessId: string;
  bookingId?: string;
  serviceName?: string;
  businessName: string;
  onReviewSubmitted?: () => void;
}

export const ProductionReviewSystem: React.FC<ProductionReviewSystemProps> = ({
  businessId,
  bookingId,
  serviceName,
  businessName,
  onReviewSubmitted
}) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleStarClick = (starRating: number) => {
    setRating(starRating);
  };

  const handleStarHover = (starRating: number) => {
    setHoveredRating(starRating);
  };

  const handleStarLeave = () => {
    setHoveredRating(0);
  };

  const getRatingText = (rating: number) => {
    switch (rating) {
      case 1: return 'Poor';
      case 2: return 'Fair';
      case 3: return 'Good';
      case 4: return 'Very Good';
      case 5: return 'Excellent';
      default: return 'Select a rating';
    }
  };

  const getRatingColor = (rating: number) => {
    if (rating <= 2) return 'text-red-500';
    if (rating <= 3) return 'text-yellow-500';
    return 'text-green-500';
  };

  const validateReview = (): boolean => {
    if (rating === 0) {
      toast.error('Please select a rating');
      return false;
    }
    
    if (!comment.trim()) {
      toast.error('Please provide your feedback');
      return false;
    }
    
    if (comment.trim().length < 10) {
      toast.error('Please provide more detailed feedback (at least 10 characters)');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateReview()) return;
    
    setIsSubmitting(true);
    
    try {
      const reviewData = {
        business_id: businessId,
        booking_id: bookingId,
        rating: rating,
        comment: comment.trim()
      };

      const { error } = await supabase
        .from('business_reviews')
        .insert(reviewData);

      if (error) throw error;

      toast.success('Thank you for your review!');
      setSubmitted(true);
      onReviewSubmitted?.();
      
    } catch (error: any) {
      console.error('Review submission error:', error);
      
      if (error.code === '23505') {
        toast.error('You have already reviewed this booking');
      } else {
        toast.error('Failed to submit review. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <ThumbsUp className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Thank You!
              </h3>
              <p className="text-gray-600">
                Your review has been submitted successfully. It helps other customers make informed decisions.
              </p>
            </div>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              Review Submitted
            </Badge>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <MessageSquare className="w-5 h-5" />
          Rate Your Experience
        </CardTitle>
        <div className="space-y-1">
          <p className="font-medium text-gray-900">{businessName}</p>
          {serviceName && (
            <p className="text-sm text-gray-600">{serviceName}</p>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Star Rating */}
          <div className="space-y-3">
            <Label className="text-base font-medium">How was your experience?</Label>
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => handleStarClick(star)}
                  onMouseEnter={() => handleStarHover(star)}
                  onMouseLeave={handleStarLeave}
                  className={cn(
                    "p-1 transition-all duration-200 transform hover:scale-110",
                    "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
                  )}
                  disabled={isSubmitting}
                >
                  <StarIcon
                    className={cn(
                      "w-8 h-8 transition-colors",
                      (hoveredRating >= star || rating >= star)
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-gray-300"
                    )}
                  />
                </button>
              ))}
            </div>
            <div className="text-center">
              <span className={cn(
                "font-medium text-lg",
                getRatingColor(rating || hoveredRating)
              )}>
                {getRatingText(rating || hoveredRating)}
              </span>
            </div>
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <Label htmlFor="comment">Tell us about your experience</Label>
            <Textarea
              id="comment"
              placeholder="Share your experience with this service..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className="resize-none"
              disabled={isSubmitting}
              maxLength={500}
            />
            <div className="text-right text-xs text-gray-500">
              {comment.length}/500 characters
            </div>
          </div>

          {/* Submit Button */}
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isSubmitting || rating === 0}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting Review...
              </>
            ) : (
              <>
                <Star className="mr-2 h-4 w-4" />
                Submit Review
              </>
            )}
          </Button>

          {/* Guidelines */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <h4 className="text-sm font-medium text-blue-900 mb-2">Review Guidelines</h4>
            <ul className="text-xs text-blue-800 space-y-1">
              <li>• Be honest and helpful to other customers</li>
              <li>• Focus on your service experience</li>
              <li>• Keep your review respectful and constructive</li>
              <li>• Avoid personal information or inappropriate content</li>
            </ul>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
