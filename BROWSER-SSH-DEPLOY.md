# Deploy Admin Dashboard via Browser SSH

Since direct SSH upload isn't working, follow these steps in your **Lightsail browser SSH terminal**:

## Step 1: Create Directory and Download Files

```bash
# Create directory
sudo mkdir -p /var/www/ariel-admin
sudo chown ubuntu:ubuntu /var/www/ariel-admin
cd /var/www/ariel-admin

# Download the built admin dashboard from your local machine
# We'll use a different method - clone from GitHub or create files directly
```

## Step 2: Get Your Local IP Address

On your Mac, open a new terminal and run:

```bash
ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -1
```

This will show your local IP (e.g., 192.168.1.100)

## Step 3: Start Local File Server

On your Mac, in the ariel-admin directory:

```bash
cd /Users/harrymora/Apps/ariel-admin
python3 -m http.server 8080
```

## Step 4: Download from Server

Back in your Lightsail browser SSH, run (replace YOUR_LOCAL_IP):

```bash
cd /var/www/ariel-admin
wget http://YOUR_LOCAL_IP:8080/ariel-admin-dist.tar.gz
tar -xzf ariel-admin-dist.tar.gz
rm ariel-admin-dist.tar.gz
ls -la
```

You should see: index.html, assets/

## Step 5: Configure Nginx

```bash
sudo nano /etc/nginx/sites-available/default
```

Add this location block INSIDE the existing `server` block (after the existing location blocks):

```nginx
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
```

Save with `Ctrl+X`, then `Y`, then `Enter`.

## Step 6: Test and Reload Nginx

```bash
# Test configuration
sudo nginx -t

# If test passes, reload nginx
sudo systemctl reload nginx

# Check nginx status
sudo systemctl status nginx
```

## Step 7: Update Backend CORS

```bash
cd /var/www/ariel
nano .env
```

Find the `ALLOWED_ORIGINS` line and update it to:

```
ALLOWED_ORIGINS=https://helloariel.ai,https://www.helloariel.ai
```

Save the file, then restart the backend:

```bash
sudo systemctl restart ariel
sudo systemctl status ariel
```

## Step 8: Test It!

Open in your browser:
```
https://helloariel.ai/admin
```

Login with:
- **Username**: admin
- **Password**: ariel2024

---

## Alternative: Direct File Creation (if wget doesn't work)

If you can't download from your local machine, we can upload the files to a temporary hosting service or GitHub and download from there.
