async function friendsInfo(userArray,data){
    console.log(userArray)
    let myFriends = [];
      let iteration = userArray.map((friendsId) =>
        data.filter((friend) => friend.id === friendsId)
      );
      iteration.map((user) => {
        user.map((friend) => myFriends.push(friend));
      });
      let myFinalFriends = myFriends.map((friend) => {
        return (friend = {
          name: friend.name,
          surname: friend.surname,
          photo: friend.photo,
          id: friend.id,
          login_time: friend.login_time,
          bio: friend.bio,
        });
      });

      return myFinalFriends;
}



module.exports = {
    friendsInfo
}