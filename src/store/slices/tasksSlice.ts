import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import api from '../../api/axios';
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
  details: any;
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

export const fetchTasks = createAsyncThunk('tasks/fetchTasks', async () => {
  const response = await api.get('/tasks');
  return response.data;
});

export const fetchUsers = createAsyncThunk('tasks/fetchUsers', async () => {
  const response = await api.get('/users');
  return response.data;
});

export const fetchTaskComments = createAsyncThunk('tasks/fetchComments', async (taskId: number) => {
  const response = await api.get(`/tasks/${taskId}/comments`);
  return response.data;
});

export const addTaskComment = createAsyncThunk(
  'tasks/addComment',
  async ({ taskId, content }: { taskId: number; content: string }) => {
    const response = await api.post(`/tasks/${taskId}/comments`, { content });
    return response.data;
  }
);

export const fetchTaskHistory = createAsyncThunk('tasks/fetchHistory', async (taskId: number) => {
  const response = await api.get(`/tasks/${taskId}/history`);
  return response.data;
});

export const fetchTaskAssignees = createAsyncThunk('tasks/fetchAssignees', async (taskId: number) => {
  const response = await api.get(`/tasks/${taskId}/assignees`);
  return response.data;
});

export const fetchFilterPresets = createAsyncThunk('tasks/fetchFilterPresets', async () => {
  const response = await api.get('/filter-presets');
  return response.data;
});

export const saveFilterPreset = createAsyncThunk(
  'tasks/saveFilterPreset',
  async (data: { name: string; filter: any }) => {
    const response = await api.post('/filter-presets', data);
    return response.data;
  }
);

export const deleteFilterPreset = createAsyncThunk(
  'tasks/deleteFilterPreset',
  async (id: number) => {
    await api.delete(`/filter-presets/${id}`);
    return id;
  }
);

export const updateTask = createAsyncThunk(
  'tasks/updateTask',
  async ({ id, data }: { id: number; data: Partial<Task> & { assignees?: number[] } }) => {
    const response = await api.patch(`/tasks/${id}`, data);
    return { id, data: response.data || data };
  }
);

export const bulkUpdateTasks = createAsyncThunk(
  'tasks/bulkUpdate',
  async ({ ids, data }: { ids: number[]; data: Partial<Task> }) => {
    await api.patch('/tasks/bulk', { ids, data });
    return { ids, data };
  }
);

export const bulkDeleteTasks = createAsyncThunk(
  'tasks/bulkDelete',
  async (ids: number[]) => {
    await api.post('/tasks/bulk-delete', { ids });
    return ids;
  }
);

export const bulkAssignTasks = createAsyncThunk(
  'tasks/bulkAssign',
  async ({ ids, userIds }: { ids: number[]; userIds: number[] }) => {
    await api.patch('/tasks/bulk-assign', { ids, userIds });
    return { ids, userIds };
  }
);

export const createTask = createAsyncThunk(
  'tasks/createTask',
  async (data: Omit<Task, 'id' | 'status' | 'createdAt' | 'createdBy'> & { assignees?: number[] }) => {
    const response = await api.post('/tasks', data);
    return response.data;
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
