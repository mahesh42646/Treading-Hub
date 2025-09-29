# 🚀 Xfunding Flow Deployment Guide

## Prerequisites

- VPS with Ubuntu/Debian
- Node.js 18+ installed
- Nginx installed
- PM2 installed globally (`npm install -g pm2`)
- Domain: `xfundingflow.com` (already configured)

## 📋 Deployment Steps

### 1. **Prepare Your VPS**

```bash
# Connect to your VPS
ssh root@your-vps-ip

# Create project directory
mkdir -p /var/www/trading-hub
cd /var/www/trading-hub

# Clone your project (or upload files)
git clone your-repository-url .
# OR upload files via SFTP/SCP
```

### 2. **Install Dependencies**

```bash
# Install Node.js dependencies
npm install

# Install PM2 globally if not installed
npm install -g pm2
```

### 3. **Configure Environment**

```bash
# Copy production environment files
cp .env.production .env.local
cp backend/.env.production backend/.env

# Edit environment files with your actual values
nano .env.local
nano backend/.env
```

### 4. **Build the Application**

```bash
# Build the frontend
npm run build

# Make deploy script executable
chmod +x deploy.sh
```

### 5. **Configure Nginx**

```bash
# Copy Nginx configuration
sudo cp nginx-trading-hub.conf /etc/nginx/sites-available/trading-hub

# Create symbolic link
sudo ln -s /etc/nginx/sites-available/trading-hub /etc/nginx/sites-enabled/

# Test Nginx configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

### 6. **Setup SSL Certificate**

```bash
# Install Certbot (Let's Encrypt)
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d xfundingflow.com -d www.xfundingflow.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### 7. **Deploy with PM2**

```bash
# Run deployment script
./deploy.sh

# Or manually:
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

### 8. **Verify Deployment**

```bash
# Check PM2 status
pm2 status

# Check logs
pm2 logs

# Test endpoints
curl http://localhost:3003
curl http://localhost:3002/api/admin/dashboard
```

## 🔧 Port Configuration

- **Frontend (Next.js)**: Port 3003
- **Backend (Express)**: Port 3002
- **Domain**: xfundingflow.com
- **API**: xfundingflow.com/api

## 📁 File Structure

```
/var/www/trading-hub/
├── src/                    # Frontend source
├── backend/               # Backend source
├── logs/                  # PM2 logs
├── ecosystem.config.js    # PM2 configuration
├── nginx-trading-hub.conf # Nginx configuration
├── deploy.sh             # Deployment script
└── .env.production       # Production environment
```

## 🛠️ Management Commands

```bash
# Start applications
npm run pm2:start

# Stop applications
npm run pm2:stop

# Restart applications
npm run pm2:restart

# View logs
npm run pm2:logs

# Check status
npm run pm2:status

# Full deployment
npm run deploy
```

## 🔍 Troubleshooting

### Check if ports are in use:
```bash
sudo netstat -tlnp | grep :3002
sudo netstat -tlnp | grep :3003
```

### Check Nginx status:
```bash
sudo systemctl status nginx
sudo nginx -t
```

### Check PM2 logs:
```bash
pm2 logs trading-hub-backend
pm2 logs trading-hub-frontend
```

### Restart everything:
```bash
sudo systemctl restart nginx
pm2 restart all
```

## 🔒 Security Notes

1. **Change default admin credentials** in production
2. **Use strong JWT secrets**
3. **Enable firewall** (UFW)
4. **Regular security updates**
5. **Monitor logs** for suspicious activity

## 📊 Monitoring

```bash
# Monitor system resources
htop

# Monitor PM2 processes
pm2 monit

# Check disk space
df -h

# Check memory usage
free -h
```

## 🔄 Updates

```bash
# Pull latest changes
git pull origin main

# Install dependencies
npm install

# Build frontend
npm run build

# Restart applications
pm2 restart all
```

## 📞 Support

If you encounter issues:
1. Check PM2 logs: `pm2 logs`
2. Check Nginx logs: `sudo tail -f /var/log/nginx/error.log`
3. Verify environment variables
4. Check port availability


ssh root@195.35.21.101
