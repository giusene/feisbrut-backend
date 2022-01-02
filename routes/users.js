const express = require("express");
const { MongoClient } = require("mongodb");
const fs = require("fs");
const router = express.Router();
const config = require('../config')


const { readFile, writeFile } = require("../libs/read&write");
const dbURI =
  `mongodb+srv://Canstopme0:${config.uriKey}@fesibrut-api.dkfxl.mongodb.net/users?retryWrites=true&w=majority`;
const mongoClient = new MongoClient(dbURI);
const usersPath = "./data/users.json";

const usersJSON = fs.readFileSync("./data/users.json", "utf-8");
const users = JSON.parse(usersJSON);
let feisbrutDB, usersCollection;


router.post("/login", async (req,res)=>{
  
  let newReq= req.body
  let data = [];
  const cursor = usersCollection.find({});
  await cursor.forEach((user) => data.push(user))
    let result =  data.filter(user =>  user.email === newReq.email && user.password === newReq.password && user.confirmed);
    console.log(result)
    if (result.length > 0 ){
      res.send(result)
    } else{res.send("Utente non trovato")}
    
    
})

router.get("/users", async (req, res) => {
  /* fs.readFile(usersPath, "utf8", (err, data) => {
    if (err) {
      throw err;
    }
    res.send(JSON.parse(data));
  }); */
  let data = [];
  const cursor = usersCollection.find({});
  await cursor.forEach((user) => {
    user = {
      id: user.id,
      name: user.name,
      surname: user.surname,
      email: user.email,
      photo: user.photo,
      friends: user.friends,
      bio: user.bio,
      friendreq: user.friendreq,
      friendrec: user.friendrec,
      messages: user.messages,
      confirmed: user.confirmed,
    };
    data.push(user);
  });
  res.send(data);
});
router.get("/users/:id", async (req, res) => {
  const userId = req.params["id"];
  let user = await usersCollection.findOne({ id: userId });
  user = {
    id: user.id,
    name: user.name,
    surname: user.surname,
    email: user.email,
    photo: user.photo,
    friends: user.friends,
    bio: user.bio,
    friendreq: user.friendreq,
    friendrec: user.friendrec,
    messages: user.messages,
    confirmed: user.confirmed,
  };
  res.send(user);

  /* readFile(
    (data) => {
      let result;
      data.map((user) => {
        const userId = req.params["id"];
        if (parseInt(user.id) == userId) {
          result = user;
        }
      });
      res.send(result);
    },
    true,
    usersPath
  ); */
});
router.post("/users", async (req, res) => {
  const newUserId = Date.now().toString();
  newReq = req.body;
  let newObject = { id: newUserId, ...newReq };
  const ris = await usersCollection.insertOne(newObject);

  if (ris.acknowledged) {
    res.status(200).send(newUserId);
  }
  /* readFile(
      async (data) => {

      data = [...data, newObject];

      writeFile(
        JSON.stringify(data, null, 2),
        () => {
          res.status(200).send(newUserId);
        },
        usersPath
      );
    },
    true,
    usersPath
  ); */
});

router.patch("/users/:id", async (req, res) => {
  const userId = req.params["id"];
  const update = { $set: req.body };
  const filter = { id: userId };
  const ris = await usersCollection.updateOne(filter, update);
  res.send(`user id:${userId} updated`);

  /* readFile(
    (data) => {
      let result;
      users.map((user) => {
        if (user.id === userId) {
          result = user;
        }
      });

      let newReq = req.body;
      let newObj = { ...result, ...newReq };

      data.map((user) => {
        if (user.id === userId) {
          data[data.indexOf(user)] = newObj;
        }
      });

      writeFile(
        JSON.stringify(data, null, 2),
        () => {
          res.status(200).send(`user id:${userId} updated`);
        },
        usersPath
      );
    },
    true,
    usersPath
  ); */
});
router.delete("/users/:id", async (req, res) => {
  const userId = req.params["id"];
  const ris = await usersCollection.deleteOne({ id: userId });
  res.status(200).send(`user id:${userId} removed`);
  /* readFile(
    (data) => {
      const userId = req.params["id"];

      data.map((user) => {
        if (user.id === userId) {
          data.splice([data.indexOf(user)]);
        }
      });

      writeFile(
        JSON.stringify(data, null, 2),
        () => {
          res.status(200).send(`user id:${userId} removed`);
        },
        usersPath
      );
    },
    true,
    usersPath
  ); */
});

async function run() {
  await mongoClient.connect();
  console.log("siamo connessi con atlas");

  feisbrutDB = mongoClient.db("feisbrut");
  usersCollection = feisbrutDB.collection("users");
}

run().catch((err) => console.log("Errore" + err));

module.exports = router;
