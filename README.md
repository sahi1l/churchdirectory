(NOT QUITE WORKING YET!)

This is a program that allows churches to generate and maintain photo
directories.  The front-end is written in Javascript, and the back-end
in Node.js with Express.js and SQLite.

HOW TO INSTALL
- Unpack the archive in a folder on your webserver, preferably in a
folder that cannot be accessed in the usual way.
- Make sure npm is installed.
- Update the passwords in db/auth.txt.  The first "read" password allows
congregants to view the directory, while the second "edit" password
allows people to edit the directory.

- You can replace the images in assets/ if you like:
-- coverphoto.jpg is the picture that goes on the cover
-- favicon.png is the little icon that appears on your browser tab.
-- interstitial.png is an image that goes on blank pages in the directory. You can delete it if you prefer blank pages.
-- unknownphoto.jpg is the image shown for families with no photo. Delete it if you prefer blankness.

- Set up a daemon to run `npm run start --run-in-foreground`
