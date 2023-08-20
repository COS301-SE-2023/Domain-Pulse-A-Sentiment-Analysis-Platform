FROM python:3.8-alpine

#copy project code
RUN mkdir /code
WORKDIR /code
COPY . /code

# uwsgi setup
RUN apk add python3-dev build-base linux-headers pcre-dev
RUN pip install uwsgi
RUN pip install --no-cache-dir -r requirements-lock.txt


CMD ["uwsgi", "--ini", "/code/domains.uwsgi.ini"]