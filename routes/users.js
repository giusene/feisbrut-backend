const express = require("express");
const router = express.Router();



const {findOneFunction,updateOneFunction,findFunction,insertFunction,deleteFunction} = require('../libs/mongoFunctions');
const {tokenGenerator} = require("../libs/tokenGenerator");
const {notificationInfo} = require ('../libs/notificationInfo');
const {friendsInfo} = require ('../libs/friendInfo');
const {messagesInfo} = require ('../libs/messagesInfo');
const {globalUsersGet} = require ('../libs/globalUsersGet');
const {userNotify} = require('../libs/notifyBody');
const {messageBody} = require('../libs/messageBody');

const {ObjectId} = require("mongodb");

let collection = "users";

/* -----------------------------------------------------LOGIN---------------------------------------------------------------------- */
router.post("/login", async (req, res) => {
  let newReq = req.body;
  let data = await findFunction(collection)
  
  let result = data.filter((user) =>user.email === newReq.email && user.password === newReq.password);
  
  if (result.length > 0 ) {

    if(result[0].confirmed){
      let newUser = await findOneFunction(collection,{ email: newReq.email });   

      let token =  tokenGenerator(32, "#aA");  

      const update = {
        $set: {
          login_time: Date.now(),
          user_token: token,
          checkSession: true,
          logged: true,
        },
      };
      const filter = { email: newReq.email };
      await updateOneFunction(collection,filter, update);
      let finalUser = await findOneFunction(collection,{ email: newReq.email });
      
      let completeFriends = await friendsInfo(finalUser.friends,data) ;
      let completeFriendsReq = await friendsInfo(finalUser.friendreq,data) ;
      let completeFriendsRec = await friendsInfo(finalUser.friendrec,data) ;
      let completeNotification = notificationInfo(finalUser,data);
      let completeMessages = messagesInfo(finalUser,data);


      let response = {
        id: finalUser.id,
        name: finalUser.name,
        surname: finalUser.surname,
        email: finalUser.email,
        photo: finalUser.photo,
        friends: completeFriends,
        bio: finalUser.bio,
        friendreq: completeFriendsReq,
        friendrec: completeFriendsRec,
        messages: completeMessages,
        confirmed: finalUser.confirmed,
        notify: completeNotification,
        login_time: finalUser.login_time,
        user_token: finalUser.user_token,
        logged: finalUser.logged,
        checkSession: finalUser.checkSession,
        db_id: finalUser._id,
      }    

      

      res.send(response);
    } else{ res.send({ response: "Utente non confermato" })}
  } else {
    res.send({ response: "Nome Utente o Password Errati" });
  }
});

/* -----------------------------------------------------/LOGIN---------------------------------------------------------------------- */

/* -----------------------------------------------------CHECKSESSION---------------------------------------------------------------------- */
router.post("/checksession/:id", async (req, res) => {
  const user_id = req.params["id"];
  let data = await findFunction(collection)
  

  newReq = req.body;
  let user= await findOneFunction(collection,{ id: user_id});
  let now = Date.now() / 60000;
  let lastLogin = newReq.login_time / 60000;
  if (
    newReq.logged &&
    now - lastLogin < 20 &&
    newReq.user_token === user.user_token
  ) {
    
    
    const update = {
      $set: { login_time: Date.now(), logged: true },
    };
    const filter = { id: newReq.userId };
    await updateOneFunction(collection,filter, update);
    let finalUser = await findOneFunction(collection,{ id: user_id });

    let completeFriends = await friendsInfo(finalUser.friends,data);
    let completeFriendsReq = await friendsInfo(finalUser.friendreq,data);
    let completeFriendsRec = await friendsInfo(finalUser.friendrec,data);
    let completeNotification = notificationInfo(finalUser,data);
    let completeMessages = messagesInfo(finalUser,data);
   

    userResponse = {
      id:finalUser.userId,
      name: finalUser.name,
      surname: finalUser.surname,
      email: finalUser.email,
      photo: finalUser.photo,
      friends: completeFriends,
      bio: finalUser.bio,
      friendreq: completeFriendsReq,
      friendrec: completeFriendsRec,
      messages: completeMessages,
      confirmed: finalUser.confirmed,
      notify: completeNotification,
      login_time: finalUser.login_time,
      user_token: finalUser.user_token,
      logged: finalUser.logged,
      checkSession: finalUser.checkSession,
      db_id: finalUser._id,
    };

    res.send(userResponse);
  } else {
    const update = { $set: { logged: false } };
    const filter = { id: newReq.userId };
    await collection.updateOneFunction(filter, update);
    res.send({ logged: false });
  }
});
/* -----------------------------------------------------/CHECKSESSION---------------------------------------------------------------------- */

/* -----------------------------------------------------USER GLOBAL GET---------------------------------------------------------------------- */
router.get("/users", async (req, res) => {
  let data = await findFunction(collection);
  let results = globalUsersGet(data);
  res.send(results);
});
/* -----------------------------------------------------/USER GLOBAL GET---------------------------------------------------------------------- */

/* -----------------------------------------------------USER POST---------------------------------------------------------------------- */
router.post("/users", async (req, res) => {
  const newUserId = Date.now().toString();
  newReq = req.body;

  let data = await findFunction(collection);
  let result = data.filter((user) => user.email === newReq.email);
  if(result.length > 0){
    res.send({response:"indirizzo email già in uso."})
  } else {

    let newObject = { id: newUserId, ...newReq };
    let newUser = await insertFunction(collection,newObject,{id:newUserId});    
    res.status(200).send({response:"Controlla la tua mail per confermare il tuo Account.", id:newUser._id});
    
  }
});

/* -----------------------------------------------------/USER POST---------------------------------------------------------------------- */


/* -----------------------------------------------------USER CONFIRMATION---------------------------------------------------------------------- */
router.post('/confirmation', async (req,res) =>{
  let newReq = req.body
  let newUser = await findOneFunction(collection,{ _id :ObjectId(newReq.id)});
  if(!newUser.confirmed){
    let filter = { _id :ObjectId(newReq.id)}
    let update = {$set : {confirmed:true}}
    await updateOneFunction(collection,filter, update);   
    
    res.send({response:"utente confermato"})

  } else {res.send({response:"Link Scaduto"})}
})


/* -----------------------------------------------------/USER CONFIRMATION---------------------------------------------------------------------- */



/* -----------------------------------------------------USER SINGLE GET---------------------------------------------------------------------- */

router.get("/users/:id", async (req, res) => {
  const user_id = req.params["id"];

  let data = await findFunction(collection);
  let user = await findOneFunction(collection,{ id: user_id});

  let completeFriends = await friendsInfo(user.friends,data);

  user = {
    id: user.id,
    name: user.name,
    surname: user.surname,
    email: user.email,
    photo: user.photo,
    friends: [completeFriends],
    bio: user.bio,
    confirmed: user.confirmed,
    login_time: user.login_time,
  };
  res.send(user);
});

/* -----------------------------------------------------/USER SINGLE GET---------------------------------------------------------------------- */

/* -----------------------------------------------------USER SINGLE PATCH---------------------------------------------------------------------- */
router.patch("/users/:id", async (req, res) => {
  const userId = req.params["id"];
  newReq = req.body

  let data = await findFunction(collection);
  let result = data.filter((user) => user._id.toString() === newReq._id);   

  if(result){
    newObject ={
    name:newReq.name,
    surname:newReq.surname,
    email:newReq.email,
    photo:newReq.photo,
    bio:newReq.bio
    }
    
    const update = { $set: newObject };
    const filter = { _id :ObjectId(newReq._id)};
    await updateOneFunction(collection,filter, update);
    res.send([{ response_: `user id:${userId} updated` }]);
  } else {res.send({response:"accesso non autorizzato"})}
  
});
/* -----------------------------------------------------/USER SINGLE PATCH---------------------------------------------------------------------- */

/* -----------------------------------------------------USER SINGLE DELETE---------------------------------------------------------------------- */
router.delete("/users/:id", async (req, res) => {
  const user_id = req.params["id"];
  await deleteFunction(collection,{ id: user_id });
  res.status(200).send([{ response_: `user id:${userId} removed` }]);
});
/* -----------------------------------------------------/USER SINGLE DELETE---------------------------------------------------------------------- */

/* -----------------------------------------------------SEND FRIEND REQUEST---------------------------------------------------------------------- */

router.post("/sendfriendrequest", async (req, res) => {
  let newReq = req.body;
  const myId = newReq.myId;
  const friendId = newReq.friendId;
  let me = await findOneFunction(collection,{ id: myId });
  let friend = await findOneFunction(collection,{ id: friendId });
  const updateMe = { $set: { friendreq: [...me.friendreq, friendId] } };
  const updateFriend = {
    $set: { 
      friendrec: [...friend.friendrec, myId], 
      notify: [...friend.notify,userNotify(myId,"friendrec")]
    }
  };

  if (me.friendreq.includes(friendId) || me.friendrec.includes(friendId)) {
    res.send([{ response_: "Richiesta Già Inviata!" }]);
  } else if (me.friends.includes(friendId)) {
    res.send([{ response_: "Gli Utenti sono Già Amici!" }]);
  } else {
    const filterMe = { id: myId };
    await updateOneFunction(collection,filterMe, updateMe);
    const filterFriend = { id: friendId };
    await updateOneFunction(collection,filterFriend,updateFriend);
    res.send([{ response_: "richiesta di amicizia inviata" }]);
  }
});
/* -----------------------------------------------------/SEND FRIEND REQUEST---------------------------------------------------------------------- */

/* -----------------------------------------------------CONFIRM FRIEND REQUEST---------------------------------------------------------------------- */

router.post("/confirmfriendrequest", async (req, res) => {
  let newReq = req.body;
  const myId = newReq.myId;
  const friendId = newReq.friendId;
  let me = await findOneFunction(collection,{ id: myId });
  let friend = await findOneFunction(collection,{ id: friendId });
  const updateMe = {
    $set: { friendrec: [...me.friendrec.filter((rec) => rec !== friendId)] },
  };
  const updateFriend = {
    $set: { friendreq: [...friend.friendreq.filter((requ) => requ !== myId)] },
  };
  const addFriendToMe = { $set: { friends: [...me.friends, friendId] } };
  const addMeToFriend = {
    $set: {
      friends: [...friend.friends, myId],
      notify: [
        ...friend.notify,userNotify(myId,"friendConfirmed")]
    }
  };

  async function clearReqRec() {
    const filterMe = { id: myId };
    await usersCollection.updateOne( collection, filterMe, updateMe);
    const filterFriend = { id: friendId };
    await usersCollection.updateOneFunction( collection, filterFriend, updateFriend);
  }

  switch (newReq.confirmed) {
    case true:
      clearReqRec();
      await updateOneFunction( collection, { id: myId }, addFriendToMe);
      await updateOneFunction( collection, { id: friendId }, addMeToFriend);

      res.send([{ response: "accettato" }]);
      break;
    case false:
      clearReqRec();

      res.send([{ response: "rifiutato" }]);
      break;
  }
});

/* -----------------------------------------------------/CONFIRM FRIEND REQUEST---------------------------------------------------------------------- */

/* -----------------------------------------------------GET FRIENDS---------------------------------------------------------------------- */
router.post("/getfriends", async (req, res) => {
  newReq = req.body;

  let friends = [];
  let data = await findFunction(collection);
  data.forEach((user) => {
    user = {
      id: user.id,
      name: user.name,
      surname: user.surname,
      email: user.email,
      photo: user.photo,
      friends: user.friends,
      bio: user.bio,
      cover: user.cover,
      login_time: user.login_time,
    };
    friends.push(user);
  });
  const result = friends.filter((item) => [...newReq].includes(item.id));

  res.send(result);
});
/* -----------------------------------------------------/GET FRIENDS---------------------------------------------------------------------- */

/* -----------------------------------------------------NOTIFICATION MANAGER---------------------------------------------------------------------- */

router.post("/notificationmanager", async (req, res) => {
  newReq = req.body;

  if (newReq.type === "delete") {
    newReq.notification_id.map((not) =>
      usersCollection.updateOne(
        { id: newReq.userId },
        { $pull: { notify: { notify_id: not } } }
      )
    );
    const response = [{ response: "notifiche cancellate con successo" }];
    res.send(response);
  } else if (newReq.type === "patch") {
    const user = await findOneFunction(collection,{ id: newReq.userId });

    let finalResult = [];

    user.notify.map((not) => finalResult.push({ ...not, read: true }));
    await updateOneFunction(collection, { id: newReq.userId }, { $set: { notify: finalResult }} );

    const response = [{ response: "notifiche aggiornate con successo" }];
    res.send(response);
  }
});

/* -----------------------------------------------------/NOTIFICATION MANAGER---------------------------------------------------------------------- */

/* -----------------------------------------------------SEARCHBAR---------------------------------------------------------------------- */
router.post("/searchbar", async (req, res) => {
  newReq = req.body;

  let data = await findFunction(collection);
  
  let query = newReq.text.replace(/\s/g, "");
  let queryed = []
  data.forEach(async (user) => {
    let completeFriends = await friendsInfo(user.friends,data);

    user = {
      id: user.id,
      queryName: user.name + user.surname,
      name: user.name,
      surname: user.surname,
      photo: user.photo,
      friends: completeFriends,
      bio: user.bio,
      cover: user.cover,
      confirmed: user.confirmed,
      login_time: user.login_time,
    };

    queryed.push(user);
  });

  const filtered = queryed.filter((user) => user.id !== newReq.author_id);
  const finalUser = filtered.filter((user) => user.queryName.toLocaleLowerCase().search(query.toLocaleLowerCase()) > -1 );
  
  if (finalUser.length > 0) {
    res.send(finalUser);
  } else {
    res.send([{ response: "nessun utente trovato" }]);
  }
});

/* -----------------------------------------------------/SEARCHBAR---------------------------------------------------------------------- */

/* -----------------------------------------------------RANDOMUSER---------------------------------------------------------------------- */
router.post("/randomusers", async (req, res) => {
  newReq = req.body;
  let data = await findFunction(collection);
  let result = []
  const me = await findOneFunction(collection,{ id: newReq.userId });
  data.forEach((user) => {
    user = {
      id: user.id,
      name: user.name,
      surname: user.surname,
      photo: user.photo,
      friends: user.friends,
      bio: user.bio,
      cover: user.cover,
      confirmed: user.confirmed,
    };
    result.push(user);
  });
  let filtered = [];
  if (me.friends.length > 0) {
    me.friends.map(
      (friend) =>
        (filtered = result.filter((user) =>  user.id !== newReq.userId && user.id !== friend ))
    );
  } else {
    filtered = result.filter( (user) => user.id !== newReq.userId );
  }

  const shuffled = filtered.sort(() => 0.5 - Math.random());
  let selected = shuffled.slice(0, 4);
  

  if (selected.length > 0) {
    res.send(selected);
  } else {
    res.send([]);
  }
});
/* -----------------------------------------------------/RANDOMUSER---------------------------------------------------------------------- */

/* -----------------------------------------------------MESSAGES---------------------------------------------------------------------- */
router.post("/instantmessage", async (req, res) => {
  action = req.body;
  const me = await findOneFunction(collection,{ id: action.my_id });
  const friend = await findOneFunction(collection,{ id: action.friend_id });  

  if (me.messages[friend.id]) {    
    
    let myNewMessageForMe = messageBody(action.my_id,action.text,true) 

    const filterMe = { id: action.my_id };

   let finalMessage = { ...me.messages, [friend.id]:[...me.messages[friend.id],myNewMessageForMe ]} 
    updateMe = {
      $set: { messages: finalMessage},
    };
    
    await updateOneFunction(collection,filterMe, updateMe);

  }else {

    const filterMe = { id: action.my_id };
    updateMe = {
      $set: {
        messages: { ...me.messages, [friend.id]: [ messageBody(me.id,action.text,true) ]}
      }
    };
    
    
    await updateOneFunction(collection, filterMe, updateMe);    
  } 
  
  if (friend.messages[me.id]) {

    let myNewMessage = messageBody(action.my_id,action.text,false);    
    
    let finalMessage = { ...friend.messages, [me.id]:[...friend.messages[me.id], myNewMessage]};
    const filterFriend = { id: action.friend_id };
    updateFriend = { $set: {messages: finalMessage} };

    await updateOneFunction(collection, filterFriend, updateFriend );

  } else {
    
    const filterFriend = { id: action.friend_id };
    updateFriend = {
      $set: {
        messages: { ...friend.messages,[me.id]: [ messageBody(me.id,action.text,false) ]},
      }
    };

    await updateOneFunction(collection,filterFriend,updateFriend);    
  } 

  const finalMe = await findOneFunction(collection,{ id: action.my_id });
  const finalFriend = await findOneFunction(collection,{ id: action.friend_id });
  res.send({ me: finalMe, friend: finalFriend });
});

/* -----------------------------------------------------/MESSAGES---------------------------------------------------------------------- */

/* -----------------------------------------------------READ MESSAGES---------------------------------------------------------------------- */
router.post("/readmessages", async (req, res) => {
  action = req.body;
  const me = await findOneFunction(collection,{ id: action.my_id });
  const friend = await findOneFunction(collection,{ id: action.friend_id });


  if(me.messages[action.friend_id]){
   
    let read = me.messages[action.friend_id].map((element) =>({...element,read:true}));     
 
    const filterMe = { id: action.my_id };
    updateMe = { $set: { messages: { ...me.messages, [action.friend_id]: read }}};    
 
    await updateOneFunction(collection,filterMe, updateMe);     
     
    res.send([{ response: "update effettuato correttamente" }]);  
  } else {res.send([{ response: "chat non trovata" }])}
});

/* -----------------------------------------------------/READ MESSAGES---------------------------------------------------------------------- */

/* -----------------------------------------------------DELETE MESSAGES---------------------------------------------------------------------- */

router.post("/deletemessages", async (req, res) => {
  newReq = req.body;

  const user = await findOneFunction(collection,{ id: newReq.userId });
  let myMessages = user.messages;
  newReq.chatId.map((element) => delete myMessages[element]);

  await updateOneFunction(collection, { id: newReq.userId }, { $set: { messages: myMessages }} );
  res.send([{ response: "chat eliminata con successo" }]);
});

/* -----------------------------------------------------/DELETE MESSAGES---------------------------------------------------------------------- */




/* -----------------------------------------------------------------EXPORT-------------------------------------------------------------------- */

module.exports = router;
