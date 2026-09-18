import { createSlice } from "@reduxjs/toolkit";
import { axiosInstance } from "../../lib/axios";
import { toast } from "react-toastify";

export const adminSlice = createSlice({
  name: "admin",
  initialState: {
    loading: false,
    totalUsers: 0,
    users: [],
    totalRevenueAllTime: 0,
    todayRevenue: 0,
    yesterdayRevenue: 0,
    totalUsersCount: 0,
    monthlySales: [],
    orderStatusCounts: {},
    topSellingProducts: [],
    lowStockProducts: [],
    revenueGrowth: "0%",
    newUsersThisMonth: 0,
    currentMonthSales: 0,
  },
  reducers: {
    getStatsRequest(state) {
      state.loading = true;
    },
    getStatsSuccess(state, action) {
      state.loading = false;
      state.totalRevenueAllTime = action.payload.totalRevenueAllTime || 0;
      state.todayRevenue = action.payload.todayRevenue || 0;
      state.yesterdayRevenue = action.payload.yesterdayRevenue || 0;
      state.totalUsersCount = action.payload.totalUsersCount || 0;
      state.monthlySales = action.payload.monthlySales || [];
      state.orderStatusCounts = action.payload.orderStatusCounts || {};
      state.topSellingProducts = action.payload.topSellingProducts || [];
      state.lowStockProducts = action.payload.lowStockProducts || [];
      state.revenueGrowth = action.payload.revenueGrowth || "0%";
      state.newUsersThisMonth = action.payload.newUsersThisMonth || 0;
      state.currentMonthSales = action.payload.currentMonthSales || 0;
    },
    getStatsFailed(state) {
      state.loading = false;
    },

    getAllUsersRequest(state) {
      state.loading = true;
    },
    getAllUsersSuccess(state, action) {
      state.loading = false;
      state.users = action.payload.users || [];
      state.totalUsers = action.payload.totalUsers || 0;
    },
    getAllUsersFailed(state) {
      state.loading = false;
    },

    deleteUserRequest(state) {
      state.loading = true;
    },
    deleteUserSuccess(state, action) {
      state.loading = false;
      state.users = state.users.filter((u) => u.id !== action.payload);
      state.totalUsers = Math.max(0, state.totalUsers - 1);
      state.totalUsersCount = Math.max(0, state.totalUsersCount - 1);
    },
    deleteUserFailed(state) {
      state.loading = false;
    },
  },
});

export const {
  getStatsRequest,
  getStatsSuccess,
  getStatsFailed,
  getAllUsersRequest,
  getAllUsersSuccess,
  getAllUsersFailed,
  deleteUserRequest,
  deleteUserSuccess,
  deleteUserFailed,
} = adminSlice.actions;

export const getDashboardStats = () => async (dispatch) => {
  dispatch(getStatsRequest());
  try {
    const res = await axiosInstance.get("/admin/fetch/dashboard-stats");
    dispatch(getStatsSuccess(res.data));
  } catch (error) {
    dispatch(getStatsFailed());
    toast.error(error.response?.data?.message || error.message || "Failed to fetch dashboard stats");
  }
};

export const fetchAllUsers = (page = 1) => async (dispatch) => {
  dispatch(getAllUsersRequest());
  try {
    const res = await axiosInstance.get(`/admin/getallusers?page=${page}`);
    dispatch(getAllUsersSuccess(res.data));
  } catch (error) {
    dispatch(getAllUsersFailed());
    toast.error(error.response?.data?.message || error.message || "Failed to fetch users");
  }
};

export const deleteUser = (userId) => async (dispatch) => {
  dispatch(deleteUserRequest());
  try {
    const res = await axiosInstance.delete(`/admin/delete/${userId}`);
    dispatch(deleteUserSuccess(userId));
    toast.success(res.data.message || "User deleted successfully");
  } catch (error) {
    dispatch(deleteUserFailed());
    toast.error(error.response?.data?.message || error.message || "Failed to delete user");
  }
};

export default adminSlice.reducer;
