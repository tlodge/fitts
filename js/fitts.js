require.config({
    baseUrl: 'js/my',

    paths: {
        "jquery": "../jquery/jquery-2.1.0.min",
		"d3": "../d3/d3",
		"knockout":"../knockout/knockout-3.1.0",
		"moment": '../moment/moment.min'
    },
    
    "shim": {
    }
});

require(['jquery','circles'], function($,circles) {
	
	//add some prototype methods to storage to support saving,loading objects
	
	Storage.prototype.setObject = function(key,value){
		this.setItem(key, JSON.stringify(value));
	}
	
	Storage.prototype.getObject = function(key){
		return JSON.parse(this.getItem(key));
	}
	
	//following makes disables scrolling on apple
	
	$(document).bind(
		'touchmove',
			function(e){
				e.preventDefault();
			}
	);
	circles.init();
});
