#!/usr/bin/env python3
import sys
import os
import json
import sqlite3
import subprocess
webgroup = "web"
port = 9000
permflags = int('775',8)
#0. Set the webgroup
response = input(f"Enter the group that the webserver belongs to, or press return for default [{webgroup}]")
if response!="":
    webgroup = response

#Port
response = unput(f"What port should the directory use? [default: {port}]")
portfile="getport.js"
os.chmod(portfile,permflags)
if response != "":
    port = int(response)
    with open("getport.js","w") as F:
        F.write(f"module.exports.getport = function() {{return {port};}}")

#1. Update the passwords
authfile = os.path.join("db","auth.txt")
readpass = input("Enter a password to view the directory online, or leave blank to disable password protection.\n")
editpass = input("Enter a password to edit the directory, or leave blank to disable password protection.\n")
with open(authfile,"w") as F:
    F.write(f'''{{
    "read": "{readpass}",
    "edit": "{editpass}"
}}''')
os.chmod(authfile,permflags)


#2. Generate the database.
## Delete the database if it is already there
database = os.path.join("db","directory.db")
C = sqlite3.connect(database)
C.execute("""CREATE TABLE IF NOT EXISTS dir (
    id INTEGER PRIMARY KEY,
    firstname TEXT,
    lastname TEXT,
    firstname2 TEXT,
    lastname2 TEXT,
    children TEXT,
    address TEXT,
    phone TEXT,
    email TEXT,
    phone2 TEXT,
    email2 TEXT,
    multcontacts TEXT, --contains a CSV of two names to use for the two columns
    photo TEXT
    )""")
C.execute("""CREATE TABLE IF NOT EXISTS staff (
    section TEXT,
    position INTEGER,
    title TEXT,
    name TEXT,
    phone TEXT,
    email TEXT,
    hash TEXT
    )""")
C.execute("""CREATE TABLE IF NOT EXISTS info (
    name TEXT PRIMARY KEY,
    value TEXT
    )""")
os.chmod(database,permflags)
subprocess.run(["chgrp",webgroup,database]) #Could do with os.chown
#FIX: This is a magic 
#3. Populate the info database with prompts
church = input("What is the organization's name? ")
C.execute("INSERT INTO info (name,value) VALUES (?,?) ON CONFLICT(name) DO UPDATE SET value=?",("church",church,church))
for name in ["address","services","officehours"]:
    try:
        C.execute("INSERT INTO info (name) VALUES (?)",(name,))
    except:
        pass
C.commit()

#4. Make the photos folder, if it doesn't already exist
try:
    #FIX: Maybe delete the directory first, get rid of photos 
    os.mkdir("photos")
except FileExistsError:
    pass

#5. Put filler files in assets
for name in ["coverphoto.jpg",
             "interstitial.png",
             "unknownphoto.jpg"]:
    open(f"assets/{name}","w").close()
    os.chmod(f"assets/{name}",permflags)
