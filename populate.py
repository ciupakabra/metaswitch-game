import csv, sqlite3

def setup():
    #run populate.py only if users.db is not present
    conn = sqlite3.connect("users.db")
    c = conn.cursor()

    c.execute("CREATE TABLE users (first TEXT, last TEXT, email TEXT, score INTEGER, clock TEXT)")

    conn.commit()

#    c.execute("CREATE TABLE comments (name TEXT, comment TEXT, id INTEGER)")

    base = '''INSERT INTO users VALUES("%(first)s","%(last)s","%(email)s",%(score)s,"%(clock)s")'''
    for a in csv.DictReader(open("users.csv")):
        i = base%a
        print i
        c.execute(i)

#    base = '''INSERT INTO comments VALUES("%(name)s","%(comment)s",%(id)s)'''
#    for a in csv.DictReader(open("comments.csv")):
#        i = base%a
#        print i
#        c.execute(i)

    conn.commit()


def insert_score(first, last, email, score, clock):
    conn = sqlite3.connect("users.db")
    c = conn.cursor()

    base = '''INSERT INTO users VALUES("%s","%s","%s",%s,"%s")'''
    c.execute(base % (first.replace('"',"'"),last.replace('"',"'"),email.replace('"',"'"),score,clock))
    conn.commit()


# def insert_comment(name, comment, _id):
#     conn = sqlite3.connect("users.db")
#     c = conn.cursor()
#
#     base = '''INSERT INTO comments VALUES("%s","%s",%s)'''
#     c.execute(base % (name.replace('"',"'"),comment.replace('"',"'"),_id))
#     conn.commit()
