This is a program that allows churches (and other organizations) to generate and maintain photo directories.  The front-end is written in Javascript, and the back-end in Node.js with Express.js and SQLite.

HOW TO INSTALL
- Install npm onto your webserver.
- Run "npm install" to install the dependencies.
- Run "npm run setup" and answer the prompt questions to get everything set up.
- Run "npm run start" as a daemon*.
- Visit the page on the web to see the (empty) directory.  Click the "Edit" button to edit details and start adding families.


*I don't have a lot of experience with this yet, myself.  I use NearlyFreeSpeech as my host, and my setup is as follows:
- I store the folder as /home/protected/churchdirectory to prevent it from being accessed directly from the web.
- I go to the NFS control panel and "Add a Daemon", with the command "/home/protected/churchdirectory/run.sh"
- I then add a proxy with protocol http, document root /, and target port 9000.


HOW TO USE
(coming soon)
