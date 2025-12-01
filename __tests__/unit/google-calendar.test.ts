/**
 * Google Calendar Test Suite
 * Tests for Google Calendar utility functions
 */

import { getUpcomingEvents } from '../../src/lib/google-calendar';

// Mock the googleapis library
jest.mock('googleapis', () => {
  const mockCalendar = {
    events: {
      list: jest.fn(),
      insert: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  return {
    google: {
      auth: {
        OAuth2: jest.fn().mockImplementation(() => ({
          setCredentials: jest.fn(),
        })),
      },
      calendar: jest.fn(() => mockCalendar),
    },
  };
});

describe('Google Calendar Utilities', () => {
  const mockAccessToken = 'mock-access-token';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getUpcomingEvents', () => {
    it('should fetch events with timeMin set to current time', async () => {
      const { google } = require('googleapis');
      const mockCalendar = google.calendar();
      
      const mockEvents = [
        {
          id: '1',
          summary: 'Future Event',
          start: { dateTime: new Date(Date.now() + 86400000).toISOString() },
          end: { dateTime: new Date(Date.now() + 90000000).toISOString() },
        },
      ];

      mockCalendar.events.list.mockResolvedValue({
        data: { items: mockEvents },
      });

      const events = await getUpcomingEvents(mockAccessToken, 10);

      expect(mockCalendar.events.list).toHaveBeenCalledWith({
        calendarId: 'primary',
        timeMin: expect.any(String),
        maxResults: 10,
        singleEvents: true,
        orderBy: 'startTime',
      });

      // Verify that timeMin is a valid ISO string representing now or future
      const callArgs = mockCalendar.events.list.mock.calls[0][0];
      const timeMin = new Date(callArgs.timeMin);
      const now = new Date();
      
      // timeMin should be very close to now (within 1 second)
      expect(Math.abs(timeMin.getTime() - now.getTime())).toBeLessThan(1000);

      expect(events).toEqual(mockEvents);
    });

    it('should return empty array if no events are returned', async () => {
      const { google } = require('googleapis');
      const mockCalendar = google.calendar();

      mockCalendar.events.list.mockResolvedValue({
        data: { items: undefined },
      });

      const events = await getUpcomingEvents(mockAccessToken, 10);

      expect(events).toEqual([]);
    });

    it('should use default maxResults of 10 when not specified', async () => {
      const { google } = require('googleapis');
      const mockCalendar = google.calendar();

      mockCalendar.events.list.mockResolvedValue({
        data: { items: [] },
      });

      await getUpcomingEvents(mockAccessToken);

      expect(mockCalendar.events.list).toHaveBeenCalledWith({
        calendarId: 'primary',
        timeMin: expect.any(String),
        maxResults: 10,
        singleEvents: true,
        orderBy: 'startTime',
      });
    });

    it('should respect custom maxResults parameter', async () => {
      const { google } = require('googleapis');
      const mockCalendar = google.calendar();

      mockCalendar.events.list.mockResolvedValue({
        data: { items: [] },
      });

      await getUpcomingEvents(mockAccessToken, 25);

      expect(mockCalendar.events.list).toHaveBeenCalledWith({
        calendarId: 'primary',
        timeMin: expect.any(String),
        maxResults: 25,
        singleEvents: true,
        orderBy: 'startTime',
      });
    });
  });
});
