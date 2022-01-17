const express = require("express");
const { MongoClient } = require("mongodb");
const fs = require("fs");
const router = express.Router();
const config = require("../config");
const { response } = require("express");

const dbURI = `mongodb+srv://Canstopme0:${config.uriKey}@fesibrut-api.dkfxl.mongodb.net/users?retryWrites=true&w=majority`;
const mongoClient = new MongoClient(dbURI);

let feisbrutDB, usersCollection;

router.post("/login", async (req, res) => {
  let newReq = req.body;
  let data = [];
  const cursor = usersCollection.find({});
  await cursor.forEach((user) => data.push(user));
  let result = data.filter(
    (user) =>
      user.email === newReq.email &&
      user.password === newReq.password &&
      user.confirmed
  );
  
  if (result.length > 0) {   
    res.send(result);
  } else {
    res.send("Utente non trovato");
  }
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

router.post("/sendfriendrequest", async (req, res) => {
  let newReq = req.body;

  const myId = newReq.myId;
  const friendId = newReq.friendId;
  let me = await usersCollection.findOne({ id: myId });
  let friend = await usersCollection.findOne({ id: friendId });
  const updateMe = { $set: { friendreq: [...me.friendreq, friendId] } };
  const updateFriend = { $set: { friendrec: [...friend.friendrec, myId] } };

  if (me.friendreq.includes(friendId) || me.friendrec.includes(friendId)) {
    res.send("Richiesta Già Inviata!");
  } else if (me.friends.includes(friendId)) {
    res.send("Gli Utenti sono Già Amici!");
  } else {
    const filterMe = { id: myId };
    const risMe = await usersCollection.updateOne(filterMe, updateMe);
    const filterFriend = { id: friendId };
    const risFriend = await usersCollection.updateOne(
      filterFriend,
      updateFriend
    );
    res.send("richiesta di amicizia inviata");
  }
});
router.post("/confirmfriendrequest", async (req, res) => {
  let newReq = req.body;

  const myId = newReq.myId;
  const friendId = newReq.friendId;
  let me = await usersCollection.findOne({ id: myId });
  let friend = await usersCollection.findOne({ id: friendId });
  const updateMe = {
    $set: { friendrec: [...me.friendrec.filter((rec) => rec !== friendId)] },
  };
  const updateFriend = {
    $set: { friendreq: [...friend.friendreq.filter((requ) => requ !== myId)] },
  };
  const addFriendToMe = { $set: { friends: [...me.friends, friendId] } };
  const addMeToFriend = { $set: { friends: [...friend.friends, myId] } };

  async function clearReqRec() {
    const filterMe = { id: myId };
    const risMe = await usersCollection.updateOne(filterMe, updateMe);
    const filterFriend = { id: friendId };
    const risFriend = await usersCollection.updateOne(
      filterFriend,
      updateFriend
    );
  }

  switch (newReq.confirmed) {
    case true:
      clearReqRec();
      const risMe = await usersCollection.updateOne(
        { id: myId },
        addFriendToMe
      );
      const risFriend = await usersCollection.updateOne(
        { id: friendId },
        addMeToFriend
      );

      res.send("accettato");
      break;
    case false:
      clearReqRec();

      res.send("rifiutato");
      break;
  }
});

async function run() {
  await mongoClient.connect();
  console.log("siamo connessi con atlas Users!");

  feisbrutDB = mongoClient.db("feisbrut");
  usersCollection = feisbrutDB.collection("users");
}

run().catch((err) => console.log("Errore" + err));

module.exports = router;
