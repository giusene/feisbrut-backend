function globalUsersGet(data){
    let results = []

    data.forEach((user) => {
        user = {
          id: user.id,
          name: user.name,
          surname: user.surname,
          email: user.email,
          photo: user.photo,
          friends: user.friends,
          bio: user.bio,
          confirmed: user.confirmed,
        };
        results.push(user);
    })
    return results
}

module.exports = {
    globalUsersGet
}