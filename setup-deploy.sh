#!/bin/bash

echo "🚀 Setting up automated deployment for Xfunding Flow..."

# Install PM2 globally if not installed
if ! command -v pm2 &> /dev/null; then
    echo "📦 Installing PM2..."
    npm install -g pm2
fi

# Install express for webhook server
echo "📦 Installing webhook dependencies..."
npm install express

# Make webhook server executable
chmod +x webhook-server.js

# Create PM2 ecosystem for webhook
cat > webhook-ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'trading-hub-webhook',
    script: 'webhook-server.js',
    cwd: '/var/www/Ubuntu/Treading-Hub',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production'
    }
  }]
};
EOF

# Start webhook server with PM2
echo "🔄 Starting webhook server..."
pm2 start webhook-ecosystem.config.js
pm2 save

echo "✅ Setup complete!"
echo ""
echo "📡 Webhook URL: http://your-server-ip:3009/deploy"
echo "🔍 Check status: pm2 status"
echo "📋 View logs: pm2 logs trading-hub-webhook"
echo ""
echo "🎯 To test deployment:"
echo "curl -X POST http://localhost:3009/deploy"
