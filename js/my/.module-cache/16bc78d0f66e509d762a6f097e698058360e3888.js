define(['jquery','react', 'showdown'], function($, React, Showdown){

	"use strict";
	
	var ResultsBox = React.createClass({displayName: "ResultsBox",
		
		experiments: [],
		
		currentExperiment: {},
		
		loadResultsFromStorage: function(){
			this.experiments = window.localStorage.getObject("experiment");
			this.setState({data:this.experiments})
		},
		
		handleExperimentSelected: function(experiment){
			var idx = this.experiments.map(function(experiment){return experiment.name}).indexOf(experiment);
			if (idx != -1){
				this.currentExperiment = this.experiments[idx];
				this.setState({experiment:this.currentExperiment});
				this.setState({parameterscsv:this.parametersToCSV(this.currentExperiment)});
				this.setState({resultscsv:this.resultsToCSV(this.currentExperiment)});
			}
		},
		
		handleExperimentEmail: function(email){
			console.log("would email experiment!!");
			console.log(email);
			window.open('mailto:' + email + "?subject=myexperiment&body=hello");
		},
		
		handleExperimentDelete: function(){
			console.log("would delete experiment!!");
		},
		
		getInitialState: function(){
			return {data:[], experiment:{}, csv:""};
		},
		
		componentDidMount: function(){
			this.loadResultsFromStorage();
			setInterval(this.loadResultsFromStorage, this.props.pollInterval);
		},
		
		parametersToCSV: function(experiment){
		
			var keys = Object.keys(experiment).map(function(item){
				return item;
			}).filter(function(item){
				return item != "results";
			})
			
			var params = keys.map(function(item){
				return experiment[item];
			});
			
			return keys.join(";") + "\n" + params.join(";");
		},
		
		resultsToCSV: function(experiment){
			var results = experiment.results;
			if (results.length > 0){
				//get the unique keys
				var keys = Object.keys(results[0]).map(function(item){
					return item;
				});
			
				var csvarray = [];
				
				results.forEach(function(result){
					var values = keys.map(function(item){
						return result[item];
					});
					csvarray.push(values.join(";"));
					console.log(values.join(";"));
				});
			}
			return (keys.join(";") + "\n" + csvarray.join("\n"));
		},
		
		render: function(){
			return (
				React.createElement("div", {className: "results"}, 
					React.createElement(ResultManage, {data: this.state.data, experimentEmail: this.handleExperimentEmail, experimentDelete: this.handleExperimentDelete}), 
					React.createElement(ResultNav, {data: this.state.data, experimentSelected: this.handleExperimentSelected}), 
					React.createElement(ExperimentParameters, {experiment: this.state.experiment}), 
					React.createElement(ExperimentResults, {experiment: this.state.experiment}), 
					React.createElement(ExperimentCSV, {parameters: this.state.parameterscsv, results: this.state.resultscsv})
				)
			);
		}
	});

	var ExperimentCSV = React.createClass({displayName: "ExperimentCSV",
	
		render: function(){
			return(
				React.createElement("div", null, 
					React.createElement("pre", null, 
						this.props.parameters
					), 
					React.createElement("pre", null, 
						this.props.results
					)
				)
			)
		}
	});
	
	var ResultManage = React.createClass({displayName: "ResultManage",
		
		handleSubmit: function(e){
			e.preventDefault();
			var email = this.refs.email.getDOMNode().value.trim();
			
			if (email){
				this.props.experimentEmail(email);
			}
			else{
				console.log("no email address!");
			}
		},
		
		render: function(){
			return(
				React.createElement("nav", {className: "nav navbar-default"}, 
					React.createElement("div", {className: "container-fluid"}, 
						React.createElement("div", {className: "navbar-header"}, 
							React.createElement("a", {className: "navbar-brand", href: "#"}, "results")
						), 
						React.createElement("div", {className: "collapse navbar-collapse"}, 
							React.createElement("form", {className: "navbar-form navbar-left", onSubmit: this.handleSubmit}, 
								React.createElement("div", {className: "form-group"}, 
									React.createElement("input", {type: "text", ref: "email", className: "form-control", placeholder: "your email address"})
								), 
								React.createElement("button", {type: "submit", className: "btn btn-default"}, "Email this experiment"), 
								React.createElement("button", {type: "button", className: "btn btn-default", onclick: this.props.experimentDelete}, "Delete this experiment")
							)
						)
					)
				)						
			)
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
	
	
	var ParametersHeader = React.createClass({displayName: "ParametersHeader",
		render: function(){
			if (this.props.type == "first_contact"){
				return(
					React.createElement("tr", null, 
						React.createElement("th", null, "type"), 
						React.createElement("th", null, "rows"), 
						React.createElement("th", null, "cols"), 
						React.createElement("th", null, "dpi"), 
						React.createElement("th", null, "min mm"), 
						React.createElement("th", null, "max mm"), 
						React.createElement("th", null, "step"), 
						React.createElement("th", null, "run length")
					)
				)
			}else{
				return(
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
				)
			}
			
		}
	});
	
	
	var ParametersBody = React.createClass({displayName: "ParametersBody",
		render: function(){
			
			if (this.props.experiment.type == "first_contact"){
				return (
					React.createElement("tr", null, 
						React.createElement("th", null, this.props.experiment.type), 
						React.createElement("th", null, this.props.experiment.gridrows), 
						React.createElement("th", null, this.props.experiment.gridcols), 
						React.createElement("th", null, this.props.experiment.dpi), 
						React.createElement("th", null, this.props.experiment.minmm), 
						React.createElement("th", null, this.props.experiment.maxmm), 
						React.createElement("th", null, this.props.experiment.step), 
						React.createElement("th", null, this.props.experiment.runlength)
					)
				)
			}else{
				return(
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
			}
		}
	});
	
	var ExperimentParameters = React.createClass({displayName: "ExperimentParameters",
		render: function(){
			
			if (this.props.experiment.name == undefined)
				return (React.createElement("div", null))
			
		
			
			return (
				React.createElement("table", {className: "table table-striped"}, 
					React.createElement("thead", null, 
						React.createElement(ParametersHeader, {type: this.props.experiment.type})
					), 				
					React.createElement("tbody", null, 
						React.createElement(ParametersBody, {experiment: this.props.experiment})
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