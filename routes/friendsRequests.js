const express = require("express");
const { MongoClient } = require("mongodb");
const fs = require("fs");
const router = express.Router();
const config = require("../config");

const dbURI = `mongodb+srv://Canstopme0:${config.uriKey}@fesibrut-api.dkfxl.mongodb.net/users?retryWrites=true&w=majority`;
const mongoClient = new MongoClient(dbURI);

let feisbrutDB, usersCollection;

router.post("/sendfriendrequest", async (req, res) => {
  let newReq = req.body;
  console.log(newReq.myId)
  console.log(newReq.friendId)
  res.send(newReq)
});

router.get("/users", async (req, res) => {
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
});
router.post("/users", async (req, res) => {
  const newUserId = Date.now().toString();
  newReq = req.body;
  let newObject = { id: newUserId, ...newReq };
  const ris = await usersCollection.insertOne(newObject);

  if (ris.acknowledged) {
    res.status(200).send(newUserId);
  }
});

router.patch("/users/:id", async (req, res) => {
  const userId = req.params["id"];
  const update = { $set: req.body };
  const filter = { id: userId };
  const ris = await usersCollection.updateOne(filter, update);
  res.send(`user id:${userId} updated`);
});
router.delete("/users/:id", async (req, res) => {
  const userId = req.params["id"];
  const ris = await usersCollection.deleteOne({ id: userId });
  res.status(200).send(`user id:${userId} removed`);
});

async function run() {
  await mongoClient.connect();
  console.log("siamo connessi con atlas Users(FriendRequest)!");

  feisbrutDB = mongoClient.db("feisbrut");
  usersCollection = feisbrutDB.collection("users");
}

run().catch((err) => console.log("Errore" + err));

module.exports = router;