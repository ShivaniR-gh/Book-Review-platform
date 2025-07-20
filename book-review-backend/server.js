const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');
require('dotenv').config();

const app  = express();                 
const PORT = process.env.PORT || 5000;

/* ---------- Global Middleware ---------- */
app.use(cors());
app.use(express.json());

/* ---------- API Routes ---------- */
app.use('/api/books',   require('./routes/bookRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/users',   require('./routes/userRoutes'));

/* ---------- Health Check ---------- */
app.get('/', (req, res) => {
  res.send('📚 Book Review Backend Running');
});

/* ---------- Global Error Handler ---------- */
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.statusCode || 500).json({ message: err.message || 'Server error' });
});

/* ---------- Connect to MongoDB & Start Server ---------- */
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch(err => console.error('❌ MongoDB connection error:', err));
