require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');

const authRoutes = require('./routes/authRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const webhookRoutes = require('./routes/webhookRoutes');
const disputeRoutes = require('./routes/disputeRoutes');
const adminRoutes = require('./routes/adminRoutes');
const storageRoutes = require('./routes/storageRoutes');
const propertyRoutes = require('./routes/propertyRoutes');
const roomRoutes = require('./routes/roomRoutes');
const onboardingRoutes = require('./routes/onboardingRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const leaseRoutes = require('./routes/leaseRoutes');
const maintenanceRoutes = require('./routes/maintenanceRoutes');
const rentRollRoutes = require('./routes/rentRollRoutes');
const errorHandler = require('./middleware/error.middleware');
const socket = require('./socket');

const app = express();
const server = http.createServer(app);

// Initialize Socket.io
const io = socket.init(server);

const path = require('path');

app.use(cors());
app.use(express.json());

// Serve static files for uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/webhooks', webhookRoutes);
app.use('/api/disputes', disputeRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/storage', storageRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/onboarding', onboardingRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/leases', leaseRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/rent-roll', rentRollRoutes);

// Socket.io connection handling
io.on('connection', (client) => {
  console.log('Client connected:', client.id);
  
  client.on('disconnect', () => {
    console.log('Client disconnected:', client.id);
  });
});

// Global Error Handling Middleware (Must be the last app.use)
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
let serverInstance;
if (require.main === module) {
  serverInstance = server.listen(PORT, () => {
    console.log(`Fiebnb API running on port ${PORT}`);
  });
}

process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! 💥 Shutting down...');
  console.error(err.name, err.message);
  
  if (serverInstance) {
    serverInstance.close(() => {
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});

module.exports = { app, server };
