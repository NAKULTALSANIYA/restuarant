const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const { connectDB } = require('./config/database');
require('dotenv').config();
const productRoutes = require('./routes/products.js');
const cartRoutes = require('./routes/cart.js');
const orderRoutes = require('./routes/orders.js');
const authRoutes = require('./routes/auth.js');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL | 'http://localhost:5173',
  credentials: true,
  optionsSuccessStatus: 200
}));

// Explicitly handle OPTIONS preflight requests for all routes
app.options('*', cors({
  origin: process.env.FRONTEND_URL | 'http://localhost:5173',
  credentials: true,
  optionsSuccessStatus: 200
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/products', productRoutes);
app.use('/api/cart',  cartRoutes);
app.use('/api/orders',  orderRoutes);
app.use('/api/auth',  authRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.listen(PORT,"0.0.0.0", async() => {
  await connectDB();
  console.log(`Server running on port ${PORT}`);
});
