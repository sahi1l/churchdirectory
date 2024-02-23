#!/bin/bash
#Back everything up in a zip file with a unique name
. ./backup.sh
#Remove the authfile
rm db/auth.txt
#Remove the database
rm db/directory.db
#Remove the photos
rm photos/*
#Remove the assets
rm assets/*
