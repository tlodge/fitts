define(['jquery','react', 'showdown'], function($, React, Showdown){

	"use strict";
	
	var ResultsBox = React.createClass({displayName: "ResultsBox",
		
		loadResultsFromStorage: function(){
			var experiments = window.localStorage.getObject("experiment");
			console.log("loaded results from storage!");
			console.log(experiments);
			this.setState({data:experiments})
		},
		handleExperimentSelected: function(experiment){
			console.log("a new experiment has been selected!");
			console.log(experiment);
		},
		getInitialState: function(){
			return {data:[], parameters:[]};
		},
		componentDidMount: function(){
			this.loadResultsFromStorage();
			//setInterval(this.loadCommentsFromServer, this.props.pollInterval);
		},
		render: function(){
			return (
				React.createElement("div", {className: "results"}, 
					React.createElement("h1", null, " Results "), 
					React.createElement(ResultNav, {data: this.state.data, experimentSelected: this.handleExperimentSelected}), 
					React.createElement(ExperimentParameters, {data: this.state.parameters})
				)
			);
		}
	});

	var ExperimentParameters = React.createClass({displayName: "ExperimentParameters",
		render: function(){
			return (
				React.createElement("p", null, "hello")
			)
		}
	});
	
	var ResultNav= React.createClass({displayName: "ResultNav",
		
		handleSelected: function(item){
			this.props.experimentSelected(item);
		},
		
		render: function(){
			var self = this;
			var resultNodes = this.props.data.map(function(experiment){
				return(
					React.createElement(NavItem, {name: experiment.name, handleSelected: self.handleSelected})
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
			this.props.handleSelected(this.props.name);
		},
		
		render: function(){
			return(
				React.createElement("li", null, React.createElement("a", {href: "#", ref: "navItem", onClick: this.clicked}, this.props.name))
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