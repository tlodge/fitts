require.config({
    baseUrl: 'js/my',

    paths: {
        "jquery": "../jquery/jquery-2.1.0.min",
		"d3": "../d3/d3",
    },
    
    "shim": {
    }
});

require(['jquery','circles'], function($,circles) {
	
	$(document).bind(
		'touchmove',
			function(e){
				e.preventDefault();
			}
	);
	circles.init();
});
