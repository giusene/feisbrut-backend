const express = require('express');
const fs = require('fs')
const router = express.Router();


const readWrite = require('../libs/read&write');
const readFile = readWrite.readFile;
const writeFile = readWrite.writeFile;



const usersPath = './data/users.json';

const usersJSON = fs.readFileSync('./data/users.json', 'utf-8')
    const users = JSON.parse(usersJSON)

router.get('/users', (req, res) => {
    fs.readFile(usersPath, 'utf8', (err, data) => {
      if (err) {
        throw err;
      }
      res.send(JSON.parse(data));
      
      
      
    });
  })
  router.get('/users/:id', (req, res) => {
    
    readFile(data=>{
        let result;
        const userId = req.params["id"];
        data.map((user)=>{if(parseInt(user.id)==userId){result=user}})
        res.send(result);


      },
      true,usersPath)
      
      
      
      
  })
  router.post('/users', (req, res) => {

    readFile(data => {
       
      const newUserId = Date.now().toString();
      newReq = req.body
      let newObject = {id:newUserId,...newReq}
            
      
      data = [...data,newObject];
      
      writeFile(JSON.stringify(data, null, 2), () => {
       
        
        res.status(200).send(newUserId);
      },usersPath);
    },
    true,usersPath);
  })
  
  router.patch('/users/:id', (req, res) => {

    readFile(data => {
      let result;
      const userId = req.params["id"];
      users.map((user)=>{if(user.id===userId){result=user}})   
      
      
      let newReq = req.body
      let newObj = {...result,...newReq}   
         
      data.map((user)=> {if(user.id===userId){data[data.indexOf(user)]=newObj}})
     

      writeFile(JSON.stringify(data, null, 2), () => {
        res.status(200).send(`user id:${userId} updated`);
      },usersPath);
    },
    true,usersPath);
  })
  router.delete('/users/:id', (req, res) => {

    readFile(data => {

      const userId = req.params["id"];
      
      data.map((user)=> {if(user.id===userId){  data.splice([data.indexOf(user)])}})
            

      

      writeFile(JSON.stringify(data, null, 2), () => {
       res.status(200).send(`user id:${userId} removed`);
      },usersPath);
    },
    true,usersPath);
  })


  module.exports = router;


