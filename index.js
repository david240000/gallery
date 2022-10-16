const express = require('express');
const app = express();
const path = require('path');
const ejs = require('ejs');
const fs = require('fs');

app.set('view engine', 'ejs');
app.use(express.static(__dirname +'/public/images/'));
app.use(express.urlencoded({ extended: true}));
const multer = require('multer');
const storage = multer.diskStorage({
    destination: './public/images/',
    filename: (req, file, cb) => {
        cb(null,file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    },
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) =>{
        checkFileType(file, cb);
    }
}).single('image');

function checkFileType(file, cb){
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if(mimetype && extname){
        return cb(null, true);
    } else {
        return cb('Error: Images only')
    }
}

function getImagesFromDir(dirPath) {
    let allImages = [];
    let files = fs.readdirSync(dirPath)

    for (let i in files) {
        let file = files[i]
        let fileLocation = path.join(dirPath, file)
        var stat = fs.statSync(fileLocation);

        if (stat && stat.isDirectory()) {
            getImagesFromDir(fileLocation)
        } else if (stat && stat.isFile() && ['.jpeg','.jpg', '.png','.gif'].indexOf(path.extname(fileLocation)) !== -1) {
            allImages.push(file)
        }
    }
    return allImages
}

app.get('/', (req, res) => {
    let images = getImagesFromDir(path.join(__dirname, 'public/images'))
    res.render('index', {images:images});
});

app.post("/upload", (req, res) =>{
    upload(req, res, (err) =>{
        if(err){
            res.redirect('/') 
           
        }else{
            if(req.file == undefined){
                res.redirect('/')
            } else {
                    res.redirect('/');
                }
            }
    });
})

app.post("/delete:param", (req, res) =>{
    let directory = __dirname + "/public/images/"
    console.log('delete')
    console.log(req.params.param)
    fs.readdir(directory, (err, files) => {
        if (err) throw err;
      
        for (const file of files) {
          fs.unlink(path.join(directory, req.params.param), (err) => {
            if (err) throw err;
          });
        }
      });
    res.redirect('/');
})

app.listen(3000);
console.log("3000 is the port");