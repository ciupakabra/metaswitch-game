## Group project practical. Group 1

### Team ###

Andrius Ovsianas

Ethan Martin

Jack Arthur

Joseph Gardiner

Justin Strauss

Jan Mirkiewicz


### Project H: Finding Technical Talent

A software telecoms company are looking for ways to attract and identify new technical talent. They’re looking for some kind of game or puzzle that will run in a web browser, with two underlying goals of 
- get lots of students interested in and applying to the company 
- automatically flagging any particularly good looking candidates to the company to fast-track to interview. 

The company has some ideas for puzzles and games that might work, but are open to ideas and suggestions from the consultants (you!) – they’re really looking for something with wow factor. There’s no restriction on the set of languages/packages/back-end that you use. [Project in collaboration with Metaswitch]


### Launching the web

There are a couple of ways to launch the server. 

One is to use docker to create an image and run it in a container. The Dockerfile is provided and tested, so that simply needs building and running. The port used is 80.

The other is to load the python server (Flask) manually:

Create a virtual environment and install libraries (assuming python2 is installed) and run the server:
```
virtualenv -p python2 flask-env
source activate flask-env/bin/activate
pip install -r requirements.txt
python main.py
```

### Workflow for development

The code is contained in *src*. However the files are uglified and minified to several files in *build*. We use grunt.js, to do that (nodejs required):

`grunt` starts a process which watches all the files in *src* and uglifies/minifies them whenever they're changed

`grunt uglify` uglifies the files in *src*
