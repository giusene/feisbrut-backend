const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 5000

const bodyParser = require('body-parser');

const fs = require('fs');
const cors = require('cors')
const routes = require('./routes/routes.js')(express(), fs);
const dataPath = './data/users.json'


 const readFile = (callback, returnJson = false, filePath = dataPath, encoding = 'utf8') => {
        fs.readFile(filePath, encoding, (err, data) => {
            if (err) {
                throw err;
            }

            callback(returnJson ? JSON.parse(data) : data);
        });
    };
    const writeFile = (fileData, callback, filePath = dataPath, encoding = 'utf8') => {

        fs.writeFile(filePath, fileData, encoding, (err) => {
            if (err) {
                throw err;
            }

            callback();
        });
    };

express()
  .use(cors())
  
  .use(bodyParser.json())
  .use(express.static(path.join(__dirname, 'public')))
  .use(bodyParser.urlencoded({ extended: true }))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/', (req, res) => res.render('pages/index'))
  .get('/users', (req, res) => {
    fs.readFile(dataPath, 'utf8', (err, data) => {
      if (err) {
        throw err;
      }

      res.send(JSON.parse(data));
    });
  })
  .post('/users', (req, res) => {

    readFile(data => {
       
      const newUserId = Date.now().toString();

            
      data[newUserId.toString()] = req.body;

      writeFile(JSON.stringify(data, null, 2), () => {
        res.status(200).send('new user added');
      });
    },
    true);
  })
  .put('/users/:id', (req, res) => {

    readFile(data => {

           
      const userId = req.params["id"];
      data[userId] = req.body;

      writeFile(JSON.stringify(data, null, 2), () => {
        res.status(200).send(`users id:${userId} updated`);
      });
    },
    true);
  })
  .delete('/users/:id', (req, res) => {

    readFile(data => {

            
      const userId = req.params["id"];
      delete data[userId];

      writeFile(JSON.stringify(data, null, 2), () => {
       res.status(200).send(`users id:${userId} removed`);
      });
    },
    true);
  })
  .listen(PORT, () => console.log(`Listening on ${ PORT }`))

express()
