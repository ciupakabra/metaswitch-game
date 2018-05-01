import csv, sqlite3, MySQLdb

def setup(conn):
    c = conn.cursor()
    #run populate.py only if users.db is not present
    c.execute("CREATE TABLE IF NOT EXISTS users (first TEXT, last TEXT, email TEXT, score INTEGER, elapsed TEXT, clock TEXT)")
    conn.commit()

#    c.execute("CREATE TABLE comments (name TEXT, comment TEXT, id INTEGER)")

#    base = '''INSERT INTO users VALUES("%(first)s","%(last)s","%(email)s",%(score)s,"%(elapsed)s","%(clock)s")'''
#    for a in csv.DictReader(open("users.csv")):
#        i = base%a
#        print i
#        c.execute(i)

#    base = '''INSERT INTO comments VALUES("%(name)s","%(comment)s",%(id)s)'''
#    for a in csv.DictReader(open("comments.csv")):
#        i = base%a
#        print i
#        c.execute(i)

    conn.commit()


def insert_score(conn, first, last, email, score, elapsed, clock):
    c = conn.cursor()

    base = '''INSERT INTO users VALUES("%s","%s","%s",%s,"%s","%s")'''
    c.execute(base % (first.replace('"',"'"),last.replace('"',"'"),email.replace('"',"'"),score, elapsed, clock))
    conn.commit()


# def insert_comment(name, comment, _id):
#     conn = sqlite3.connect("users.db")
#     c = conn.cursor()
#
#     base = '''INSERT INTO comments VALUES("%s","%s",%s)'''
#     c.execute(base % (name.replace('"',"'"),comment.replace('"',"'"),_id))
#     conn.commit()
