
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AttendancePayload {
  staff_id: string;
  business_id: string;
  status: 'signed_in' | 'signed_out';
  attendance_date: string;
  notes?: string;
  ip_address?: string;
  user_agent?: string;
  geolocation?: any;
}

interface OfflineAttendanceRecord extends AttendancePayload {
  timestamp: string;
  id: string;
}

// Get device info for fraud detection
const getDeviceInfo = async (): Promise<{ ip_address?: string; user_agent: string; geolocation?: any }> => {
  const user_agent = navigator.userAgent;
  let geolocation = null;
  
  // Get location if available
  if (navigator.geolocation) {
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
      });
      geolocation = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy
      };
    } catch (error) {
      console.log('Location not available:', error);
    }
  }

  return { user_agent, geolocation };
};

// Save attendance when offline or online
export const submitAttendance = async (
  staffId: string, 
  businessId: string, 
  action: 'signed_in' | 'signed_out',
  notes?: string
): Promise<{ success: boolean; offline: boolean; error?: string }> => {
  
  const deviceInfo = await getDeviceInfo();
  const payload: AttendancePayload = {
    staff_id: staffId,
    business_id: businessId,
    status: action,
    attendance_date: new Date().toISOString().split('T')[0],
    notes,
    ...deviceInfo
  };

  if (!navigator.onLine) {
    // Store offline
    const offlineRecord: OfflineAttendanceRecord = {
      ...payload,
      timestamp: new Date().toISOString(),
      id: crypto.randomUUID()
    };
    
    const pending = JSON.parse(localStorage.getItem('pending_attendance') || '[]');
    pending.push(offlineRecord);
    localStorage.setItem('pending_attendance', JSON.stringify(pending));
    
    toast.info('Attendance saved offline. Will sync when online.');
    return { success: true, offline: true };
  }

  // Online: Submit directly to Supabase
  try {
    const { error } = await supabase
      .from('staff_attendance')
      .insert([payload]);
    
    if (error) {
      if (error.message.includes('Duplicate sign-in')) {
        toast.error('Duplicate sign-in detected! Please wait 5 minutes before trying again.');
        return { success: false, offline: false, error: 'Duplicate sign-in detected' };
      }
      throw error;
    }
    
    toast.success(action === 'signed_in' ? 'Successfully signed in!' : 'Successfully signed out!');
    return { success: true, offline: false };
  } catch (error: any) {
    console.error('Attendance submission error:', error);
    toast.error('Failed to submit attendance: ' + error.message);
    return { success: false, offline: false, error: error.message };
  }
};

// Sync pending submissions when back online
export const syncOfflineAttendance = async (): Promise<{ synced: number; failed: number }> => {
  const pending = JSON.parse(localStorage.getItem('pending_attendance') || '[]') as OfflineAttendanceRecord[];
  
  if (!pending.length || !navigator.onLine) {
    return { synced: 0, failed: 0 };
  }

  let synced = 0;
  let failed = 0;
  const stillPending: OfflineAttendanceRecord[] = [];

  for (const record of pending) {
    try {
      const { error } = await supabase
        .from('staff_attendance')
        .insert([{
          staff_id: record.staff_id,
          business_id: record.business_id,
          status: record.status,
          attendance_date: record.attendance_date,
          notes: record.notes,
          ip_address: record.ip_address,
          user_agent: record.user_agent,
          geolocation: record.geolocation
        }]);
      
      if (error) {
        if (error.message.includes('Duplicate sign-in')) {
          // Skip duplicate records
          console.log('Skipping duplicate record:', record.id);
        } else {
          stillPending.push(record);
          failed++;
        }
      } else {
        synced++;
      }
    } catch (error) {
      stillPending.push(record);
      failed++;
    }
  }

  // Update localStorage with remaining pending records
  localStorage.setItem('pending_attendance', JSON.stringify(stillPending));
  
  if (synced > 0) {
    toast.success(`Synced ${synced} offline attendance records`);
  }
  if (failed > 0) {
    toast.warning(`Failed to sync ${failed} records`);
  }

  return { synced, failed };
};

// Get pending attendance count
export const getPendingAttendanceCount = (): number => {
  const pending = JSON.parse(localStorage.getItem('pending_attendance') || '[]');
  return pending.length;
};

// Auto-sync when coming back online
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    console.log('Back online, syncing attendance...');
    syncOfflineAttendance();
  });
}
