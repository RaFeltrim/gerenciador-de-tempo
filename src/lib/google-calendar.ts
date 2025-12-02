import { google } from 'googleapis';

// Initialize the Google Calendar API client
export const getGoogleCalendarClient = (accessToken: string) => {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.NEXTAUTH_URL
  );

  oauth2Client.setCredentials({ access_token: accessToken });
  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
  return calendar;
};

// Get upcoming events from Google Calendar
export const getUpcomingEvents = async (accessToken: string, maxResults = 10) => {
  const calendar = getGoogleCalendarClient(accessToken);

  const res = await calendar.events.list({
    calendarId: 'primary',
    timeMin: new Date().toISOString(),
    maxResults: maxResults,
    singleEvents: true,
    orderBy: 'startTime',
  });

  return res.data.items || [];
};

// Create a new event in Google Calendar
export const createEvent = async (accessToken: string, event: any) => {
  const calendar = getGoogleCalendarClient(accessToken);

  const res = await calendar.events.insert({
    calendarId: 'primary',
    requestBody: event,
  });

  return res.data;
};

// Update an existing event in Google Calendar
export const updateEvent = async (accessToken: string, eventId: string, event: any) => {
  const calendar = getGoogleCalendarClient(accessToken);

  const res = await calendar.events.update({
    calendarId: 'primary',
    eventId: eventId,
    requestBody: event,
  });

  return res.data;
};

// Delete an event from Google Calendar
export const deleteEvent = async (accessToken: string, eventId: string) => {
  const calendar = getGoogleCalendarClient(accessToken);

  await calendar.events.delete({
    calendarId: 'primary',
    eventId: eventId,
  });
};
