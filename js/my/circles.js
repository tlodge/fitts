define(['jquery','d3'], function($, d3){

	"use strict";
	
	var
		width 	= $(document).width(),
		
		height 	= $(document).height(),
		
		svg  	= d3.select("#svg")
					.attr("width",width)
					.attr("height",height)
					.append("g")
					.attr("class","container"),
					
		randomx = function(){
			return Math.random() * width;
		},
		
		randomy = function(){
			return Math.random() * height;
		},
		
		randomr = function(){
			return 10 + Math.random() * (Math.min(width-10, height-10)/2)
		},
		
		start = function(){
		
			var data = [{x:randomx(), y:randomy(), r:randomr()}];
				
			//update
			//svg.selectAll("circle")
			//  .attr("cx", function(d){return d.x})
			 // .attr("cy", function(d){return d.y})
			 // .attr("r", function(d){return d.r})
			
			var circle = svg.selectAll("circle")
							.data(data, function(d){return [d.x,d.y,d.r]})
						
			circle
				.enter()
				.append("circle")
				.attr("cx", function(d){return Math.min(Math.max(d.r,d.x), width-d.r)})
				.attr("cy", function(d){return Math.min(Math.max(d.r,d.y), height-d.r)})
				.attr("r", function(d){return d.r})
				.style("stroke", "red")
				.style("stroke-opacity", "1.0")
				.style("fill", "red")
				.style("fill-opacity", 0.3)
				.on("click", start);
	
			circle
				.exit()
				.remove();		
		},
		
		
		init = function(){
			start();	
		}
	
	return{
		init: init
	}
	
});