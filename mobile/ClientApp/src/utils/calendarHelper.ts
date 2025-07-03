import { Platform } from 'react-native';
import * as Calendar from 'expo-calendar';
import { Alert } from 'react-native';

interface CalendarEvent {
  title: string;
  startDate: Date;
  endDate: Date;
  location?: string;
  notes?: string;
}

/**
 * Add an event to the device calendar
 * @param eventDetails Calendar event details
 */
export const addEventToCalendar = async (eventDetails: CalendarEvent): Promise<string> => {
  try {
    // Request calendar permissions
    const { status } = await Calendar.requestCalendarPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Calendar permission not granted');
    }

    // Get default calendar for the platform
    const defaultCalendar = await getDefaultCalendar();
    
    if (!defaultCalendar) {
      throw new Error('No default calendar found');
    }

    // Create the event
    const eventId = await Calendar.createEventAsync(defaultCalendar.id, {
      title: eventDetails.title,
      startDate: eventDetails.startDate,
      endDate: eventDetails.endDate,
      location: eventDetails.location,
      notes: eventDetails.notes,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      alarms: [{ relativeOffset: -60 }], // Alert 1 hour before
    });

    return eventId;
  } catch (error) {
    console.error('Error adding event to calendar:', error);
    throw error;
  }
};

/**
 * Get the default calendar based on platform
 */
export const getDefaultCalendar = async () => {
  const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
  
  // iOS: Find calendar with allowsModifications set to true
  // Android: Find calendar that is the primary calendar
  const defaultCalendar = calendars.find((calendar) => {
    if (Platform.OS === 'ios') {
      return calendar.allowsModifications;
    } else {
      return calendar.isPrimary;
    }
  });
  
  // If no suitable calendar found, use the first one that allows modifications
  return defaultCalendar || calendars.find(cal => cal.allowsModifications);
};

/**
 * Check if the device has calendar access
 */
export const checkCalendarAccess = async (): Promise<boolean> => {
  const { status } = await Calendar.getCalendarPermissionsAsync();
  return status === 'granted';
};

/**
 * Ask for calendar permission
 */
export const requestCalendarPermission = async (): Promise<boolean> => {
  const { status } = await Calendar.requestCalendarPermissionsAsync();
  return status === 'granted';
};
