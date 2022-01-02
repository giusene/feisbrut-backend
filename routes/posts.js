const express = require("express");
const fs = require("fs");
const router = express.Router();

const {readFile,writeFile} = require("../libs/read&write");


const postsPath = "./data/posts.json";

const postsJSON = fs.readFileSync("./data/posts.json", "utf-8");
const posts = JSON.parse(postsJSON);

router.get("/posts", (req, res) => {
  fs.readFile(postsPath, "utf8", (err, data) => {
    if (err) {
      throw err;
    }
    res.send(JSON.parse(data));
    console.log("ciao");
  });
});
router.get("/posts/:id", (req, res) => {
  readFile(
    (data) => {
      let result;
      const postId = req.params["id"];
      data.map((post) => {
        if (parseInt(post.id) == postId) {
          result = post;
        }
      });
      res.send(result);
    },
    true,
    postsPath
  );
});
router.post("/posts", (req, res) => {
  readFile(
    (data) => {
      const newPostId = Date.now().toString();
      newReq = req.body;
      let newObject = { id: newPostId, ...newReq };

      data = [...data, newObject];

      writeFile(
        JSON.stringify(data, null, 2),
        () => {
          res.status(200).send(newPostId);
        },
        postsPath
      );
    },
    true,
    postsPath
  );
});

router.patch("/posts/:id", (req, res) => {
  readFile(
    (data) => {
      let result;
      const postId = req.params["id"];
      posts.map((post) => {
        if (post.id === postId) {
          result = post;
        }
      });

      let newReq = req.body;
      let newObj = { ...result, ...newReq };

      data.map((post) => {
        if (post.id === postId) {
          data[data.indexOf(post)] = newObj;
        }
      });

      writeFile(
        JSON.stringify(data, null, 2),
        () => {
          res.status(200).send(`post id:${postId} updated`);
        },
        postsPath
      );
    },
    true,
    postsPath
  );
});
router.delete("/posts/:id", (req, res) => {
  readFile(
    (data) => {
      const postId = req.params["id"];

      data.map((post) => {
        if (post.id === postId) {
          data.splice([data.indexOf(post)]);
        }
      });

      writeFile(
        JSON.stringify(data, null, 2),
        () => {
          res.status(200).send(`post id:${postId} removed`);
        },
        postsPath
      );
    },
    true,
    postsPath
  );
});

module.exports = router;
