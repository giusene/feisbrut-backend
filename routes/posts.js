const express = require("express");


const router = express.Router();
const config = require("../config");

const {findOneFunction,updateOneFunction,findFunction,insertFunction,deleteFunction} = require('../libs/mongoFunctions');
const {commentsInfo} = require('../libs/commentsInfo');
const {likesInfo} = require('../libs/likesInfo');
const {notify} = require('../libs/notifyBody');


let postsCollection = "posts";
let usersCollection = "users"



 /* -----------------------------------------------------GLOBAL POST GET---------------------------------------------------------------------- */
router.get("/posts", async (req, res) => {
  let result = []
  let posts = await findFunction(postsCollection);
  posts.forEach((post) => {

    post = {
      id:post.id,
      authorId:post.authorId,
      text:post.text,
      date:post.date,
      likes:post.likes,
      comments:post.comments,
      url:post.url
    }
    result.push(post);
  });
  res.send(result);
});

  /* -----------------------------------------------------/GLOBAL POST GET---------------------------------------------------------------------- */


  /* -----------------------------------------------------POSTS POST---------------------------------------------------------------------- */
router.post("/posts", async (req, res) => {
  const newPostId = Date.now().toString();
  newReq = req.body;

  let newObject = { id: newPostId, ...newReq };
  await insertFunction(postsCollection,newObject);
  
  res.status(200).send(newPostId);
  
});
  /* -----------------------------------------------------/POSTS POST---------------------------------------------------------------------- */


  /* -----------------------------------------------------GET SINGLE POST---------------------------------------------------------------------- */
router.get("/posts/:id", async (req, res) => {  
  const postId = req.params["id"];

  let post = await findOneFunction(postsCollection,{ id: postId });
  
  let users = await findFunction(usersCollection);
  const utenti = users.filter((user) => user.id === post.authorId);

  let completeComments = commentsInfo(post,users);
  let completeLikes = likesInfo(post,users);

  let finalPost ={
    ...post,
    _id:"*****",
    db_id:"*****",
    authorName : utenti[0].name,
    authorSurname : utenti[0].surname,
    authorAlias : utenti[0].bio.alias,
    authorPhoto : utenti[0].photo,
    comments: completeComments,
    likes: completeLikes ,
  }
 
 res.send(finalPost);

});
  /* -----------------------------------------------------/GET SINGLE POST---------------------------------------------------------------------- */


  /* -----------------------------------------------------SINGLE POST PATCH---------------------------------------------------------------------- */
router.patch("/posts/:id", async (req, res) => {
  let newReq = req.body
  const postId = req.params["id"];
  let post = await findOneFunction(postsCollection,{ id: postId });
  if(post.db_id === newReq.db_id){

  const update = { $set: req.body };
  const filter = { id: postId };
  await updateOneFunction(postsCollection,filter, update);

  res.send([{response:`post aggiornato con successo`}]);
  } else {res.send({response:"non sei autorizzato"})}
});
  /* -----------------------------------------------------/SINGLE POST PATCH---------------------------------------------------------------------- */



  /* -----------------------------------------------------SINGLE POST DELETE---------------------------------------------------------------------- */
router.delete("/posts/:id", async (req, res) => {
  const postId = req.params["id"];  
  let newReq = req.body

  let post = await findOneFunction(postsCollection,{ id: postId });
  if(post.db_id === newReq.db_id){
    await deleteOne(postsCollection,{ id: postId });

    res.status(200).send([{response:`post eliminato con successo`}]);

  } else {res.send({response:"non sei autorizzato"})}
});
  /* -----------------------------------------------------/SINGLE POST DELETE---------------------------------------------------------------------- */


  /* -----------------------------------------------------GET MY POST---------------------------------------------------------------------- */
router.post("/getmypost", async (req, res) => {
  newReq = req.body;

  let posts = await findFunction(postsCollection);
  let users = await findFunction(usersCollection);
  console.log(users)
  let result = posts
    .filter((item) => [...newReq].includes(item.authorId))
    .reverse();
  
    let finalResult =  result.map( (post) => {
    let utenti =  users.filter((user) => user.id === post.authorId);
    let completeComments = commentsInfo(post,users);
    let completeLikes = likesInfo(post,users);  

    let thisPost = {
      ...post,
      authorName: utenti[0].name,
      authorSurname: utenti[0].surname,      
      authorPhoto: utenti[0].photo,
      comments:completeComments,
      likes: completeLikes,
    };

    return thisPost
    });
    
    
  res.send(finalResult);
});
  /* -----------------------------------------------------/GET MY POST---------------------------------------------------------------------- */



  /* -----------------------------------------------------POSTS LIKE---------------------------------------------------------------------- */
router.post("/like", async (req, res) => {  
  action = req.body;
  const postId = action.postId;
  
  let post = await findOneFunction(postsCollection,{ id: postId });
  let user = await findOneFunction(usersCollection,{ id: post.authorId });

  if (action.type === "like") {

    const updatePost = { $set: { likes: [...post.likes, action.userId] } };
    const filterPost = { id: postId };
    const filterUser = { id: user.id };
    const updateUser = { $set: { notify: [ ...user.notify , notify( action.userId ,"like", postId ) ]}};
    await updateOneFunction(postsCollection,filterPost, updatePost);

    if(action.userId !== user.id ){

      updateOneFunction(usersCollection,filterUser, updateUser);
  
      res.send([{response:`post id:${postId} updated and notification send`}]);

    } else {res.send([{response:`post id:${postId} updated and notification unsend`}])}

  } else if (action.type === "dislike") {
    
    
    const dislike = post.likes.filter((like) => like !== action.userId);
    const update = { $set: { likes: [...dislike] } };
    const filter = { id: postId };
    
    await updateOneFunction(postsCollection,filter, update);
    

    res.send([{response:`post id:${postId} updated`}]);
  }
});

  /* -----------------------------------------------------/POSTS LIKE---------------------------------------------------------------------- */



  /* -----------------------------------------------------POSTS COMMENTS---------------------------------------------------------------------- */
router.post("/comments", async (req, res) => {
  action = req.body;
  postId = action.postId;

  let post = await findOneFunction(postsCollection,{ id: postId });
  let user = await findOneFunction(usersCollection,{ id: post.authorId });

  const filter = { id: postId };
  const update = {
    $set: { comments: [ ...post.comments, { authorId: action.authorId, text: action.text, date: action.date }]}};
  const filterUser = { id: user.id };
  const updateUser = { $set: { notify: [ ...user.notify, notify( action.authorId, "comment", postId) ]}};

  await updateOneFunction(postsCollection,filter, update);
  if(action.authorId !== user.id  ){

    await updateOneFunction(usersCollection,filterUser, updateUser);

    res.send([{response:`post id:${postId} updated and notification send`}]);
  } else {res.send([{response:`post id:${postId} updated and notification unsend `}]);}
});

/* -----------------------------------------------------/POSTS COMMENTS---------------------------------------------------------------------- */


/* -----------------------------------------------------------EXPORT---------------------------------------------------------------------- */

module.exports = router;
