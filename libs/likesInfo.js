

const likesInfo = (post,users) => {
    let result = post.likes.map((like) => {
        const newUser = users.filter((user) => like === user.id);
        newLike = {
          authorId: like,
          authorName: newUser[0].name,
          authorSurname: newUser[0].surname,
          authorPhoto: newUser[0].photo,
          authorAlias : newUser[0].bio.alias,
        };
        return newLike;
      })
      return result
}

module.exports = {
    likesInfo
}