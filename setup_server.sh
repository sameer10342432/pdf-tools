#!/bin/bash
set -e

# Configuration
DOMAIN="pdf-converters.online"
APP_DIR="/var/www/pdf-converter"
NODE_VERSION="20.x"

# 1. Install System Dependencies
echo "Updating system..."
apt-get update && apt-get upgrade -y
apt-get install -y curl build-essential nginx certbot python3-certbot-nginx git unzip

# 2. Install Node.js
echo "Installing Node.js..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
else
    echo "Node.js is already installed."
fi

# 3. Install PM2
echo "Installing PM2..."
npm install -g pm2

# 4. Prepare Application Directory
echo "Preparing application directory..."
mkdir -p "$APP_DIR"

# 5. Extract Artifacts
# Assumes deployment.tar.gz is in /tmp
if [ -f "/tmp/deployment.tar.gz" ]; then
    echo "Extracting files..."
    tar -xzf /tmp/deployment.tar.gz -C "$APP_DIR"
else
    echo "Error: /tmp/deployment.tar.gz not found!"
    exit 1
fi

# 6. Install App Dependencies
echo "Installing app dependencies..."
cd "$APP_DIR"
# Remove devDependencies to save space/time, only install production deps
# Actually, since esbuild externalized things, we need 'dependencies'.
npm install --omit=dev --legacy-peer-deps

# 7. Configure Nginx
echo "Configuring Nginx..."
cat > /etc/nginx/sites-available/$DOMAIN <<EOL
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;

    location / {
        proxy_pass http://localhost:5003;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    }

    # Increase max upload size for PDF tools
    client_max_body_size 100M;
}
EOL

# Enable Site
if [ ! -f /etc/nginx/sites-enabled/$DOMAIN ]; then
    ln -s /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/
    # rm -f /etc/nginx/sites-enabled/default
fi

# Test and Reload Nginx
nginx -t
systemctl reload nginx

# 8. Setup SSL
echo "Setting up SSL..."
# Run certbot to ensure SSL is configured (this fixes the config if we overwrote it)
# --keep-until-expiring prevents hitting rate limits by only renewing when necessary
# --reinstall ensures the nginx config is updated even if certs exist
certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN --redirect --keep-until-expiring

# 9. Start Application with PM2
echo "Starting application with PM2..."
# Stop existing process if any
pm2 delete pdf-tools || true
# Start new process
PORT=5003 NODE_ENV=production pm2 start dist/index.cjs --name pdf-tools
pm2 save
pm2 startup | bash || true

echo "Deployment Complete!"
