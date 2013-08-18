/********************************************************
 * SWFUpload jQuery Plugin v1.0
 *
 * This plugin will count the characters contained in the 
 * binded element and can prevent any further character entry.
 * 
 * INSTRUCTIONS: 
 * In your javascript, add ".simpleCounter()" to any input field or
 * textarea you wish to count and/or limit. 
 * 
 * DISPLAY:
 * To display the counter, insert the following into your HTML:
 *
 *      <div class="counter-container cfix">
 *        <span id="[field name]-counter" class="right"></span>
 *      </div>
 *
 * The container is not required, but is useful to position and 
 * style the counter html. See network.css for class definitions
 *
 * PARAMETERS: See comments below for parameter explainations.
 *
 ********************************************************/



(function ($) {

  $.fn.simpleCounter = function( userParams ) {

    this.each( function() {
    
      var $field            = $(this),
          $counter          = false,
          field_classes     = $field.attr( 'class' ).split(' '),

      
          params = {
            max:              255,                  // Set as "isMinimum[0]|isMaximum[#]" rule in CRV setRule. Can be overriden in JS (though CRV will still enforce its own maximum server-side)
            warn:             10,                   // The amount of characters remaining int he field before the text changes to the "warn" color, informing the user the max limit is close
            strict:           true,                 // Prevents user from typing any data past the limit. Pasting more characters than the max will still work, though CRV will prevent form submission
            truncate:         true,                 // When pasting more characters than the max, this setting will truncate the field down to the max limit. Works only when "strict" is true
            direction:        'down',               // Direction of counter (down = counts down from max to 0. up = counts up to the max).
            downAppendString: 'characters left',    // Text that follows the character count when counting down
            upAppendString:   'characters',         // Text that follows the character count when counting up
            normalStyle:      'counter-normal',     // Class name of normal color for the coutner and its text
            warnStyle:        'counter-warn',       // Class name of the warn color for the coutner and its text
            maxStyle:         'counter-max'         // Class name of the max color for the coutner and its text
          },
          
          allowedAtMax = [
          
            $.ui.keyCode.BACKSPACE,
            $.ui.keyCode.DELETE,
            $.ui.keyCode.CONTROL,
            $.ui.keyCode.SHIFT,
            $.ui.keyCode.UP,
            $.ui.keyCode.DOWN,
            $.ui.keyCode.LEFT,
            $.ui.keyCode.RIGHT,
            $.ui.keyCode.HOME,
            $.ui.keyCode.END,
            $.ui.keyCode.PAGE_UP,
            $.ui.keyCode.PAGE_DOWN,
            $.ui.keyCode.PAGE_DOWN
          ],
       
          updateCounter = function(){ 
            var count   = $field.val().length;
            if ( params.direction == 'down' ){
              $counter.text( (params.max - count) + ' ' + params.downAppendString );
            }
            else {
              $counter.text( count + ' ' + params.upAppendString);
            } 
            
            updateColor( count );
            
          }, // update the counter text
          
          updateCounter2 = function(){

            var count   = $field.val().length;
            if ( params.direction == 'down' ){
              $counter.text( (params.max - count) + ' ' + params.downAppendString );
            }
            else {
              $counter.text( count + ' ' + params.upAppendString);
            } 
            
            updateColor( count );
            
          }, // update the counter text
          
          updateColor = function( count ){ 
            
            if ( count >= params.max ){
              $counter.addClass( params.maxStyle ).removeClass(params.warnStyle).removeClass(params.normalStyle);
              $field.trigger('simplecounter-max');
            } // if max or greater
            
            else {
               
              if ( count >= ( params.max - params.warn ) ){
                $counter.addClass( params.warnStyle ).removeClass(params.normalStyle).removeClass(params.maxStyle);
                $field.trigger('simplecounter-warn');
              } // if in warn range
              
              else{
                $counter.addClass( params.normalStyle ).removeClass(params.warnStyle).removeClass(params.maxStyle);
                $field.trigger('simplecounter-normal');
              } // if normal 
            } // if not max 
          },
          
          truncateField = function () {
            $field.val( $field.val().substring(0, params.max) ); 
          },

          countNow = function( e ){ 
            var count   = $field.val().length;
            
            if ( count >= params.max ){

              if ( params.strict && params.truncate && e !== true &&  $.inArray( e.keyCode, allowedAtMax ) == -1) {
                truncateField();
              } // prevent pasting and additional characters if strict and truncate 
              
            } // if max or greater
            
            updateCounter();
        
          }, // countNow
          
          checkStop = function( e ) {
          
            if ( ( $.inArray( e.keyCode, allowedAtMax ) == -1 ) && params.strict && $field.val().length >= params.max ) {
              
              if ( params.truncate ) { 
                truncateField();
                updateCounter();
              }
              
              return false; 
              
            }
          }; // checkStop on keydown
          
      
      $.each( field_classes, function(index, value) {
        if ( value.match( /validate\[(?:[^,]*|.*,)length\[([0-9]+),([0-9]+)\].*\]/i ) ) {
          params.max = value.replace(/validate\[(?:[^,]*|.*,)length\[([0-9]+),([0-9]+)\].*\]/i,'$2');
          return;
        }
      });
      
      params   = $.extend({}, params, userParams);
      $counter = ( params.$counter ) ? params.$counter : $( '#' + $field.attr('id') + '-counter' );
      
      if ( !$counter.length ) {
        return;
      }
      
      if ( params.direction == 'down' ){
        $counter.text( (params.max) + params.downAppendString );
      }
      else {
        $counter.text( '0' + params.upAppendString);
      }
      
      countNow(true);
      
      $field.bind('keyup', countNow);    
      $field.bind('keydown', checkStop);   
      $field.bind('alter', updateCounter2 );    
        
    }); // each
    
    return this;
    
  }; // fn.simpleCounter

}(jQuery));
