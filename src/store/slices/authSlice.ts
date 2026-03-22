import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { jwtDecode } from 'jwt-decode';
import { UserRole, type User } from '../../types/auth';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

interface JWTPayload {
  id?: number | string;
  sub?: number | string;
  name?: string;
  email?: string;
  role?: string;
}

const parseToken = (token: string): User | null => {
  try {
    const decoded = jwtDecode<JWTPayload>(token);
    const idVal = decoded.id || decoded.sub || 0;
    
    return {
      id: typeof idVal === 'string' ? parseInt(idVal, 10) : idVal,
      email: decoded.email || decoded.name || '',
    // LB4 profile properties can be in different fields
      role: (decoded.role as UserRole) || UserRole.CONSUMER,
    };
  } catch {
    return null;
  }
};

const token = localStorage.getItem('token');
const initialUser = token ? parseToken(token) : null;

if (token && !initialUser) {
  localStorage.removeItem('token');
}

const initialState: AuthState = {
  user: initialUser,
  token: token,
  isAuthenticated: !!initialUser,
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
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;
