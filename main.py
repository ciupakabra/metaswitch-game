from flask import Flask, render_template, request, redirect, url_for, Response
import sqlite3
import populate
import MySQLdb
import json
import os.path
from time import strftime

# Database type
#dbType = 'local' # use a local sqlite database
dbType = 'remote' # use a remote database, specify credentials below

# Remote DB Config (if appropriate)
dbHost = '127.0.0.1'
dbName = 'ms_game_scores'
dbUsername = 'root'
dbPassword = ''

# app is an instance of the Flask class
application = Flask(__name__, static_folder=".", static_url_path="")

@application.after_request
def request_no_caching(r):
    r.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
    r.headers['Pragma'] = 'no-cache'
    r.headers["Expires"] = "0"
    return r

@application.route("/")
def home():
        return render_template("index.html")



@application.route("/submit",methods=["GET","POST"])
def submit():

    if dbType=='local':
        if not os.path.isfile("users.db"):
            conn = sqlite3.connect("users.db")
            populate.setup(conn)
    try:
        conn = sqlite3.connect("users.db") if dbType=='local' else MySQLdb.connect(dbHost,dbUsername,dbPassword,dbName)
    except Exception as e:
        print e
    if dbType=='remote':
        populate.setup(conn)
    c = conn.cursor()
    print(request)
    if request.method == "POST":
        try:
            data = request.get_json(force=True);
            first = request.json.get("first")
            last = request.json.get("last")
            email = request.json.get("email")
            score = request.json.get("score")
            elapsed = request.json.get("elapsed")
        except:
            first = request.form["first"]
            last = request.form["last"]
            email = request.form["email"]
            score = request.form["score"]
            elapsed = request.form["elapsed"]

        clock = strftime("%I:%M:%S %m/%d/%Y")
        populate.insert_score(conn, first,last,email,score, elapsed, clock)

        return render_template("highscores.html")
    else:
        return render_template("submit.html")

if __name__=="__main__":
    # set the instance variable debug to True
    application.debug = True
    # call the run method
    application.run(host='0.0.0.0', port='80')
