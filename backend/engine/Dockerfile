# Use an official Python runtime as a parent image
FROM python:3.8-slim

# Set environment variables for Django
ENV PYTHONUNBUFFERED 1
ENV DJANGO_SETTINGS_MODULE engine.settings

# Copy the project files into the container
RUN mkdir /code
WORKDIR /code
COPY . /code

# Install system dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    gcc \
    libc-dev \
    && rm -rf /var/lib/apt/lists/*

# Install required Python packages
# RUN python -m pip install torch==1.9.1+cpu torchvision==0.10.1+cpu -f https://download.pytorch.org/whl/cpu/torch_stable.html
RUN pip install --no-cache-dir uwsgi
RUN pip install --no-cache-dir -r requirements.txt

#install the huggingface models to the docker image
RUN python /code/processor/nn_models.py

#install the nltk data to the docker image
RUN python -c "import nltk; nltk.download('punkt'); nltk.download('stopwords'); nltk.download('wordnet')"

# Start uWSGI with the specified configuration file
CMD ["uwsgi", "--ini", "/code/engine.uwsgi.ini"]