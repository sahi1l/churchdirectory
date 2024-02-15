const fs = require("fs");
module.exports.isAuthorized = function(req,res,next) {
    //There are two passwords: one to read teh directory, and one to edit the directory
    let readhash = req.cookies["churchdirectoryRead"]
    let edithash = req.cookies["churchdirectoryEdit"];
    let toCompare = JSON.parse(fs.readFileSync("db/auth.txt","utf8"));
    if(toCompare.read=="" || readhash==toCompare.read || edithash==toCompare.edit) { 
    	next()
    } else {
	res.status(401).end();
    }
}

module.exports.isAuthorizedEdit = function(req,res,next) {
    let edithash = req.cookies["churchdirectoryEdit"];
    let toCompare = JSON.parse(fs.readFileSync("db/auth.txt","utf8"));
    if (toCompare.edit=="" || edithash==toCompare.edit) {
	next();
    } else {
	res.status(401).end();
    }
}
