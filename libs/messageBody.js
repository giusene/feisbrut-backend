const messageBody = (author_id,text) =>{
    let message = {
        author: author_id,
        date: new Date().toISOString(),
        text: text,
        read: false,
      }
    return message
}

module.exports = {
    messageBody
}