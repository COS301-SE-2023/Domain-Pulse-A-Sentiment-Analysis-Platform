#!/bin/sh

# Check if NGINX_CONF is set; if not, use the default
if [ -z "$NGINX_CONF" ]; then
  NGINX_CONF="dev-domainpulse.app.conf"
fi

# Create a symlink to the selected configuration file
ln -sf /etc/nginx/sites-available/$NGINX_CONF /etc/nginx/sites-enabled/domainpulse.app.conf

# Start Nginx
exec nginx -g "daemon off;"