const multer = require("multer");

module.exports = multer({
    dest: './uploads/',
    rename: function (fieldname, filename) {
        return filename;
    },
})