#!/bin/bash
# Deploy Ariel Admin Dashboard to Lightsail
# Usage: ./deploy-to-server.sh

SERVER_IP="3.223.102.157"
SERVER_USER="ubuntu"
PEM_KEY="$HOME/Downloads/ariel-production.pem"

echo "🚀 Deploying Ariel Admin Dashboard to Lightsail..."

# Check if build exists
if [ ! -d "dist" ]; then
    echo "❌ dist/ folder not found. Run 'npm run build' first."
    exit 1
fi

# Check if PEM key exists
if [ ! -f "$PEM_KEY" ]; then
    echo "❌ PEM key not found at $PEM_KEY"
    echo "Please update PEM_KEY variable in this script with the correct path."
    exit 1
fi

# Create directory on server
echo "📁 Creating directory on server..."
ssh -i "$PEM_KEY" $SERVER_USER@$SERVER_IP "sudo mkdir -p /var/www/ariel-admin && sudo chown ubuntu:ubuntu /var/www/ariel-admin"

# Upload dist files
echo "📤 Uploading files..."
scp -i "$PEM_KEY" -r dist/* $SERVER_USER@$SERVER_IP:/var/www/ariel-admin/

# Configure Nginx
echo "⚙️  Configuring Nginx..."
ssh -i "$PEM_KEY" $SERVER_USER@$SERVER_IP << 'EOF'
sudo tee /etc/nginx/sites-available/ariel-admin > /dev/null << 'NGINX_CONFIG'
# Ariel Admin Dashboard
location /admin {
    alias /var/www/ariel-admin;
    index index.html;
    try_files $uri $uri/ /admin/index.html;

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
NGINX_CONFIG

# Test nginx configuration
sudo nginx -t

# Reload nginx if test passes
if [ $? -eq 0 ]; then
    sudo systemctl reload nginx
    echo "✅ Nginx reloaded successfully"
else
    echo "❌ Nginx configuration test failed"
    exit 1
fi
EOF

echo ""
echo "✅ Deployment complete!"
echo ""
echo "Admin Dashboard URL: http://$SERVER_IP/admin"
echo ""
echo "Login with:"
echo "  Username: admin"
echo "  Password: ariel2024"
echo ""
