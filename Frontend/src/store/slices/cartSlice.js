import { createSlice } from "@reduxjs/toolkit";

const normalizeProduct = (prod) => {
  if (!prod) return null;
  let current = prod;
  // Handle nested wrappers like { products: { ... } } or { product: { ... } }
  while (
    current &&
    typeof current === "object" &&
    (current.product || current.products) &&
    !current.name &&
    !current.id &&
    !current._id
  ) {
    current = current.product || current.products;
  }
  return current;
};

const initialCart = (() => {
  try {
    const stored = localStorage.getItem("cart");
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((item) => {
        const prod = normalizeProduct(item.product) || normalizeProduct(item);
        return {
          ...item,
          product: prod,
          quantity: Number(item.quantity) > 0 ? Number(item.quantity) : 1,
        };
      })
      .filter(
        (item) => item.product && (item.product.id || item.product._id || item.id)
      );
  } catch (error) {
    return [];
  }
})();

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    cart: initialCart,
  },
  reducers: {
    addToCart: (state, action) => {
      const payload = action.payload;
      const rawProduct = payload?.product || payload?.products || payload;
      const product = normalizeProduct(rawProduct);
      if (!product) return;

      const qty = payload.quantity ? Number(payload.quantity) : 1;
      const productId = String(product.id || product._id);

      const existingItem = state.cart.find(
        (i) =>
          String(i.product?.id || i.product?._id || i.id) === productId
      );

      if (existingItem) {
        existingItem.quantity = (Number(existingItem.quantity) || 0) + qty;
      } else {
        state.cart.push({ product, quantity: qty });
      }

      localStorage.setItem("cart", JSON.stringify(state.cart));
    },
    removeFromCart: (state, action) => {
      const productId = String(action.payload);
      state.cart = state.cart.filter(
        (i) =>
          String(i.product?.id || i.product?._id || i.id) !== productId
      );
      localStorage.setItem("cart", JSON.stringify(state.cart));
    },
    updateQuantity: (state, action) => {
      const { id, quantity } = action.payload;
      const targetId = String(id);
      const newQty = Number(quantity);

      if (newQty <= 0) {
        state.cart = state.cart.filter(
          (i) =>
            String(i.product?.id || i.product?._id || i.id) !== targetId
        );
      } else {
        const item = state.cart.find(
          (i) =>
            String(i.product?.id || i.product?._id || i.id) === targetId
        );
        if (item) {
          item.quantity = newQty;
        }
      }
      localStorage.setItem("cart", JSON.stringify(state.cart));
    },
    updateCartQuantity: (state, action) => {
      const { id, quantity } = action.payload;
      const targetId = String(id);
      const newQty = Number(quantity);

      if (newQty <= 0) {
        state.cart = state.cart.filter(
          (i) =>
            String(i.product?.id || i.product?._id || i.id) !== targetId
        );
      } else {
        const item = state.cart.find(
          (i) =>
            String(i.product?.id || i.product?._id || i.id) === targetId
        );
        if (item) {
          item.quantity = newQty;
        }
      }
      localStorage.setItem("cart", JSON.stringify(state.cart));
    },
    clearCart: (state) => {
      state.cart = [];
      localStorage.removeItem("cart");
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  updateQuantity,
  updateCartQuantity,
  clearCart,
} = cartSlice.actions;

export default cartSlice.reducer;
