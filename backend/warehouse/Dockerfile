FROM python:3.8-alpine

#Copy project files
RUN mkdir /code
WORKDIR /code
COPY . /code

# uwsgi setup
RUN apk add python3-dev build-base linux-headers pcre-dev
RUN pip install uwsgi
RUN pip install --no-cache-dir -r requirements.txt

RUN python manage.py collectstatic --noinput

CMD ["uwsgi", "--ini", "/code/warehouse.uwsgi.ini"]