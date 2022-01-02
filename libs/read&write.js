const fs = require('fs')

const readFile = (callback, returnJson = false, filePath, encoding = 'utf8') => {
    fs.readFile(filePath, encoding, (err, data) => {
        if (err) {
            console.log(err)
            /* throw err; */
        }

        callback(returnJson ? JSON.parse(data) : data);
    });
};
const writeFile = (fileData, callback, filePath, encoding = 'utf8') => {

    fs.writeFile(filePath, fileData, encoding, (err) => {
        if (err) {
            console.log(err)
           /*  throw err; */
        }
        
        callback();
    });
};


module.exports = {
    readFile,
    writeFile
}