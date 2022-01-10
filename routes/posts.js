const express = require("express");
const { MongoClient } = require("mongodb");
const fs = require("fs");
const router = express.Router();
const config = require("../config");

const dbURI = `mongodb+srv://Canstopme0:${config.uriKey}@fesibrut-api.dkfxl.mongodb.net/posts?retryWrites=true&w=majority`;
const mongoClient = new MongoClient(dbURI);

let feisbrutDB, postsCollection;

router.get("/posts", async (req, res) => {
  let data = [];
  const cursor = postsCollection.find({});
  await cursor.forEach((post) => {
    data.push(post);
  });
  res.send(data);
});
router.post("/getmypost", (req,res)=>{
  let data = [];
  
    const cursor = postsCollection.find({});
    cursor.forEach((post) => {
      data.push(post);
    });
    res.send(data);
  

})

router.get("/posts/:id", async (req, res) => {
  const postId = req.params["id"];
  let post = await postsCollection.findOne({ id: postId });

  res.send(post);
});
router.post("/posts", async (req, res) => {
  const newPostId = Date.now().toString();
  newReq = req.body;
  let newObject = { id: newPostId, ...newReq };
  const ris = await postsCollection.insertOne(newObject);

  if (ris.acknowledged) {
    res.status(200).send(newPostId);
  }
});

router.patch("/posts/:id", async (req, res) => {
  const postId = req.params["id"];
  const update = { $set: req.body };
  const filter = { id: postId };
  const ris = await postsCollection.updateOne(filter, update);

  res.send(`user id:${postId} updated`);
});
router.delete("/posts/:id", async (req, res) => {
  const postId = req.params["id"];
  const ris = await postsCollection.deleteOne({ id: postId });
  res.status(200).send(`user id:${postId} removed`);
});

async function run() {
  await mongoClient.connect();
  console.log("siamo connessi con atlas Post!");

  feisbrutDB = mongoClient.db("feisbrut");
  postsCollection = feisbrutDB.collection("posts");
}

run().catch((err) => console.log("Errore" + err));

module.exports = router;
