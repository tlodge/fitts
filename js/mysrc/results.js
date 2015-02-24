define(['jquery','react', 'showdown'], function($, React, Showdown){

	"use strict";
	
	var ResultsBox = React.createClass({
		
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
			setInterval(this.loadResultsFromStorage, this.props.pollInterval);
		},
		render: function(){
			return (
				<div className="results">
					<h1> Results </h1>
					<ResultNav data={this.state.data} experimentSelected={this.handleExperimentSelected}/>
					<ExperimentParameters experiment={this.state.experiment}/>
					<ExperimentResults experiment={this.state.experiment}/>
				</div>
			);
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