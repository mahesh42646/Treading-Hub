#!/bin/bash

echo "🚀 Starting Trading Hub Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    print_error "PM2 is not installed. Installing PM2..."
    npm install -g pm2
fi

# Create logs directory
mkdir -p logs

# Install dependencies
print_status "Installing dependencies..."
npm install

# Build the frontend
print_status "Building frontend..."
npm run build

# Stop existing PM2 processes if running
print_status "Stopping existing PM2 processes..."
pm2 stop trading-hub-backend trading-hub-frontend 2>/dev/null || true
pm2 delete trading-hub-backend trading-hub-frontend 2>/dev/null || true

# Start the applications with PM2
print_status "Starting applications with PM2..."
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
print_status "Saving PM2 configuration..."
pm2 save

# Setup PM2 to start on boot
print_status "Setting up PM2 startup script..."
pm2 startup

print_status "Deployment completed successfully!"
print_status "Frontend: http://localhost:3003"
print_status "Backend: http://localhost:3002"
print_status "Domain: https://0fare.com"

# Show PM2 status
echo ""
print_status "PM2 Status:"
pm2 status
