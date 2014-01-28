/*global jQuery */
/**
 * Copied out of plugins folder as part of project editor refactor
 * No longer uses Fn/Core.js, but can still use a bit of refactoring
 */
(function(factory) {
  'use strict';
  if (typeof define === 'function' && define.amd) {
    define([ 'jquery',
        'jquery/ui/slider' ], function() {
      var module = factory.apply(this, arguments);
      return module;
    });
  }
  else {
    return jQuery && factory.call(this, jQuery);
  }
}(function($, Colors) {
  'use strict';

  $.fn.fancyslider = function( options ) {

    options = $.extend( {
      animate         : 'fast',
      input           : 'value',
      value           : 0,
      percent_default : 50

    }, options );

    var $slider      = this,
        last_hit     = false,
        percent      = 100 * options.value / options.max, // can't use function since slider doesn't exist yet
        $progress    = $('<div class="ui-progress"/>'),
        dinput_value = ( options.input === 'value' ) ? options.value : percent,
        $input       = $('input[type=text]').filter(function() {
          return $(this).data('forslider') === $slider[0].id;
        });

    // Guard against bad default value
    if ( percent > 100 ) {
      percent = 100;
    }

    $progress.css( 'width', percent+'%' );

    function updateFromInput( e, force ) {

      var val = parseInt( this.value, 10 ),
          max = $slider.slider( 'option', 'max' ),
          min = $slider.slider( 'option', 'min' ),
          slider_value;

      function exceedsMax() {

        if ( options.input === 'value' ) {

          if ( val > max ) {
            return true;
          }
        }
        else if ( val > 100 ) {
          return true;
        }

        return false;


      } // exceedsMax

      function exceedsMin() {

        if ( options.input === 'value' ) {

          if ( val < min ) {
            return true;
          }
        }
        else if ( val < 0 ) {
          return true;
        }

        return false;

      } // exceedsMax

      // no need to update if on blur same value as what's saved
      if ( parseInt( $slider.slider('value'), 10 ) === val && force !== true ) {
        return;
      }

      if (+val || val === 0) {
        val = ( options.input === 'value' ) ? $slider.slider( 'value' ) : options.percent_default;
      }

      // simulate slidestart to calculate some default values
      $slider.trigger( 'slidestart', { value: $slider.slider( 'value' ) } );

      last_hit = false;

      if ( options.input === 'value' ) {
        slider_value = val;
      }
      else {
        slider_value = Math.round( $slider.slider( 'option', 'max' ) * ( val/100 ) );
      }

      if ( exceedsMax()) {
        slider_value = max;
      }

      if ( exceedsMin() ) {
        slider_value = min;
      }

      // set slider to new val
      $slider.slider( 'value', slider_value );

      $slider.trigger( 'slide', { value: slider_value } );

      // after triggering slide, all new correct values are set, so correct in this scope
      slider_value = $slider.slider('value');

      $slider.trigger( 'slidestop', { value: slider_value } );

      // make sure input is right val
      this.value = ( options.input === 'value' ) ? slider_value : ( slider_value / max ) * 100;

    } // updateFromInput

    function keyDown( e ) {

      var trigger = false;

      switch ( e.keyCode ) {

        case $.ui.keyCode.ENTER :
          trigger = true;
          break;

        case $.ui.keyCode.UP :
          $input.val( parseInt( $input.val(), 10 ) + 1 );
          trigger = true;
          break;

        case $.ui.keyCode.DOWN :
          $input.val( parseInt( $input.val(), 10 ) - 1 );
          trigger = true;
          break;

        default :
          break;

      } // switch e.keyCode

      if ( trigger ) {

        $input.trigger('blur').focus();
        return false;

      }

    } // keyDown

    function checkKey() {

      // Only update based on timeout if enough time has elapsed and the input has a value
      if ( last_hit && ( new Date() - last_hit ) > 500 && $input.val() ) {

        $input.trigger('blur').focus();
        last_hit = false;

      }

    } // checkKey

    function keyUp( e ) {

      switch ( e.keyCode ) {

        // already handled in the up event
        case $.ui.keyCode.ENTER :
        case $.ui.keyCode.UP :
        case $.ui.keyCode.DOWN :
          return false;


      } // switch e.keyCode

      last_hit = new Date();
      setTimeout( checkKey, 1000 );

    } // keyUp

    function getPercent( value ) {

      // Getting min and max during slide just in case some options change during event binds
      var min         = $slider.slider( 'option', 'min' ),
          max         = $slider.slider( 'option', 'max' );

      return 100 * ( value - min ) / ( max - min );

    } // getPercent

    this.slider( options )
    .on( 'slide', function(e, ui) {

      var percent     = getPercent( ui.value ),
          input_value = ( options.input === 'value' ) ? ui.value : percent;

      $progress.css( 'width', percent+'%' );

      $input.val( input_value );

    })
    .prepend( $progress );

    $input.val( dinput_value );

    $input.on( 'blur', updateFromInput  )
          .on( 'keydown', keyDown )
          .on( 'keyup', keyUp );

    return this;

  }; // fancyslider

}));