This is a program that allows churches (and other organizations) to generate and maintain photo directories.  The front-end is written in Javascript, and the back-end in Node.js with Express.js and SQLite.

# HOW TO INSTALL
- Install npm onto your webserver.
- Run "npm install" to install the dependencies.
- Run "npm run setup" and answer the prompt questions to get everything set up.
- Run "npm run start" as a daemon.  (See EXAMPLE INSTALLATION below.)
- Visit the page on the web to see the (empty) directory.  Click the "Edit" button to edit details and start adding families.


# HOW TO USE
(coming soon)


# EXAMPLE INSTALLATION
I am still learning about Node.js and daemons, but I thought I'd describe how I set this up on my hosting service, which is NearlyFreeSpeech.net (NFS).

- NFS has a special folder called `/home/protected` which can be accessed by scripts and daemons but not the general web.  I store the directory as `/home/protected/churchdirectory` so that outside snoopers can't download my database or my passwords.
- In the NFS control panel for my site, I pressed "Add a Daemon", with these fields:
-- **Command Line**: `/home/protected/churchdirectory/run.sh`
-- **Working Directory**: `/home/protected/churchdirectory`
-- **Run Daemon As**: `web`
-- I then pressed "Add a Proxy" with these fields:
-- **Protocol**: `HTTP`
-- **Base URI**: `/directory/` (so I can visit the site at `XXX.nfshost.com/directory`)
-- **Document Root**: `/`
-- **Target Port**: `9000`

