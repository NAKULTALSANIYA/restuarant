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
  const [pendingUpdates, setPendingUpdates] = useState(new Map()); // Track pending changes: cartItemId -> {quantity, action}
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

  const updateCartItem = (cartItemId, quantity) => {
    // Update local state immediately (optimistic update)
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === cartItemId
          ? { ...item, quantity, subtotal: (quantity * item.price).toFixed(2) }
          : item
      )
    );

    // Update total
    setCartTotal(prevTotal => {
      const item = cartItems.find(item => item.id === cartItemId);
      if (item) {
        const oldSubtotal = parseFloat(item.subtotal);
        const newSubtotal = quantity * item.price;
        return prevTotal - oldSubtotal + newSubtotal;
      }
      return prevTotal;
    });

    // Track pending update
    setPendingUpdates(prev => new Map(prev).set(cartItemId, { quantity, action: 'update' }));

    return { success: true };
  };

  const removeFromCart = (cartItemId) => {
    // Update local state immediately (optimistic update)
    const itemToRemove = cartItems.find(item => item.id === cartItemId);
    if (itemToRemove) {
      setCartItems(prevItems => prevItems.filter(item => item.id !== cartItemId));
      setCartTotal(prevTotal => prevTotal - parseFloat(itemToRemove.subtotal));
    }

    // Track pending update
    setPendingUpdates(prev => new Map(prev).set(cartItemId, { action: 'remove' }));

    return { success: true };
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

  const syncPendingUpdates = async () => {
    if (!user) return;

    const updates = Array.from(pendingUpdates.entries());

    for (const [cartItemId, update] of updates) {
      try {
        if (update.action === 'update') {
          await instance.put('/api/cart/update', {
            cart_item_id: cartItemId,
            quantity: update.quantity
          });
        } else if (update.action === 'remove') {
          await instance.delete(`/api/cart/remove/${cartItemId}`);
        }
        // Remove from pendingUpdates after successful sync
        setPendingUpdates(prev => {
          const newMap = new Map(prev);
          newMap.delete(cartItemId);
          return newMap;
        });
      } catch (error) {
        console.error('Error syncing cart update:', error);
        // Optionally handle retry or error display
      }
    }
  };

  const checkout = async (customerInfo) => {
    if (!user) {
      return { success: false, message: 'Please login to checkout' };
    }

    try {
      // Sync pending updates before checkout
      await syncPendingUpdates();

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
