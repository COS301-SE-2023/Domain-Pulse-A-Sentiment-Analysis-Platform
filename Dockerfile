FROM nginx:latest

#copy static files
COPY ./frontend/dist/domain-pulse /usr/share/nginx/html

#copy nginx conf files
COPY ./nginx/nginx.conf /etc/nginx/nginx.conf
COPY ./nginx/domainpulse.app.conf /etc/nginx/sites-available/domainpulse.app.conf
COPY ./nginx/dev-domainpulse.app.conf /etc/nginx/sites-available/dev-domainpulse.app.conf
COPY ./nginx/prod-domainpulse.app.conf /etc/nginx/sites-available/prod-domainpulse.app.conf

RUN mkdir /etc/nginx/sites-enabled
# Create symbolic links to both configuration files (by default, link to dev)
RUN ln -s /etc/nginx/sites-available/dev-domainpulse.app.conf /etc/nginx/sites-enabled/domainpulse.app.conf

# Copy the entry point script
COPY ./nginx/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT [ "/entrypoint.sh" ]