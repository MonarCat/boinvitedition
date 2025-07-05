import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useParams, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface Booking {
  id: string;
  service_id: string;
  business_id: string;
  booking_date: string;
  booking_time: string;
  services: {
    name: string;
  };
  businesses: {
    name: string;
    id: string;
  };
}

export const ReviewServicePage = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [existingReview, setExistingReview] = useState<any | null>(null);

  // Load booking data on component mount
  useEffect(() => {
    const loadBooking = async () => {
      try {
        // First try to get from session storage if coming from booking history
        const storedBooking = sessionStorage.getItem('reviewBooking');
        if (storedBooking) {
          const parsedBooking = JSON.parse(storedBooking);
          setBooking(parsedBooking);
          sessionStorage.removeItem('reviewBooking');
        }
        
        // Otherwise fetch from API
        else if (bookingId) {
          const { data, error } = await supabase
            .from('bookings')
            .select(`
              id,
              service_id,
              business_id,
              booking_date,
              booking_time,
              services:service_id(name),
              businesses:business_id(name, id)
            `)
            .eq('id', bookingId)
            .single();
          
          if (error) throw error;
          if (!data) throw new Error('Booking not found');
          
          setBooking(data);
        }
        
        // Check if review already exists
        if (bookingId) {
          const { data: existingReviewData } = await supabase
            .from('business_reviews')
            .select('*')
            .eq('booking_id', bookingId)
            .single();
          
          if (existingReviewData) {
            setExistingReview(existingReviewData);
            setRating(existingReviewData.rating);
            setComment(existingReviewData.comment || '');
          }
        }
      } catch (error) {
        console.error('Error loading booking:', error);
        setError('Unable to load booking details. Please try again or contact support.');
      } finally {
        setIsLoading(false);
      }
    };

    loadBooking();
  }, [bookingId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!booking) return;
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }
    
    setIsSubmitting(true);
    try {
      // If review exists, update it
      if (existingReview) {
        const { error } = await supabase
          .from('business_reviews')
          .update({
            rating,
            comment,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingReview.id);
        
        if (error) throw error;
      } 
      // Otherwise create new review
      else {
        const { error } = await supabase
          .from('business_reviews')
          .insert({
            business_id: booking.business_id,
            booking_id: booking.id,
            service_id: booking.service_id,
            rating,
            comment,
            client_name: 'Anonymous', // Will be replaced with actual client name from booking
          });
        
        if (error) throw error;
      }
      
      setIsSubmitted(true);
      toast.success('Thank you for your feedback!');
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 max-w-3xl text-center">
        <Card>
          <CardContent className="py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-lg text-gray-600">Loading booking details...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-600">
              <AlertCircle className="h-5 w-5" />
              Unable to Load Review
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">{error}</p>
          </CardContent>
          <CardFooter>
            <Button onClick={handleBack} variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="container mx-auto py-8 max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              Booking Not Found
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">The booking you're looking for could not be found.</p>
          </CardContent>
          <CardFooter>
            <Button onClick={handleBack} variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="container mx-auto py-8 max-w-3xl">
        <Card className="border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              Thank You for Your Feedback
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">Your review has been successfully submitted and will help other clients make informed decisions.</p>
            <div className="bg-green-50 p-4 rounded-lg mb-4">
              <h3 className="font-semibold text-green-800 mb-2">Your Rating</h3>
              <div className="flex items-center mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={cn(
                      "h-6 w-6",
                      star <= rating ? "text-yellow-400 fill-current" : "text-gray-300"
                    )}
                  />
                ))}
                <span className="ml-2 font-semibold">{rating} of 5 stars</span>
              </div>
              {comment && (
                <>
                  <h4 className="font-semibold text-green-800 mt-3 mb-1">Your Comment</h4>
                  <p className="italic">"{comment}"</p>
                </>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleBack}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Return to Bookings
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle>{existingReview ? 'Update Your Review' : 'Rate Your Experience'}</CardTitle>
          <CardDescription>
            Share your feedback about your {booking.services?.name} service at {booking.businesses?.name} on {format(new Date(booking.booking_date), 'PP')}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Rating</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 hover:scale-110 transition-transform"
                  >
                    <Star
                      className={cn(
                        "h-8 w-8",
                        star <= rating ? "text-yellow-400 fill-current" : "text-gray-300"
                      )}
                    />
                  </button>
                ))}
              </div>
              {rating > 0 && (
                <p className="text-sm mt-1 text-gray-600">
                  {rating === 1 && 'Poor - I would not recommend this service'}
                  {rating === 2 && 'Fair - Below average experience'}
                  {rating === 3 && 'Average - Met basic expectations'}
                  {rating === 4 && 'Good - Better than expected'}
                  {rating === 5 && 'Excellent - Outstanding service'}
                </p>
              )}
            </div>
            
            <div>
              <label htmlFor="comment" className="block text-sm font-medium mb-2">
                Comments (Optional)
              </label>
              <Textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share details about your experience..."
                className="min-h-[120px]"
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={handleBack} type="button">
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={rating === 0 || isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : existingReview ? 'Update Review' : 'Submit Review'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};
