const express = require("express");
const { MongoClient } = require("mongodb");
const fs = require("fs");
const router = express.Router();
const config = require("../config");

const dbURI = `mongodb+srv://Canstopme0:${config.uriKey}@fesibrut-api.dkfxl.mongodb.net/posts?retryWrites=true&w=majority`;
const mongoClient = new MongoClient(dbURI);
const dbURI2 = `mongodb+srv://Canstopme0:${config.uriKey}@fesibrut-api.dkfxl.mongodb.net/users?retryWrites=true&w=majority`;
const mongoClient2 = new MongoClient(dbURI2);

let feisbrutDB, postsCollection;
let feisbrutDB2, usersCollection;

router.get("/posts", async (req, res) => {
  let data = [];
  const cursor = postsCollection.find({});
  await cursor.forEach((post) => {
    data.push(post);
  });
  res.send(data);
});
router.post("/getmypost", async (req, res) => {
  newReq = req.body;

  let data = [];
  let finalResult = [];

  const cursor = postsCollection.find();
  await cursor.forEach((post) => {
    data.push(post);
  });
  let result = data
    .filter((item) => [...newReq].includes(item.authorId))
    .reverse();
  result.map(async (post)=>{
    let user = await usersCollection.findOne({ id: post.authorId});
    post = {
      ...post,
      authorName:user.name,
      authorSurname:user.surname,
      authorAlias:user.bio.alias,
      authorPhoto:user.photo,
    }
    finalResult.push(post)
  })
    
  console.log(finalResult)
  res.send(finalResult);
});

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

router.post("/like", async (req, res) => {
  action = req.body;

  if (action.type === "like") {
    const postId = action.postId;
    let post = await postsCollection.findOne({ id: postId });
    let user = await usersCollection.findOne({ id: post.authorId });

    const updatePost = { $set: { likes: [...post.likes, action.userId] } };
    const filterPost = { id: postId };
    const filterUser = { id: user.id };
    const updateUser = {
      $set: {
        notify: [...user.notify,
          {
            type: "like",
            who: `${action.userId}`,
            date: new Date().toISOString(),
            read: false,
          },
        ],
      },
    };
    const ris = await postsCollection.updateOne(filterPost, updatePost);
    usersCollection.updateOne(filterUser, updateUser);

    res.send(`user id:${postId} updated`);
  } else if (action.type === "dislike") {
    const postId = action.postId;
    let post = await postsCollection.findOne({ id: postId });
    let user = await usersCollection.findOne({ id: post.authorId });
    const dislike = post.likes.filter((like) => like !== action.userId);
    const update = { $set: { likes: [...dislike] } };
    const filter = { id: postId };
    const filterUser = { id: user.id };
    const updateUser = {
      $set: { notify: user.notify.filter((not) => not.who !== action.userId) },
    };
    const ris = await postsCollection.updateOne(filter, update);
    /* usersCollection.updateOne(filterUser, updateUser);  */

    res.send(`user id:${postId} updated`);
  }
});

async function run1() {
  await mongoClient.connect();
  console.log("siamo connessi con atlas Post!");

  feisbrutDB = mongoClient.db("feisbrut");
  postsCollection = feisbrutDB.collection("posts");
}
async function run2() {
  await mongoClient2.connect();
  console.log("siamo connessi con atlas users!");

  feisbrutDB2 = mongoClient2.db("feisbrut");
  usersCollection = feisbrutDB2.collection("users");
}

run1().catch((err) => console.log("Errore" + err));
run2().catch((err) => console.log("Errore" + err));

module.exports = router;
