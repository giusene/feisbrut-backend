const messageBody = (author_id,text) =>{
    let message = {
        author: friendDestination,
        date: new Date().toISOString(),
        text: action.text,
        read: false,
      }
    return message
}

module.exports = {
    messageBody
}