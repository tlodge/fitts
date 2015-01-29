require.config({
    baseUrl: 'js/my',

    paths: {
        "jquery": "../jquery/jquery-2.1.0.min",
		"d3": "../d3/d3",
		"knockout":"../knockout/knockout-3.1.0",
    },
    
    "shim": {
    }
});

require(['jquery','circles'], function($,circles) {
	
	//following makes disables scrolling on apple
	
	$(document).bind(
		'touchmove',
			function(e){
				e.preventDefault();
			}
	);
	circles.init();
});
