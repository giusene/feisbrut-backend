const notify = (sender_id,type,post_id) =>{
    let notification = {
        type: `${type}`,
        who: `${sender_id}`,
        date: new Date().toISOString(),
        read: false,
        postID:post_id,
        notify_id:Date.now().toString()
      }
    return notification
}
const userNotify = (sender_id,type) =>{
    let notification = {
        type: `${type}`,
        who: `${sender_id}`,
        date: new Date().toISOString(),
        read: false,        
        notify_id:Date.now().toString()
      }
    return notification
}

module.exports = {
    notify,
    userNotify
}