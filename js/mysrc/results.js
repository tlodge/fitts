define(['jquery','react', 'showdown'], function($, React, Showdown){

	"use strict";
	
	var ResultsBox = React.createClass({
		
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
			if (this.currentExperiment){
				var subject	 = this.currentExperiment.name; 
				var body  	 = this.parametersToCSV(this.currentExperiment) + "\n" +  this.resultsToCSV(this.currentExperiment);
				window.open('mailto:' + email + "?subject=" + subject + "&body="+body);
			}
		},
		
		handleExperimentDelete: function(){
			
			console.log("am in handle experiment delete");
			
			var experimentnames = this.experiments.map(function(item){
				return item.name;
			});
			
			var newexperiments = $.extend([], this.experiments);
			var indextodelete = experimentnames.indexOf(this.currentExperiment.name);
			newexperiments.splice(indextodelete,1);
			
			window.localStorage.setObject("experiment", newexperiments);
			this.setState({data:newexperiments})
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
				
				<div className="row">
					<div className="col-md-12">
						<div className="results">
							<h2>results</h2>
							<div className="row">
								<div className="col-md-12">
									<ResultManage experiment={this.state.experiment} experimentEmail={this.handleExperimentEmail} experimentDelete={this.handleExperimentDelete}/>
								</div>
							</div>
							<div className="row">
								<div className="col-md-12">
									<ResultNav data={this.state.data} experimentSelected={this.handleExperimentSelected}/>
								</div>
							</div>
							<div className="row">
								<div className="col-md-12">
									<ExperimentParameters experiment={this.state.experiment}/>
								</div>
							</div>
							<div className="row">
								<div className="col-md-12">
									<ExperimentResults experiment={this.state.experiment}/>
									<ExperimentCSV parameters={this.state.parameterscsv} results={this.state.resultscsv}/>
								</div>
							</div>
						</div>
					</div>
				</div>
			);
		}
	});

	var ExperimentCSV = React.createClass({
	
		render: function(){
			return(
				<div>
					<pre>
						{this.props.parameters}
					</pre>
					<pre>
						{this.props.results}
					</pre>
				</div>
			)
		}
	});
	
	var ResultManage = React.createClass({
		
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
			if (this.props.experiment.results == undefined)
				return (<div></div>)
				
			return(
				<nav className="nav navbar-default">
					<div className="container-fluid">
						<div className="navbar-header">
							<a className="navbar-brand" href="#">manage</a>
						</div>
						<div className="collapse navbar-collapse">
							<form className="navbar-form navbar-left" onSubmit={this.handleSubmit}>
								<div className="form-group">
									<input type="text" ref="email" className="form-control" placeholder="your email address"/>
								</div>
								<button type="submit" className="btn btn-default">Email this experiment</button>
								<button type="button" className="btn btn-default" onClick={this.props.experimentDelete}>Delete this experiment</button>
							</form>
						</div>
					</div>
				</nav>						
			)
		}
	});

	var ResultLine = React.createClass({
		render: function(){
			return(
				<tr>
					<th>{this.props.line.duration}</th>
					<th>{this.props.line.targetpos}</th>
					<th>{this.props.line.targetmm}</th>
					<th>{this.props.line.targetpx}</th>
					<th>{this.props.line.touchpos}</th>
					<th>{this.props.line.pxdistance}</th>
					<th>{this.props.line.mmdistance}</th>
				</tr>
			)
		}
	});

	
	var ExperimentResults = React.createClass({
		
						
		render: function(){
			
			if (this.props.experiment.results == undefined)
				return (<div></div>)
				
			var resultNodes = this.props.experiment.results.map(function(line){
				return(
					<ResultLine line={line}/>
				)
			});
			
			return(
				<table className="table table-striped">
					<thead>
						<tr>
							<th>duration (ms)</th>
							<th>target position</th>
							<th>target radius (mm)</th>
							<th>target radius (px)</th>
							<th>touch position</th>
							<th>distance (px)</th>
							<th>distance (mm)</th>
						</tr>
					</thead>
					<tbody>
						{resultNodes}
					</tbody>
				</table>
			)
		}
	});
	
	
	var ParametersHeader = React.createClass({
		render: function(){
			if (this.props.type == "first_contact"){
				return(
					<tr>
						<th>type</th>
						<th>rows</th>
						<th>cols</th>
						<th>dpi</th>
						<th>min mm</th>
						<th>max mm</th>
						<th>step</th>
						<th>run length</th>
					</tr>
				)
			}else{
				return(
					<tr>
						<th>type</th>
						<th>rows</th>
						<th>cols</th>
						<th>dpi</th>
						<th>min mm</th>
						<th>max mm</th>
						<th>step</th>
						<th>run length</th>
						<th>target x</th>
						<th>target y</th>
						<th>target radius</th>
					</tr>
				)
			}
			
		}
	});
	
	
	var ParametersBody = React.createClass({
		render: function(){
			
			if (this.props.experiment.type == "first_contact"){
				return (
					<tr>
						<th>{this.props.experiment.type}</th>
						<th>{this.props.experiment.gridrows}</th>
						<th>{this.props.experiment.gridcols}</th>
						<th>{this.props.experiment.dpi}</th>
						<th>{this.props.experiment.minmm}</th>
						<th>{this.props.experiment.maxmm}</th>
						<th>{this.props.experiment.step}</th>
						<th>{this.props.experiment.runlength}</th>
					</tr>
				)
			}else{
				return(
					<tr>
						<th>{this.props.experiment.type}</th>
						<th>{this.props.experiment.gridrows}</th>
						<th>{this.props.experiment.gridcols}</th>
						<th>{this.props.experiment.dpi}</th>
						<th>{this.props.experiment.minmm}</th>
						<th>{this.props.experiment.maxmm}</th>
						<th>{this.props.experiment.step}</th>
						<th>{this.props.experiment.runlength}</th>
						<th>{this.props.experiment.targetx}</th>
						<th>{this.props.experiment.targety}</th>
						<th>{this.props.experiment.targetr}</th>
					</tr>
				)
			}
		}
	});
	
	var ExperimentParameters = React.createClass({
		render: function(){
			
			if (this.props.experiment.name == undefined)
				return (<div></div>)
			
		
			
			return (
				<table className="table table-striped">
					<thead>
						<ParametersHeader type={this.props.experiment.type} />
					</thead>				
					<tbody>
						<ParametersBody experiment={this.props.experiment} />
					</tbody>
				</table>
				
			)
		}
	});
	
	var ResultNav= React.createClass({
		
		handleSelected: function(item){
			this.props.experimentSelected(item);
		},
		
		render: function(){
			var self = this;
			var resultNodes = this.props.data.map(function(experiment){
				return(
					<NavItem name={experiment.name} handleSelected={self.handleSelected}/>
				)
			});
			return (
				<ul className="nav nav-pills">
					{resultNodes}
				</ul>
			);
		}
	});

	var NavItem = React.createClass({
		
		clicked: function(){
			this.props.handleSelected(this.props.name);
		},
		
		render: function(){
			return(
				<li><a href="#" ref="navItem" onClick={this.clicked}>{this.props.name}</a></li>
			);
		}
		
	});
	
	var init = function(){
		React.render(
			<ResultsBox key="experiments" pollInterval={2000}/>, document.getElementById('content')
		);
	}
	
	return{
		init: init
	}
});