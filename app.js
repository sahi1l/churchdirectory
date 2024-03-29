const readOnly = false
const express = require('express')
const auth = require('./auth')
const nocache = require('nocache')
const multer = require('multer')
const cookieParser = require('cookie-parser')
const fs = require('fs')  //filesystem, for use with a single text output
const path = require('path')
const unlink = require('node:fs').unlink
const cors = require('cors')
const getport = require('./port')
const im = require('imagemagick');
const db = require('better-sqlite3')('./db/directory.db')
const bodyParser = require('body-parser')
const app = express()

app.use(cookieParser())
app.use(cors());
app.use(nocache());
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use('/robots.txt', function (req, res, next) {
    res.type('text/plain')
    res.send("User-agent: *\nDisallow: */\n");
});
/*PHOTO UPLOAD*/
const storage = multer.diskStorage({
    destination: (req,file,cb) => {
        cb(null, 'photos/')
    },
    filename: (req,file,cb) => {
	console.debug("A",req)
        const unique = Date.now() + "-" + Math.round(Math.random()*1E9)
        let extension = path.extname(file.originalname)
	console.debug("B")
        cb(null, unique + extension)
	console.debug("C")
    }});
const upload = multer({
    storage: storage,
});
const storageasset = multer.diskStorage({
    destination: (req,file,cb) => {
	console.debug("destination req=",Object.keys(req))
	cb(null,'assets/')
    },
    filename: (req,file,cb) => {
	cb(null, req.query.target);
    }});
const uploadasset = multer({storage: storageasset});
/*BASIC REDIRECTS*/
app.use('/',express.static('src'))
app.use('/edit',express.static('src/edit.html'))
app.use('/directory',express.static('src/index.html'));
//adding these two in case I want to relocate them
app.use('/photos', express.static('photos'));
app.use('/assets', express.static('assets'));
	
/*API*/
app.post('/uploadasset', uploadasset.single('file'),
//    {name:'file', maxCount: 1},{name:'target', maxCount:1}]),
         (req,res) => {
	     if(readOnly) {
		 res.send("readonly");
	     } else {
		 console.debug("/uploadasset",req)
		 let path = req.file.path
		 res.status(200).end();
	     }
         }
        );
app.post('/deleteasset',
	 (req,res) => {
	     if(readOnly) {
		 res.send("readonly");
	     } else {
		 let fname = "assets/"+req.query.target;
		 console.log("fname=",fname);
		 fs.writeFile(fname, "", (err) => {
		     if (err) throw err;
		     res.status(200).end();
		     console.log(fname,"was deleted.");
		 })
	     }
	 });
app.post('/upload',auth.isAuthorizedEdit, upload.single('file'),
         (req,res) => {
	     if(readOnly) {
		 res.send("readonly");
	     } else {
		 let path = req.file.path
		 let dest = req.file.destination + "D" + req.file.filename.split(".").slice(0,-1).join(".") + '.jpg';
		 im.resize({srcPath: path, dstPath: dest, format: 'jpg', width: 400},
			   (err) => {
			       if(err) throw err;
			       console.log(dest,"was created.")
			       unlink(path, (err) => {
				   if(err) throw err;
				   console.log(path,'was deleted.')
			       })
			   });
		 res.send({path:dest})
	     }
	 }
	);

//------------------------------------------------------------
app.post('/save', auth.isAuthorizedEdit, (req,res) => {
    if(readOnly) {
	res.send("readonly");
    } else {
	let fields = Object.keys(req.body)
	//console.debug("Username=",require("os").userInfo().username)
	let dbstring = "INSERT INTO dir ("+fields.join(",")+") VALUES ("+fields.map((x)=>"@"+x).join(",")+")";
	db.prepare("DELETE FROM dir WHERE id=@id").run({id:req.body.id});
	db.prepare(dbstring).run(req.body);
	res.json([req.body,dbstring])
    }
})
//------------------------------------------------------------
app.post('/savestaff',auth.isAuthorizedEdit, (req,res) => {
    if(readOnly) {
	res.send("readonly");
    } else {
	let fields = Object.keys(req.body)
	let dbstring = "INSERT INTO staff ("+fields.join(",")+") VALUES ("+fields.map((x)=>"@"+x).join(",")+")";
	db.prepare("DELETE FROM staff WHERE hash=@hash").run({hash:req.body.hash});
	if(!fields.includes("del")){
	    db.prepare(dbstring).run(req.body);
	}
	res.json([req.body,dbstring])
    }
});
app.post('/savenewstaff', auth.isAuthorizedEdit, (req,res) => {
    if(readOnly) {
	res.send("readonly");
    } else {
	let data = req.body;
	console.debug(typeof(data),data);
	fs.writeFileSync("db/staff.json", JSON.stringify(data))
	res.json([req.body,""]);
    }
});
//------------------------------------------------------------
app.post('/saveinfo',auth.isAuthorizedEdit, (req,res) => {
    if(readOnly) {
	res.send("readonly");
    } else {
	let entry = req.body;
	//db.prepare("INSERT INTO info (name,value) VALUES (@name,@value) ON CONFLICT(name) DO UPDATE SET value=@value").run(entry);
    db.prepare("UPDATE info SET value=@value WHERE name=@name").run(entry);
	res.json([entry]);
    }
});
//------------------------------------------------------------
app.post('/delete', auth.isAuthorized, (req,res) => {
    if(readOnly) {
	res.send("readonly");
    } else {
	db.prepare("DELETE FROM dir WHERE id=@id").run({id: req.body.id});
	res.json([]);
    }
});
//------------------------------------------------------------
app.get('/canedit', auth.isAuthorizedEdit, (req,res) => {
    //check if you can edit the database (permission wise)
    //send a different error if it's a readonly database?
    res.status(200).send();
});
//------------------------------------------------------------
app.get('/load', auth.isAuthorized,(req,res) => {
    console.debug("User=",req.user); 
    let data = {"families": db.prepare('SELECT * from dir').all(),
//		"staff": db.prepare('SELECT * from staff ORDER BY position').all(),
		"info": db.prepare('SELECT * from info').all(),
		"debug": req.cookies
	       }
    let staff = fs.readFileSync("db/staff.json");
    data.staff = JSON.parse(staff);
    res.json(data)
});
//------------------------------------------------------------
app.post("/pwdupdate", auth.isAuthorized, (req,res) => {
    //update the passwords
    if(readOnly) {
	res.send("readonly");
    } else {
	auth.writePassword(req.body.mode, req.body.oldP, req.body.newP);
    }
});
//------------------------------------------------------------
//------------------------------------------------------------
let port = getport.getport()
app.listen(port,()=> {
    console.log(`Church Directory app listening on port ${port}`)
})
