/*jslint sloppy:true*/
/*Note: This is for pantone swatches - don't confuse this with the swatches in regular colorpicker*/
(function(factory) {
  if (typeof define === 'function' && define.amd) {
    define(['jquery', 'utils/colors', 'jquery/plugins/jquery.ui.colorpicker',
            'css!styles/utils/colorpicker', 'css!styles/utils/swatchcolorpicker' ], factory);
  }
  else {
    if ( !$.fn.on ) {
      $.fn.on  = $.fn.bind;
      $.fn.off = $.fn.unbind;
    }
    factory.call(this, jQuery, Utils.Colors );
  }
}( function( $, Colors ) {
  "use strict";

  var selected_hex, $lastSwatch;

  $.widget( "ui.swatchcolorpicker", $.extend({}, {

    options : {
      $target : $(''),
      padding_bottom : 5
    },

    $children : null,
    
    value : function( hex ) {
    
      if ( hex ) {
        this.options.$target.css( 'background-color', hex );
      }
    
      return Colors.checkHex( this.options.$target.css( 'background-color' ), true );
      
    }, // value

    _init : function() {

      var widget = this;
      
      selected_hex = this.options.$target.data('hex').substr(1);// # was added to hex value to ensure it stays as string

      this.$children = $(this.element).children();
      
      // On creation of the menu selector is available to bind to
      this.$children.on( 'colorpickermenucreated', function() {
        $(this).colorpicker('menu').addClass( 'ui-swatchcolorpicker' )
          .draggable( 'disable' );
      });

      // Initialize each colorpicker
      this.$children.each(function() {
        widget._add( $(this) );
      }); // children each
      
      /*
       * After all the colorpickers are initialized, set the color since each picker
       * would have given the target their own color
       */
      this.options.$target.css( 'background-color', '#' + selected_hex );

    }, // _init
    
    // Callback to colorpicker which overrides default positioning
    _setPosition : function( $swatch ) {
    
      var $menu  = $swatch.colorpicker( 'menu' ),
          offset = $swatch.offset();
      
      $menu.css({
        left : offset.left - ( ( $menu.outerWidth() - $swatch.outerWidth() ) / 2 ),
        top  : offset.top - ( ( $menu.outerHeight() - $swatch.outerHeight() ) / 2 ) - this.options.padding_bottom
      });

    }, // _setPosition

    _add : function ( $swatch ) {

      var widget = this,
      changed    = false,
      original_hex, open_hex, original_hsv, full_hex;
          
      // Hex value includes #
      original_hex = $swatch.data('hex').replace(/#((?:[0-9a-f]{3}){1,2})/i,'$1');

      // Set selected swatch only after user opens swatch AND interacts
      function updateSwatch() {
        $lastSwatch = $swatch;
        widget._trigger( 'updatedswatch' );
      }

      $swatch.colorpicker({
        $target            : this.options.$target,
        template_id        : 'custom-colorpicker-template',
        auto_target_update : true,
        auto_swatch_update : false,
        default_color      : original_hex,
        set_position       : this._setPosition.bind( this, $swatch )
      })
      .on( 'colorpickeropen', function() {
      
        // Save off hex when opening colorpicker, before colorpicker refigures wrong color
        // Wrong color is given from picker since it does not expect brightness to be ignored
        open_hex = ( $lastSwatch && $lastSwatch[0] === $swatch[0] ) ? 
          selected_hex : 
          original_hex;

      })
      .on( 'colorpickeropened', function() {
      
        var rgb = Colors.hex2rgb( open_hex ),
            hsv = Colors.rgb2hsv( rgb[0], rgb[1], rgb[2] ),
            desaturated_rgb, desaturated_hex;

        if ( !original_hsv ) {

          original_hsv = {
            hue            : hsv[0],
            brightness     : hsv[2],
            max_saturation : hsv[1]
          };

          // Set the hex for bottom of gradient
          full_hex = open_hex;

        } // if !original_hsv

        // Get hex for top of gradient
        desaturated_rgb = Colors.hsv2rgb( hsv[0], 0, hsv[2] );
        desaturated_hex = Colors.rgb2hex( desaturated_rgb[0], desaturated_rgb[1], desaturated_rgb[2] );

        $('.colorpicker-bg')[0].style.cssText = widget._Css( desaturated_hex, full_hex );

        $swatch.colorpicker( 'moveSelector', {
            left : 0.5,
            top : hsv[1] / original_hsv.max_saturation
        });
        
        $('#colorpicker-hue-slider').slider( 'value',hsv[0] * 1000 );
        
        $swatch.colorpicker('selector').on( 'mouseup', updateSwatch );

        if ( $lastSwatch && $lastSwatch[0] !== $swatch[0] ) {
          updateSwatch();
        }

      }) // colorpickeropened
      .on( 'colorpickerclosed', function( e, ui ) {
      
        selected_hex = ui.hex;
        $swatch.colorpicker('selector').off( 'mouseup', updateSwatch );
        widget._trigger( 'save' );
      
      }) // colorpickerclosed
      .on( 'colorpickernewhsv', function( e, ui ) {

        if ( !original_hsv ) {
          return;
        }

        // Ensure that the colorpicker's selection is overwritten to keep H and V locked
        ui.hsv.hue        = original_hsv.hue;
        ui.hsv.brightness = original_hsv.brightness;
        ui.hsv.saturation = ( 1 - ui.top_percentage ) * original_hsv.max_saturation;

      }); // colorpickernewhsv


    }, // _add

    _Css : function( start_hex, end_hex ) {

      var css = '',
          start_rgba     = Colors.hex2rgbstring( start_hex ),
          end_rgba       = Colors.hex2rgbstring( end_hex );

      css += 'background: -moz-linear-gradient(top,  ' + start_rgba + ' 0%, ' + end_rgba + ' 100%);';
      css += 'background: -webkit-gradient(linear, left top, left bottom, color-stop(0%,' + start_rgba + '), color-stop(100%,' + end_rgba + '));';
      css += 'background: -webkit-linear-gradient(top,  ' + start_rgba + ' 0%,' + end_rgba + ' 100%);';
      css += 'background: -o-linear-gradient(top,  ' + start_rgba + ' 0%,' + end_rgba + ' 100%);';
      css += 'background: -ms-linear-gradient(top,  ' + start_rgba + ' 0%,' + end_rgba + ' 100%);';
      css += 'background: linear-gradient(to bottom,  ' + start_rgba + ' 0%,' + end_rgba + ' 100%);';
      css += 'filter: progid:DXImageTransform.Microsoft.gradient( startColorstr=\'#' + start_hex + '\', endColorstr=\'#00' + end_hex + '\',GradientType=0 );';
      
      return css;

    } // _Css

  }));

}));
