define(['jquery','react', 'showdown'], function($, React, Showdown){

	"use strict";
	
	var CommentBox = React.createClass({displayName: "CommentBox",
		loadCommentsFromServer: function(){
		
			$.ajax({
				url: this.props.url,
				dataType: 'json',
				success: function(data){
					this.setState({data:data});
				}.bind(this),
				error: function(xhr, status, err){
					console.error(this.props.url, status, err.toString());
				}.bind(this)
			});	
		},
		handleCommentSubmit: function(){
			var comments = this.state.data;
			var newComments = comments.concat([comment])
			this.setState({data:newComments});
		
			$.ajax({
				url: this.props.url,
				dataType: 'json',
				type: 'POST',
				data: comment,
				success: function(data){
					this.setState({data:data});
				}.bind(this),
				error: function(xhr, status, err){
					console.error(this.props.url, status, err.toString());
				}.bind(this)
			});
		},
		getInitialState: function(){
			return {data:[]};
		},
		componentDidMount: function(){
			this.loadCommentsFromServer();
			setInterval(this.loadCommentsFromServer, this.props.pollInterval);
		},
		render: function(){
			return (
				React.createElement("div", {className: "commentBox"}, 
					React.createElement("h1", null, " Comments! "), 
					React.createElement(CommentList, {data: this.state.data}), 
					React.createElement(CommentForm, {onCommentSubmit: this.handleCommentSubmit})
				)
			);
		}
	});

	var CommentList = React.createClass({displayName: "CommentList",
		render: function(){
			var commentNodes = this.props.data.map(function(comment){
				return(
					React.createElement(Comment, {author: comment.author}, 
					comment.text
					)
				)
			});
			return (
				React.createElement("div", {className: "commentList"}, 
					commentNodes
				)
			);
		}
	});

	var CommentForm = React.createClass({displayName: "CommentForm",
		handleSubmit: function(e){
			e.preventDefault();
			var author = this.refs.author.getDomNode().value().trim();
			var text = this.refs.text.getDOMNode().value.trim();
			if (!text || !author){
				return;
			}
			//TODO: send request to the server
			this.props.onCommentSubmit({author:author, text:text});
			this.refs.author.getDOMNode().value = '';
			this.refs.text.getDOMNode().value = '';
		
		},
		render: function(){
			return (
				React.createElement("form", {className: "commentForm", onSubmit: this.handleSubmit}, 
					React.createElement("input", {type: "text", placeholder: "your name", ref: "author"}), 
					React.createElement("input", {type: "text", placeholder: "say something", ref: "text"}), 
					React.createElement("input", {type: "submit", value: "Post"})
				)
			);
		}
	});

	var converter = new Showdown.converter();

	var Comment = React.createClass({displayName: "Comment",
		render: function(){
			var rawmarkup = converter.makeHtml(this.props.children.toString())
			return (
				React.createElement("div", {className: "comment"}, 
					React.createElement("h2", {className: "commentAuthor"}, 
						this.props.author
					), 
					React.createElement("span", {dangerouslySetInnerHTML: {__html:rawmarkup}})
				)
			);
		}
	});

	var init = function(){
		React.render(
			React.createElement(CommentBox, {url: "../comments.json", pollInterval: 2000}), document.getElementById('content')
		);
	}
	
	return{
		init: init
	}
});