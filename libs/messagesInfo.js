function messagesInfo(user,data){
    let newMessages = {};
    Object.keys(user.messages).forEach((single) => {
      const friendFinder = data.filter((friend) => friend.id === single);
      newMessages = {
        ...newMessages,
        [single]: {
          discussion: user.messages[single],
          user: {
            name: friendFinder[0].name,
            surname: friendFinder[0].surname,
            photo: friendFinder[0].photo,
            id: friendFinder[0].id,
            login_time: friendFinder[0].login_time
          },
        },
      };
    });
    return newMessages;
}
module.exports = {
    messagesInfo
}