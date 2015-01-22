define(['jquery','d3'], function($, d3){

	"use strict";
	
	
	var 
	
		hook,
	
		createcomponent = function(parent, dim, col, row, d){
	
			var sliderradius = dim.h/6;
			var buttonradius = dim.h/4;
			var buttoninnerradius = dim.h/6;
			
			var x1 = dim.x + sliderradius + dim.w*col;
			var x2 =  dim.x + dim.w*col + dim.w - sliderradius;
			var y  =  dim.y + dim.h/2;
			var sliderscale = d3.scale.linear();
			sliderscale.range([d.min, d.max]);
			sliderscale.domain([x1,x2]);
			
			if (d.type=="slider"){
				
			   parent.append("line")
					  .attr("x1", x1)
					  .attr("x2", x2)
					  .attr("y1", y)
					  .attr("y2", y)
					  .style("stroke", "black")
					  .style("stroke-width", "1px")
		
				parent.append("circle")
					  .attr("cx", function(d){return  sliderscale.invert(d.value);})
					  .attr("cy", y)
					  .attr("r", sliderradius)
					  .style("stroke", "black")
					  .style("stroke-width", "1px")
					  .style("fill", "#80b3ff")
					  .call(d3.behavior.drag().on("drag", function(d){
					  		var x = Math.min(Math.max(d3.event.x,x1),x2);
					  		var value = sliderscale(x);
					  		d3.select("text.option_" + d.id)
					  			.text(parseInt(value));
					  		d3.select(this).attr("cx",x);
					  }).on("dragend", function(){
					  		var d = d3.select(this).data();
					  		var x = d3.select(this).attr("cx");
					  		var value = sliderscale(x);
					  		d[0].callback(value)
					  }))
			}
			else if (d.type == "button"){
				parent.append("circle")
					  .attr("cx", x1 + (x2-x1)/2)
					  .attr("cy", y)
					  .attr("r", buttonradius)
					  .style("fill", "#fff")
					  .style("stroke", "black");
					  
				parent.append("circle")
					  .attr("cx", x1 + (x2-x1)/2)
					  .attr("cy", y)
					  .attr("r", buttoninnerradius)
					  .style("fill", function(d){return d.value?"#80b3ff":"white"})
					  .style("stroke", "black")
					  .call(d3.behavior.drag().on("dragstart", function(){
					  		var d = d3.select(this).data();
					  		d[0].value = !d[0].value;
					  		d3.select(this).style("fill", d[0].value?"#80b3ff":"white");
					  		d[0].callback(d[0].value)
					  }));
			}
		},
	
		
		create = function(hook, x0, y0, width, height, data){
			
			
			data.forEach(function(item){
				item.components.forEach(function(component){
					component.items = item.components.length; 
				});	
			});
				
			var rowspacing  = height/50;
			var colspacing  = width/50;
			
			
			var groupheight = (height / data.length) - (2*rowspacing);
			var headerheight = groupheight / 4;
			var leftw 	= (2/10 * width)  
			var middlew = (5/10 * width) 
			var rightw 	= (3/10 * width) 
			
			var groups = hook.append("g")
								 .attr("class", "groups")
			
			var group  = groups.selectAll("g.group")
								 	   .data(data);
			
			group.enter()
				 .append("g")
				 .attr("class", "group")
			
			group.append("rect")
				  .attr("x", x0 + colspacing)
				  .attr("y", function(d,i){return y0+(i * groupheight)})
				  .attr("width", leftw)
				  .attr("height", groupheight- (rowspacing))
				  .style("stroke", "black")
				  .style("fill", "none")
			
			group.append("text")
				 .attr("text-anchor", "middle")
				 .attr("x", x0 + colspacing + (leftw)/2)
				 .attr("y",function(d,i){return y0+(i * groupheight) + groupheight/2})
				 .attr("dy", ".3em")	
				 .style("fill", "#000")
	  			 .style("font-size", (headerheight*0.8) + "px")
	  			 .text(function(d){return d.name})
				  
			var components = group.append("g")
								  .attr("class", "components"); 
			
			components.append("rect")
					 .attr("x", x0 + colspacing*2 + leftw)
					 .attr("y", function(d,i){return y0+(i * groupheight)})
					 .attr("width", middlew-colspacing*2)
					 .attr("height", groupheight-rowspacing)
					 .style("stroke", "black")
					 .style("fill", "none");
					
							
			var component = components.selectAll("g.component")
					  							.data(function(d){return d.components})
												.enter()
												.append("g")
												.attr("class", "component")
												.each(function(d,i,j){
													var col = i;
													var row = j;
													var dim = {	x: (x0 + colspacing*2 + leftw),
										   						y: headerheight + y0+(row * groupheight),
										   						w: ((middlew-(2*colspacing))/d.items),
										   						h: groupheight - headerheight - rowspacing}; 
													
													createcomponent(d3.select(this),dim, col,row, d);
												});
			
			component.append("rect")
					.attr("x",function(d,i,j){return (x0 + colspacing*2 + leftw) + (i * (middlew-colspacing*2)/d.items)})
					.attr("y",function(d,i,j){return y0+(j * groupheight)})
					.attr("width", function(d){return (middlew-colspacing*2)/d.items})
					.attr("height",	headerheight)		
					.style("stroke", "black")
					.style("stroke-width", 1)
					.style("fill", "white")
			
			component.append("text")
					.attr("text-anchor", "middle")
					.attr("x",function(d,i,j){return (x0 + colspacing*2 + leftw) + (i * (middlew-colspacing*2)/d.items) + ((middlew-colspacing*2)/d.items)/2})
					.attr("y",function(d,i,j){return y0+(j * groupheight)+(headerheight)/2})
					  .attr("dy", ".3em")	
					 .style("fill", "#000")
	  			  	 .style("font-size", (headerheight*0.8) + "px")
	  			  	 .text(function(d){return d.name})
			//RHS SUMMARY BOX
			
			group.append("rect")
				  .attr("x", x0+colspacing + leftw + middlew)
				  .attr("y", function(d,i){return y0+(i * groupheight)})
				  .attr("width", rightw)
				  .attr("height", groupheight-rowspacing)
				  .style("stroke", "black")
				  .style("fill", "none")
			
			var summaries = group.append("g")
								  .attr("class", "summary");
			
			
			var summary =  summaries.selectAll("g.summarycolumn")
					 		.data(function(d){return d.components})
					 		.enter()
					 
					 
			summary.append("rect")
	  			     .attr("x",  (x0+colspacing + leftw + middlew))
				  	 .attr("y",function(d,i,j){
				  	 	var colheight = (groupheight-rowspacing)/d.items;
				  	 	return y0 + (groupheight*j) + colheight*i;
				  	 })
				  	 .attr("width",rightw*3/5)
				  	 .attr("height", function(d){return (groupheight-rowspacing)/d.items})
					 .style("fill", "grey")
					 .style("fill-opacity", 0.7)
					 .style("stroke", "#000")
	  		
	  		summary.append("rect")
	  			     .attr("x",  (x0+colspacing + leftw + middlew) + rightw*3/5)
				  	 .attr("y",function(d,i,j){
				  	 	var colheight = (groupheight-rowspacing)/d.items;
				  	 	return y0 + (groupheight*j) + colheight*i;
				  	 })
				  	 .attr("width",rightw*2/5)
				  	 .attr("height", function(d){return (groupheight-rowspacing)/d.items})
					 .style("fill", "none")
					 .style("stroke", "#000")
					 
					 
	  		summary.append("text")
				   
	  			   .attr("x",   (x0+colspacing + leftw + middlew) + rightw/20)
				    .attr("dy", ".3em")
				   .attr("y",function(d,i,j){
				   		
				  	 	var colheight = (groupheight-rowspacing)/d.items;
				  	 	d.fontheight = headerheight * 0.7;
				  	 	return (y0 + (groupheight*j) + colheight*i) + colheight/2;
				  	 	
				  	 })
					 .style("fill", "#000")
	  			  	 .style("font-size", function(d){ return d.fontheight + "px"})
	  			  	 .text(function(d){return d.name})
					 
			summary.append("text")
				   .attr("class", function(d){return "option_" + d.id})
	  			   .attr("x",   (x0+colspacing + leftw + middlew) + rightw*3/5 +  rightw/50)
				   .attr("dy", ".3em")
				   .attr("y",function(d,i,j){
				  	 	var colheight = (groupheight-rowspacing)/d.items;
				  	 	d.fontheight = colheight * 0.35;
				  	 	return (y0 + (groupheight*j) + colheight*i) + colheight/2;
				  	 	
				  	 })
					 .style("fill", "#000")
	  			  	 .style("font-size", function(d){ return (d.fontheight) + "px"})
	  			  	 .style("font-weight", "bold")
	  			  	 .text(function(d){return d.value})
	  			  	 
					 	 
			/*summaries.selectAll("text.summary")
					 .data(function(d){return d.components})
					 .enter()
					 .append("text")
					 //.attr("dy", ".3em")
					 .attr("text-anchor", "middle")
	  			     .attr("x",   (x0+colspacing + leftw + middlew) + rightw/2)
				  	 .attr("y",function(d,i,j){
				  	 	
				  	 	var colheight = (groupheight/d.items) * 14/15;
				  	 	var padding  = colheight/15;
				  	 	
				  	 	d.fontheight = Math.min(headerheight,colheight - (padding*2));
				  	 	var starty 	 = y0+(j * groupheight)+d.fontheight/2;
				  	 	var rowoffset = padding + ((colheight-(2*padding))*i);
				  	 	return starty + d.fontheight/2+ rowoffset;
				  	 })
					 .style("fill", "#000")
	  			  	 .style("font-size", function(d){ return d.fontheight + "px"})
	  			  	 .text(function(d){return d.name + ":"+  d.value })  */
			
		}
	
	
	return {
		create: create
	}	
	
});