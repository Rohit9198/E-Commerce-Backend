import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../../lib/axios";
import { toast } from "react-toastify";
import { toggleAuthPopup } from "./popupSlice";

export const register = createAsyncThunk("auth/register", async(data, thunkAPI) => {
  try{
    const res = await axiosInstance.post("/auth/register", data);
    toast.success(res.data?.message || "Registered successfully!");
    thunkAPI.dispatch(toggleAuthPopup());
    return res.data.user;
  }catch(error){
    toast.error(error.response?.data?.message || "Registration failed.");
    return thunkAPI.rejectWithValue(error.response?.data?.message);
  }
});

export const login = createAsyncThunk("auth/login", async(data, thunkAPI) => {
  try{
    const res = await axiosInstance.post("/auth/login", data);
    toast.success(res.data?.message || "Logged in successfully!");
    thunkAPI.dispatch(toggleAuthPopup());
    return res.data.user;
  }catch(error){
    toast.error(error.response?.data?.message || "Login failed.");
    return thunkAPI.rejectWithValue(error.response?.data?.message);
  }
});

export const getUser = createAsyncThunk("auth/getUser", async(_, thunkAPI) => {
  try{
    const res = await axiosInstance.get("/auth/me");
    return res.data.user;
  }catch(error){
    return thunkAPI.rejectWithValue(error.response?.data?.message || "Failed to get user.");
  }
});

export const logout = createAsyncThunk("auth/logout", async(_, thunkAPI) => {
  try{
    const res = await axiosInstance.get("/auth/logout");
    toast.success(res.data?.message || "Logged out successfully!");
    thunkAPI.dispatch(toggleAuthPopup());
    return null;
  }catch(error){
    toast.error(error.response?.data?.message || "Failed to log out.");
    return thunkAPI.rejectWithValue(error.response?.data?.message || "Failed to log out.");
  }
});

export const forgotPassword = createAsyncThunk("auth/forgotPassword", async(emailData, thunkAPI) => {
  try{
    const res = await axiosInstance.post("/auth/password/forgot?frontendUrl=http://localhost:5173", emailData);
    toast.success(res.data?.message || "Password reset link sent to your email!");
    return null;
  }catch(error){
    toast.error(error.response?.data?.message || "Something went wrong.");
    return thunkAPI.rejectWithValue(error.response?.data?.message);
  }
});

export const resetPassword = createAsyncThunk("auth/resetPassword", async({token, password, confirmPassword}, thunkAPI) => {
  try{
    const res = await axiosInstance.put(`/auth/password/reset/${token}`, {password, confirmPassword});
    toast.success(res.data?.message || "Password reset successfully!");
    return res.data.user;
  }catch(error){
    const message = error.response?.data?.message || "Something went wrong. Please try again.";
    toast.error(message);
    return thunkAPI.rejectWithValue(message);
  }
});

export const updatePassword = createAsyncThunk("auth/updatePassword", async(data, thunkAPI) => {
  try{
    const res = await axiosInstance.put(`/auth/password/update`, data);
    toast.success(res.data?.message || "Password updated successfully!");
    return null;
  }catch(error){
    const message = error.response?.data?.message || "Failed to update password.";
    toast.error(message);
    return thunkAPI.rejectWithValue(message);
  }
});

export const updateProfile = createAsyncThunk("auth/me/update", async(data, thunkAPI) => {
  try{
    const res = await axiosInstance.put(`/auth/profile/update`, data);
    toast.success(res.data?.message || "Profile updated successfully!");
    return res.data.user;
  }catch(error){
    const message = error.response?.data?.message || "Failed to update profile.";
    toast.error(message);
    return thunkAPI.rejectWithValue(message);
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState: {
    authUser: null,
    isSigningUp: false,
    isLoggingIn: false,
    isUpdatingProfile: false,
    isUpdatingPassword: false,
    isRequestingForToken: false,
    isCheckingAuth: true,
  },
  extraReducers: (builder) => {
    builder
      .addCase(register.pending, (state) => {
        state.isSigningUp = true;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isSigningUp = false;
        state.authUser = action.payload;
      })
      .addCase(register.rejected, (state) => {
        state.isSigningUp = false;
      })
      .addCase(login.pending, (state) => {
        state.isLoggingIn = true;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoggingIn = false;
        state.authUser = action.payload;
      })
      .addCase(login.rejected, (state) => {
        state.isLoggingIn = false;
      })
      .addCase(getUser.pending, (state) => {
        state.isCheckingAuth = true;
        state.authUser = null;
      })
      .addCase(getUser.fulfilled, (state, action) => {
        state.isCheckingAuth = false;
        state.authUser = action.payload;
      })
      .addCase(getUser.rejected, (state) => {
        state.isCheckingAuth = false;
        state.authUser = null;
      })
      .addCase(logout.fulfilled, (state) => {
        state.authUser = null;
      })
      .addCase(logout.rejected, (state) => {
        state.authUser = state.authUser;
      })
      .addCase(forgotPassword.pending, (state) => {
        state.isRequestingForToken = true;
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.isRequestingForToken = false;
      })
      .addCase(forgotPassword.rejected, (state) => {
        state.isRequestingForToken = false;
      })
      .addCase(resetPassword.pending, (state) => {
        state.isUpdatingPassword = true;
      })
      .addCase(resetPassword.fulfilled, (state, action) => {
        state.isUpdatingPassword = false;
        state.authUser = action.payload;
      })
      .addCase(resetPassword.rejected, (state) => {
        state.isUpdatingPassword = false;
      })
      .addCase(updatePassword.pending, (state) => {
        state.isUpdatingPassword = true;
      })
      .addCase(updatePassword.fulfilled, (state) => {
        state.isUpdatingPassword = false;
      })
      .addCase(updatePassword.rejected, (state) => {
        state.isUpdatingPassword = false;
      })
      .addCase(updateProfile.pending, (state) => {
        state.isUpdatingProfile = true;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.isUpdatingProfile = false;
        state.authUser = action.payload;
      })
      .addCase(updateProfile.rejected, (state) => {
        state.isUpdatingProfile = false;
      });
  },
});

export default authSlice.reducer;
