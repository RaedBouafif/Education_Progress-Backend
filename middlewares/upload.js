const multer = require('multer')
const storage = multer.memoryStorage()

const fileFilter = (req, file , cb) => {
    
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpeg') {
        cb(null , true)
    }else {
        cb(new Error('Invalid file type. Only JPEG and PNG images are allowed.'))
    }
} 
const upload = multer({ storage : storage , fileFilter : fileFilter})

module.exports = upload 