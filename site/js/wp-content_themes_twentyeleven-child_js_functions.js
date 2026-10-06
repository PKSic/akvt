$(document).ready(function() { 	
													 
	greyInitRedux();
	ieDropdownsNav();
	ieDropdownsFilter();
	itemViewer(); 
	jsTabsetInit();
	slider( true );
	headerTabs();
	carousel();
	emergencyClose(); 
	adjournLinks();
	zebra_strip_rows();
	visitor_site_slideshow();
	utilDropDownMobile();
 });

var carousel_round = 0;

/*-------------------------------------------
 	Grey Initial Values
-------------------------------------------*/
function greyInitRedux() {
	$("input.filled, textarea.filled").focus(function(e){
		if(this.value == this.defaultValue)
		{
			$(this).removeClass('filled');
			 this.value= '';
		}
		$(this).blur(function(f){ 
			if(this.value == this.defaultValue) {
				$(this).addClass('filled');
				} else if(this.value == "") {
					this.value = this.defaultValue;
					$(this).addClass('filled');
				}
			});
	})

}
	
/*-------------------------------------------
 	IE6 CSS Main Nav Dropdowns
-------------------------------------------*/
function ieDropdownsNav() {
	if(document.all&&document.getElementById) 
	{
		navRoot = document.getElementById('main-nav');
		if (!navRoot) { return false; }
		
		for(i=0; i<navRoot.childNodes.length; i++) 
		{
			node = navRoot.childNodes[i];
			if (node.nodeName=='LI') 
			{
				node.onmouseover=function() 
				{
					this.className+=' over';
				}
				node.onmouseout=function() 
				{
					this.className=this.className.replace(' over', '');
				}
			}
		}
	}
}


/*-------------------------------------------
 	IE6 CSS Main Nav Dropdowns
-------------------------------------------*/
function ieDropdownsFilter() {
	if(document.all&&document.getElementById) 
	{
		navRoot = document.getElementById('filter-drop');
		if (!navRoot) { return false; }
		
		for(i=0; i<navRoot.childNodes.length; i++) 
		{
			node = navRoot.childNodes[i];
			if (node.nodeName=='DIV') 
			{
				node.onmouseover=function() 
				{
					this.className+=' over';
				}
				node.onmouseout=function() 
				{
					this.className=this.className.replace(' over', '');
				}
			}
		}
	}
}
	



/*-------------------------------------------
 	View More
-------------------------------------------*/
function itemViewer() {
	//$(document).delegate('#filter-drop a, .expandable > .load, .filter-nav a', 'click', function (e)
	//$(document).delegate('.expandable > .load, .filter-nav a', 'click', function (e)
	$(document).delegate('.filter-nav a', 'click', function (e)	
	{
		// get the src for the content we're trying to view
		var dataSrc = $(this).attr('data-src');
		
		// determine whether we're trying to sort the existing view
		if($(this).attr('data-sort')) {
			var dataSort = $(this).attr('data-sort');
		} else {
			var dataSort = $('.filter-nav > li > a').attr('data-sort');
		}

		// how many items do we have?
		var itemOffset = $('.expandable .listing > li').size();
		
		//find out if we clicked the menu, if so, clear out everything and add data attribute to the load more
		if($(this).closest('div').hasClass("filter"))
		{
			var hiddenDiv = $('<div />', {
				"class": "items hidden spacer",
				"height": $('.expandable').outerHeight()
			});
			$('.expandable > .load').before(hiddenDiv);
			
			$('.expandable > ul, .expandable > div:not(.spacer)').remove();
			$('.load').attr('data-src',dataSrc);
	
			// Change Class of Dropdown Toggle
			var clickedClass = $(this).parent().attr('class');
			$("#filter-drop strong").removeClass().addClass(clickedClass);
	
			// Change Text of Dropdown Toggle
			var thisLabel = $(this).text();
			$("#filter-drop strong span").text(thisLabel);
			
			// Grab datasrc from clicked-on menu item and populate the filters with it
			$('.filter-nav a').attr('data-src' , dataSrc);
			$('.filter-nav li').removeClass('active');
			$('.filter-nav > li').eq(0).addClass('active');
		}
			
		//find out if we clicked the filter nav, if so let's switch the active class
		if($(this).closest('ul').hasClass("filter-nav")) {
			$('.filter-nav li').removeClass('active');
			$(this).parent().addClass('active');
			
			//Also let's remove all the items before replacing them with what we want
			var hiddenDiv = $('<div />', {
				"class": "items hidden spacer",
				"height": $('.expandable').outerHeight()
			});
			$('.expandable > .load').before(hiddenDiv);
			
			$('.expandable > ul, .expandable > div:not(.spacer)').remove();
		}
		
		$.get(dataSrc, { offset: itemOffset, sort: dataSort }, function(data) {
			$('.expandable .spacer').remove();
			var hiddenDiv = $('<div class="items hidden"></div>');
			$('.expandable > .load').before(hiddenDiv);
			$(hiddenDiv).append(data).hide().removeClass("hidden").fadeIn(); 
		});
		
		e.preventDefault();
	});
}


function jsTabsetInit() {
	var $tabset = $('.action-footer .heading-tabset').eq(0);
	
	var $tablist = $('<ul />', {"class": "heading-tab"});
	$tabset.prepend($tablist);
	
	$('.action-footer div.heading-tab h3').each(function()
	{
		var $anchor = $('<a />', {
			"class": $(this).attr('class'),
			"onClick":  '_gaq.push([\'_trackEvent\', \'Connect\', \'Click\', \'Head'+$(this).attr('class')+'\', 3]);',
			"href": "#",
			"html": $(this).html()
		});
		var $li = $('<li />');
		$li.append($anchor);
		$tablist.append($li);
	});
	
	$('.action-footer div.heading-tab').remove();
	
	$('.action-footer .heading-tabset:gt(0)').each(function()
	{
		$tabset.append($(this).find('.listing'));
		$(this).remove();
	});
}


function slider( clickEvent ) {
	$('.action-footer .slider').each(function()
	{
		// As we loop through the slider items we'll document the tallest one and the left position
		// of each element
		var maxHeight = 0, lastWidth = 0;
		
		// grab the slider and make sure the overflow is hidden and it has a defined width
		var $slider = $(this);
		$slider.css('width', $slider.outerWidth());
		$slider.css('position', 'relative');
		$slider.css('overflow', 'hidden');

		// store the index (or the currently "selected" slide)
		$slider.prop('index', 0);
		
		// loop through each of the direct children
		$slider.find('> *').each(function()
		{
			// localize the child as a jQuery object
			var $li = $(this);
			
			// if this is the tallest child, document it
			if ($li.outerHeight() > maxHeight)
			{
				maxHeight = $li.outerHeight();
			}
			
			// position each child to the immediate right of its preceding sibling
			$li.css('position', 'absolute');
			$li.css('top', 0);
			$li.css('left', lastWidth);
			
			// update our maths so we know where to place the next sibling
			lastWidth+= $li.outerWidth();
		});
		
		// set the height of the slider based on the tallest child
		//$slider.css('height', maxHeight);
		
		// build the previous control button and store a reference to its related slider
		var $previous = $('<a />', {"class": "prev disabled", "href": "#", "text": "Previous"});
		$previous.prop('slider', $slider);
		
		// build the next control button and store a reference to its related slider
		var $next = $('<a />', {"class": "next", "href": "#", "text": "Next"});
		$next.prop('slider', $slider);
		
		// build the controls div and add it to the markup
		var $controls = $('<div />', {"class": "controls"}).append($previous).append($next);
		$slider.after($controls);
		$slider.prop('controls', $controls);
	});
	
	// watch for clicks on the controls
	if ( clickEvent ) { 
	$(document).delegate('.listing + .controls .prev, .listing + .controls .next', 'click', function (event)
	{
		// stop our clicks from affecting the browser/url
		event.preventDefault();
		
		// localize a jQuery version of the clicked link
		var $anchor = $(this);
		
		// grab the slider, that we previously stored while creating these links
		var $slider = $anchor.prop('slider');
		
		// localize the index for prettier code
		var focusedIndex = $slider.prop('index');
		if ( !focusedIndex ) {
			focusedIndex = 0;
		}
		
		// determine what slide is focused
		var $focus = $slider.find('> *').eq(focusedIndex);
		
		// grab the width of that focused slide
		var widthDelta = $focus.outerWidth();
		
		// if we clicked the next button we're moving to the left (negative values, so
		// multiply by -1).
		if ($anchor.hasClass('next'))
		{
			widthDelta *= -1;
		}
		
		focusedIndex += ($anchor.hasClass('next')) ? 1 : -1;
				
		// check that the upcoming movement won't push the first element too far to the right
		// leaving whitespace before the element
		if ($slider.find('> *').eq(0).position().left + widthDelta > 0)
		{
			return true;
		}
		
		// check that the upcoming movement won't push the last element too far to the left
		// leaving whitespace after the element
		var $lastChild = $slider.find('> *').eq(-1)
		if ($lastChild.position().left + widthDelta < $slider.outerWidth() - $lastChild.outerWidth() - 1)
		{
			return true;
		}
		
		// get all the child elements, so we can loop through them and detmine offsets based
		// on widths
		var $siblings = $slider.find('> *');
		
		// finally loop through each child and kick off the animation
		$siblings.each(function(index)
		{
			// we'll determine the `left` in just a second, sit tight
			var left = 0;
			
			// localize the child element
			var $li = $(this);
			
			// loop through each sibling and determine the new left
			if (index < focusedIndex)
			{
				left = -$slider.outerWidth();
			}
			
			if (index >= focusedIndex && index < focusedIndex + 3)
			{
				if ( $(window).width() > 850 ) {
					left = 219 * (index - focusedIndex);
				}
				else {
					left = 162 * (index - focusedIndex);
				}
			}
			
			if (index >= focusedIndex + 3)
			{
				left = $slider.outerWidth() * 2;
			}
			
			
			// start the animation
			$li.animate({'left': left}, 300);
			
			// are we at the beginning?
			if (index == 0 && left == 0)
			{
				$slider.prop('controls').find('.prev').addClass('disabled');
			}
			else if (index == 0)
			{
				$slider.prop('controls').find('.prev').removeClass('disabled');
			}
			
			// are we at the end?
			if (index == $siblings.size()-1 && left == $slider.outerWidth() - $lastChild.outerWidth() - 1)
			{
				$slider.prop('controls').find('.next').addClass('disabled');
			}
			else if (index == $siblings.size()-1)
			{
				$slider.prop('controls').find('.next').removeClass('disabled');
			}
		});
		
		// if we got down here then we actually moved the slider, update the reference to the
		// focused slide
		$slider.prop('index', focusedIndex);
	}); 
	
	}
}

function headerTabs()
{
	var $tabset = $('.action-footer .heading-tabset')
	
	$tabset.find('.listing:gt(0)').hide();
	$tabset.find('.controls:gt(0)').hide();
	$tabset.find('.heading-tab li').eq(0).addClass('active');
	
	$(document).delegate('.action-footer .heading-tab a', 'click', function(event)
	{
		event.preventDefault();
		
		$(this).parent().addClass('active');
		$(this).parent().siblings().removeClass('active');
		
		var index = $(this).parent().prevAll('*').size();
		
		$(this).parents('.heading-tabset').find('.listing').hide();
		$(this).parents('.heading-tabset').find('.listing').eq(index).show();
		
		$(this).parents('.heading-tabset').find('.controls').hide();
		$(this).parents('.heading-tabset').find('.controls').eq(index).show();
	});
}

function carousel()
{
	$('.carousel').each(function()
	{
		var $carousel = $(this);
		var $slides = $carousel.find('.carousel-item');
		if ($slides.length < 2) return;

		var current = 0;
		var timer = null;

		// Remove old controls injected by previous runs
		$carousel.find('.carousel-prev, .carousel-next, .carousel-dots').remove();

		// Hide all slides, show only first
		$slides.removeClass('active').css({ opacity: 0, display: 'none' });
		$slides.eq(0).css({ display: 'flex', opacity: 1 }).addClass('active');

		// Create prev/next buttons
		var $prev = $('<button class="carousel-prev" aria-label="Previous">‹</button>');
		var $next = $('<button class="carousel-next" aria-label="Next">›</button>');
		$carousel.append($prev).append($next);

		// Create dots
		var $dots = $('<div class="carousel-dots"></div>');
		$slides.each(function(i) {
			var $dot = $('<button class="carousel-dot" data-index="' + i + '"></button>');
			if (i === 0) $dot.addClass('active');
			$dots.append($dot);
		});
		$carousel.append($dots);

		function showSlide(index) {
			if (index === current) return;
			var $out = $slides.eq(current);
			var $in = $slides.eq(index);
			$in.show().css({ opacity: 0 }).addClass('active');
			$in.animate({ opacity: 1 }, 500);
			$out.removeClass('active').animate({ opacity: 0 }, 500, function() {
				$(this).hide();
			});
			current = index;
			$dots.find('.carousel-dot').removeClass('active').eq(index).addClass('active');
		}

		$prev.on('click', function() {
			var idx = current - 1;
			if (idx < 0) idx = $slides.length - 1;
			showSlide(idx);
			resetTimer();
		});

		$next.on('click', function() {
			var idx = current + 1;
			if (idx >= $slides.length) idx = 0;
			showSlide(idx);
			resetTimer();
		});

		$dots.on('click', '.carousel-dot', function() {
			showSlide(parseInt($(this).data('index')));
			resetTimer();
		});

		function startTimer() {
			timer = setInterval(function() {
				var idx = current + 1;
				if (idx >= $slides.length) idx = 0;
				showSlide(idx);
			}, 5000);
		}

		function resetTimer() {
			clearInterval(timer);
			startTimer();
		}

		startTimer();
		$carousel.on('mouseenter', function() { clearInterval(timer); });
		$carousel.on('mouseleave', function() { startTimer(); });
	});
}

function emergencyClose() {
	//$('.emergency .wrap').append('<a href="#" class="close">Close</a>');
	
	$(document).delegate('.emergency .close', 'click', function(event)
	{
		event.preventDefault();
		$(this).parents('.emergency').remove();
	});
}

/* Twitter Anywhere is deprecated. so we change to use other way to reply 
function replyLinks() {
	$close = $('<a />', {"class": "close", "href": "#", "text": "Close"});
	$twitterWrap = $('<div />', {"id": "twitter-wrap"});
	$twitterWrap.append($close);
	$twitter = $('<div />', {"id": "twitter"});
	$twitterWrap.append($twitter);
	$(document.body).append($twitterWrap);
	
	twttr.anywhere(function (T) {
		T("#twitter").tweetBox({
			"width": 315,
			"height": 133,
			"defaultContent": "",
			"onTweet": function()
			{
				$("#twitter-wrap").fadeOut('fast');
				$('#overlay').fadeOut();
				$('#overlay').remove();
				_gaq.push(['trackEvent', 'Home', 'SubmitReply', 'TwitterReply', 5]);
				//$twitter.remove();
			}
		});
	});
	
	$(document).delegate('.link-reply', 'click', function(event)
	{
		event.preventDefault();
		
		//if ( !$('#overlay') ) {
			$(document.body).prepend($('<div />', {"id": "overlay"}));
		//}

		$('#overlay').fadeIn();
		
		$("#twitter-wrap").css({
			"position": "fixed",
			"top": 200,
			"left": ($(document.body).width()-335)/2
		});
		
		if ($.browser == 'msie')
		{
			$("#twitter-wrap").css({
				"position": "absolute",
				"top": $(document.body).scrollTop() + 200
			});
		}
		
		$("#twitter-wrap").fadeIn('fast');
	});
	
	$(document).delegate('#overlay, #twitter-wrap .close', 'click', function(event)
	{
		event.preventDefault();
		
		$('#twitter-wrap').fadeOut('fast');
		$('#overlay').fadeOut('fast', function()
		{
			$(this).remove();
		})
	});
}
*/

function adjournLinks()
{
	$('.adjoin-options').each(function()
	{
		var headings = [];
		
		$(this).find('*[data-heading]').each(function()
		{
			headings[$(this).attr('data-heading')] = $(this).attr('data-heading');
		});
		
		var $headings = $('<ul />', {
			"class": "adjoin-header"
		});
		
		for (var heading in headings)
		{
			var $li = $('<li />');
			var $a = $('<a />', {
				"href": "#",
				"onClick":  '_gaq.push([\'_trackEvent\', \'SocialDirectory\', \'Click\', \'Head'+heading+'\', 3]);',
				"data-show": heading,
				"text": heading
			})
			
			$li.append($a);
			$headings.append($li);
		}
		
		$(this).before($headings);
	});
	
	$(document).delegate('a[data-show]', 'click', function(event)
	{
		// stop the default click action
		event.preventDefault();
		
		// set active
		$(this).parent().siblings().find('.active').removeClass('active');
		$(this).addClass('active');
		
		// find the appropriate elements
		$('.adjoin-options *[data-heading]').hide();
		$('.adjoin-options *[data-heading="'+$(this).attr('data-show')+'"].').fadeIn();
	});
	
	$('.adjoin-header').find('a[data-show]').eq(0).trigger('click');
}

$(document).ready(function ()
{
	var $filter = $('#filter-drop');
	var $filterSpacer = $('<div />', {
		"class": "filter-drop-spacer",
		"height": $filter.outerHeight()
	});
	var $homeShield = $('.home .primary');
	var $totalHeight = $('.carousel').outerHeight() + $('.header').outerHeight()


	if ($filter.size())
	{
		$(window).scroll(function ()
		{
			if($(window).scrollTop() > $totalHeight ) {
				
				$homeShield.addClass("shieldfix");
			} 
			else if ($homeShield.hasClass('shieldfix')  && $(window).scrollTop() < $totalHeight)
			{
				$homeShield.removeClass("shieldfix");
			}
			
			if (!$filter.hasClass('fix') && $(window).scrollTop() > $filter.offset().top)
			{
				$filter.css('width', $filter.width());
				$filter.before($filterSpacer);
				$filter.addClass("fix");
			}
			else if ($filter.hasClass('fix')  && $(window).scrollTop() < $filterSpacer.offset().top)
			{
				$filter.removeClass("fix");
				$filterSpacer.remove();
			}
		});
	}
	
});

function get_more_home_items() {
	
	if ( views_left>0 ) {
		jQuery("#home_items_loading").show();
		
		jQuery.ajax({
		  type: 'GET',
		  url: 'ajax/home_items/',
		  data: 'timestamp='+jQuery("#curr_timestamp").html()+'&index='+views_left,
		  dataType: 'json',
		  success: function(data) {
			jQuery("#home_items_loading").hide();	
			jQuery("#curr_timestamp").html(data.timestamp);
			jQuery("#home_content").append(data.html);
		  }
		});
		
		views_left--;
	}
	
	var click_index = 2-views_left;
	
	_gaq.push(['_trackEvent', 'ViewMoreChannels', 'Click', 'ViewMore_'+click_index.toString(), 3]);

	if ( views_left<=0 ) {
		jQuery("#view_more").hide();
	}
}

/*-------------------------------------------
 	Add Zebra Strip Rows of table with class "stripe" -- Chris Traganos
-------------------------------------------*/
function zebra_strip_rows() {
  $("table.stripe tr:odd").addClass("odd");
  $("table.stripe tr:even").addClass("even");
}

function visitor_site_slideshow() {
  $('.visitors_slideshow').cycle({
	  fx: 'fade' // choose your transition type, ex: fade, scrollUp, shuffle, etc...
  });	
  
}

function utilDropDownMobile()
{
	$('a.utility-trigger ').on('click', function()
	{
		//$('.with-nav-dropdown ul').remove();
		$("a.search-trigger").removeClass("active");
		$('form#search').fadeOut("fast");
		$('.utility ul').fadeToggle("fast").toggleClass("mobile-active");
		$(this).toggleClass("active");

	});

	$('a.search-trigger ').on('click', function()
	{
		$("a.utility-trigger").removeClass("active");
		if ( $('.utility ul').css('position')=='absolute' ) {
			$('.utility ul').fadeOut("fast");
		}
		$('form#search').fadeToggle("fast").toggleClass("mobile-active");
		$(this).toggleClass("active");
		$('#searchtext').focus();
	});

	/* --- Hamburger menu for mobile (injected into header) --- */
	function initHamburger() {
		if ($('#hamburger-btn').length) return;
		if ($(window).width() > 767) return;
		var $wrap = $('header#branding .wrap');
		if (!$wrap.length) return;
		var $btn = $('<button id="hamburger-btn" aria-label="Toggle menu"><span></span><span></span><span></span></button>');
		$btn.on('click', function() {
			$(this).toggleClass('is-open');
			$('nav#access').toggleClass('open');
		});
		/* Insert after logo so it's at the right side */
		$wrap.find('.logo.top').after($btn);
	}

	initHamburger();
	$(window).on('resize', function() {
		if ($(window).width() > 767) {
			$('#hamburger-btn').removeClass('is-open');
			$('nav#access').removeClass('open');
		} else {
			initHamburger();
		}
	});
}
