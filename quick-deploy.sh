#!/bin/bash

echo "🚀 Quick deployment script for Trading Hub..."

# Change to project directory
cd /var/www/Ubuntu/Treading-Hub

echo "📥 Pulling latest changes..."
git pull

if [ $? -eq 0 ]; then
    echo "✅ Git pull successful"
    
    echo "🔨 Building application..."
    npm run build
    
    if [ $? -eq 0 ]; then
        echo "✅ Build successful"
        
        echo "🔄 Restarting PM2 processes..."
        pm2 restart all
        
        echo "🌐 Reloading Nginx..."
        sudo systemctl reload nginx
        
        echo "✅ Deployment completed successfully!"
    else
        echo "❌ Build failed"
        exit 1
    fi
else
    echo "❌ Git pull failed"
    exit 1
fi
