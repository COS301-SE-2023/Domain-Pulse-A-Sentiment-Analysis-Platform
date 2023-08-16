FROM nginx:latest

COPY nginx.conf /etc/nginx/nginx.conf
COPY domainpulse.app.conf /etc/nginx/sites-available/domainpulse.app.conf

RUN mkdir /etc/nginx/sites-enabled
RUN ln -s /etc/nginx/sites-available/domainpulse.app.conf /etc/nginx/sites-enabled/

CMD ["nginx", "-g", "daemon off;"]