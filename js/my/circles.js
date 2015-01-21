define(['jquery','d3', 'controls'], function($, d3, controls){

	"use strict";
	
	var
		
		mingrid		  = {rows:8, cols:8},
		
		runlength 	  = 15,
		
		step	  	  = 0.1,
		
		radiusrange	  = [0.1, 1.0],
		
		positions	  = [],
	
		values		  = [],
		
		grid = [],

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
		
		showgrid = false,	
		
		rscale  = d3.scale.linear().range([cmtopx(radiusrange[0]), cmtopx(radiusrange[1])]),
	
		
		dragged = function(d){
			
			d.x = d3.event.x;
			d.y = d3.event.y;
			d3.select(this)
				.attr("cx", d.x)
				.attr("cy", d.y)
				//.style("transform", function(d){return "translate(" + d.x + "px," + d.y + "px)";})
		},
		
		
		/*gcf = function(number){
			var results = [];
			for (var i=number-1; i >0; i--){
				if (number%i == 0){
					results.push([i, number/i]);
				}
			}	
			return results;
		},*/
		
		shuffle = function(o){
			for(var j,x,i=o.length;i;j=Math.floor(Math.random()*i),x=o[--i], o[i]=o[j],o[j]=x);
				return o;
		},
		
		createdata = function(){
			
			var steps = Math.max(runlength, radiusrange[1]-radiusrange[0]/step);
			var count = 0;
			
			while(count < steps){
				for (var i = radiusrange[0]; i <= radiusrange[1]; i+=step){
					if (++count > steps)
						break;
					values.push(i);
				}
			}
			
			var shuffled = shuffle(values)
					
			var colwidth 	= width/mingrid.cols;
			var colheight 	= height/mingrid.rows;
			
			
			var id = 0;
			
			for (var row = 0; row < mingrid.rows; row++){
				for (var col = 0; col < mingrid.cols; col++){
					var xrange = [row*colwidth, (row+1)*colwidth];
					var yrange = [col*colheight,(col+1)*colheight];
				
					var randx = xrange[0] + Math.random()*colwidth;
					var randy = yrange[0] + Math.random()*colheight;
					grid.push({x:xrange[0], y:yrange[0], w:colwidth, h:colheight});
					//positions.push({x:xrange[0] + Math.random()*xrange[1], y:yrange[0] + Math.random()*yrange[1]});
					
					var radius = randomr();
					
					if (shuffled.length > 0){
						radius = rscale(shuffled.shift());	
					}
					
					positions.push({ id:id++,
									 x0:xrange[0],	
									 y0: yrange[0], 
									 x:Math.max(Math.min(randx, (xrange[0]+colwidth)-radius), xrange[0]+radius), 
									 y:Math.max(Math.min(randy, (yrange[0]+colheight)-radius), yrange[0]+radius),
									 r:radius});
					
					//positions.push([ [xrange[0], xrange[1]],[yrange[0], yrange[1]]]);
				}
			}
			
			positions = shuffle(positions);
			creategrid();
			
		},
	
		creategrid = function(){
		
			d3.select("g.grid").remove();
			
			var mygrid = svg.append("g").attr("class", "grid")
			
			mygrid.selectAll("mycircles")
					.data(positions)
					.enter()
					.insert("circle", ":first-child")
					.attr("class",function(d){return  "underlay underlay"+d.id})
					.attr("cx", function(d){return d.x})
					.attr("cy", function(d){return d.y})
					.attr("r", function(d){return d.r})
					.style("fill", "white")
					.style("stroke", "black")
					.style("opacity", 0.5)		
			
			mygrid.selectAll("mygrid")
					.data(grid)
					.enter()
					.insert("rect", ":first-child")
					.attr("class", "grid")
					.attr("x", function(d){return d.x})
					.attr("y", function(d){return d.y})
					.attr("width", function(d){return d.w})
					.attr("height", function(d){return d.h})
					.attr("fill", "none")
					.style("stroke", "black")
					.style("stroke-opacity", 0.5)
		},
	
		togglegrid = function(){
			if (!showgrid){
				d3.select("g.grid")
					.transition()
					.duration(500)	
					.style("opacity", 1);
			}else{
				d3.select("g.grid")
					.transition()
					.duration(500)
					.style("opacity", 0);
			}
			
			showgrid = !showgrid;
		
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
			  				//can use datum() / data() rather than __data__?
			  				var id = d3.select(this).node().__data__.id;
			  				d3.select("circle.underlay"+id).style("fill", "green");
			  				//d3.event.sourceEvent.stopPropagation();
			  				startfirstcontact()
				})
				.on("drag", function(d){
					console.log(d);
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
			
			svg.selectAll("circle.target")
				.remove();
			
			svg.selectAll("circle.start")
				.remove();
			
			svg.selectAll("circle.end")
				.remove();
			
			callback();
		},
		
		settings = function(){
			
			var rowspacing = width/15;
			var padding = width/50;
			var buttonheight = height/15;
			var buttonwidth  = (width/2 - padding*3)/2
			var selectradius = padding/2;
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
			
			controls.create(cpanel, width/2, padding, (width/2-padding), height-padding)
			
			//add grid underlay buttons
			/*cpanel.append("circle")
				  .attr("cx",  width/2+padding)
				  .attr("cy",  padding)
				  .attr("r", selectradius)
				  .style("stroke", "black")
				  .style("fill", "white")
				  .call(d3.behavior.drag().on("dragstart", function(){
				  		togglegrid();
				  }))
				  
			cpanel.append("text")
				  .attr("dy", ".3em")
	  			  .attr("x",  width/2+ 2* selectradius + padding)
				  .attr("y",padding)	
				  //.attr("text-anchor", "middle")
	  			  .style("fill", "#000")
	  			  .style("font-size", (selectradius*2 + "px"))
	  			  .text("show grid")
	  		
	  		//add the dpi selection thing
	  		cpanel.append("line")
	  			  .attr("x1", width/2+padding)
				  .attr("x2", width-padding)
				  .attr("y1",rowspacing)
				  .attr("y2",rowspacing)	
	  			  .style("stroke", "#000")
	  			  .style("stroke-width", "2px")
			*/
			
			
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
			
			if (positions.length > 0){
				var data = [positions.shift()]
			}
			//update
			//svg.selectAll("circle")
			//  .attr("cx", function(d){return d.x})
			 // .attr("cy", function(d){return d.y})
			 // .attr("r", function(d){return d.r})
			
			var circle = svg.selectAll("circle.target")
							.data(data, function(d){return [d.x,d.y,d.r]})
						
			circle
				.enter()
				.append("circle")
				.attr("class", "target")
				.attr("cx", function(d){return Math.min(Math.max(d.r,d.x), width-d.r)})
				.attr("cy", function(d){return Math.min(Math.max(d.r,d.y), height-d.r)})
				.attr("r", function(d){return d.r})
				.style("stroke", "red")
				.style("stroke-opacity", "1.0")
				.style("fill", "red")
				.style("fill-opacity", 0.3)
				.on("click", function(d){
					startfirstcontact()
				})
				.call(dragtouch);
	
			circle
				.exit()
				.remove();		
		},
		
		
		
		
		init = function(){
			rscale.domain([0, 1]);
			createdata();
			//startfirstcontact();	
			startlastcontact();
			settings();
		}
	
	return{
		init: init
	}
	
});