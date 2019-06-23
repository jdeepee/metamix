FROM ubuntu
MAINTAINER Joshua Parkin <joshuadparkin@gmail.com>

RUN apt-get update
RUN apt-get install -y python python-pip

# Setup flask application
RUN mkdir -p /app
COPY metamix /app
COPY run_app.py /app
COPY __init__.py /app
COPY manage.py /app
COPY run_app.py /app
COPY requirements.txt /app

ENV METAMIX_ENV development

RUN pip install -r /app/requirements.txt
EXPOSE 5000


