define(['jquery','d3', 'controls', 'knockout', 'moment'], function($, d3, controls, ko, moment){

	"use strict";
	
	var
		
		//experiment values
		missts,
		
		start,
		
		stop,
		
		experiments = [],
			
		experimentname = "",
		
		results = {results:[]},
		
		lasttargetpos,
		
		touchpos,
		
		targetpos,
		
		endpos, //record the end drag point for the last contact experiment
		
		runstep 	  = 0,
		
		mingrid		  = {rows:8, cols:8},
		
		runlength 	  = 10,
		
		step	  	  = 2,
		
		radiusrange	  = [3, 11],
		
		positions	  = [],
	
		values		  = [],
		
		grid = [],

		width 	= $(document).width(),
		
		height 	= $(document).height(),
		
		targetradius  = width/20,
		
		targetdata = {x: width/2, y:height-targetradius, r:targetradius},
		
		dpi		= 113,
		
		enddata 	= [],
		
		currentdata = [],
		
		menuwidth = 30,
		
	    controltimer,
		
		errorcount = 0,
		
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
				
			if (overlap(d.x,d.y, currentdata.r)){
				console.log("overlap!!");
				d3.select("circle.end")
					.style("fill", "blue");
			}else{
				d3.select("circle.end")
					.style("fill", "red");
			}
				//.style("transform", function(d){return "translate(" + d.x + "px," + d.y + "px)";})
		},
	
		
		shuffle = function(o){
			for(var j,x,i=o.length;i;j=Math.floor(Math.random()*i),x=o[--i], o[i]=o[j],o[j]=x);
				return o;
		},
		
		
		createdata = function(){
		
			console.log("creating data for dpi " + dpi);
			console.log(radiusrange[0] + " -> " + radiusrange[1]);
			console.log(Math.floor(mmtopx(radiusrange[0])) + " -> " + Math.floor(mmtopx(radiusrange[1])));
			
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
					.style("fill-opacity", 0.3)
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
	 	
	 	overlap = function(x,y,r){
	 		var pxdistance = Math.sqrt(((x-targetdata.x)*(x-targetdata.x)) + ((y-targetdata.y)*(y-targetdata.y)));
			
			if (pxdistance > (r+targetdata.r)){
	 			return false;
	 		}
	 		return true;
	 		
	 	},
	 	
		dragend = function(){
		
			var x = d3.event.sourceEvent.clientX;
			var y = d3.event.sourceEvent.clientY;
			  		
			if (x == undefined && y == undefined){
			  	x = d3.event.sourceEvent.touches[0].clientX;
			  	y = d3.event.sourceEvent.touches[0].clientY;
			}
			  				
			d3.event.sourceEvent.stopPropagation();
	   		d3.event.sourceEvent.preventDefault();
	   				
			if (overlap(x,y, currentdata.r) == false){
				errorcount = errorcount + 1;
				refreshlastcontact();	
				return;
			}
			
			d3.select("circle.underlay"+currentdata.id).style("fill", "green")
			  								
			var x0 = Math.floor(d3.select(this).attr("cx"));
			var y0 =  Math.floor(d3.select(this).attr("cy"));
			var r0  =  Math.floor(d3.select(this).attr("r"));
			
			var x1 =  Math.floor(d3.select("circle.end").attr("cx"));
			var y1 =  Math.floor(d3.select("circle.end").attr("cy"));
			var r1  =  Math.floor(d3.select("circle.end").attr("r"));
			
			endpos = ({x:x, y:y});
			
			startlastcontact();
		},
			
		drag = d3.behavior.drag()
			  //.origin(function(d){return {x:d.x, y:d.y};})
			  .on("dragstart", function(){
			  		var x = d3.event.sourceEvent.clientX;
			  		var y = d3.event.sourceEvent.clientY;
			  		
			  		if (x == undefined && y == undefined){
			  				x = d3.event.sourceEvent.touches[0].clientX;
			  				y = d3.event.sourceEvent.touches[0].clientY;
			  		}
			  				
			  		d3.event.sourceEvent.stopPropagation();
	   				d3.event.sourceEvent.preventDefault();
			  		console.log(currentdata);
			  		touchpos  = {x:x, y:y};
			  		targetpos = {x:Math.round(currentdata.x), y:Math.round(currentdata.y), rpx: currentdata.r, rmm:pxtomm(currentdata.r)}
			  		
			  })
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
			  		errorcount = errorcount +1;
			  		d3.event.sourceEvent.stopPropagation();
	   				d3.event.sourceEvent.preventDefault();
			  		missts = new Date().getTime();
			  		window.clearTimeout(controltimer);
			  		controltimer = window.setTimeout(pulse, 2300);
			  		
			  }).on("dragend", function(){
			  		window.clearTimeout(controltimer);
			  		if (new Date().getTime()-missts > 2000){
			  			$("body").css("overflow", "auto");
			  			d3.select("g.controls")
			  				.transition()
			  				.duration(800)
			  			  	.attr("transform", "translate(0,0)")
			  		}
			  }),
			  
		dragtouch = d3.behavior.drag()
			  .on("dragstart", function(){
			  
			  				var x = d3.event.sourceEvent.clientX;
			  				var y = d3.event.sourceEvent.clientY;
			  				if (x == undefined && y == undefined){
			  					x = d3.event.sourceEvent.touches[0].clientX;
			  					y = d3.event.sourceEvent.touches[0].clientY;
			  				}
			  				
			  				d3.event.sourceEvent.stopPropagation();
	   						d3.event.sourceEvent.preventDefault();
			  				var tdata = d3.select(this).data()[0];
			  				touchpos  = {x:x, y:y};
			  				targetpos = {x:Math.round(tdata.x), y:Math.round(tdata.y), rpx: tdata.r, rmm:pxtomm(tdata.r)}
			  				var id = tdata.id;
			  				d3.select("circle.underlay"+id).style("fill", "green");
			  				startfirstcontact()
				}),
	  	  		
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
			var rdx =  radiusrange[0] + step * Math.floor(Math.random() * (radiusrange[1]-radiusrange[0])/step);
			return rscale(rdx);
		},
		
	
		reset = function(callback){
			
			results['results'] = [];
			
			runstep = 0;
			
			d3.select("g.controls")
			  				.transition()
			  				.duration(800)
			  			  	.attr("transform", "translate(" + (width) + ",0)")
			  			    
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
			var buttonwidth  = (width - padding*4)/3
			var selectradius = padding/2;
			var cpanel = svg.append("g")
							.attr("class", "controls")
							.attr("transform", "translate(" + width + ",0)")
						
							 
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
									dpi = Math.floor(value);
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
								{name:"run length", id:"runlength", type:"slider", min:1, max:50, value:runlength, callback:function(value){
									runlength = Math.floor(value);
								}},
							]
						},
						{
							name:"target",
							components:[
								{name:"x", id:"targetx", type:"slider", min:targetradius, max:width-targetradius, value:width/2, callback:function(value){
									targetdata.x = value;
									d3.select("circle.end")
										.attr("cx", value);
								}},
								{name:"y", id:"targety", type:"slider", min:targetradius, max:height-targetradius, value: height-targetradius, callback:function(value){
									console.log(value);
									targetdata.y = value;
									d3.select("circle.end")
										.attr("cy", value);
								}},
							]
						},
						{
							name:"name",
							components:[
								{name:"name", id:"experimentname", type:"textinput", label:"experiment name", callback:function(value){
									experimentname = value;
								}}
							]
						}
				
			];
	
	
	
			var controlsettings = {
					hook:cpanel,
					x: 0,
					y: 0,
					width: width-padding*2,
					height: height-(buttonheight+padding+padding), 
					data: controlsdata
			}
			
			cpanel.append("rect")
				  .attr("x", controlsettings.x)
				  .attr("y", 0)
				  .attr("width", width)
				  .attr("height", height)
				  .style("fill", "white")
				  .style("opacity", 0.9)
			
			
			controls.create(controlsettings);
			
				  
			cpanel.append("rect")
				  .attr("x",  controlsettings.x)
				  .attr("y",  (height)-buttonheight-padding-padding)
				  .attr("width", width)
				  .attr("height",buttonheight+padding+padding)
				  .style("fill", "#30363c")
				  .style("fill-opacity", 1.0)
				  .style("stroke", "black")
				  .style("stroke-width", 1)				
				  
			
			cpanel.append("rect")
				  .attr("rx", 5)
				  .attr("x",  controlsettings.x+ padding)
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
	  			  .attr("x",  controlsettings.x + padding + buttonwidth/2)
				  .attr("y",height-buttonheight-padding + buttonheight/2)	
				  .attr("text-anchor", "middle")
	  			  .style("fill", "#000")
	  			  .style("font-size", (buttonheight*0.3 + "px"))
	  			  .text("experiment one")
	  			  .call(d3.behavior.drag().on("dragstart", function(){reset(startfirstcontact);}))
	  			  
	  			  
			cpanel.append("rect")
				  .attr("rx", 5)
				  .attr("x",  controlsettings.x+ padding + buttonwidth + padding)
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
	  			  .attr("x", controlsettings.x+padding + buttonwidth + padding + buttonwidth/2)
				  .attr("y", height-buttonheight-padding + buttonheight/2)	
				  .attr("text-anchor", "middle")
	  			  .style("fill", "#000")
	  			  .style("font-size", (buttonheight*0.3 + "px"))
	  			  .text("experiment two")	  
				  .call(d3.behavior.drag().on("dragstart", function(){reset(startlastcontact);}))
			
			cpanel.append("rect")
				  .attr("rx", 5)
				  .attr("x",  controlsettings.x+ padding + buttonwidth + padding + buttonwidth + padding)
				  .attr("y",  height-buttonheight-padding)
				  .attr("width", buttonwidth)
				  .attr("height",buttonheight)
				  .style("fill", "white")
				  .style("fill-opacity", 1.0)
				  .style("stroke", "black")
				  .style("stroke-width", 1)				
				  .call(d3.behavior.drag().on("dragstart", function(){
				  	window.location="./results.html";
				  
				  }))
		
			cpanel
				  .append("text")
				  .attr("class", "buttonlabel")
				  .attr("dy", ".3em")
	  			  .attr("x", controlsettings.x+padding + buttonwidth + padding + buttonwidth + padding + buttonwidth/2)
				  .attr("y", height-buttonheight-padding + buttonheight/2)	
				  .attr("text-anchor", "middle")
	  			  .style("fill", "#000")
	  			  .style("font-size", (buttonheight*0.3 + "px"))
	  			  .text("results")	  
				  .call(d3.behavior.drag().on("dragstart", function(){
				  		window.location="./results.html";
				  }));
			
		},
		
		refreshlastcontact = function(){
			
			start = new Date().getTime();
			
			svg.selectAll("circle.start")
				.attr("cx", currentdata.x)
				.attr("cy", currentdata.y)	
			
			svg.select("circle.end")
					.style("fill", "red");		
		},
		
		startlastcontact  = function(){
		 	
		 	svg.select("circle.end")
					.style("fill", "red");
		  	
		  	if (runstep == 0){
				console.log("experiment starting");
			}
			else{
				stop = new Date().getTime();//performance.now();
				
				var pxdistance = Math.sqrt(((targetpos.x-targetdata.x)*(targetpos.x-targetdata.x)) + ((targetpos.y-targetdata.y)*(targetpos.y-targetdata.y)));
				var mmdistance = pxtomm(pxdistance);
				
				var endpxdistance = Math.sqrt(((endpos.x-targetdata.x)*(endpos.x-targetdata.x)) + ((endpos.y-targetdata.y)*(endpos.y-targetdata.y)));
				var endmmmdistance =  pxtomm(endpxdistance);
				
				
				results['results'].push({
					ts:start,
					duration:(stop-start),
					touchpos: touchpos.x + "," + touchpos.y,
					targetpos: targetpos.x + "," + targetpos.y,
					targetmm: Math.floor(targetpos.rmm),
					targetpx: Math.floor(targetpos.rpx),
					pxdistance: Math.floor(pxdistance),
					mmdistance: Math.floor(mmdistance),	
					endpxdistance:  Math.floor(endpxdistance),
					endmmdistance: Math.floor(endmmmdistance),
					errors: errorcount
				})
				errorcount = 0;
			}
			
			
			if (runstep == runlength){
				endlastcontact();
			}
			
			runstep+=1;
			
			var data = {x:randomx(), y:randomy(), r:randomr()};
			
			if (positions.length > 0){
				data = positions.shift();
			}
			
			currentdata = $.extend([],data);
			//create a new random position if these intersect, can do better than attempts - should check if possible
			//not to intersect!
			
			
			var target = svg.selectAll("circle.end")
							.data([targetdata])
			
			
			target.enter()
					.append("circle")
					.attr("class", "end")
					.attr("cx", function(d){return d.x})
					.attr("cy", function(d){return d.y})
					.attr("r", function(d){return d.r})
					.style("fill", "red")
					.style("stroke", "black")
					
			
			var source = svg.selectAll("circle.start")
							.data([data], function(d){return [d.x,d.y,d.r]})
			
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
		
		endlastcontact   = function(){
		
			results.name 	  = "lc_" + experimentname + "_" + moment().format("DD_MM_YY_HH:mm:ss");
			results.type	  = "last_contact";
			results.gridrows  = mingrid.rows;
			results.gridcols  = mingrid.cols;
			results.dpi  	  = dpi;
			results.minmm 	  = radiusrange[0];
			results.maxmm 	  = radiusrange[1];
			results.step 	  = step;
			results.runlength = runlength;
			results.targetx   = targetdata.x;
			results.targety   = targetdata.y;
			results.targetr   = targetdata.r;	
			var rcopy = $.extend({},results);
			console.log(rcopy);
			experiments.push(rcopy);
			
			var stored = window.localStorage.getObject("experiment") || [];
			stored.push(rcopy);
			window.localStorage.setObject("experiment", stored)
			
			reset(function(){
				console.log("end of last contact experiment!!");
			});
		},
		
		
		startfirstcontact = function(){
			
			if (runstep == 0){
			
			}
			else if (runstep==1){
				
				start = new Date().getTime();
				lasttargetpos = targetpos;
				
			}else{
				
				stop = new Date().getTime();//performance.now();
				
				var pxdistance = Math.sqrt(((targetpos.x-lasttargetpos.x)*(targetpos.x-lasttargetpos.x)) + ((targetpos.y-lasttargetpos.y)*(targetpos.y-lasttargetpos.y)));
				var mmdistance = pxtomm(pxdistance);
				
				
				results['results'].push({
					ts:start,
					duration:(stop-start),
					touchpos: touchpos.x + "," + touchpos.y,
					targetpos: targetpos.x + "," + targetpos.y,
					targetmm: Math.floor(targetpos.rmm),
					targetpx: Math.floor(targetpos.rpx),
					pxdistance: Math.floor(pxdistance),
					mmdistance: Math.floor(mmdistance),	
					errors: errorcount,
				})
				errorcount = 0;				
				lasttargetpos = targetpos;
			}
			
			
			if (runstep == runlength){
				endfirstcontact();
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
				.call(dragtouch);
	
			start = new Date().getTime();//performance.now();
			circle
				.exit()
				.remove();		
		},
		
		endfirstcontact   = function(){
		
			results.name 	  = "fc_" + experimentname + "_" + moment().format("DD_MM_YY_HH:mm:ss");
			results.type	  = "first_contact";
			results.gridrows  = mingrid.rows;
			results.gridcols  = mingrid.cols;
			results.dpi  	  = dpi;
			results.minmm 	  = radiusrange[0];
			results.maxmm 	  = radiusrange[1];
			results.step 	  = step;
			results.runlength = runlength;
			var rcopy = $.extend({},results);
			console.log(rcopy);
			experiments.push(rcopy);
			
			var stored = window.localStorage.getObject("experiment") || [];
			stored.push(rcopy);
			window.localStorage.setObject("experiment", stored)
			
			reset(function(){
				console.log("end of experiment!!");
			});
		},
		
		init = function(){
			
					
			rscale.domain(radiusrange);
			
			//startlastcontact();
			settings();
			
			d3.select("g.container")
				.insert("rect", ":first-child")
				.attr("class", "misspace")
				.attr("x",0)
				.attr("y",0)
				.attr("width", width)
				.attr("height", height)
				.attr("fill", "white")
				.call(touchmiss)
			
			reset(startfirstcontact);	
			
		}
	
	return{
		init: init
	}
	
});