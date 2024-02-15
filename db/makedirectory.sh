#!/bin/bash
db="directory.db"

sqlite3 $db "create table dir (
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
       )"

sqlite3 $db "CREATE TABLE staff (
       section TEXT,
       position INTEGER,
       title TEXT,
       name TEXT,
       phone TEXT,
       email TEXT,
       hash TEXT
)"
sqlite3 $db "CREATE TABLE info (
       name TEXT,
       value TEXT
);"
