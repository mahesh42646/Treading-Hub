# xfunding Flow - Funded Trading Platform

A comprehensive funded trading platform built with Next.js, Firebase, and Bootstrap. This project provides a complete MVP similar to FundedNext with user authentication, trading plans, wallet management, and referral systems.

## Features

### 🚀 Core Features
- **User Authentication** - Firebase-based authentication with email/password
- **Trading Plans** - Multiple funding levels with different profit sharing
- **Wallet Management** - Deposit, withdrawal, and transaction tracking
- **Referral System** - Complete referral program with commission tracking
- **User Dashboard** - Profile management and account statistics
- **Payment Integration** - Razorpay payment gateway integration

### 📱 Pages & Components
- Landing page with hero section and plan comparison
- User authentication (Login, Register, Forgot Password)
- User dashboard with sidebar navigation
- Profile management
- Wallet with transaction history
- Referral program management
- About, Contact, Terms & Conditions, Privacy Policy pages

### 🎨 Design & UI
- Modern, responsive design using Bootstrap 5
- Custom CSS with animations and hover effects
- Mobile-friendly interface
- Professional trading platform aesthetics

## Tech Stack

- **Frontend**: Next.js 15, React 19
- **Styling**: Bootstrap 5, Custom CSS
- **Authentication**: Firebase Authentication
- **Database**: Firebase Firestore
- **Payment**: Razorpay
- **Icons**: Bootstrap Icons
- **Deployment**: Vercel (recommended)

## Project Structure

```
treading-hub/
├── src/
│   ├── app/
│   │   ├── (routes)/           # Route groups
│   │   │   ├── about/
│   │   │   ├── contact/
│   │   │   ├── terms/
│   │   │   ├── privacy/
│   │   │   ├── plans/
│   │   │   ├── profile/
│   │   │   ├── wallet/
│   │   │   └── referral/
│   │   ├── user/
│   │   │   ├── components/     # User components
│   │   │   │   ├── Header.js
│   │   │   │   ├── Footer.js
│   │   │   │   └── Sidebar.js
│   │   │   └── auth/          # Authentication
│   │   │       ├── firebase.js
│   │   │       ├── Login.js
│   │   │       ├── Register.js
│   │   │       └── ForgotPassword.js
│   │   ├── admin/             # Admin components
│   │   ├── contexts/          # React contexts
│   │   ├── services/          # API services
│   │   ├── styles/            # Custom styles
│   │   ├── layout.js
│   │   └── page.js
│   ├── public/                # Static assets
│   └── package.json
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Firebase project
- Razorpay account

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd treading-hub
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   # Firebase Configuration
   NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX

   # Razorpay Configuration
   NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_your_key_id
   RAZORPAY_KEY_SECRET=your_razorpay_secret_key

   # App Configuration
   NEXT_PUBLIC_APP_NAME=xfunding Flow
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. **Set up Firebase**
   
   - Create a new Firebase project
   - Enable Authentication (Email/Password)
   - Create a Firestore database
   - Get your Firebase configuration from Project Settings

5. **Set up Razorpay**
   
   - Create a Razorpay account
   - Get your API keys from the dashboard
   - Update the environment variables

6. **Run the development server**
```bash
npm run dev
   ```

7. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## Configuration

### Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Authentication with Email/Password provider
4. Create a Firestore database
5. Get your configuration from Project Settings > General > Your apps

### Razorpay Setup

1. Sign up at [Razorpay](https://razorpay.com/)
2. Get your API keys from the dashboard
3. Use test keys for development
4. Configure webhook endpoints for production

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- AWS Amplify
- DigitalOcean App Platform
- Railway

## Customization

### Branding

1. Update the company name in components
2. Replace logo and images in `/public`
3. Modify color scheme in `src/app/styles/user.css`
4. Update contact information

### Features

1. **Add new trading plans**: Modify the plans array in `/plans/page.js`
2. **Customize referral rates**: Update commission calculations in `/referral/page.js`
3. **Add new payment methods**: Extend the payment integration
4. **Modify trading rules**: Update evaluation criteria

## API Routes

The project is structured to easily add API routes in the `src/app/api/` directory for:
- User management
- Payment processing
- Trading data
- Referral tracking

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, email support@xfundingflow.com or create an issue in the repository.

## Roadmap

- [ ] Admin dashboard
- [ ] Advanced trading analytics
- [ ] Mobile app
- [ ] Multi-language support
- [ ] Advanced payment methods
- [ ] Trading education modules
- [ ] Social trading features

---

**Note**: This is a demo/MVP project. For production use, ensure proper security measures, compliance with financial regulations, and thorough testing.
