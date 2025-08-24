# Trading Hub Backend

A scalable Node.js backend API for the Trading Hub platform built with Express and MongoDB.

## Features

- 🔐 Firebase Authentication Integration
- 👤 Two-step user registration (Account + Profile)
- 📸 File upload for PAN card verification
- 🔗 Referral system with unique codes
- 💰 Wallet and trading statistics
- 🛡️ Secure API endpoints
- 📊 MongoDB database with Mongoose ODM

## API Endpoints

### User Management
- `POST /api/users/create` - Create user account (step 1)
- `GET /api/users/profile/:uid` - Get user profile
- `POST /api/users/profile-setup` - Create user profile (step 2)
- `PUT /api/users/profile/:uid` - Update user profile

### Referral System
- `GET /api/users/referral/:code` - Get user by referral code
- `POST /api/users/referral/:uid` - Add referral to user

### Admin (Future)
- `GET /api/users/all` - Get all users (admin only)
- `DELETE /api/users/:uid` - Delete user (admin only)

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   - Copy `.env.example` to `.env`
   - Update the following variables:
     ```env
     PORT=9988
     MONGODB_URI=mongodb://localhost:27017/tradinghub
     NODE_ENV=development
     JWT_SECRET=your-super-secret-jwt-key-here
     ```

4. **Start MongoDB**
   - Local: `mongod`
   - Or use MongoDB Atlas cloud service

5. **Run the server**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

The server will start on `http://localhost:9988`

## Database Schema

### User Collection
```javascript
{
  uid: String (Firebase UID),
  email: String,
  emailVerified: Boolean,
  status: String (active/inactive/suspended),
  role: String (user/admin/moderator),
  createdAt: Date,
  updatedAt: Date
}
```

### Profile Collection
```javascript
{
  userId: ObjectId (ref: User),
  firstName: String,
  lastName: String,
  gender: String (male/female/other),
  dateOfBirth: Date,
  country: String,
  city: String,
  phone: String,
  panCardNumber: String,
  panCardImage: String (filename),
  referralCode: String (10 chars, unique),
  referredBy: String,
  referrals: [String],
  wallet: {
    balance: Number,
    currency: String
  },
  tradingStats: {
    totalTrades: Number,
    winningTrades: Number,
    totalProfit: Number,
    winRate: Number
  }
}
```

## File Upload

- Supported formats: Images (JPEG, PNG, GIF, etc.)
- Maximum file size: 5MB
- Upload directory: `./uploads/`
- Files are stored with unique names to prevent conflicts

## Security Features

- CORS enabled for frontend integration
- File type validation for uploads
- File size limits
- Input validation and sanitization
- Error handling middleware
- Environment-based error messages

## Scalability

The backend is designed to be scalable:
- Modular route structure
- Separate schema definitions
- Easy to add new routes and models
- Environment-based configuration
- Middleware-based architecture

## Future Enhancements

- JWT authentication for API protection
- Rate limiting
- Request logging
- Email verification system
- Admin dashboard APIs
- Trading history and analytics
- Payment integration
- Real-time notifications

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check connection string in `.env`
   - Verify network connectivity

2. **Port Already in Use**
   - Change PORT in `.env`
   - Kill existing process: `lsof -ti:9988 | xargs kill -9`

3. **File Upload Errors**
   - Check uploads directory permissions
   - Verify file size and type
   - Ensure disk space is available

### Logs
- Server logs are printed to console
- Error logs include stack traces in development
- Production logs are sanitized for security

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

ISC License
