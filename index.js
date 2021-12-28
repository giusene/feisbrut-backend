const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 5000

const bodyParser = require('body-parser');

const fs = require('fs');
const cors = require('cors')
const routes = require('./routes/routes.js')(express(), fs);
const usersPath = './data/users.json';
const postsPath = './data/posts.json';


 const readFile = (callback, returnJson = false, filePath, encoding = 'utf8') => {
        fs.readFile(filePath, encoding, (err, data) => {
            if (err) {
                throw err;
            }

            callback(returnJson ? JSON.parse(data) : data);
        });
    };
    const writeFile = (fileData, callback, filePath, encoding = 'utf8') => {

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
    fs.readFile(usersPath, 'utf8', (err, data) => {
      if (err) {
        throw err;
      }
      res.send(JSON.parse(data));
      
      
    });
  })
  .get('/users/:id', (req, res) => {
    readFile(data => {

           
      const userId = req.params["id"];
      /* data[userId] = res.body; */      
      res.send(data[userId])
    },
    true,usersPath);
  })
  .post('/users', (req, res) => {

    readFile(data => {
       
      const newUserId = Date.now().toString();

            
      
      data[newUserId.toString()] = req.body;
      
      writeFile(JSON.stringify(data, null, 2), () => {
       
        
        res.status(200).send(newUserId);
      },usersPath);
    },
    true,usersPath);
  })
  .put('/users/:id', (req, res) => {

    readFile(data => {

      
      const userId = req.params["id"];
      data[userId] = req.body;

      writeFile(JSON.stringify(data, null, 2), () => {
        res.status(200).send(`users id:${userId} updated`);
      },usersPath);
    },
    true,usersPath);
  })
  .patch('/users/:id', (req, res) => {

    readFile(data => {

      
      const userId = req.params["id"];
      
      let newBody = req.body
      let newObj = {...data[userId],...newBody}      
      data[userId] = newObj

      writeFile(JSON.stringify(data, null, 2), () => {
        res.status(200).send(`users id:${userId} updated`);
      },usersPath);
    },
    true,usersPath);
  })
  .delete('/users/:id', (req, res) => {

    readFile(data => {

            
      const userId = req.params["id"];
      delete data[userId];

      writeFile(JSON.stringify(data, null, 2), () => {
       res.status(200).send(`users id:${userId} removed`);
      },usersPath);
    },
    true,usersPath);
  })


  .get('/posts', (req, res) => {
    fs.readFile(postsPath, 'utf8', (err, data) => {
      if (err) {
        throw err;
      }
      res.send(JSON.parse(data));
      
      
    });
  })
  .get('/posts/:id', (req, res) => {
    readFile(data => {

           
      const postId = req.params["id"];
      /* data[userId] = res.body; */      
      res.send(data[postId])
    },
    true,postsPath);
  })
  .post('/posts', (req, res) => {

    readFile(data => {
       
      const newPostId = Date.now().toString();

            
      
      data[newPostId.toString()] = req.body;
      
      writeFile(JSON.stringify(data, null, 2), () => {
       
        
        res.status(200).send(newPostId);
      },postsPath);
    },
    true,postsPath);
  })
  .put('/posts/:id', (req, res) => {

    readFile(data => {

      
      const postId = req.params["id"];
      data[postId] = req.body;

      writeFile(JSON.stringify(data, null, 2), () => {
        res.status(200).send(`post id:${postId} updated`);
      },postsPath);
    },
    true,postsPath);
  })
  .patch('/posts/:id', (req, res) => {

    readFile(data => {

      
      const postId = req.params["id"];
      
      let newBody = req.body
      let newObj = {...data[postId],...newBody}      
      data[postId] = newObj

      writeFile(JSON.stringify(data, null, 2), () => {
        res.status(200).send(`users id:${postId} updated`);
      },postsPath);
    },
    true,postsPath);
  })
  .delete('/posts/:id', (req, res) => {

    readFile(data => {

            
      const postId = req.params["id"];
      delete data[postId];

      writeFile(JSON.stringify(data, null, 2), () => {
       res.status(200).send(`users id:${postId} removed`);
      },postsPath);
    },
    true,postsPath);
  })
  .listen(PORT, () => console.log(`Listening on ${ PORT }`))

express()
