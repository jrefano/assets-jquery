/********************************************************
 * Ticker jQuery Plugin v1.0
 *
 * This is a simple and flexible plugin to have an element 
 * scroll within its box model.
 * 
 * INSTRUCTIONS: 
 * In your javascript, add ".ticker()" to any element
 * that has overflow and want it to scroll to view all content
 *
 * NOTE: to be used with elements with overflow!
 * 
 * PARAMETERS: See comments below for parameter explainations.
 *
 ********************************************************/



(function ( $ ) {

  $.fn.ticker = function( userParams ) {
  
    var init = function() {
      var $ticker           = $(this),                      // the initial jQuery object chosen to scroll
          cur_overflow      = $ticker.css('overflow'),    // what the initial overflow value of the element was
          ticker_width      = $ticker.width(),            // the width of the element containing everything (will be applied to $t_container)
          children_width    = 10,                         // width of all children combined (start at 10 to cover minor browser differences)
          currently_over    = false,                      // if the container is currently being hovered over
          $t_container,                                   // div created to hold scrolling div
          $t_scroll_div,                                  // div created to actually scroll
          is_overflowing,                                 // value holding boolean of if the element is actually overflowing
        
          params = {
            speed : 25                                    // adjust speed of $ticker (milliseconds)
          },
          
          changemargin = function(e) {
            
            var margin_left = parseInt( $t_scroll_div.css( 'margin-left' ), 10 );
            margin_left = margin_left - 1;

            if ( Math.abs(margin_left) === children_width ) {
              margin_left = children_width;
            }

            $t_scroll_div.css( {'margin-left': margin_left+'px'} );

          }, // changemargin

          mouseover  = function(e) {
            currently_over = setInterval( changemargin, params.speed );
          }, // mouseover

          mouseout   = function(e) {
            
            $t_scroll_div.css( {'margin-left':'0px'} );
            clearInterval( currently_over );
            currently_over = false;
            
          }; // mouseout
                
      // merge user params
      params = $.extend( {}, params, userParams );
      
      // temporarily set the overflow to hidden to detect overflow
      $ticker.css( { 'overflow':'hidden', 'display':'inline' } );

      // determine if there's overflow
      $ticker.children().each( function(i, ch){
        children_width = children_width + $(this).width();
      });
      
      is_overflowing = children_width > ticker_width + 10;
          
      // reset overflow val (in case we hid it earlier)
      $ticker.css('overflow', cur_overflow);
        
      // now if we don't have overflow, return since there's nothing more to do
      if( !is_overflowing ) {
        $ticker.css( { 'display':'inline-block' } );
        return true; 
      }

      // build $ticker divs
      $ticker.children().wrapAll( '<span class="ticker-container" />' );
      
      $t_container = $ticker.find( '.ticker-container' );
              
      $t_container.css( {'overflow':'hidden', 'display':'inline-block', 'white-space':'nowrap', 'width': ticker_width } )
                  .children()
                    .wrapAll( '<span class="ticker-scroll-div" />' );
               
      $t_scroll_div = $t_container.find( '.ticker-scroll-div' );
      
      $t_scroll_div.css( { 'width':children_width+'px' } );
      
      $ticker.parent().hover( mouseover, mouseout );
      $ticker.unbind( 'mouseover', init );
    };
    
    $(this).each(function( index, el ) {
      $(el).bind( 'mouseover', init );
    });
    
    return this;
    
  }; // fn.ticker

}(jQuery));
