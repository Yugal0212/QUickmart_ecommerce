const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const { compressResponses, secureHeaders, apiLimiter } = require('./middleware/performance');

const connectDB = require('./config/db'); // Import database connection
const cookieParser = require("cookie-parser");
const authRoutes = require('./routes/authRoutes'); 
const addressRoutes = require('./routes/addresRoutes');
const productRoutes = require('./routes/productRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const sellerRoutes = require('./routes/sellerRoutes');
const adminRoutes = require('./routes/adminRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const walletRoutes = require('./routes/walletRoutes');
const couponRoutes = require('./routes/couponRoutes');
const seoRoutes = require('./routes/seoRoutes');
const blogRoutes = require('./routes/blogRoutes');
const path = require('path');

dotenv.config();
const app = express();

connectDB(); // Connect to MongoDB

app.use(express.urlencoded({ extended: true })); 
// add data in json format
app.use(express.json());

// Apply Performance Middleware
app.use(secureHeaders);
app.use(compressResponses);
app.use('/api', apiLimiter); // Apply rate limiting only to API routes

// Configure CORS to allow credentials (cookies) and to accept a frontend origin from env
const allowedOrigin = process.env.FRONTEND_URL || true; // if FRONTEND_URL not set, allow all (change in production)
app.use(
  cors({
    origin: allowedOrigin,
    credentials: true,
  })
);

app.use(cookieParser());

// If running behind a proxy (Render, Heroku, etc.), trust proxy to enable secure cookies
if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

app.use('/quickmart', express.static(path.join(__dirname, 'quickmart')));

// Routes
app.use("/api/auth", authRoutes); 
app.use("/api/address", addressRoutes);
app.use("/api/categories", categoryRoutes);
app.use('/api/cart', cartRoutes);
app.use("/api/products", productRoutes);
app.use('/api/order', orderRoutes);
app.use('/api/seller', sellerRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/seo', seoRoutes);
app.use('/api/blogs', blogRoutes);

app.get('/', (req, res) => {
  res.send('Welcome to the E-commerce API!');
});

// Centralized Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Server Error'
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
