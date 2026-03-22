import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { jwtDecode } from 'jwt-decode';

interface User {
  id: string;
  email: string;
  role: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

const parseToken = (token: string): User | null => {
  try {
    const decoded: any = jwtDecode(token);
    // LB4 profile properties can be in different fields
    return {
      id: decoded.id || decoded.sub || '',
      email: decoded.name || decoded.email || '',
      role: decoded.role || 'CONSUMER',
    };
  } catch (e) {
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
