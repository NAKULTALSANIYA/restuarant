# Restaurant Management Web Application

A comprehensive restaurant management system built with Node.js, Express.js, React, and MongoDB. This application provides a complete solution for managing restaurant operations including menu management, order processing, customer management, and PDF bill generation.

## 🚀 Features

### Customer Features
- **Modern UI**: Beautiful, responsive design with Tailwind CSS
- **Menu Browsing**: Browse products with search and category filtering
- **Shopping Cart**: Add items to cart with quantity management
- **User Authentication**: Secure login/register system
- **Order Management**: View order history and track status
- **PDF Bills**: Download order bills in PDF format

### Admin Features
- **Product Management**: Add, edit, delete, and manage menu items
- **Order Management**: View and update order status
- **Dashboard**: Comprehensive analytics and statistics
- **Image Upload**: Upload product images with validation
- **Category Management**: Organize products by categories

### Technical Features
- **RESTful API**: Well-structured API endpoints
- **Database Integration**: MongoDB with Mongoose
- **File Upload**: Image upload with multer
- **PDF Generation**: Automatic bill generation with PDFKit
- **Authentication**: JWT-based authentication
- **Responsive Design**: Mobile-first approach
- **Error Handling**: Comprehensive error handling
- **Security**: Rate limiting, CORS, and input validation

## 🛠️ Tech Stack

### Backend
- **Node.js**: Runtime environment
- **Express.js**: Web framework
- **MongoDB**: Database with Mongoose
- **JWT**: Authentication
- **Multer**: File upload handling
- **PDFKit**: PDF generation
- **bcryptjs**: Password hashing
- **express-validator**: Input validation

### Frontend
- **React**: UI library
- **Vite**: Build tool
- **Tailwind CSS**: Styling framework
- **React Router**: Client-side routing
- **Axios**: HTTP client
- **Heroicons**: Icon library

## 📋 Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (v14 or higher)
- **npm** (v6 or higher)
- **XAMPP** (for MySQL database)
- **Git** (for version control)

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd restaurant-management-app
```

### 2. Install Backend Dependencies
```bash
npm install
```

### 3. Install Frontend Dependencies
```bash
cd client
npm install
cd ..
```

### 4. Database Setup

1. **Start XAMPP**:
   - Open XAMPP Control Panel
   - Start Apache and MySQL services

2. **Create Database**:
   - Open phpMyAdmin (http://localhost/phpmyadmin)
   - Create a new database named `restaurant_management`

3. **Configure Environment**:
   - The application will automatically create tables on first run
   - Database configuration is in `config/database.js`

### 5. Environment Configuration

Create a `.env` file in the root directory:
```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=restaurant_management
JWT_SECRET=your_jwt_secret_key_here
UPLOAD_PATH=./uploads
```

### 6. Run the Application

#### Development Mode

**Terminal 1 - Backend Server**:
```bash
npm run dev
```

**Terminal 2 - Frontend Development Server**:
```bash
cd client
npm run dev
```

#### Production Mode

**Build Frontend**:
```bash
cd client
npm run build
cd ..
```

**Start Production Server**:
```bash
npm start
```

## 🌐 Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **Database**: http://localhost/phpmyadmin

## 📁 Project Structure

```
restaurant-management-app/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── contexts/       # React contexts
│   │   ├── pages/          # Page components
│   │   └── ...
│   └── package.json
├── config/                 # Configuration files
│   └── database.js         # Database configuration
├── routes/                 # API routes
│   ├── auth.js            # Authentication routes
│   ├── products.js        # Product management routes
│   ├── cart.js            # Cart and checkout routes
│   └── orders.js          # Order management routes
├── uploads/               # File uploads directory
│   └── products/          # Product images
├── server.js              # Main server file
├── package.json           # Backend dependencies
└── README.md
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/change-password` - Change password

### Products
- `GET /api/products` - Get all products (with pagination, search, filter)
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create new product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product (soft delete)
- `GET /api/products/categories/list` - Get product categories

### Cart
- `POST /api/cart/add` - Add item to cart
- `GET /api/cart/:user_id` - Get user's cart
- `PUT /api/cart/update` - Update cart item quantity
- `DELETE /api/cart/remove/:cart_item_id` - Remove item from cart
- `DELETE /api/cart/clear/:user_id` - Clear entire cart
- `POST /api/cart/checkout` - Create order from cart

### Orders
- `GET /api/orders` - Get all orders (with pagination, filter)
- `GET /api/orders/:id` - Get single order with items
- `PUT /api/orders/:id/status` - Update order status
- `GET /api/orders/:id/bill` - Download PDF bill
- `GET /api/orders/stats/summary` - Get order statistics

## 🎨 UI Components

### Pages
- **Home**: Landing page with features and testimonials
- **Menu**: Product catalog with search and filtering
- **Cart**: Shopping cart with checkout functionality
- **Orders**: Order history and tracking
- **Login/Register**: Authentication pages
- **Admin Dashboard**: Analytics and management overview
- **Product Management**: CRUD operations for products

### Key Features
- **Responsive Design**: Mobile-first approach
- **Modern UI**: Clean, professional design
- **Interactive Elements**: Hover effects, animations
- **Form Validation**: Client and server-side validation
- **Error Handling**: User-friendly error messages
- **Loading States**: Smooth loading indicators

## 🔐 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt for password security
- **Input Validation**: Server-side validation with express-validator
- **Rate Limiting**: Prevent API abuse
- **CORS Configuration**: Cross-origin request handling
- **File Upload Security**: Image type validation and size limits
- **SQL Injection Prevention**: Parameterized queries

## 📊 Database Schema

### Tables
- **users**: User accounts and authentication
- **products**: Menu items and product information
- **cart_items**: Shopping cart items
- **orders**: Order information and customer details
- **order_items**: Individual items within orders

### Relationships
- Users can have multiple cart items and orders
- Orders contain multiple order items
- Products are referenced in cart items and order items

## 🚀 Deployment

### Backend Deployment
1. Set up a production server (AWS, DigitalOcean, etc.)
2. Install Node.js and MySQL
3. Configure environment variables
4. Run `npm install` and `npm start`

### Frontend Deployment
1. Build the React app: `cd client && npm run build`
2. Deploy the `dist` folder to a static hosting service
3. Update API base URL in production

### Database Deployment
1. Export MySQL database from XAMPP
2. Import to production MySQL server
3. Update database connection settings

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the documentation above
2. Search existing issues
3. Create a new issue with detailed information
4. Contact the development team

## 🔄 Updates & Roadmap

### Planned Features
- **Real-time Notifications**: WebSocket integration
- **Payment Integration**: Stripe/PayPal integration
- **Inventory Management**: Stock tracking
- **Analytics Dashboard**: Advanced reporting
- **Mobile App**: React Native version
- **Multi-language Support**: Internationalization

### Recent Updates
- ✅ Complete CRUD operations for products
- ✅ Shopping cart functionality
- ✅ PDF bill generation
- ✅ Modern responsive UI
- ✅ Authentication system
- ✅ Admin dashboard

---

**Happy Coding! 🎉**

For more information, please refer to the documentation or contact the development team.
