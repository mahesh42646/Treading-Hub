#!/bin/bash

echo "🚀 Starting Xfunding Flow Database Seeding..."

# Navigate to backend directory
cd backend

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️  Warning: .env file not found. Creating a basic one..."
    cat > .env << EOF
MONGODB_URI=mongodb://localhost:27017/trading-hub
NODE_ENV=development
PORT=9988
EOF
    echo "✅ Created .env file with default settings"
fi

# Run the seed script
echo "🌱 Running database seed script..."
node seed-data.js

echo "✅ Database seeding completed!"
echo ""
echo "📊 Summary of seeded data:"
echo "   • 5 users with complete profiles"
echo "   • 5 blog articles"
echo "   • 5 team members"
echo "   • 5 contact inquiries"
echo "   • 8 FAQs"
echo "   • 5 news articles"
echo "   • 4 subscription plans"
echo ""
echo "🎯 You can now:"
echo "   • Access admin dashboard to view all data"
echo "   • View user-side pages with populated content"
echo "   • Test all features with realistic data"
