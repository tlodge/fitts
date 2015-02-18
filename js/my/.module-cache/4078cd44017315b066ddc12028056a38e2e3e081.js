define(['jquery','react', 'showdown'], function($, React, Showdown){

	"use strict";
	
	var ResultsBox = React.createClass({displayName: "ResultsBox",
		
		loadResultsFromStorage: function(){
			var experiments = window.localStorage.getObject("experiment");
			console.log("loaded results from storage!");
			console.log(experiments);
			this.setState({data:experiments})
		},
		handleExperimentSelected: function(experiment, something){
			console.log("I have been clicked!!");
			console.log(this.refs);
			console.log(experiment);
			console.log(something);
		},
		getInitialState: function(){
			return {data:[]};
		},
		componentDidMount: function(){
			this.loadResultsFromStorage();
			//setInterval(this.loadCommentsFromServer, this.props.pollInterval);
		},
		render: function(){
			return (
				React.createElement("div", {className: "results"}, 
					React.createElement("h1", null, " Results "), 
					React.createElement(ResultNav, {data: this.state.data, experimentSelected: this.handleExperimentSelected})
					
				)
			);
		}
	});

	var ResultNav= React.createClass({displayName: "ResultNav",
		
		handleClick: function(item){
			console.log(item);
		},
		
		render: function(){
			var resultNodes = this.props.data.map(function(experiment){
				return(
					React.createElement(NavItem, {name: experiment.name})
				)
			});
			return (
				React.createElement("ul", {className: "nav nav-pills"}, 
					resultNodes
				)
			);
		}
	});

	var NavItem = React.createClass({displayName: "NavItem",
		
		clicked: function(){
			console.log(this.props.name);
		},
		
		render: function(){
			console.log("rendering");
			console.log(this.props);
			return(
				React.createElement("li", null, React.createElement("a", {href: "#", ref: "navItem", onClick: clicked}, this.props.name))
			);
		}
		
	});
	
	var init = function(){
		React.render(
			React.createElement(ResultsBox, {key: "experiments", pollInterval: 2000}), document.getElementById('content')
		);
	}
	
	return{
		init: init
	}
});