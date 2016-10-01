$( document ).ready( function(){
	$('.blink')
		.focus(function(){
			if( $(this).attr('value') == $(this).attr('title') ) {
				$(this).attr({ 'value': '' });
			}
		})
		.blur(function(){
			if( $(this).attr('value') == '' || typeof($(this).attr('value')) == 'undefined') {
				$(this).attr({ 'value': $(this).attr('title') })
			}
		});
		
	$('#slider-holder ul').jcarousel({
		scroll: 1,
		wrap: 'both',
		initCallback: _init_carousel,
		buttonNextHTML: null,
		buttonPrevHTML: null
	});
	
	$('.tabs a').slide({
		'slide_selector' : '.tab-content'
	})
	
	$('.buyNow').click(function(event) {
		event.stopPropagation();
		var desc = $(this).attr('description');
		var balance = $(this).attr('balance');
		var amount = $(this).attr('amount');
		$('#buyNowButton').attr('description',desc);
		$('#buyNowButton').attr('amount',amount);
		$('#purchase').text(desc);
		$('#purchaseAmount').text(amount);
		
		$('#remaining').text(balance-amount);
		console.log(desc,amount);
	  $('#purchase-form').modal();
	  return false;
	});
	
	$('#buyNowButton').click(function(event){
		var desc = $(this).attr('description');
		var amount = $(this).attr('amount');
		console.log(desc,amount);
	});

});
function _init_carousel(carousel) {
	$('#slider-nav .next').bind('click', function() {
		carousel.next();
		return false;
	});
	
	$('#slider-nav .prev').bind('click', function() {
		carousel.prev();
		return false;
	});
};