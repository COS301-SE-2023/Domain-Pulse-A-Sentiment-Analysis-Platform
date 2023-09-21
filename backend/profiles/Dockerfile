# Use an official Python runtime as a parent image
FROM python:3.8-slim

# Set environment variables for Django
ENV PYTHONUNBUFFERED 1
ENV DJANGO_SETTINGS_MODULE profiles.settings

# Copy the project files into the container
RUN mkdir /code
WORKDIR /code
COPY . /code

# Install system dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    gcc \
    libc-dev \
    wkhtmltopdf\
    && rm -rf /var/lib/apt/lists/*

# Install required Python packages
RUN pip install --no-cache-dir uwsgi
RUN pip install --no-cache-dir -r requirements.txt

CMD ["uwsgi", "--ini", "/code/profiles.uwsgi.ini"]