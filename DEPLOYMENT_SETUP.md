# 🚀 Automated Deployment Setup

## Quick Setup (3 steps)

### 1. On Your Server (VPS)

```bash
# Navigate to your project
cd /var/www/Ubuntu/Xfunding-Flow

# Make scripts executable
chmod +x setup-deploy.sh deploy-now.sh webhook-server.js

# Run setup
./setup-deploy.sh
```

### 2. Test the Webhook

```bash
# Test deployment
curl -X POST http://localhost:3009/deploy

# Check if webhook is running
pm2 status
```

### 3. Configure GitHub (Optional)

Add these secrets to your GitHub repository:
- `HOST`: Your server IP
- `USERNAME`: Your server username (root)
- `SSH_KEY`: Your private SSH key

## Manual Deployment

```bash
# Quick manual deployment
./deploy-now.sh
```

## How It Works

1. **Webhook Server**: Runs on port 3009
2. **Automatic**: When you push to GitHub, it triggers deployment
3. **Manual**: You can also trigger deployment manually
4. **Safe**: Only pulls, builds, and restarts if git pull succeeds

## Commands

```bash
# Check webhook status
pm2 status

# View webhook logs
pm2 logs trading-hub-webhook

# Restart webhook
pm2 restart trading-hub-webhook

# Manual deployment
./deploy-now.sh
```

## Ports Used

- **3000**: Your main app
- **3001**: Another service
- **3002**: Xfunding Flow (your project)
- **3009**: Webhook server (new)

## Troubleshooting

If deployment fails:
1. Check logs: `pm2 logs trading-hub-webhook`
2. Test manually: `./deploy-now.sh`
3. Check permissions: `ls -la deploy-now.sh`
