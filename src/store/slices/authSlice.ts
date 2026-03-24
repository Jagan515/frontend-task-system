import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { jwtDecode } from 'jwt-decode';
import { UserRole, type User } from '../../types/auth';
import api from '../../api/axios';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
}

interface JWTPayload {
  id?: number | string;
  sub?: number | string;
  name?: string;
  email?: string;
  role?: string;
}

export const initializeAuth = createAsyncThunk('auth/initialize', async () => {
  const token = localStorage.getItem('token');
  if (!token) return null;

  try {
    const response = await api.get('/users/whoami');
    const profile = response.data;
    
    let role = profile.role?.toUpperCase();
    if (role === 'CONSUMER') role = UserRole.USER;
    if (role === 'CONTRIBUTOR') role = UserRole.MANAGER;
    if (role === 'POWER_USER') role = UserRole.ADMIN;

    return {
      id: profile.id ? parseInt(profile.id, 10) : 0,
      email: profile.email || '',
      role: (role as UserRole) || UserRole.USER,
      username: profile.name
    } as User;
  } catch (err: any) {
    // Only logout if it's a 401 or 403 (unauthorized/forbidden)
    // Other errors (like 500 or network error) shouldn't necessarily kill the local session
    if (err.response?.status === 401 || err.response?.status === 403) {
      localStorage.removeItem('token');
      return null;
    }
    
    // For other errors, we can try to fallback to local decoding if we already have it
    // But returning null here will trigger the "else" in fulfilled which logs out.
    // So let's try to decode locally if server is down but token exists.
    const localUser = parseToken(token);
    return localUser;
  }
});

const parseToken = (token: string): User | null => {
  try {
    const decoded = jwtDecode<JWTPayload>(token);
    const idVal = decoded.id || decoded.sub || 0;
    
    let role = decoded.role?.toUpperCase();
    if (role === 'CONSUMER') role = UserRole.USER;
    if (role === 'CONTRIBUTOR') role = UserRole.MANAGER;
    if (role === 'POWER_USER') role = UserRole.ADMIN;

    return {
      id: typeof idVal === 'string' ? parseInt(idVal, 10) : idVal,
      email: decoded.email || decoded.name || '',
      role: (role as UserRole) || UserRole.USER,
    };
  } catch {
    return null;
  }
};

const token = localStorage.getItem('token');
const initialUser = token ? parseToken(token) : null;

const initialState: AuthState = {
  user: initialUser,
  token: token,
  isAuthenticated: !!initialUser,
  isInitializing: true,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state, action: PayloadAction<string>) => {
      const newToken = action.payload;
      const decodedUser = parseToken(newToken);
      
      if (decodedUser) {
        localStorage.setItem('token', newToken);
        state.token = newToken;
        state.user = decodedUser;
        state.isAuthenticated = true;
      }
    },
    logout: (state) => {
      localStorage.removeItem('token');
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(initializeAuth.pending, (state) => {
        state.isInitializing = true;
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.isInitializing = false;
        if (action.payload) {
          state.user = action.payload;
          state.isAuthenticated = true;
        } else {
          // No user found or invalid session
          state.user = null;
          state.token = null;
          state.isAuthenticated = false;
        }
      })
      .addCase(initializeAuth.rejected, (state) => {
        state.isInitializing = false;
        // Don't necessarily logout on rejection unless we want to be strict
        // If it's rejected, it means the thunk itself failed (uncaught error)
      });
  },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;
