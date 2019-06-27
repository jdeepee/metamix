FROM ubuntu:18.04
MAINTAINER Joshua Parkin <joshuadparkin@gmail.com>

RUN apt-get update
RUN apt-get install -y python python-pip python-virtualenv nginx gunicorn supervisor

# Setup flask application
RUN mkdir -p /app
COPY metamix /app
COPY run_app.py /app
COPY __init__.py /app
COPY manage.py /app
COPY run_app.py /app
RUN pip install -r /app/metamix/requirements.txt

# Setup nginx
RUN rm /etc/nginx/sites-enabled/default
COPY /app/metamix/deployment/flask.conf /etc/nginx/sites-available/
RUN ln -s /etc/nginx/sites-available/flask.conf /etc/nginx/sites-enabled/flask.conf
RUN echo "daemon off;" >> /etc/nginx/nginx.conf

# Setup supervisord
RUN mkdir -p /var/log/supervisor
COPY /app/metamix/deployment/supervisord.conf /etc/supervisor/conf.d/supervisord.conf
COPY /app/metamix/deployment/gunicorn.conf /etc/supervisor/conf.d/gunicorn.conf

# Start processes
CMD ["/usr/bin/supervisord"]