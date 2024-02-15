#!/usr/bin/env python3
import sys
import os
import json
import sqlite3
#1. Update the passwords
readpass = input("Enter a password to view the directory online, or leave blank to disable password protection.\n")
editpass = input("Enter a password to edit the directory, or leave blank to disable password protection.\n")
with open("db/auth.txt","w") as F:
    F.write(f'''{{
    "read": "{readpass}",
    "edit": "{editpass}"
}}''')

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

#3. Populate the info database with prompts
church = input("What is the organization's name? ")
C.execute("INSERT INTO info (name,value) VALUES (?,?) ON CONFLICT(name) DO UPDATE SET value=?",("church",church,church))
C.commit()
#4. Make the photos folder, if it doesn't already exist
try:
    os.mkdir("photos")
except FileExistsError:
    pass

#5. Explain about the assets folder.
print(f"""Initial setup for {church} Directory is complete.
Next steps:
1) Review the photos in the folder assets/ and replace them as necessary.
2) Visit <directory.host>:9000/edit and add in other details about your church in the Staff tab.
""")
