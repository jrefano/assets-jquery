$.fn.readMoreBox = function( $see_all ) {

  var $tag_container = this,
      start_height   = $tag_container.height(),
      full_height    = $tag_container.css('max-height','').height('auto').height(),
      viewing_all    = false;
      
  $tag_container.height( start_height );
  
  $see_all.hide();
  
  if ( start_height !== full_height ) {
    
    if( full_height < start_height ) {
      
      $tag_container.height( full_height );
      
    }
    else {
      
      $see_all.show().find('.fake-link').on( 'click', function() {
  
        // if viewing_all is true, you are about to not be viewing them all
        // if it is false, you are about to view them all
      
        var toggle_height = start_height,
            text_func     = 'remove';
      
        if( !viewing_all ) {
          toggle_height = full_height;
          text_func     = 'add';
        }
      
        $tag_container.animate( { height : toggle_height } );
      
        $see_all[text_func + 'Class']('viewing-all');
      
        viewing_all = !viewing_all;
      
      });
    
    } // else
    
  } // height diff

};