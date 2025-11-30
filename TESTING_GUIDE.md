# FocusFlow - Testing Guide

This guide provides instructions to manually test the fixes implemented for the issues identified in the audit report.

## 1. Authentication Race Condition Fix

**Issue**: 401 Unauthorized errors when fetching tasks before session was ready.

**Test Steps**:

1. Open the application in a new browser/incognito window
2. Click "Entrar com Google" to sign in
3. Observe the Network tab in Developer Tools
4. Verify that no 401 errors appear for `/api/google-tasks` or `/api/calendar` requests
5. Confirm that tasks load correctly after authentication

**Expected Result**:

- No 401 errors in the console
- Google Tasks and Calendar events load correctly after authentication
- Smooth loading experience without errors

## 2. Empty Edit Modal Fix

**Issue**: Edit form fields were empty when editing a task.

**Test Steps**:

1. Navigate to the Dashboard
2. Create a new task with title and description
3. Click the edit (pencil) icon on the task
4. Verify that the edit form is pre-filled with the task's current data
5. Make changes and save
6. Confirm changes are reflected in the task list

**Expected Result**:

- Edit form should be pre-filled with task data
- All fields (title, description, priority, category, duration) should show current values
- Changes save correctly

## 3. Pomodoro Timer Logic Fix

**Issue**: Timer was set to task duration instead of default 25 minutes.

**Test Steps**:

1. Create a task with a long duration (e.g., 120 minutes)
2. Click the timer icon on the task
3. Check the Pomodoro timer display
4. Verify it shows "25:00" (default) and not the task duration
5. Click "Iniciar" to start the timer
6. Confirm it counts down from 25 minutes

**Expected Result**:

- Timer should always initialize to 25:00 for Pomodoro sessions
- Timer should not automatically start when clicking the task timer icon
- User should manually start the timer

## 4. Calendar Grid Display Fix

**Issue**: Calendar was missing previous/next month days and had inconsistent grid.

**Test Steps**:

1. Navigate to the Dashboard
2. Look at the mini calendar
3. Verify it always shows 6 rows (42 cells) regardless of month
4. Check that previous month days are shown with reduced opacity
5. Check that next month days are shown with reduced opacity
6. Navigate to different months using arrow buttons
7. Confirm consistent 6-row grid across all months

**Expected Result**:

- Calendar always displays 6 rows (42 days total)
- Previous month days are visible with opacity-40 and text-gray-400
- Next month days are visible with opacity-40 and text-gray-400
- Current month days are fully visible
- Today is highlighted appropriately

## 5. UI/UX Improvements

**Issue**: Various UI issues including input glitches, spacing, and responsiveness.

**Test Steps**:

1. View the homepage on different screen sizes (mobile, tablet, desktop)
2. Check that layout adapts appropriately
3. Verify that sidebar moves below main content on mobile
4. Test all input fields for visual glitches
5. Check that buttons have appropriate hover effects
6. Verify that cards have proper shadows and rounded corners
7. Confirm that the Pomodoro timer has improved styling

**Expected Result**:

- Responsive layout that works on all screen sizes
- Improved input fields with better height and styling
- Consistent spacing and visual hierarchy
- Enhanced glassmorphism effects throughout the app
- Better visual feedback on interactive elements
- Properly styled Pomodoro timer with gradients and shadows

## Regression Testing

After implementing all fixes, perform these additional checks:

1. **Task Creation**: Create tasks using natural language and verify parsing works
2. **Task Completion**: Mark tasks as complete and verify recurring tasks work
3. **Google Sync**: Ensure Google Calendar and Tasks integration still functions
4. **Navigation**: Test all navigation elements work correctly
5. **Performance**: Verify no significant performance degradation

## Troubleshooting

If any issues persist:

1. Clear browser cache and localStorage
2. Check browser console for any new errors
3. Verify all API endpoints are functioning correctly
4. Ensure Google authentication is properly configured
