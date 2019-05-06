import React, {Component} from 'react';
import './App.css';
import {listBlogs} from './graphql/queries'
import {onCreateBlog} from './graphql/subscriptions'
import {createBlog} from './graphql/mutations'
import {API, graphqlOperation} from 'aws-amplify'
import {withAuthenticator} from 'aws-amplify-react';
import titles from './randomTitles';

class App extends Component {

    constructor(props) {
        super(props);
        this.state = {
            blogs: []
        }
    }

    componentDidMount() {
        this.loadBlogsList();
        this.subscribeToNewBlogs();
    }

    subscribeToNewBlogs() {
        API.graphql(graphqlOperation(onCreateBlog))
            .subscribe({
                next: (event) => {
                    this.setState({
                        blogs: this.state.blogs.concat(event.value.data.onCreateBlog)
                    })
                }
            })
    }

    loadBlogsList() {
        API.graphql(graphqlOperation(listBlogs))
            .then(x => this.setState({
                blogs: x.data.listBlogs.items
            }));
    }

    addRandomBlog() {
        API.graphql(graphqlOperation(createBlog, {
            input: {
                name: titles[Math.floor(Math.random() * titles.length)]
            }
        }));
    }

    render() {
        return (
            <div className="App">
                <button onClick={this.addRandomBlog}>Add new blog</button>
                <BlogList blogs={this.state.blogs}/>
            </div>
        );
    }
}

const BlogList = ({blogs}) => (
    <div>
        <h3>All Blogs</h3>
        <div>
            {blogs.map(blog => <p key={blog.id}>{blog.name}</p>)}
        </div>
    </div>
);

export default withAuthenticator(App);
