import { createSlice } from "@reduxjs/toolkit";
import { axiosInstance } from "../../lib/axios";
import { toast } from "react-toastify";
import { toggleCreateProductModal, toggleUpdateProductModal } from "./extraSlice";

const productSlice = createSlice({
  name: "product",
  initialState: {
    loading: false,
    products: [],
    totalProducts: 0,
  },
  reducers: {
    createProductRequest(state) {
      state.loading = true;
    },
    createProductSuccess(state, action) {
      state.loading = false;
      if (action.payload) {
        state.products.unshift(action.payload);
        state.totalProducts += 1;
      }
    },
    createProductFailed(state) {
      state.loading = false;
    },

    getAllProductsRequest(state) {
      state.loading = true;
    },
    getAllProductsSuccess(state, action) {
      state.loading = false;
      state.products = action.payload.products || [];
      state.totalProducts = action.payload.totalProducts || 0;
    },
    getAllProductsFailed(state) {
      state.loading = false;
    },

    updateProductRequest(state) {
      state.loading = true;
    },
    updateProductSuccess(state, action) {
      state.loading = false;
      if (action.payload) {
        const index = state.products.findIndex(
          (p) => p.id === action.payload.id
        );
        if (index !== -1) {
          state.products[index] = action.payload;
        }
      }
    },
    updateProductFailed(state) {
      state.loading = false;
    },

    deleteProductRequest(state) {
      state.loading = true;
    },
    deleteProductSuccess(state, action) {
      state.loading = false;
      state.products = state.products.filter(
        (p) => p.id !== action.payload
      );
      state.totalProducts = Math.max(0, state.totalProducts - 1);
    },
    deleteProductFailed(state) {
      state.loading = false;
    },
  },
});

export const {
  createProductRequest,
  createProductSuccess,
  createProductFailed,
  getAllProductsRequest,
  getAllProductsSuccess,
  getAllProductsFailed,
  updateProductRequest,
  updateProductSuccess,
  updateProductFailed,
  deleteProductRequest,
  deleteProductSuccess,
  deleteProductFailed,
} = productSlice.actions;

export const createNewProduct = (data) => async (dispatch) => {
  dispatch(createProductRequest());
  try {
    const res = await axiosInstance.post("/product/admin/create", data);
    dispatch(createProductSuccess(res.data.product));
    toast.success(res.data.message || "Product created successfully.");
    dispatch(toggleCreateProductModal());
  } catch (error) {
    dispatch(createProductFailed());
    toast.error(error.response?.data?.message || "Failed to create product.");
  }
};

export const updateProduct = (data, productId) => async (dispatch) => {
  dispatch(updateProductRequest());
  try {
    const res = await axiosInstance.put(`/product/admin/update/${productId}`, data);
    dispatch(updateProductSuccess(res.data.updatedProduct));
    toast.success(res.data.message || "Product updated successfully.");
    dispatch(toggleUpdateProductModal());
  } catch (error) {
    dispatch(updateProductFailed());
    toast.error(error.response?.data?.message || "Failed to update product.");
  }
};

export const fetchAllProducts = () => async (dispatch) => {
  dispatch(getAllProductsRequest());
  try {
    const res = await axiosInstance.get("/product");
    dispatch(
      getAllProductsSuccess({
        products: res.data.products,
        totalProducts: res.data.totalProducts,
      })
    );
  } catch (error) {
    dispatch(getAllProductsFailed());
    toast.error(error.response?.data?.message || "Failed to fetch products.");
  }
};

export const deleteProduct = (productId) => async (dispatch) => {
  dispatch(deleteProductRequest());
  try {
    const res = await axiosInstance.delete(`/product/admin/delete/${productId}`);
    dispatch(deleteProductSuccess(productId));
    toast.success(res.data.message || "Product deleted successfully.");
  } catch (error) {
    dispatch(deleteProductFailed());
    toast.error(error.response?.data?.message || "Failed to delete product.");
  }
};

export default productSlice.reducer;
