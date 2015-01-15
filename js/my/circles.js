define(['jquery','d3'], function($, d3){

	"use strict";
	
	var
		
		width 	= $(document).width(),
		
		height 	= $(document).height(),
		
		dpi		= 113,
		
		enddata 	= [],
		
		menuwidth = 30,
		
		cmtopx = function(cm){
			
			//convert to inches
			var inches = cm * 0.39370;
			
			//mutliply by dpi
			return inches*dpi
		},
		
		minradiuscm	= 1,
		
		maxradiuscm = 4,
		
		
		rscale  = d3.scale.linear().range([cmtopx(minradiuscm), cmtopx(maxradiuscm)]),
	
		
		dragged = function(d){
			
			d.x = d3.event.x;
			d.y = d3.event.y;
			d3.select(this)
				.attr("cx", d.x)
				.attr("cy", d.y)
				//.style("transform", function(d){return "translate(" + d.x + "px," + d.y + "px)";})
		},
	
	 	intersect = function(c1, c2){
	 		
	 	
	 		var dx = c2.x-c1.x;
			var dy = -c1.y - -c2.y;
			
			var d = Math.sqrt((dy*dy)+(dx*dx));
			
			if (d >= (c1.r + c2.r)){
				return false;
			}
			return true;
	 	},
	 	
	 	
		dragend = function(){
			var x0 = parseInt(d3.select(this).attr("cx"));
			var y0 = parseInt(d3.select(this).attr("cy"));
			var r0  = parseInt(d3.select(this).attr("r"));
			
			var x1 = parseInt(d3.select("circle.end").attr("cx"));
			var y1 = parseInt(d3.select("circle.end").attr("cy"));
			var r1  = parseInt(d3.select("circle.end").attr("r"));
		
			startlastcontact();
		},
			
		drag = d3.behavior.drag()
			  //.origin(function(d){return {x:d.x, y:d.y};})
			  .on("drag", dragged)
			  .on("dragend", dragend),
		
		dragtouch = d3.behavior.drag()
			  .on("dragstart", function(){
			  								console.log("dragstart!");
			  								d3.event.sourceEvent.stopPropagation();
			  								startfirstcontact()
			  							}),
	  	  		
		svg  	= d3.select("#svg")
					.attr("width",width)
					.attr("height",height)
					.append("g")
					.attr("class","container"),
		
		controlsvisible = false,
					
		randomx = function(){
			return Math.random() * width;
		},
		
		randomy = function(){
			return Math.random() * height;
		},
		
		randomr = function(){
			return rscale(Math.random());
		},
		
		togglecontrols = function(){
		
			if (controlsvisible){
				svg.select("g.controls")
					.transition()
					.duration(500)
					.attr("transform", "translate(" + ((width/2)-menuwidth) + ",0)")
			}else{
				svg.select("g.controls")
					.transition()
					.duration(500)
					.attr("transform", "translate(0,0)")
			}	
			controlsvisible = !controlsvisible;
		},
		
		reset = function(callback){
			togglecontrols();
			svg.selectAll("circle")
				.remove();
			callback();
		},
		
		settings = function(){
			
			var padding = width/50;
			var buttonheight = height/15;
			var buttonwidth  = (width/2 - padding*3)/2
			
			var cpanel = svg.append("g")
							.attr("class", "controls")
							.attr("transform", "translate(" + ((width/2)-menuwidth) + ",0)")
							 
			cpanel.append("rect")
				  .attr("x",  width/2)
				  .attr("y",  0)
				  .attr("width", width/2)
				  .attr("height",height)
				  .style("fill", "white")
				  .style("fill-opacity", 1.0)
				  .style("stroke", "black")
				  .style("stroke-width", 1)				
				  .call(d3.behavior.drag().on("dragstart", function(){togglecontrols();}))
				  
			cpanel.append("rect")
				  .attr("x",  width/2)
				  .attr("y",  height-buttonheight-padding-padding)
				  .attr("width", width/2)
				  .attr("height",buttonheight+padding+padding)
				  .style("fill", "#30363c")
				  .style("fill-opacity", 1.0)
				  .style("stroke", "black")
				  .style("stroke-width", 1)				
				  
			
			cpanel.append("rect")
				  .attr("rx", 5)
				  .attr("x",  width/2 + padding)
				  .attr("y",  height-buttonheight-padding)
				  .attr("width", buttonwidth)
				  .attr("height",buttonheight)
				  .style("fill", "white")
				  .style("fill-opacity", 1.0)
				  .style("stroke", "black")
				  .style("stroke-width", 1)				
				  .call(d3.behavior.drag().on("dragstart", function(){reset(startfirstcontact);}))
			
				
			cpanel
				  .append("text")
				  .attr("class", "buttonlabel")
				  .attr("dy", ".3em")
	  			  .attr("x", width/2 + padding + buttonwidth/2)
				  .attr("y",height-buttonheight-padding + buttonheight/2)	
				  .attr("text-anchor", "middle")
	  			  .style("fill", "#000")
	  			  .style("font-size", (buttonheight*0.5 + "px"))
	  			  .text("experiment one")
	  			  .call(d3.behavior.drag().on("dragstart", function(){reset(startfirstcontact);}))
	  			  
	  			  
			cpanel.append("rect")
				  .attr("rx", 5)
				  .attr("x",  width/2 + padding + buttonwidth + padding)
				  .attr("y",  height-buttonheight-padding)
				  .attr("width", buttonwidth)
				  .attr("height",buttonheight)
				  .style("fill", "white")
				  .style("fill-opacity", 1.0)
				  .style("stroke", "black")
				  .style("stroke-width", 1)				
				  .call(d3.behavior.drag().on("dragstart", function(){reset(startlastcontact);}))
		
			cpanel
				  .append("text")
				  .attr("class", "buttonlabel")
				  .attr("dy", ".3em")
	  			  .attr("x", width/2 + padding + buttonwidth + padding + buttonwidth/2)
				  .attr("y", height-buttonheight-padding + buttonheight/2)	
				  .attr("text-anchor", "middle")
	  			  .style("fill", "#000")
	  			  .style("font-size", (buttonheight*0.5 + "px"))
	  			  .text("experiment two")	  
				  .call(d3.behavior.drag().on("dragstart", function(){reset(startlastcontact);}))
		},
		
		startlastcontact  = function(){
		
			var r0 = randomr();
			
			var startdata = enddata.length > 0 ? enddata: [
						{x:Math.min(Math.max(r0,randomx()), width-r0),
						 y:(Math.min(Math.max(r0,randomy()), height-r0)), 
						 r:r0}];
						 
			var r1 = randomr();
			
		
			enddata   	  = [
						{x:Math.min(Math.max(r1,randomx()), width-r1),
						 y:(Math.min(Math.max(r1,randomy()), height-r1)), 
						 r:r1}];
			
			//create a new random position if these intersect
			while (intersect(enddata[0], startdata[0])){
				enddata = [
						{x:Math.min(Math.max(r1,randomx()), width-r1),
						 y:(Math.min(Math.max(r1,randomy()), height-r1)), 
						 r:r1}];
			}
			
			var c1 =  svg.selectAll("circle.start")
						  .data(startdata, function(d){return [d.x,d.y,d.r]});
			
			var c2 =  svg.selectAll("circle.end")
						  .data(enddata, function(d){return [d.x,d.y,d.r]});
			
			
			
			c1
				.enter()
				.insert("circle", ":first-child")
				.attr("class", "start")
				.attr("cx", function(d){return d.x})
				.attr("cy", function(d){return d.y})
				.attr("r", function(d){return d.r})
				.style("stroke", "red")
				.style("stroke-opacity", "1.0")
				.style("fill", "red")
				.style("fill-opacity", 0.3)
				.call(drag)
				
			c2
				.enter()
				.insert("circle", ":first-child")
				.attr("class", "end")
				.attr("cx", function(d){return d.x})
				.attr("cy", function(d){return d.y})
				.attr("r", function(d){return d.r})
				.style("stroke", "green")
				.style("stroke-opacity", "1.0")
				.style("fill", "green")
				.style("fill-opacity", 0.3)
				
			c1.exit().remove();
			c2.exit().remove();
		},
		
		startfirstcontact = function(){
		
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
				.on("click", startfirstcontact)
				.call(dragtouch);
	
			circle
				.exit()
				.remove();		
		},
		
		
		
		
		init = function(){
			rscale.domain([0, 1]);
			
			//startfirstcontact();	
			startlastcontact();
			settings();
		}
	
	return{
		init: init
	}
	
});