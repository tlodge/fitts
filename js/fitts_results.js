require.config({
    baseUrl: 'js/my',

    paths: {
        "jquery": "../jquery/jquery-2.1.0.min",
		"moment": '../moment/moment.min',
		"react": '../react/react',
		"showdown": '../react/showdown.min',
    },
    
    "shim": {
    }
});

require(['jquery', 'results'], function($, results) {
	
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
	results.init();
});
