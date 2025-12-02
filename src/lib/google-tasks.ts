import { google } from 'googleapis';

// Initialize the Google Tasks API client
export const getGoogleTasksClient = (accessToken: string) => {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.NEXTAUTH_URL
  );

  oauth2Client.setCredentials({ access_token: accessToken });
  const tasks = google.tasks({ version: 'v1', auth: oauth2Client });
  return tasks;
};

// Get all task lists
export const getTaskLists = async (accessToken: string) => {
  const tasks = getGoogleTasksClient(accessToken);

  const res = await tasks.tasklists.list({
    maxResults: 100,
  });

  return res.data.items || [];
};

// Get tasks from a specific task list (defaults to primary "@default")
export const getTasks = async (
  accessToken: string,
  taskListId = '@default',
  showCompleted = true
) => {
  const tasks = getGoogleTasksClient(accessToken);

  const res = await tasks.tasks.list({
    tasklist: taskListId,
    showCompleted: showCompleted,
    showHidden: false,
    maxResults: 100,
  });

  return res.data.items || [];
};

// Create a new task
export const createTask = async (
  accessToken: string,
  task: {
    title: string;
    notes?: string;
    due?: string; // RFC 3339 date format
    status?: 'needsAction' | 'completed';
  },
  taskListId = '@default'
) => {
  const tasks = getGoogleTasksClient(accessToken);

  const res = await tasks.tasks.insert({
    tasklist: taskListId,
    requestBody: {
      title: task.title,
      notes: task.notes,
      due: task.due,
      status: task.status || 'needsAction',
    },
  });

  return res.data;
};

// Update an existing task
export const updateTask = async (
  accessToken: string,
  taskId: string,
  updates: {
    title?: string;
    notes?: string;
    due?: string;
    status?: 'needsAction' | 'completed';
  },
  taskListId = '@default'
) => {
  const tasks = getGoogleTasksClient(accessToken);

  const res = await tasks.tasks.patch({
    tasklist: taskListId,
    task: taskId,
    requestBody: updates,
  });

  return res.data;
};

// Delete a task
export const deleteTask = async (accessToken: string, taskId: string, taskListId = '@default') => {
  const tasks = getGoogleTasksClient(accessToken);

  await tasks.tasks.delete({
    tasklist: taskListId,
    task: taskId,
  });
};

// Complete a task
export const completeTask = async (
  accessToken: string,
  taskId: string,
  taskListId = '@default'
) => {
  return updateTask(accessToken, taskId, { status: 'completed' }, taskListId);
};

// Move task to a different position in the list
export const moveTask = async (
  accessToken: string,
  taskId: string,
  taskListId = '@default',
  previousTaskId?: string,
  parentTaskId?: string
) => {
  const tasks = getGoogleTasksClient(accessToken);

  const res = await tasks.tasks.move({
    tasklist: taskListId,
    task: taskId,
    previous: previousTaskId,
    parent: parentTaskId,
  });

  return res.data;
};
