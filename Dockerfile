FROM ubuntu:16.04
MAINTAINER Joshua Parkin <joshuadparkin@gmail.com>

RUN apt-get update
RUN apt-get install -y python python-pip git build-essential libssl-dev libffi-dev python-dev nginx gunicorn supervisor

# Setup flask application
RUN mkdir -p /app
COPY webapp /app

ENV METAMIX_ENV development

RUN pip install -r /app/webapp/requirements.txt

RUN rm /etc/nginx/sites-enabled/default
COPY metamix-nginx-conf /etc/nginx/sites-available/metamix-nginx-conf
RUN ln -s /etc/nginx/sites-available/metamix-nginx-conf /etc/nginx/sites-enabled/metamix-nginx-conf
RUN /etc/init.d/nginx start

RUN useradd -ms /bin/bash metamix-user
USER metamix-user
WORKDIR /home/metamix-user

RUN supervisorctl reread
RUN supervisorctl update
RUN supervisorctl start metamix

EXPOSE 80