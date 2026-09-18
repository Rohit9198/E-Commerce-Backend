import { createSlice } from "@reduxjs/toolkit";
import { axiosInstance } from "../../lib/axios";
import { toast } from "react-toastify";

const orderSlice = createSlice({
  name: "order",
  initialState: {
    loading: false,
    orders: [],
    error: null,
  },
  reducers: {
    getAllOrdersRequest(state) {
      state.loading = true;
      state.error = null;
    },
    getAllOrdersSuccess(state, action) {
      state.loading = false;
      state.orders = action.payload || [];
    },
    getAllOrdersFailed(state, action) {
      state.loading = false;
      state.error = action.payload;
    },

    updateOrderRequest(state) {
      state.loading = true;
    },
    updateOrderSuccess(state, action) {
      state.loading = false;
      const index = state.orders.findIndex((o) => o.id === action.payload.id);
      if (index !== -1) {
        state.orders[index] = { ...state.orders[index], ...action.payload };
      }
    },
    updateOrderFailed(state) {
      state.loading = false;
    },

    deleteOrderRequest(state) {
      state.loading = true;
    },
    deleteOrderSuccess(state, action) {
      state.loading = false;
      state.orders = state.orders.filter((o) => o.id !== action.payload);
    },
    deleteOrderFailed(state) {
      state.loading = false;
    },
  },
});

export const {
  getAllOrdersRequest,
  getAllOrdersSuccess,
  getAllOrdersFailed,
  updateOrderRequest,
  updateOrderSuccess,
  updateOrderFailed,
  deleteOrderRequest,
  deleteOrderSuccess,
  deleteOrderFailed,
} = orderSlice.actions;

export const fetchAllOrders = () => async (dispatch) => {
  dispatch(getAllOrdersRequest());
  try {
    const res = await axiosInstance.get("/order/admin/getall");
    dispatch(getAllOrdersSuccess(res.data.orders));
  } catch (error) {
    const message = error.response?.data?.message || error.message || "Failed to fetch orders";
    dispatch(getAllOrdersFailed(message));
    toast.error(message);
  }
};

export const updateOrderStatus = (orderId, status) => async (dispatch) => {
  dispatch(updateOrderRequest());
  try {
    const res = await axiosInstance.put(`/order/admin/update/${orderId}`, { status });
    dispatch(updateOrderSuccess(res.data.order || { id: orderId, order_status: status }));
    toast.success(res.data.message || "Order status updated successfully");
  } catch (error) {
    dispatch(updateOrderFailed());
    toast.error(error.response?.data?.message || error.message || "Failed to update order status");
  }
};

export const deleteOrder = (orderId) => async (dispatch) => {
  dispatch(deleteOrderRequest());
  try {
    const res = await axiosInstance.delete(`/order/admin/delete/${orderId}`);
    dispatch(deleteOrderSuccess(orderId));
    toast.success(res.data.message || "Order deleted successfully");
  } catch (error) {
    dispatch(deleteOrderFailed());
    toast.error(error.response?.data?.message || error.message || "Failed to delete order");
  }
};

export default orderSlice.reducer;
