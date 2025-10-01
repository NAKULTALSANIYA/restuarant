const express = require('express');
const { body, validationResult } = require('express-validator');
const CartItem = require('../models/CartItem');
const Product = require('../models/Product');
const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const { requireAuth, requireCustomer } = require('../middleware/auth');

const router = express.Router();

// Add item to cart
router.post('/add', requireAuth, requireCustomer, [
  body('product_id').isMongoId().withMessage('Product ID must be a valid ID'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('user_id').isMongoId().withMessage('User ID must be a valid ID')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { product_id, quantity, user_id } = req.body;

    // Ensure user can only add to their own cart
    if (user_id !== req.user.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Check if product exists and is available
    const product = await Product.findOne({ _id: product_id, is_available: true });

    if (!product) {
      return res.status(404).json({ message: 'Product not found or not available' });
    }

    // Check if item already exists in cart
    const existingItem = await CartItem.findOne({ product_id, user_id });

    if (existingItem) {
      // Update quantity
      await CartItem.findByIdAndUpdate(existingItem._id, { quantity: existingItem.quantity + quantity });
    } else {
      // Add new item
      const cartItem = new CartItem({
        user_id,
        product_id,
        quantity
      });
      await cartItem.save();
    }

    res.json({ message: 'Item added to cart successfully' });
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ message: 'Error adding to cart' });
  }
});

// Get cart items
router.get('/:user_id', requireAuth, requireCustomer, async (req, res) => {
  try {
    const { user_id } = req.params;

    // Ensure user can only access their own cart
    if (user_id !== req.user.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const cartItems = await CartItem.find({ user_id })
      .populate({
        path: 'product_id',
        match: { is_available: true }
      })
      .sort({ createdAt: -1 });

    // Filter out items where product is not available
    const validItems = cartItems.filter(item => item.product_id);

    const items = validItems.map(item => ({
      id: item._id,
      quantity: item.quantity,
      product_id: item.product_id._id,
      name: item.product_id.name,
      price: item.product_id.price,
      image_url: item.product_id.image_url,
      description: item.product_id.description,
      subtotal: (item.quantity * item.product_id.price).toFixed(2)
    }));

    // Calculate total
    const total = items.reduce((sum, item) => sum + parseFloat(item.subtotal), 0);

    res.json({
      items,
      total: total.toFixed(2)
    });
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({ message: 'Error fetching cart' });
  }
});

// Update cart item quantity
router.put('/update', requireAuth, requireCustomer, [
  body('cart_item_id').isMongoId().withMessage('Cart item ID must be a valid ID'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { cart_item_id, quantity } = req.body;

    // Check if cart item belongs to the user
    const cartItem = await CartItem.findById(cart_item_id);
    if (!cartItem || cartItem.user_id.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const result = await CartItem.findByIdAndUpdate(cart_item_id, { quantity });

    if (!result) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    res.json({ message: 'Cart item updated successfully' });
  } catch (error) {
    console.error('Error updating cart item:', error);
    res.status(500).json({ message: 'Error updating cart item' });
  }
});

// Remove item from cart
router.delete('/remove/:cart_item_id', requireAuth, requireCustomer, async (req, res) => {
  try {
    const { cart_item_id } = req.params;

    // Check if cart item belongs to the user
    const cartItem = await CartItem.findById(cart_item_id);
    if (!cartItem || cartItem.user_id.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const result = await CartItem.findByIdAndDelete(cart_item_id);

    if (!result) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    res.json({ message: 'Item removed from cart successfully' });
  } catch (error) {
    console.error('Error removing cart item:', error);
    res.status(500).json({ message: 'Error removing cart item' });
  }
});

// Clear entire cart
router.delete('/clear/:user_id', async (req, res) => {
  try {
    const { user_id } = req.params;

    await CartItem.deleteMany({ user_id });

    res.json({ message: 'Cart cleared successfully' });
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({ message: 'Error clearing cart' });
  }
});

// Create order from cart
router.post('/checkout', [
  body('user_id').isMongoId().withMessage('User ID must be a valid ID'),
  body('customer_name').trim().isLength({ min: 1 }).withMessage('Customer name is required'),
  body('customer_email').isEmail().withMessage('Valid email is required'),
  body('customer_phone').trim().isLength({ min: 1 }).withMessage('Phone number is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { user_id, customer_name, customer_email, customer_phone } = req.body;

    // Get cart items
    const cartItems = await CartItem.find({ user_id })
      .populate({
        path: 'product_id',
        match: { is_available: true }
      });

    const validCartItems = cartItems.filter(item => item.product_id);

    if (validCartItems.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    // Calculate total
    const totalAmount = validCartItems.reduce((sum, item) => sum + (item.quantity * item.product_id.price), 0);

    // Generate order number
    const orderNumber = 'ORD-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9).toUpperCase();

    // Create order
    const order = new Order({
      order_number: orderNumber,
      user_id,
      customer_name,
      customer_email,
      customer_phone,
      total_amount: totalAmount
    });

    await order.save();

    // Create order items
    const orderItems = validCartItems.map(item => ({
      order_id: order._id,
      product_id: item.product_id._id,
      product_name: item.product_id.name,
      product_price: item.product_id.price,
      quantity: item.quantity,
      subtotal: item.quantity * item.product_id.price
    }));

    await OrderItem.insertMany(orderItems);

    // Clear cart
    await CartItem.deleteMany({ user_id });

    res.status(201).json({
      message: 'Order created successfully',
      orderId: order._id,
      orderNumber: orderNumber,
      totalAmount: totalAmount.toFixed(2)
    });

  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ message: 'Error creating order' });
  }
});

module.exports = router;
