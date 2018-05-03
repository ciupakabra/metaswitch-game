FROM tiangolo/uwsgi-nginx:python2.7

COPY ./assets/ /app/assets/
COPY ./build/ /app/build/
COPY ./static/ /app/static/
COPY ./templates/ /app/templates/
COPY ./libs/ /app/libs/
COPY ./main.py /app/
COPY ./populate.py /app/
COPY ./requirements.txt /app/

RUN pip install -r requirements.txt
