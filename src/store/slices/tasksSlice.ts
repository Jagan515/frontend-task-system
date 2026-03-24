import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import api, { extractErrorMessage } from '../../api/axios';
import { type User } from '../../types/auth';

export interface Comment {
  id: number;
  taskId: number;
  userId: number;
  content: string;
  createdAt: string;
  user?: User;
}

export interface AuditLog {
  id: number;
  entityType: string;
  entityId: number;
  action: string;
  performedBy: number;
  details: Record<string, unknown>;
  createdAt: string;
  user?: User;
}

export interface FilterPreset {
  id: number;
  name: string;
  filter: {
    searchTerm?: string;
    statusFilter?: string;
    priorityFilter?: string;
    dateRange?: { start: string; end: string };
  };
  userId: number;
  createdAt: string;
}

export interface Task {
  id: number;
  title: string;
  description: string;
  dueDate: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  createdBy: number;
  createdAt: string;
  updatedAt: string;
}

interface TasksState {
  items: Task[];
  users: User[];
  comments: Comment[];
  history: AuditLog[];
  filterPresets: FilterPreset[];
  selectedTaskAssignees: number[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  selectedTaskId: number | null;
}

const initialState: TasksState = {
  items: [],
  users: [],
  comments: [],
  history: [],
  filterPresets: [],
  selectedTaskAssignees: [],
  status: 'idle',
  error: null,
  selectedTaskId: null,
};

export const fetchTasks = createAsyncThunk<Task[]>('tasks/fetchTasks', async (_, { rejectWithValue, signal }) => {
  try {
    const response = await api.get('/tasks', { signal });
    return response.data;
  } catch (err: unknown) {
    return rejectWithValue(extractErrorMessage(err));
  }
});

export const fetchUsers = createAsyncThunk<User[]>('tasks/fetchUsers', async (_, { rejectWithValue, signal }) => {
  try {
    const response = await api.get('/users', { signal });
    return response.data;
  } catch (err: unknown) {
    return rejectWithValue(extractErrorMessage(err));
  }
});

export const fetchTaskComments = createAsyncThunk<Comment[], number>('tasks/fetchComments', async (taskId, { rejectWithValue, signal }) => {
  try {
    const response = await api.get(`/tasks/${taskId}/comments`, { signal });
    return response.data;
  } catch (err: unknown) {
    return rejectWithValue(extractErrorMessage(err));
  }
});

export const addTaskComment = createAsyncThunk<Comment, { taskId: number; content: string }>(
  'tasks/addComment',
  async ({ taskId, content }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/tasks/${taskId}/comments`, { content });
      return response.data;
    } catch (err: unknown) {
      return rejectWithValue(extractErrorMessage(err));
    }
  }
);

export const fetchTaskHistory = createAsyncThunk<AuditLog[], number>('tasks/fetchHistory', async (taskId, { rejectWithValue, signal }) => {
  try {
    const response = await api.get(`/tasks/${taskId}/history`, { signal });
    return response.data;
  } catch (err: unknown) {
    return rejectWithValue(extractErrorMessage(err));
  }
});

export const fetchTaskAssignees = createAsyncThunk<number[], number>('tasks/fetchAssignees', async (taskId, { rejectWithValue, signal }) => {
  try {
    const response = await api.get(`/tasks/${taskId}/assignees`, { signal });
    return response.data;
  } catch (err: unknown) {
    return rejectWithValue(extractErrorMessage(err));
  }
});

export const fetchFilterPresets = createAsyncThunk<FilterPreset[]>('tasks/fetchFilterPresets', async (_, { rejectWithValue, signal }) => {
  try {
    const response = await api.get('/filter-presets', { signal });
    return response.data;
  } catch (err: unknown) {
    return rejectWithValue(extractErrorMessage(err));
  }
});

export const saveFilterPreset = createAsyncThunk<FilterPreset, { name: string; filter: Record<string, unknown> }>(
  'tasks/saveFilterPreset',
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post('/filter-presets', data);
      return response.data;
    } catch (err: unknown) {
      return rejectWithValue(extractErrorMessage(err));
    }
  }
);

export const deleteFilterPreset = createAsyncThunk<number, number>(
  'tasks/deleteFilterPreset',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/filter-presets/${id}`);
      return id;
    } catch (err: unknown) {
      return rejectWithValue(extractErrorMessage(err));
    }
  }
);

export const updateTask = createAsyncThunk<{ id: number; data: Partial<Task> & { assignees?: number[] } }, { id: number; data: Partial<Task> & { assignees?: number[] } }>(
  'tasks/updateTask',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/tasks/${id}`, data);
      return { id, data: response.data || data };
    } catch (err: unknown) {
      return rejectWithValue(extractErrorMessage(err));
    }
  }
);

export const bulkUpdateTasks = createAsyncThunk<{ ids: number[]; data: Partial<Task> }, { ids: number[]; data: Partial<Task> }>(
  'tasks/bulkUpdate',
  async ({ ids, data }, { rejectWithValue }) => {
    try {
      await api.patch('/tasks/bulk', { ids, data });
      return { ids, data };
    } catch (err: unknown) {
      return rejectWithValue(extractErrorMessage(err));
    }
  }
);

export const bulkDeleteTasks = createAsyncThunk<number[], number[]>(
  'tasks/bulkDelete',
  async (ids, { rejectWithValue }) => {
    try {
      await api.post('/tasks/bulk-delete', { ids });
      return ids;
    } catch (err: unknown) {
      return rejectWithValue(extractErrorMessage(err));
    }
  }
);

export const bulkAssignTasks = createAsyncThunk<{ ids: number[]; userIds: number[] }, { ids: number[]; userIds: number[] }>(
  'tasks/bulkAssign',
  async ({ ids, userIds }, { rejectWithValue }) => {
    try {
      await api.patch('/tasks/bulk-assign', { ids, userIds });
      return { ids, userIds };
    } catch (err: unknown) {
      return rejectWithValue(extractErrorMessage(err));
    }
  }
);

export const createTask = createAsyncThunk<Task, Omit<Task, 'id' | 'status' | 'createdAt' | 'createdBy'> & { assignees?: number[] }>(
  'tasks/createTask',
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post('/tasks', data);
      return response.data;
    } catch (err: unknown) {
      return rejectWithValue(extractErrorMessage(err));
    }
  }
);

export const fetchAuditLogs = createAsyncThunk<AuditLog[]>('tasks/fetchAuditLogs', async (_, { rejectWithValue, signal }) => {
  try {
    const response = await api.get('/audit-logs', { signal });
    return response.data;
  } catch (err: unknown) {
    return rejectWithValue(extractErrorMessage(err));
  }
});

/**
 * Parallel initial data fetch using Promise.all per Standard #3
 */
export const fetchInitialData = createAsyncThunk(
  'tasks/fetchInitialData',
  async (_, { rejectWithValue, signal }) => {
    try {
      const [tasksRes, usersRes, presetsRes] = await Promise.all([
        api.get('/tasks', { signal }),
        api.get('/users', { signal }),
        api.get('/filter-presets', { signal })
      ]);
      return {
        tasks: tasksRes.data as Task[],
        users: usersRes.data as User[],
        presets: presetsRes.data as FilterPreset[]
      };
    } catch (err: unknown) {
      return rejectWithValue(extractErrorMessage(err));
    }
  }
);

/**
 * Parallel fetching of task details (comments, history, assignees) per Standard #3
 */
export const fetchTaskDetails = createAsyncThunk<{ comments: Comment[]; history: AuditLog[]; assignees: number[] }, number>(
  'tasks/fetchTaskDetails',
  async (taskId, { rejectWithValue, signal }) => {
    try {
      const [commentsRes, historyRes, assigneesRes] = await Promise.all([
        api.get(`/tasks/${taskId}/comments`, { signal }),
        api.get(`/tasks/${taskId}/history`, { signal }),
        api.get(`/tasks/${taskId}/assignees`, { signal })
      ]);
      return {
        comments: commentsRes.data as Comment[],
        history: historyRes.data as AuditLog[],
        assignees: assigneesRes.data as number[]
      };
    } catch (err: unknown) {
      return rejectWithValue(extractErrorMessage(err));
    }
  }
);

export const fetchAuditLogs = createAsyncThunk('tasks/fetchAuditLogs', async () => {
  const response = await api.get('/audit-logs');
  return response.data;
});

export const fetchInitialData = createAsyncThunk(
  'tasks/fetchInitialData',
  async () => {
    const [tasksRes, usersRes, presetsRes] = await Promise.all([
      api.get('/tasks'),
      api.get('/users'),
      api.get('/filter-presets')
    ]);
    return {
      tasks: tasksRes.data,
      users: usersRes.data,
      presets: presetsRes.data
    };
  }
);

export const fetchTaskDetails = createAsyncThunk(
  'tasks/fetchTaskDetails',
  async (taskId: number) => {
    const [commentsRes, historyRes, assigneesRes] = await Promise.all([
      api.get(`/tasks/${taskId}/comments`),
      api.get(`/tasks/${taskId}/history`),
      api.get(`/tasks/${taskId}/assignees`)
    ]);
    return {
      comments: commentsRes.data,
      history: historyRes.data,
      assignees: assigneesRes.data
    };
  }
);

import { logout } from './authSlice';

import { UserRole } from '../../types/auth';

const normalizeUserRole = (user: User): User => {
  let role = user.role?.toUpperCase();
  if (role === 'CONSUMER') role = UserRole.USER;
  if (role === 'CONTRIBUTOR') role = UserRole.MANAGER;
  if (role === 'POWER_USER') role = UserRole.ADMIN;
  
  return {
    ...user,
    role: (role as UserRole) || UserRole.USER
  };
};

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    selectTask: (state, action: PayloadAction<number | null>) => {
      state.selectedTaskId = action.payload;
      if (action.payload === null) {
        state.comments = [];
        state.history = [];
        state.selectedTaskAssignees = [];
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasks.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchTasks.fulfilled, (state, action: PayloadAction<Task[]>) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        if (action.meta.aborted) return;
        state.status = 'failed';
        state.error = (action.payload as string) || action.error.message || 'Something went wrong';
      })
      .addCase(fetchInitialData.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchInitialData.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload.tasks;
        state.users = action.payload.users.map(normalizeUserRole);
        state.filterPresets = action.payload.presets;
      })
      .addCase(fetchInitialData.rejected, (state, action) => {
        if (action.meta.aborted) return;
        state.status = 'failed';
        state.error = (action.payload as string) || action.error.message || 'Something went wrong';
      })
      .addCase(fetchTaskDetails.fulfilled, (state, action) => {
        state.comments = action.payload.comments;
        state.history = action.payload.history;
        state.selectedTaskAssignees = action.payload.assignees;
      })
      .addCase(fetchAuditLogs.fulfilled, (state, action: PayloadAction<AuditLog[]>) => {
        state.history = action.payload;

      })
      .addCase(fetchUsers.fulfilled, (state, action: PayloadAction<User[]>) => {
        state.users = action.payload.map(normalizeUserRole);
      })
      .addCase(fetchTaskComments.fulfilled, (state, action: PayloadAction<Comment[]>) => {
        state.comments = action.payload;
      })
      .addCase(addTaskComment.fulfilled, (state, action: PayloadAction<Comment>) => {
        state.comments.push(action.payload);
      })
      .addCase(fetchTaskHistory.fulfilled, (state, action: PayloadAction<AuditLog[]>) => {
        state.history = action.payload;
      })
      .addCase(fetchTaskAssignees.fulfilled, (state, action: PayloadAction<number[]>) => {
        state.selectedTaskAssignees = action.payload;
      })
      .addCase(fetchFilterPresets.fulfilled, (state, action: PayloadAction<FilterPreset[]>) => {
        state.filterPresets = action.payload;
      })
      .addCase(fetchAuditLogs.fulfilled, (state, action) => {
        state.history = action.payload;
      })
      .addCase(saveFilterPreset.fulfilled, (state, action: PayloadAction<FilterPreset>) => {
        state.filterPresets.push(action.payload);
      })
      .addCase(deleteFilterPreset.fulfilled, (state, action: PayloadAction<number>) => {
        state.filterPresets = state.filterPresets.filter(p => p.id !== action.payload);
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        const { id, data } = action.payload;
        const index = state.items.findIndex((task) => task.id === id);
        if (index !== -1) {
          state.items[index] = { ...state.items[index], ...data };
        }
      })
      .addCase(bulkUpdateTasks.fulfilled, (state, action) => {
        const { ids, data } = action.payload;
        state.items = state.items.map(task => 
          ids.includes(task.id) ? { ...task, ...data } : task
        );
      })
      .addCase(bulkDeleteTasks.fulfilled, (state, action) => {
        const ids = action.payload;
        state.items = state.items.filter(task => !ids.includes(task.id));
      })
      .addCase(bulkAssignTasks.fulfilled, (state) => {
        state.status = 'succeeded';
      })
      .addCase(createTask.fulfilled, (state, action: PayloadAction<Task>) => {
        state.items.push(action.payload);
      })
      .addCase(logout, (state) => {
        state.items = [];
        state.users = [];
        state.comments = [];
        state.history = [];
        state.filterPresets = [];
        state.status = 'idle';
        state.selectedTaskId = null;
      });
  },
});

export const { selectTask } = tasksSlice.actions;
export default tasksSlice.reducer;
