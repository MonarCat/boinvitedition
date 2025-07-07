import { createBrowserRouter } from 'react-router-dom';
import App from './App';

// Existing imports (make sure to include your actual existing imports)
import BookingPreviewPage from './pages/BookingPreviewPage';
import PublicBookingPage from './pages/PublicBookingPage';
import BookingPage from './pages/BookingPage';

// New page imports
import { BookingHistory } from './components/booking/BookingHistory';
import { RescheduleBookingPage } from './components/booking/RescheduleBookingPage';
import { ReviewServicePage } from './components/booking/ReviewServicePage';
import { BookingDetailsPage } from './components/booking/BookingDetailsPage';
import { BookingManagementLanding } from './components/booking/BookingManagementLanding';
import { ClientBookingActions } from './components/booking/ClientBookingActions';
import BookingSearchPage from './components/booking/BookingSearchPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      // Your existing routes would be here
    ],
  },
  {
    path: '/preview',
    element: <BookingPreviewPage />
  },
  {
    path: '/booking/:businessId',
    element: <PublicBookingPage />
  },
  {
    path: '/book/:businessId',
    element: <BookingPage />
  },
  // New client-facing routes
  {
    path: '/booking/manage',
    element: <BookingManagementLanding />
  },
  {
    path: '/booking/search',
    element: <BookingSearchPage />
  },
  {
    path: '/booking/actions',
    element: <ClientBookingActions />
  },
  {
    path: '/booking/history',
    element: <BookingHistory />
  },
  {
    path: '/booking/details/:bookingId',
    element: <BookingDetailsPage />
  },
  {
    path: '/booking/reschedule',
    element: <RescheduleBookingPage />
  },
  {
    path: '/booking/reschedule/:bookingId',
    element: <RescheduleBookingPage />
  },
  {
    path: '/booking/review',
    element: <ReviewServicePage />
  },
  {
    path: '/booking/review/:bookingId',
    element: <ReviewServicePage />
  },
]);

export default router;
