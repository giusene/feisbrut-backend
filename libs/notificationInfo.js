function notificationInfo(user,data){
    let notifyId = user.notify.map((not) => not.who);
    let friendsNot = [];
    notifyId.forEach((element) =>
      data.map((friend) => {
        if (friend.id === element) {
          let newFriend = {
            name: friend.name,
            surname: friend.surname,
            photo: friend.photo,
            id: friend.id,
          };
          friendsNot.push(newFriend);
        }
      })
    );
    const ids = friendsNot.map((o) => o.id);
    const filtered = friendsNot.filter(
      ({ id }, index) => !ids.includes(id, index + 1)
    );

    let myNotify = [];
      let iteration4 = [...user.notify].map((not) => myNotify.push(not));
      let finalNotify = myNotify.map((not) => {
        return (
          newNot = {
            ...not,
            user: filtered.filter((friend) => friend.id === not.who),
        });
      });

      return finalNotify
}
module.exports = {
    notificationInfo
}