const express = require('express')
const auth = require('./auth')
const nocache = require('nocache')
const multer = require('multer')
const cookieParser = require('cookie-parser')
const fs = require('fs')  //filesystem, for use with a single text output
const path = require('path')
const unlink = require('node:fs').unlink
const cors = require('cors')
const im = require('imagemagick');

const db = require('better-sqlite3')('./db/standrewsdirectory.db')
const bodyParser = require('body-parser')
const app = express()

app.use(cookieParser())
app.use(cors());
app.use(nocache());
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use('/robots.txt', function (req, res, next) {
    res.type('text/plain')
    res.send("User-agent: *\nDisallow: */");
});
/*PHOTO UPLOAD*/
const storage = multer.diskStorage({
    destination: (req,file,cb) => {
        cb(null, 'photos/')
    },
    filename: (req,file,cb) => {
        const unique = Date.now() + "-" + Math.round(Math.random()*1E9)
        let extension = path.extname(file.originalname)
        cb(null, unique + extension)
    }});
const upload = multer({
    storage: storage,
})

/*BASIC REDIRECTS*/
app.use('/',express.static('src'))
app.use('/edit',express.static('src/edit.html'))
//app.use('/staff',express.static('src/staff.html'))
app.use('/directory',express.static('src/directory.html'));
//adding these two in case I want to relocate them
app.use('/photos', express.static('photos'));
app.use('/assets', express.static('assets'));
	
/*API*/
app.post('/upload',auth.isAuthorizedEdit, upload.single('file'), (req,res) => {
    console.log("Receiving photo");
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
});


app.post('/save', auth.isAuthorizedEdit, (req,res) => {
    let fields = Object.keys(req.body)
    //console.debug("Username=",require("os").userInfo().username)
    let dbstring = "INSERT INTO dir ("+fields.join(",")+") VALUES ("+fields.map((x)=>"@"+x).join(",")+")";
    db.prepare("DELETE FROM dir WHERE id=@id").run({id:req.body.id});
    db.prepare(dbstring).run(req.body);
    res.json([req.body,dbstring])
})
app.post('/savestaff',auth.isAuthorizedEdit, (req,res) => {
    let fields = Object.keys(req.body)
    let dbstring = "INSERT INTO staff ("+fields.join(",")+") VALUES ("+fields.map((x)=>"@"+x).join(",")+")";
    db.prepare("DELETE FROM staff WHERE hash=@hash").run({hash:req.body.hash});
    if(!fields.includes("del")){
	db.prepare(dbstring).run(req.body);
    }
    res.json([req.body,dbstring])
});
app.post('/saveinfo',auth.isAuthorizedEdit, (req,res) => {
    let entry = req.body;
    db.prepare("UPDATE info SET value=@value WHERE name=@name").run(entry);
    res.json([entry]);
});
app.post('/delete', auth.isAuthorized, (req,res) => {
    db.prepare("DELETE FROM dir WHERE id=@id").run({id: req.body.id});
    res.json([]);
});

app.get('/canedit', auth.isAuthorizedEdit, (req,res) => {
    res.status(200).end();
});
    
app.get('/load', auth.isAuthorized,(req,res) => {
    let data = {"families": db.prepare('SELECT * from dir').all(),
		"staff": db.prepare('SELECT * from staff ORDER BY position').all(),
		"info": db.prepare('SELECT * from info').all(),
		"debug": req.cookies
	       }
    res.json(data)
})
app.post('/staffout', (req,res) => {
    let writer = fs.createWriteStream("dummy.txt")
    let S = req.body
    res.json(S)
    return
    writer.write(S)
    let R = writer.close()
    res.json([S,R])
})


//I think I can delete this?
app.get('/test', auth.isAuthorized,(req,res) => {
    res.send('Church Directory says hi!!')
})
const port = 9000
app.listen(port,()=> {
    console.log("Yup yup");
    console.log(`Example app listening on port ${port}`)
})
