define(['jquery','d3', 'controls'], function($, d3, controls){

	"use strict";
	
	var
		
		//experiment values
		missts,
		
		start,
		
		stop,
		
		results = [],
		
		lasttargetpos,
		touchpos,
		targetpos,
		
		runstep 	  = 0,
		
		mingrid		  = {rows:8, cols:8},
		
		runlength 	  = 15,
		
		step	  	  = 2,
		
		radiusrange	  = [3, 11],
		
		positions	  = [],
	
		values		  = [],
		
		grid = [],

		width 	= $(document).width(),
		
		height 	= $(document).height(),
		
		targetradius  = width/20,
		
		dpi		= 113,
		
		enddata 	= [],
		
		menuwidth = 30,
		
	    controltimer,
		
		mmtopx = function(mm){
			
			//convert to inches
			var inches = mm * 0.039370;
			
			//mutliply by dpi
			return (inches*dpi)
		},
		
		pxtomm = function(px){
			return px / (0.039370 * dpi);
		},
		
		showgrid = true,	
		
		rscale  = d3.scale.linear().range([mmtopx(radiusrange[0]), mmtopx(radiusrange[1])]),
	
		
		dragged = function(d){
			
			d.x = d3.event.x;
			d.y = d3.event.y;
			d3.select(this)
				.attr("cx", d.x)
				.attr("cy", d.y)
				//.style("transform", function(d){return "translate(" + d.x + "px," + d.y + "px)";})
		},
	
		
		shuffle = function(o){
			for(var j,x,i=o.length;i;j=Math.floor(Math.random()*i),x=o[--i], o[i]=o[j],o[j]=x);
				return o;
		},
		
		
		
		createdata = function(){
			
			grid = [];
			values = [];
			positions = [];
			enddata = [];
		
			rscale  = d3.scale.linear().range([mmtopx(radiusrange[0]), mmtopx(radiusrange[1])])
			rscale.domain(radiusrange);
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
					var xrange = [col*colwidth, (col+1)*colwidth];
					var yrange = [row*colheight,(row+1)*colheight];
				
				
					var randx = xrange[0] + colwidth/2; //+ Math.random()*colwidth;
					var randy = yrange[0] + colheight/2;//+ Math.random()*colheight;
					var attempts = 0;
			
					//do a check here for circles overlapping with target for drag exp!
					
			
					grid.push({x:xrange[0], y:yrange[0], w:colwidth, h:colheight});
					//positions.push({x:xrange[0] + Math.random()*xrange[1], y:yrange[0] + Math.random()*yrange[1]});
					
					var radius = randomr();
					
					if (shuffled.length > 0){
						radius = rscale(shuffled.shift());	
					}
					
					positions.push({ id:id++,
									 x0:xrange[0],	
									 y0: yrange[0], 
									 x:randx,//Math.max(Math.min(randx, (xrange[0]+colwidth)-radius), xrange[0]+radius), 
									 y:randy,//Math.max(Math.min(randy, (yrange[0]+colheight)-radius), yrange[0]+radius),
									 r:radius});
					
					//positions.push([ [xrange[0], xrange[1]],[yrange[0], yrange[1]]]);
				}
			}
			
			
			positions = shuffle(positions);
			creategrid();
		},
	
		removegrid = function(){
			d3.selectAll("g.grid").remove();
		},
		
		creategrid = function(){
		
			removegrid();
			
			var mygrid = svg.insert("g", "g.controls")
							.attr("class", "grid")
							.style("opacity", showgrid? 1:0);
							
			mygrid.selectAll("mycircles")
					.data(positions)
					.enter()
					.insert("circle", ":first-child")
					.attr("class",function(d){return  "underlay underlay"+d.id})
					.attr("cx", function(d){return d.x})
					.attr("cy", function(d){return d.y})
					.attr("r", function(d){return d.r})
					.style("fill", "none")
					.style("stroke", "black")
					.style("stroke-opacity",0.5)		
			
			mygrid.selectAll("mygrid")
					.data(grid, function(d,i){return [d.x, d.y, d.width,d.height]})
					.enter()
					.insert("rect", ":first-child")
					.attr("class", "grid")
					.attr("x", function(d){return d.x})
					.attr("y", function(d){return d.y})
					.attr("width", function(d){return d.w})
					.attr("height", function(d){return d.h})
					.attr("fill", "none")
					.style("stroke", "black")
					.style("stroke-opacity",0.5)
			
		
		},
	
		togglegrid = function(){
		
			d3.select("g.grid")
				.transition()
				.duration(100)	
				.style("opacity", showgrid? 0:1);
			
			
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
			var id = d3.select(this).data()[0].id;
			d3.select("circle.underlay"+id).style("fill", "green");
			  				
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
		
		
		pulse = function(){
			d3.select("rect.misspace")
				.transition()
				.duration(200)
				.style("fill", "grey")
				.each("end",function(){
					
					d3.select("rect.misspace")
						.transition()
						.duration(200)
					   .style("fill", "white");
				})
		},
		
		touchmiss = d3.behavior.drag()
			  .on("dragstart", function(){
			  		d3.event.sourceEvent.stopPropagation();
	   				d3.event.sourceEvent.preventDefault();
			  		missts = new Date().getTime();
			  		controltimer = window.setTimeout(pulse, 2300);
			  		
			  }).on("dragend", function(){
			  		window.clearTimeout(controltimer);
			  		if (new Date().getTime()-missts > 2000){
			  			$("body").css("overflow", "auto");
			  			d3.select("g.container")
			  				.transition()
			  				.duration(800)
			  			    .attr("transform", "translate(0," + -height + ")")
			  		}
			  }),
			  
		dragtouch = d3.behavior.drag()
			  .on("dragstart", function(){
			  				d3.event.sourceEvent.stopPropagation();
	   						d3.event.sourceEvent.preventDefault();
			  				var tdata = d3.select(this).data()[0];
			  				touchpos  = {x:d3.event.sourceEvent.clientX, y:d3.event.sourceEvent.clientY};
			  				targetpos = {x:Math.round(tdata.x), y:Math.round(tdata.y), rpx: tdata.r, rmm:pxtomm(tdata.r)}
			  				var id = tdata.id;
			  				d3.select("circle.underlay"+id).style("fill", "green");
			  				startfirstcontact()
				}),
	  	  		
		svg  	= d3.select("#svg")
					.attr("width",width)
					.attr("height",height*2)
					.append("g")
					.attr("class","container"),
					
		
		
		randomx = function(){
			return Math.random() * width;
		},
		
		randomy = function(){
			return Math.random() * height;
		},
		
		randomr = function(){
			var rdx =  radiusrange[0] + step * Math.floor(Math.random() * (radiusrange[1]-radiusrange[0])/step);
			return rscale(rdx);
		},
		
		
		reset = function(callback){
			$("html").scrollTop(0);
			$("body").scrollTop(0);
			$("body").css("overflow", "hidden");
			d3.select("g.container")
			  				.transition()
			  				.duration(800)
			  			    .attr("transform", "translate(0,0)")
			runstep = 0;
			
			//$("body").css("overflow", "auto");
			//window.location.hash="";
			
			createdata();
			
			
			svg.selectAll("circle.target")
				.remove();
			
			svg.selectAll("circle.start")
				.remove();
			
			svg.selectAll("circle.end")
				.remove();
			
			callback();
		},
		
		onchange = function(value){
			
			//console.log(value);
		},
		
		settings = function(){
			
			var rowspacing = width/15;
			var padding = width/50;
			var buttonheight = height/15;
			var buttonwidth  = (width/2 - padding*3)/2
			var selectradius = padding/2;
			var cpanel = svg.append("g")
							.attr("class", "controls")
							
							//.attr("transform", "translate(" + ((width/2)-menuwidth) + ",0)")
						
							 
			cpanel.append("rect")
				  .attr("x",  0)
				  .attr("y",  height)
				  .attr("width", width)
				  .attr("height",height)
				  .style("fill", "white")
				  .style("fill-opacity", 1.0)
				  .style("stroke", "black")
				  .style("stroke-width", 1)				
				  
			
			var controlsdata = [
						{
							name:"grid",
							components:[
								{name:"rows", id:"rows", type:"slider", min:1, max:20, value:mingrid.rows, callback:function(value){
									mingrid.rows = parseInt(value);
									createdata();
								}},
								
								{name:"cols", id:"cols",type:"slider", min:1, max:20, value:mingrid.cols, callback:function(value){
									mingrid.cols = parseInt(value);
									createdata();
								}},
								
								{name:"visible",id:"visible", type:"button", value: true,  callback:function(value){
									
									togglegrid();
								}}
							]
						},
						{
							name:"DPI",
							components:[
								{name:"dpi", id:"dpi", type:"slider", min:30, max:500, value:dpi, callback:function(value){
									dpi = parseInt(value);

									createdata();
								}},
							]
						},
						{
							name:"widths",
							components:[
								{name:"minmm", id:"minmm", type:"slider", min:1, max:50, value:radiusrange[0], callback:function(value){
									if (value > radiusrange[1])
										radiusrange[1] = value;
										
									radiusrange[0] = value;
									
									createdata();
								}},
								{name:"maxmm", id:"maxmm",type:"slider", min:1, max:50, value:radiusrange[1], callback:function(value){
									if (value < radiusrange[0])
										radiusrange[0] = value;
										
									radiusrange[1] = value;
									createdata();
								}},
							]
						},
						{
							name:"step",
							components:[
								{name:"step", id:"step", type:"slider", min:1, max:50, value:1, callback:function(value){
									step = value;
									createdata();
								}},
							]
						},
						{
							name:"run length",
							components:[
								{name:"run length", id:"runlength", type:"slider", min:1, max:1000, value:20, callback:function(value){
									runlength = value;
								}},
							]
						},
						{
							name:"target",
							components:[
								{name:"x", id:"targetx", type:"slider", min:targetradius, max:width-targetradius, value:width/2, callback:function(value){
									d3.select("circle.end")
										.attr("cx", value);
								}},
								{name:"y", id:"targety", type:"slider", min:targetradius, max:height-targetradius, value: height-targetradius, callback:function(value){
									console.log(value);
									d3.select("circle.end")
										.attr("cy", value);
								}},
							]
						},
				
			];
	
			
			controls.create({
					hook:cpanel,
					x: 0,
					y: height+padding,
					width: width-padding*2,
					height: height-padding, 
					data: controlsdata
			});
			
			cpanel.append("rect")
				  .attr("x",  0)
				  .attr("y",  (height*2)-buttonheight-padding-padding)
				  .attr("width", width)
				  .attr("height",buttonheight+padding+padding)
				  .style("fill", "#30363c")
				  .style("fill-opacity", 1.0)
				  .style("stroke", "black")
				  .style("stroke-width", 1)				
				  
			
			cpanel.append("rect")
				  .attr("rx", 5)
				  .attr("x",  padding)
				  .attr("y",  height*2-buttonheight-padding)
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
	  			  .attr("x",  padding + buttonwidth/2)
				  .attr("y",height*2-buttonheight-padding + buttonheight/2)	
				  .attr("text-anchor", "middle")
	  			  .style("fill", "#000")
	  			  .style("font-size", (buttonheight*0.5 + "px"))
	  			  .text("experiment one")
	  			  .call(d3.behavior.drag().on("dragstart", function(){reset(startfirstcontact);}))
	  			  
	  			  
			cpanel.append("rect")
				  .attr("rx", 5)
				  .attr("x",  padding + buttonwidth + padding)
				  .attr("y",  height*2-buttonheight-padding)
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
	  			  .attr("x", padding + buttonwidth + padding + buttonwidth/2)
				  .attr("y", height*2-buttonheight-padding + buttonheight/2)	
				  .attr("text-anchor", "middle")
	  			  .style("fill", "#000")
	  			  .style("font-size", (buttonheight*0.5 + "px"))
	  			  .text("experiment two")	  
				  .call(d3.behavior.drag().on("dragstart", function(){reset(startlastcontact);}))
		},
		
		
		startlastcontact  = function(){
		  	
			
			
			var data = [{x:randomx(), y:randomy(), r:randomr()}];
			
			if (positions.length > 0){
				var data = [positions.shift()]
			}
			
			var targetdata = [{x: width/2, y:height-targetradius, r:targetradius}];
			
			//create a new random position if these intersect, can do better than attempts - should check if possible
			//not to intersect!
			
			
			var target = svg.selectAll("circle.end")
							.data(targetdata)
			
			
			target.enter()
					.append("circle")
					.attr("class", "end")
					.attr("cx", function(d){return d.x})
					.attr("cy", function(d){return d.y})
					.attr("r", function(d){return d.r})
					.style("fill", "red")
					.style("stroke", "black")
					
			
			var source = svg.selectAll("circle.start")
							.data(data, function(d){return [d.x,d.y,d.r]})
			
			source.enter()
						.append("circle")
						.attr("class", "start")
						.attr("cx", function(d){return d.x})
						.attr("cy", function(d){return d.y})
						.attr("r", function(d){return d.r})
						.style("fill", "green")
						.style("stroke", "black")
						.call(drag)
							
			target.exit()
				   .remove();
				   
			source.exit()
					.remove();
			
		},
		
		
		startfirstcontact = function(){
			
			if (runstep==0){
				
			}
			else if (runstep==1){
				//start=performance.now();
				start = new Date().getTime();
				lasttargetpos = targetpos;
				
			}else{
				
				stop = new Date().getTime();//performance.now();
				
				var pxdistance = Math.sqrt(((targetpos.x-lasttargetpos.x)*(targetpos.x-lasttargetpos.x)) + ((targetpos.y-lasttargetpos.y)*(targetpos.y-lasttargetpos.y)));
				var mmdistance = pxtomm(pxdistance);
				
				results.push({
					duration:(stop-start),
					touchpos: touchpos,
					targetpos: targetpos,
					distancepx: pxdistance,
					distancemm: mmdistance,	
				})
								
				lasttargetpos = targetpos;
				console.log(results);
			}
			
			runstep+=1;
			
			var data = [{x:randomx(), y:randomy(), r:randomr()}];
			
			if (positions.length > 0){
				var data = [positions.shift()]
			}
			
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
				//.on("click", function(d){
				//	console.log("clicked!!!");
				
				//	startfirstcontact()
				//})
				.call(dragtouch);
	
			start = new Date().getTime();//performance.now();
			circle
				.exit()
				.remove();		
		},
		
		fittsresults = function(){
			
			var result = d3.select("body")
							.append("div")
			  				.attr("id", "results")
			  				.style("position", "absolute")
			  				.style("top", (height*2) + "px")
			  				.style("left", "0px");
			
			result.append("H1").text("your results").style("font-size", "40px");
			
			   
		},
		
		
		init = function(){
			
					
			rscale.domain(radiusrange);
			createdata();
			startfirstcontact();	
			//startlastcontact();
			settings();
			fittsresults();
			
			/*$(window).bind('hashchange',function(){
				if (window.location.hash == "#c"){
					$("body").css("overflow", "auto");
				}else{	  
					$("body").css("overflow", "auto");
				}
				
			});*/
			
			d3.select("g.container")
				.insert("rect", ":first-child")
				.attr("class", "misspace")
				.attr("x",0)
				.attr("y",0)
				.attr("width", width)
				.attr("height", height)
				.attr("fill", "white")
				.call(touchmiss)
			
		}
	
	return{
		init: init
	}
	
});