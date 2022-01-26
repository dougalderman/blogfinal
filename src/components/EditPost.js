import { API, Auth, graphqlOperation } from 'aws-amplify';
import React, { Component } from 'react';
import { updatePost } from '../graphql/mutations';

class EditPost extends Component {

  postDataBeforeUpdate = {}

  constructor(props) {
    super(props);
    this.state = {
      show: false,
      id: '',
      postOwnerId: '',
      postOwnerUsername: '',
      postTitle: '',
      postBody: '',
      postData: {
        postTitle: this.props.postTitle,
        postBody: this.props.postBody
      }
    }
  }  

  openModal = () => {
    this.setState({ show: true});
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
    this.postDataBeforeUpdate = JSON.parse(JSON.stringify(this.state.postData));
  } 
  
  closeModalWithoutSaving = () => {
    this.setState({ show: false});
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
    this.setState({
      postData: this.postDataBeforeUpdate
    });
  }
 
  handleUpdatePost = async (event) => {
    event.preventDefault();
    
    const input = {
      id: this.props.id,
      postOwnerId: this.state.postOwnerId,
      postOwnerUsername: this.state.postOwnerUsername,
      postTitle: this.state.postData.postTitle,
      postBody: this.state.postData.postBody
    };

    await API.graphql(graphqlOperation(updatePost, { input }));

    // force close the modal
    this.setState({ show: !this.state.show});
  }

  handleTitle = event => {
    this.setState({
      postData: {...this.state.postData, postTitle: event.target.value}
    });
  }

  handleBody = event => {
    this.setState({ 
      postData: {...this.state.postData, postBody: event.target.value}
    });
  }

  componentDidMount = async () => {
    await Auth.currentUserInfo()
      .then(user => {
        this.setState({
          postOwnerId: user.attributes.sub,
          postOwnerUsername: user.username
        })
      })
  }

  render() {
    return (
      <>
        { this.state.show && (
          <div className="modal">
            <button className = "close"
              onClick={() => this.closeModalWithoutSaving()}>
              X
            </button>

            <form className="add-post"
              onSubmit={(event) => this.handleUpdatePost(event)}>

              <input style={{fontSize: "19px"}}
                type="test" placeholder="Title"
                name="postTitle"
                value={this.state.postData.postTitle}
                onChange={this.handleTitle}/>

              <input style={{height: "150px", fontSize: "19px"}}
                type="text" placeholder="Body"
                name="postBody"
                value={this.state.postData.postBody}
                onChange={this.handleBody}/>

              <input />

              <button>Update Post</button>

            </form>

          </div>
        )}

        <button onClick={() => this.openModal()}>Edit</button>
      </>
    )
  }
}
export default EditPost;