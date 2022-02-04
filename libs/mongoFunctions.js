require('dotenv').config({path: '.env'});
const { MongoClient, ObjectId, ObjectID } = require("mongodb");
const uri = process.env.NODE_HEROKU_URI_KEY;

const dbURI = `mongodb+srv://feisbrut:${uri}@fesibrut-api.dkfxl.mongodb.net/posts?retryWrites=true&w=majority`;
const mongoClient = new MongoClient(dbURI);
const dbURI2 = `mongodb+srv://feisbrut:${uri}@fesibrut-api.dkfxl.mongodb.net/users?retryWrites=true&w=majority`;
const mongoClient2 = new MongoClient(dbURI2);

let feisbrutDB, postsCollection,usersCollection;


async function findOneFunction(collection,filter){
    let user = await feisbrutDB.collection(collection).findOne(filter);
    return user
 
}
async function updateOneFunction(collection,filter,update){
    await feisbrutDB.collection(collection).updateOne(filter,update);
    
 
}
async function findFunction(collection){
    
    let data = [];
    const cursor = feisbrutDB.collection(collection).find({});
    await cursor.forEach((user) => data.push(user));
    return data
}
async function insertFunction(collection,obj,filter){
    
    const ris = await feisbrutDB.collection(collection).insertOne(obj);
    let newUser = {}
    if (ris.acknowledged) {
      newUser = findOneFunction(collection,filter);       
    }
    return newUser;
}
async function deleteFunction(collection,filter){
    await feisbrutDB.collection(collection).deleteOne(filter);
}


/* --------------------------------------------------------------CONNECTIONS------------------------------------------------------------------------ */
async function run1() {
    await mongoClient.connect();
    console.log("siamo connessi con atlas Post!");
    console.log("siamo connessi con atlas Users!");
  
    feisbrutDB = mongoClient.db("feisbrut");
    postsCollection = feisbrutDB.collection("posts");
    usersCollection = feisbrutDB.collection("users");
  }
  
  
  run1().catch((err) => console.log("Errore" + err));
 

  /* --------------------------------------------------------------/CONNECTIONS------------------------------------------------------------------------ */

    /* --------------------------------------------------------------EXPORT------------------------------------------------------------------------ */
  module.exports = {
      findOneFunction,
      updateOneFunction,
      findFunction,
      insertFunction,
      deleteFunction
  }