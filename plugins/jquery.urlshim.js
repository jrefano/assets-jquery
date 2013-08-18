$.fn.urlShim = function() {

  var $input              = this.find('.shim-input'),
      $input_placeholder  = false,
      $wrap               = false,
      $shim               = false,
      height              = false,
      shim_width          = 0,
      field_padding       = 0;
      field_width         = 0;

  $input.each(function() {
    
    $input             = $(this);
    $wrap              = $input.closest('.shim-wrap');
    $input_placeholder = $wrap.find('.form-text-placeholder');
    $shim              = $wrap.find('.shim');
    height             = ( $input.is(':visible') ? $input : $input_placeholder ).outerHeight() - parseFloat( $input.css('border-top-width') ) * 2;
    side               = ( $wrap.hasClass( 'shim-right' ) ) ? 'right' : 'left';
    
    // set the styles for the shim
    $shim.css({ height      : height, 
                lineHeight  : height+'px', 
                display     : 'block' });
    
    if ( side === 'left' ) {
      $shim.css({ 
        borderRight : '1px solid ' + $input.css('border-left-color'),
        borderLeft  : '0' 
      });
    }
    else {
      $shim.css({ 
        borderLeft  : '1px solid ' + $input.css('border-right-color'),
        borderRight : '0' 
      });
    }
    
    // bind a click event to the shim to focus the placeholder,
    // that way clicking the shim will hide a visible placeholder and focus the actual field
    $shim.bind('click', function() {
      $input_placeholder.focus();
    });
    
    // store some values...
    shim_width     = $shim.outerWidth();
    field_padding  = parseFloat( $input.css('padding-'+side) );
    field_width    = $input.width();
    
    // if we changed the value on the shim and are re-initializing sizes, check to see if we stored the original side padding

    if ( typeof $input.data( 'original' ) === 'undefined' ) {
    
     $input.data( 'original', {
        'padding-left'  : parseFloat( $input.css('padding-left') ),
        'padding-right' : parseFloat( $input.css('padding-right') ),
        'width'         : parseFloat( $input.css('width') )
      });

    } // if not set
    
    else {
      field_padding =  $input.data( 'original' )['padding-'+side];
      field_width   =  $input.data( 'original' ).width;
    }
    
    // If the shim is empty, set shim_width value to 0 and hide it
    if ( $shim.text() === '' ) {
      shim_width = 0;
      $shim.css({ display : 'none' });
    }
    
    // ...do some math to set the width and padding of the input field, adjusted accordingly based on the size of the shim
    // a static shim does not affect the overall width of the input field. other shims do.
    var $both_inputs     = $input.add( $input_placeholder ),
        sum_padding      = shim_width + field_padding,
        new_width        = $shim.hasClass('static-shim') ? field_width - shim_width : field_width;

        
    if ( side === 'left' ) {
      $both_inputs.css({ 
        paddingLeft  : sum_padding, 
        paddingRight : $input.data( 'original' )['padding-right']
      });
    }
    else {
      $both_inputs.css({ 
        paddingRight : sum_padding, 
        paddingLeft  : $input.data( 'original' )['padding-left']
      });
    }
      
    // IE reflow bug requires us to set width and padding at different times
    if ( $('.ie').length > 0 ) {
    
      setTimeout( function() {
        $both_inputs.css({ width : new_width });
      }, 1 ); // setTimeout
      
    } // if ie
    else {
      $both_inputs.css({ width : new_width });
    }
    
  }); // each shim-input
  
  return this;
  
};