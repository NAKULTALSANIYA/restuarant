import React, { createContext, useContext, useState, useEffect } from 'react';
import instance from '../api/axios';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchCartItems();
    } else {
      setCartItems([]);
      setCartTotal(0);
    }
  }, [user]);

  const fetchCartItems = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const response = await instance.get(`/api/cart/${user.id}`);
      setCartItems(response.data.items);
      setCartTotal(parseFloat(response.data.total));
    } catch (error) {
      console.error('Error fetching cart items:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId, quantity = 1) => {
    if (!user) {
      return { success: false, message: 'Please login to add items to cart' };
    }

    try {
      await instance.post('/api/cart/add', {
        product_id: productId,
        quantity,
        user_id: user.id
      });

      await fetchCartItems();
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Error adding to cart' 
      };
    }
  };

  const updateCartItem = async (cartItemId, quantity) => {
    try {
      await instance.put('/api/cart/update', {
        cart_item_id: cartItemId,
        quantity
      });

      await fetchCartItems();
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Error updating cart item' 
      };
    }
  };

  const removeFromCart = async (cartItemId) => {
    try {
      await instance.delete(`/api/cart/remove/${cartItemId}`);
      await fetchCartItems();
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Error removing from cart' 
      };
    }
  };

  const clearCart = async () => {
    if (!user) return;

    try {
      await instance.delete(`/api/cart/clear/${user.id}`);
      setCartItems([]);
      setCartTotal(0);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Error clearing cart' 
      };
    }
  };

  const checkout = async (customerInfo) => {
    if (!user) {
      return { success: false, message: 'Please login to checkout' };
    }

    try {
      const response = await instance.post('/api/cart/checkout', {
        user_id: user.id,
        ...customerInfo
      });

      await fetchCartItems();
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Error during checkout' 
      };
    }
  };

  const value = {
    cartItems,
    cartTotal,
    loading,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    checkout,
    fetchCartItems,
    cartItemCount: cartItems.reduce((total, item) => total + item.quantity, 0)
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
