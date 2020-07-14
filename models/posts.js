const marked = require("marked")
const Post = require("../lib/mongo").Post

Post.plugin("contentToHtml",{
    afterFind:function(posts){
        return posts.map(function(post){
            post.content = marked(post.content)
            return post
        })
    },
    afterFindOne: function(post){
        if(post){
            post.content = marked(post.content)
        }
        return post
    }
})

module.exports = {
    create: function create(post){
        return Post.create(post).exec()
    },
    getPostById:function getPostById(postId){
        return Post
        .findOne({_id: postId})
        .populate({path:'author',model:'User'})
        .addCreatedAt()
        .contentToHtml()
        .exec()
    }
}