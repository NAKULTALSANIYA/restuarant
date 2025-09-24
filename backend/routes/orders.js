const express = require('express');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');

const router = express.Router();

// Get all orders
router.get('/', async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const query = status ? { status } : {};
    const skip = (page - 1) * limit;

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalItems = await Order.countDocuments(query);

    res.json({
      orders,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalItems / limit),
        totalItems,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Error fetching orders' });
  }
});

// Get single order with items
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const items = await OrderItem.find({ order_id: id });

    res.json({
      order,
      items
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ message: 'Error fetching order' });
  }
});

// Update order status
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const result = await Order.findByIdAndUpdate(id, { status });

    if (!result) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({ message: 'Order status updated successfully' });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ message: 'Error updating order status' });
  }
});

// Generate PDF bill
router.get('/:id/bill', async (req, res) => {
  try {
    const { id } = req.params;

    // Get order details
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Get order items
    const orderItems = await OrderItem.find({ order_id: id });

    // Create PDF
    const doc = new PDFDocument({ margin: 50 });

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="bill-${order.order_number}.pdf"`);

    // Pipe PDF to response
    doc.pipe(res);

    // Restaurant header
    doc.fontSize(24)
       .font('Helvetica-Bold')
       .text('Restaurant Management', { align: 'center' });

    doc.fontSize(16)
       .font('Helvetica')
       .text('Bill Receipt', { align: 'center' })
       .moveDown(2);

    // Order details
    doc.fontSize(12)
       .text(`Order Number: ${order.order_number}`)
       .text(`Date: ${new Date(order.order_date).toLocaleDateString()}`)
       .text(`Customer: ${order.customer_name}`)
       .text(`Email: ${order.customer_email}`)
       .text(`Phone: ${order.customer_phone}`)
       .moveDown(1);

    // Items table header
    doc.text('Items Ordered:', { underline: true })
       .moveDown(0.5);

    // Table headers
    const tableTop = doc.y;
    doc.font('Helvetica-Bold')
       .fontSize(10)
       .text('Item', 50, tableTop)
       .text('Qty', 300, tableTop)
       .text('Price', 350, tableTop)
       .text('Subtotal', 450, tableTop);

    // Draw line under headers
    doc.moveTo(50, tableTop + 15)
       .lineTo(550, tableTop + 15)
       .stroke();

    let currentY = tableTop + 25;

    // Items
    doc.font('Helvetica')
       .fontSize(9);

    orderItems.forEach(item => {
      doc.text(item.product_name, 50, currentY, { width: 240 })
         .text(item.quantity.toString(), 300, currentY)
         .text(`Rs. ${item.product_price}`, 350, currentY)
         .text(`Rs. ${item.subtotal}`, 450, currentY);

      currentY += 20;
    });

    // Total
    currentY += 10;
    doc.moveTo(350, currentY)
       .lineTo(550, currentY)
       .stroke();

    currentY += 10;
    doc.font('Helvetica-Bold')
       .fontSize(12)
       .text(`Total Amount: Rs. ${order.total_amount}`, 350, currentY);

    // Footer
    doc.moveDown(3)
       .font('Helvetica')
       .fontSize(10)
       .text('Thank you for your order!', { align: 'center' })
       .text('Visit us again soon!', { align: 'center' });

    // Finalize PDF
    doc.end();

  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({ message: 'Error generating PDF bill' });
  }
});

// Get order statistics
router.get('/stats/summary', async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();

    const totalRevenueResult = await Order.aggregate([
      { $match: { payment_status: 'paid' } },
      { $group: { _id: null, total: { $sum: '$total_amount' } } }
    ]);
    const totalRevenue = totalRevenueResult.length > 0 ? totalRevenueResult[0].total : 0;

    const statusBreakdown = await Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $project: { status: '$_id', count: 1, _id: 0 } }
    ]);

    res.json({
      totalOrders,
      totalRevenue,
      statusBreakdown
    });
  } catch (error) {
    console.error('Error fetching order stats:', error);
    res.status(500).json({ message: 'Error fetching order statistics' });
  }
});

module.exports = router;
