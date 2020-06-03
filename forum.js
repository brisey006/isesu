const Post = require('./models/post');
const User = require('./models/User');
const Comment = require('./models/comment');


module.exports = (socket, client) => {
    console.log('User connected');
    
    socket.on('newForum', async (data) => {
        try{
            const { comment, id, postId } = data;
            let commentObj = Comment({ comment });
            const user = await User.findById(id);
            const post = await Post.findById(postId);
    
            commentObj.creator = user._id;
            commentObj.post = post._id;
            post.threads.push(commentObj);
            const savedComment = await commentObj.save();
            await post.save();
            client.emit('output', savedComment);
        } catch(err) {
            console.log(err.message);
        }
    });
}