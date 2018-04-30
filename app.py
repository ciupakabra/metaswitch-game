from flask import Flask, render_template, request, redirect, url_for, Response
import sqlite3
import populate
import json
import os.path
from time import strftime

# app is an instance of the Flask class
app = Flask(__name__, static_folder=".", static_url_path="")

@app.after_request
def request_no_caching(r):
    r.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
    r.headers['Pragma'] = 'no-cache'
    r.headers["Expires"] = "0"
    return r

@app.route("/")
def home():
        return render_template("index.html")

@app.route("/submit",methods=["GET","POST"])
#@app.route("/<title>",methods=["GET","POST"])
def submit():
    if not os.path.isfile("users.db"):
        populate.setup()
    #run populate.py only if users.db is not present
    conn = sqlite3.connect("users.db")
    c = conn.cursor()
    # if title==None:
    #     error = False;
    print(request)
    if request.method == "POST":
        try:
            data = request.get_json(force=True);
            first = request.json.get("first")
            last = request.json.get("last")
            email = request.json.get("email")
        except:
            first = request.form["first"]
            last = request.form["last"]
            email = request.form["email"]
        #q = '''SELECT MAX(id) FROM users'''
        #maxID = c.execute(q).next()[0] #gets maxID in ID column to assign
                                       #a new unique ID
        #q = '''SELECT title FROM users'''
        #titleCheck = c.execute(q)
        #titleCheck = [w[0] for w in titleCheck]
        #if not (len(t) == 0 or len(a) == 0 or len(e) == 0):
        #    if t in titleCheck:
        #        error = True
        #    else:
        score = 100
        clock = strftime("%I:%M:%S %m/%d/%Y")
        populate.insert_score(first,last,email,score,clock)

        q = '''SELECT first,last,email,score,clock FROM users'''
        users = c.execute(q)

        # q = "SELECT title FROM users"
        # result = c.execute(q)
        # result = [o for o in result][::-1]
        return render_template("highscores.html",users=users)#,titles=result,haserror=error)
    else:
        # #get user whose title matches the url
        # t = title.replace("_"," ")
        # q = '''SELECT title,name,entry,id,time FROM users
        # WHERE title = "%s"''' % t
        # result = c.execute(q)
        # try:
        #     r = result.next()
        # except StopIteration:
        #     return redirect(url_for('home'))
        #
        # if request.method == "POST":
        #     n = request.form["name"]
        #     e = request.form["comment"]
        #     if not (len(n) == 0 or len(e) == 0):
        #         populate.insert_comment(n,e,r[3])
        #
        # #find all comments whose id corresponds to that of the user
        # q = '''SELECT name,comment FROM comments
        #        WHERE id = %s''' % r[3]
        # comments = c.execute(q)

        return render_template("submit.html")#,text=r,comments=comments, c=c)

# @app.route("/about")
# def about():
#         return render_template("about.html")
#
# @app.route("/all")
# def all():
#     conn = sqlite3.connect("users.db")
#     c = conn.cursor()
#     q = '''SELECT title, name, entry,id FROM users'''
#     posts = c.execute(q)
#
#     b = conn.cursor()
#     q = '''SELECT name, comment,id FROM comments'''
#     comments = b.execute(q)
#     comments = [[a[0],a[1],a[2]] for a in comments]
#
#     return render_template("all.html",posts=posts, comments=comments)

if __name__=="__main__":
    # set the instance variable debug to True
    app.debug = True
    # call the run method
    app.run()
