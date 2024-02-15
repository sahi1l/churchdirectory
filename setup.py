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

#3. Populate the info database with prompts
#4. Make the photos folder
#5. Explain about the assets folder.
