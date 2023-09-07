FROM nginx:latest

#copy static files
COPY ./frontend/dist/domain-pulse /usr/share/nginx/html

#copy nginx conf files
COPY ./nginx/nginx.conf /etc/nginx/nginx.conf
COPY ./nginx/domainpulse.app.conf /etc/nginx/sites-available/domainpulse.app.conf

RUN mkdir /etc/nginx/sites-enabled
RUN ln -s /etc/nginx/sites-available/domainpulse.app.conf /etc/nginx/sites-enabled/

CMD ["nginx", "-g", "daemon off;"]