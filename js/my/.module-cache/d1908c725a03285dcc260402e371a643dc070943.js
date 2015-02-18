define(['jquery','react', 'showdown'], function($, React, Showdown){

	"use strict";
	
	var ResultsBox = React.createClass({displayName: "ResultsBox",
		
		experiments: [],
		
		loadResultsFromStorage: function(){
			this.experiments = window.localStorage.getObject("experiment");
			this.setState({data:this.experiments})
		},
		handleExperimentSelected: function(experiment){
			var idx = this.experiments.map(function(experiment){return experiment.name}).indexOf(experiment);
			if (idx != -1){
				var experiment = this.experiments[idx];
				this.setState({experiment:experiment});
			} 
		},
		getInitialState: function(){
			return {data:[], experiment:{}};
		},
		componentDidMount: function(){
			this.loadResultsFromStorage();
			setInterval(this.loadCommentsFromServer, this.props.pollInterval);
		},
		render: function(){
			return (
				React.createElement("div", {className: "results"}, 
					React.createElement("h1", null, " Results "), 
					React.createElement(ResultNav, {data: this.state.data, experimentSelected: this.handleExperimentSelected}), 
					React.createElement(ExperimentParameters, {experiment: this.state.experiment}), 
					React.createElement(ExperimentResults, {experiment: this.state.experiment})
				)
			);
		}
	});


	var ResultLine = React.createClass({displayName: "ResultLine",
		render: function(){
			return(
				React.createElement("tr", null, 
					React.createElement("th", null, this.props.line.duration), 
					React.createElement("th", null, this.props.line.targetpos), 
					React.createElement("th", null, this.props.line.targetmm), 
					React.createElement("th", null, this.props.line.targetpx), 
					React.createElement("th", null, this.props.line.touchpos), 
					React.createElement("th", null, this.props.line.pxdistance), 
					React.createElement("th", null, this.props.line.mmdistance)
				)
			)
		}
	});

	
	var ExperimentResults = React.createClass({displayName: "ExperimentResults",
		
						
		render: function(){
			
			if (this.props.experiment.results == undefined)
				return (React.createElement("div", null))
				
			var resultNodes = this.props.experiment.results.map(function(line){
				return(
					React.createElement(ResultLine, {line: line})
				)
			});
			
			return(
				React.createElement("table", {className: "table table-striped"}, 
					React.createElement("thead", null, 
						React.createElement("tr", null, 
							React.createElement("th", null, "duration (ms)"), 
							React.createElement("th", null, "target position"), 
							React.createElement("th", null, "target radius (mm)"), 
							React.createElement("th", null, "target radius (px)"), 
							React.createElement("th", null, "touch position"), 
							React.createElement("th", null, "distance (px)"), 
							React.createElement("th", null, "distance (mm)")
						)
					), 
					React.createElement("tbody", null, 
						resultNodes
					)
				)
			)
		}
	});
	
	var ExperimentParameters = React.createClass({displayName: "ExperimentParameters",
		render: function(){
			
			if (this.props.experiment.name == undefined)
				return (React.createElement("div", null))
			
			return (
				React.createElement("table", {className: "table table-striped"}, 
					React.createElement("thead", null, 
						React.createElement("tr", null, 
							React.createElement("th", null, "type"), 
							React.createElement("th", null, "rows"), 
							React.createElement("th", null, "cols"), 
							React.createElement("th", null, "dpi"), 
							React.createElement("th", null, "min mm"), 
							React.createElement("th", null, "max mm"), 
							React.createElement("th", null, "step"), 
							React.createElement("th", null, "run length"), 
							React.createElement("th", null, "target x"), 
							React.createElement("th", null, "target y"), 
							React.createElement("th", null, "target radius")
						)
					), 				
					React.createElement("tbody", null, 
						React.createElement("tr", null, 	
							React.createElement("th", null, this.props.experiment.type), 
							React.createElement("th", null, this.props.experiment.gridrows), 
							React.createElement("th", null, this.props.experiment.gridcols), 
							React.createElement("th", null, this.props.experiment.dpi), 
							React.createElement("th", null, this.props.experiment.minmm), 
							React.createElement("th", null, this.props.experiment.maxmm), 
							React.createElement("th", null, this.props.experiment.step), 
							React.createElement("th", null, this.props.experiment.runlength), 
							React.createElement("th", null, this.props.experiment.targetx), 
							React.createElement("th", null, this.props.experiment.targety), 
							React.createElement("th", null, this.props.experiment.targetr)
						)
					)
				)
				
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