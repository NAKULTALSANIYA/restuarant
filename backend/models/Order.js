const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  order_number: {
    type: String,
    required: true,
    unique: true
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  customer_name: {
    type: String,
    trim: true
  },
  customer_email: {
    type: String,
    lowercase: true,
    trim: true
  },
  customer_phone: {
    type: String,
    trim: true
  },
  total_amount: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'],
    default: 'pending'
  },
  payment_status: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending'
  }
}, {
  timestamps: { createdAt: 'order_date', updatedAt: true }
});

module.exports = mongoose.model('Order', orderSchema);
