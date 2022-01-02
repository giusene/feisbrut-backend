const express = require("express");
const path = require("path");
const PORT = process.env.PORT || 5000;
const bodyParser = require("body-parser");

const cors = require("cors");
const postsRouter = require("./routes/posts");
const usersRouter = require("./routes/users");
const homePageRouter = require("./routes/home")

express()
  .use(cors())
  .use(bodyParser.json())
  .use(express.static(path.join(__dirname, "public")))
  .use(bodyParser.urlencoded({ extended: true }))
  .set("views", path.join(__dirname, "views"))
  .set("view engine", "ejs")
  .use(homePageRouter)
  .use(usersRouter)
  .use(postsRouter)
  
  

  .listen(PORT, () => console.log(`Listening on ${PORT}`));

express();
