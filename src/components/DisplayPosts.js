import React, { Component } from 'react';
import { listPosts, listComments } from '../graphql/queries';
import { API, graphqlOperation } from 'aws-amplify';
import DeletePost  from './DeletePosts';
import EditPost from './EditPost';
import CreateCommentPost from './CreateCommentPost';
import CommentPost from './CommentPost';
import { onCreatePost, onDeletePost, onUpdatePost, onCreateComment } from '../graphql/subscriptions';

class DisplayPosts extends Component {
  
  constructor(props) {
    super(props);
    this.state = {
      posts: [],
      comments: []
    }
  }

  componentDidMount = async () => {

    this.getPosts();
    this.getComments();

    this.createPostListener = API.graphql(graphqlOperation(onCreatePost))
      .subscribe({
        next: postData => {
          const newPost = postData.value.data.onCreatePost;
          const prevPosts = this.state.posts.filter(post => post.id !== newPost.id);
          const updatedPosts = [newPost, ...prevPosts]

          this.setState({ posts: updatedPosts});
        }
      });

      this.deletePostListener = API.graphql(graphqlOperation(onDeletePost))
        .subscribe({
          next: postData => {

            const deletedPost = postData.value.data.onDeletePost;
            const updatedPosts = this.state.posts.filter(post => post.id !== deletedPost.id);
            this.setState({posts: updatedPosts});

          }
        });

        this.updatePostListener = API.graphql(graphqlOperation(onUpdatePost))
          .subscribe({
            next: postData => {

              const { posts } = this.state;
              const updatePost = postData.value.data.onUpdatePost;
              const index = posts.findIndex(post => post.id === updatePost.id);
              if (index !== -1) {
                const updatedPosts = [
                  ...posts.slice(0, index),
                  updatePost,
                  ...posts.slice(index + 1)
                ];
                this.setState({posts: updatedPosts});
              }   
            }  
          });

        this.createPostCommentListener = API.graphql(graphqlOperation(onCreateComment))
          .subscribe({
            next: commentData => {
              const createdComment = commentData.value.data.onCreateComment;
              const posts = [...this.state.posts];
              let comments = [...this.state.comments];

              for (let post of posts) {
                if (createdComment.postCommentsId === post.id) {
                  comments.push(createdComment);
                }
              }

              this.setState({comments});
            }
          })
  }

  componentWillUnmount() {
    this.createPostListener.unsubscribe();
    this.deletePostListener.unsubscribe();
    this.updatePostListener.unsubscribe();
    this.createPostCommentListener.unsubscribe();
  }

  getPosts = async () => {
    const resultListPosts = await API.graphql(graphqlOperation(listPosts));
    
    this.setState({ posts: resultListPosts.data.listPosts.items})
  }

  getComments = async (post, index) => {
    const resultListComments = await API.graphql(graphqlOperation(listComments));

    this.setState({ comments: resultListComments.data.listComments.items })
  }
  
  render() {
    const { posts, comments }  = this.state;
    
    return posts.map(( post ) => {

      let commentsForThisPost = [];

      if (comments.length && comments.length > 0) {
        for (const comment of comments) {
          if (comment.postCommentsId === post.id) {
            commentsForThisPost.push(comment);
          } 
        }
      }

      return (
        <div className="posts" style={rowStyle} key={ post.id }>
          <h1> { post.postTitle }</h1>
          <span style={{ fontStyle: "italic", color: "#0ca5e297" }}>
            { "Wrote by: " } { post.postOwnerUsername }

            { " on  "}
            <time style={{ fontStyle: "italic" }}>
              { " " }
              { new Date(post.createdAt).toDateString() }
            </time>
          </span>

          <p>
            { post.postBody }
          </p>

          <br />

          <span>
            <DeletePost data={post}/>
            <EditPost {...post} />
          </span>

          <span>
            <CreateCommentPost postId={post.id}/>
            {commentsForThisPost.length > 0 && <span style={{fontSize: "19px", color:"gray"}}>
              Comments: </span>}

                {commentsForThisPost.length > 0 && commentsForThisPost.map((comment) =>
                  <CommentPost key={comment.id} commentData={comment}/>)}
          </span> 
        </div>
      );
    });
  }
}

const rowStyle = {
  background: '#f4f4f4',
  padding: '10px',
  border: '1px #ccc dotted',
  margin: '14px'
}
export default DisplayPosts;
