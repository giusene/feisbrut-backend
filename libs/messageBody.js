const messageBody = (author_id,text,toRead) =>{
    let message = {
        author: author_id,
        date: new Date().toISOString(),
        text: text,
        read: toRead,
      }
    return message
}

module.exports = {
    messageBody
}