import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../../lib/axios";
import { toast } from "react-toastify";
import { toggleAIModal } from "./popupSlice";

export const fetchAllProducts = createAsyncThunk(
  "product/fetchAll",
  async (filterParams = {}, thunkAPI) => {
    try {
      const {
        availability = "",
        price = "",
        category = "",
        rating = "",
        search = "",
        page = 1,
      } = filterParams;

      const params = new URLSearchParams();

      if (category) params.append("category", category);
      if (price) params.append("price", price);
      if (search) params.append("search", search);
      if (rating) params.append("rating", rating);
      if (availability) params.append("availability", availability);
      if (page) params.append("page", page);

      const queryString = params.toString();
      const url = queryString ? `/product?${queryString}` : "/product";
      const res = await axiosInstance.get(url);
      return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message || "Failed to fetch products."
      );
    }
  }
);

export const fetchProductDetails = createAsyncThunk("product/singleProduct", async(id, thunkAPI) =>{
  try{
   const res = await axiosInstance.get(`/product/singleProduct/${id}`)
   return res.data.product;
  }catch(error){
    return thunkAPI.rejectWithValue(
      error.response.data.message || "Failed to fetch products."
    );
  }
})

export const postReview = createAsyncThunk(
  "product/post-new/review", 
  async ({ productId, review }, thunkAPI) => {
    try {
      const res = await axiosInstance.put(`/product/post-new/review/${productId}`, review);
      toast.success(res.data.message);
      return res.data.review;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to post review.");
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to post review."
      );
    }
  }
);

export const deleteReview = createAsyncThunk(
  "product/delete/review", 
  async ({ productId, reviewId }, thunkAPI) => {
    try {
      const res = await axiosInstance.delete(`/product/delete/review/${productId}`);
      toast.success(res.data.message);
      return reviewId;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete review.");
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to delete review."
      );
    }
  }
);

export const fetchProductWithAI = createAsyncThunk(
  "product/ai-search", 
  async (userPrompt, thunkAPI) => {
    try {
      const res = await axiosInstance.post(`/product/ai-search`, userPrompt);
      thunkAPI.dispatch(toggleAIModal());
      return res.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch AI Filtered products details.");
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch AI Filtered products details."
      );
    }
  }
);

const productSlice = createSlice({
  name: "product",
  initialState: {
    loading: false,
    products: [],
    productDetails: {},
    totalProducts: 0,
    topRatedProducts: [],
    newProducts: [],
    aiSearching: false,
    isReviewDeleting: false,
    isPostingReview: false,
    productReviews: [],
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllProducts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAllProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload.products;
        state.newProducts = action.payload.newProducts;
        state.topRatedProducts = action.payload.topRatedProducts;
        state.totalProducts = action.payload.totalProducts;
      }) 
      .addCase(fetchAllProducts.rejected, (state) => {
        state.loading = false;
      })
      .addCase(fetchProductDetails.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProductDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.productDetails = action.payload;
        state.productReviews = action.payload.reviews;
      }) 
      .addCase(fetchProductDetails.rejected, (state) => {
        state.loading = false;
      })
      .addCase(postReview.pending, (state) => {
        state.isPostingReview = true;
      })
      .addCase(postReview.fulfilled, (state, action) => {
        state.isPostingReview = false;
        state.productReviews = [action.payload, ...state.productReviews]; 
      })
      .addCase(postReview.rejected, (state) => {
        state.isPostingReview = false;
      })
      .addCase(deleteReview.pending, (state) => {
        state.isReviewDeleting = true;
      })
      .addCase(deleteReview.fulfilled, (state, action) => {
        state.isReviewDeleting = false;
        state.productReviews = state.productReviews.filter(
          (review) => review.review_id !== action.payload
        );
      })
    .addCase(deleteReview.rejected,(state) => {
      state.isReviewDeleting= false;
    })
    .addCase(fetchProductWithAI.pending,(state) => {
      state.aiSearching= true;
    })
    .addCase(fetchProductWithAI.fulfilled,(state, action) => {
      state.aiSearching= false;
      state.products = action.payload.products;
      state.totalProducts = action.payload.products.length;
    })
    .addCase(fetchProductWithAI.rejected,(state) => {
      state.aiSearching= false;
    })
  },
});

export default productSlice.reducer;
