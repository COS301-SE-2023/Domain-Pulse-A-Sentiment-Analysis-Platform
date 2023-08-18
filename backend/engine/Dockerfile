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
RUN python -m pip install torch==1.9.1+cpu -f https://download.pytorch.org/whl/cpu/torch_stable.html
RUN pip install --no-cache-dir uwsgi
RUN pip install --no-cache-dir -r requirements.txt


# Start uWSGI with the specified configuration file
CMD ["uwsgi", "--ini", "/code/engine.uwsgi.ini"]

# FROM ubuntu:20.04

# ENV DEBIAN_FRONTEND noninteractive

# RUN apt-get update && apt-get install -y \
#     python3.9 \
#     python3.9-dev \
#     build-essential \
#     libpcre3-dev \
#     && rm -rf /var/lib/apt/lists/*

# # Install Rust and set to nightly
# RUN curl https://sh.rustup.rs -sSf | sh -s -- --default-toolchain nightly -y
# ENV PATH="/root/.cargo/bin:${PATH}"

# SHELL ["/bin/bash", "-c"]

# # Install Cargo and Rust nightly components
# RUN source $HOME/.cargo/env && cargo install cargo-watch
# RUN update-alternatives --install /usr/bin/python python /usr/bin/python3.9 1

# RUN apt-get update -y && apt-get install -y software-properties-common && add-apt-repository ppa:deadsnakes/ppa
# RUN apt-get install && apt-get install -y python3-pip
# RUN apt-get install && apt-get install -y cmake
# # RUN apt-get update && apt-get install -y curl python3.9-distutils python3.9-apt
# # RUN curl https://bootstrap.pypa.io/get-pip.py -o get-pip.py && python get-pip.py

# RUN mkdir /code
# WORKDIR /code
# COPY . /code

# # uwsgi setup
# RUN python -m pip install uwsgi
# # torchvision==0.10.1+cpu torchaudio==0.9.1
# RUN python -m pip install torch==1.9.1+cpu -f https://download.pytorch.org/whl/cpu/torch_stable.html
# RUN python -m pip install -r requirements.txt

# CMD ["uwsgi", "--ini", "/code/engine.uwsgi.ini"]