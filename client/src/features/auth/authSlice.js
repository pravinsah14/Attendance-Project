import { createSlice } from '@reduxjs/toolkit';

const loadState = () => {
  try {
    const serialized = localStorage.getItem('auth');
    if (!serialized) return { user: null, token: null, isAuthenticated: false };
    return JSON.parse(serialized);
  } catch {
    return { user: null, token: null, isAuthenticated: false };
  }
};

const initialState = loadState();

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { user, token } = action.payload;
      state.user = user;
      state.token = token;
      state.isAuthenticated = true;
      try {
        localStorage.setItem('auth', JSON.stringify({ user, token, isAuthenticated: true }));
      } catch {}
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      try {
        localStorage.removeItem('auth');
      } catch {}
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
