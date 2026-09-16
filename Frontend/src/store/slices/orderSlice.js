import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../../lib/axios";
import { toast } from "react-toastify";

export const fetchMyOrders = createAsyncThunk(
  "order/fetchMyOrders",
  async (_, thunkAPI) => {
    try {
      const res = await axiosInstance.get("/order/me");
      return res.data.myOrders || [];
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch orders."
      );
    }
  }
);

export const fetchSingleOrder = createAsyncThunk(
  "order/fetchSingleOrder",
  async (orderId, thunkAPI) => {
    try {
      const res = await axiosInstance.get(`/order/${orderId}`);
      return res.data.orders;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch order details."
      );
    }
  }
);

export const placeNewOrder = createAsyncThunk(
  "order/placeNewOrder",
  async (orderData, thunkAPI) => {
    try {
      const res = await axiosInstance.post("/order/new", orderData);
      toast.success(res.data?.message || "Order created successfully!");
      return res.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to place order.");
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to place order."
      );
    }
  }
);

const orderSlice = createSlice({
  name: "order",
  initialState: {
    myOrders: [],
    singleOrder: null,
    fetchingOrders: false,
    placingOrder: false,
    finalPrice: null,
    orderStep: 1,
    paymentIntent: "",
    error: null,
  },
  reducers: {
    setOrderStep: (state, action) => {
      state.orderStep = action.payload;
    },
    clearSingleOrder: (state) => {
      state.singleOrder = null;
    },
    clearOrderError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchMyOrders
      .addCase(fetchMyOrders.pending, (state) => {
        state.fetchingOrders = true;
        state.error = null;
      })
      .addCase(fetchMyOrders.fulfilled, (state, action) => {
        state.fetchingOrders = false;
        state.myOrders = action.payload || [];
      })
      .addCase(fetchMyOrders.rejected, (state, action) => {
        state.fetchingOrders = false;
        state.error = action.payload;
      })

      // fetchSingleOrder
      .addCase(fetchSingleOrder.pending, (state) => {
        state.fetchingOrders = true;
        state.error = null;
      })
      .addCase(fetchSingleOrder.fulfilled, (state, action) => {
        state.fetchingOrders = false;
        state.singleOrder = action.payload;
      })
      .addCase(fetchSingleOrder.rejected, (state, action) => {
        state.fetchingOrders = false;
        state.error = action.payload;
      })

      // placeNewOrder
      .addCase(placeNewOrder.pending, (state) => {
        state.placingOrder = true;
        state.error = null;
      })
      .addCase(placeNewOrder.fulfilled, (state, action) => {
        state.placingOrder = false;
        state.paymentIntent = action.payload?.paymentIntent || "";
        state.finalPrice = action.payload?.total_price || null;
      })
      .addCase(placeNewOrder.rejected, (state, action) => {
        state.placingOrder = false;
        state.error = action.payload;
      });
  },
});

export const { setOrderStep, clearSingleOrder, clearOrderError } = orderSlice.actions;
export default orderSlice.reducer;
