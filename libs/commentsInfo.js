

const commentsInfo = (post,users) => {
    let result = post.comments.map((comment) => {
        const newUser = users.filter((user) => comment.authorId === user.id);
        comment = {
          ...comment,
          authorName: newUser[0].name,
          authorSurname: newUser[0].surname,
          authorPhoto: newUser[0].photo,
          authorAlias : newUser[0].bio.alias,
        };
        return comment;
      })
      return result
}

module.exports = {
    commentsInfo
}