/*global jQuery */
(function(factory) {
  'use strict';
  if (typeof define === 'function' && define.amd) {
    define([ 'jquery',
        'utils/colors',
        'jquery/plugins/jquery.cookie',
        'jquery/ui/draggable',
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

  var CLOSE_EVT = 'mousedown',
      Menu, $active_element, $menu, menu_height, menu_width, $palette, palette_height,
      palette_width, $input, $r, $g, $b, $selector, $hue, $original_swatch,
      $current_swatch, element_width, $cancel_btn, $save_btn, $body,
      $spot, $spots, $add_color, $saved_colors;

  $.widget( "ui.colorpicker", $.extend({}, {

    options : {
      template            : null,
      property            : 'background-color',
      $target             : null,
      default_color       : null,
      set_position        : null,
      $position_element   : null,
      auto_element_update : false,
      auto_swatch_update  : true,
      auto_target_update  : true,
      default_spot_color  : 'D5D5D5',
      spot_colors         : [
        'unselected',
        'unselected',
        'unselected',
        'unselected',
        'unselected',
        'unselected',
        'unselected',
        'unselected'
      ]
    },

    current_hex : null,
    opened_hex  : null,
    is_open     : false,

    _init : function() {

      var opts = this.options;

      $body = $( document.body);

      // If there is no menu, create it
      if ( !$menu || !$menu.length ) {
        $menu = Menu._create( this );
      }

      if ( opts.default_color ) {
        opts.default_color = Colors.checkHex( opts.default_color, true );
        this.current_hex = opts.default_color;
      }

      opts.$target = opts.$target || this.element;

      // Ensure that close, cancel, open always has the same context no matter what
      this.close  = this.close.bind( this );
      this.cancel = this.cancel.bind( this );
      this.open   = this.open.bind( this );

      this.element.on( 'click', this.open );

      this.element.on( 'colorpickerupdate', function( e, ui ) {

        if ( this.options.auto_target_update === true && this.options.$target ) {
          this._setCssColor( '#' + ui.hex );
        }

        if ( this.options.auto_element_update === true ) {
          this.element.css( 'background-color', '#' + ui.hex );
        }

      }.bind( this ));

      element_width = this.element.width();

      this.current_hex = this._initColor();

    }, // _init

    open : function( e ) {

      // Set "global" variable so Menu knows which element it's dealing with
      $active_element = this.element;

      var setPos      = this.options.set_position,
          doc_width   = $(document).width(),
          doc_height  = $(document).height(),
          menu_offset;

        Menu.open();

      this._trigger( 'open' );

      // Position menu in relation to picker
      if ( !setPos  ) {

        $menu.clonePosition( this.options.$position_element || this.element, {
          setWidth   : false,
          setHeight  : false,
          offsetLeft : element_width+15,
          offsetTop  : Math.round( menu_height / 2 ) * -1
        });

        // Now that menu is positioned, check that it's not off the page
        menu_offset = $menu.offset();

        if ( ( menu_width + menu_offset.left ) > doc_width ) {
          $menu.css({'left':( doc_width - menu_width) - 15+'px'});
        }

        if ( ( menu_offset.top + menu_height ) > doc_height ) {
          $menu.css({'top':( doc_height - menu_height ) - 15+'px'});
        }

      }
      // Use callback function
      else {
        setPos.apply( this );
      }

      // Stop event bubbling so clicking swatch won't close menu
      if ( e && e.stopPropagation ) {
        e.stopPropagation();
      }

      // Update elements inside menu
      Menu._setFromHex( this.current_hex );

      // Close menu on click outside of element
      $body.on( CLOSE_EVT, this.close );

      this.opened_hex = this.current_hex;

      this.is_open = true;

      this._trigger( 'opened' );


    }, // open

    activeElement : function( $element ) {
      $active_element = $element;
    },

    cancel : function(e) {
      Menu._setFromHex( this.opened_hex );
      this.close(e);
    }, // cancel

    close : function(e) {

      // No need to close if it's already closed
      if ( !this.is_open ) {
        return;
      }

      this._trigger( 'close', {}, { hex : this.current_hex } );

      $body.off( CLOSE_EVT, this.close );

      if ( this.options.auto_swatch_update === true ) {
        this.element.css({'background-color': '#'+this.current_hex});
      }

      Menu.close();

      this.is_open = false;

      this._trigger( 'closed', {}, { hex : this.current_hex } );

      // Stop bubbling so no other possible binds detect a click on body when closing menu
      if ( e && e.stopPropagation ) {
        e.stopPropagation();
      }

    }, // close

    moveSelector : function( percentages ) {

      var left = palette_width * percentages.left,
          top  = palette_height * percentages.top;

      Menu._placeSelector({
        top : Math.round( top ),
        left : Math.round( left )
      });

    }, // moveSelector

    value : function( hex ) {

      if ( hex ) {
        Menu._setFromHex( hex );
      }

      return this.current_hex;
    },

    selector : function() {
      return $selector;
    }, // selector

    menu : function() {
      return $menu;
    }, // menu

    _getCssColor : function( $el ) {

      var css_value   = '',
          split_props = this.options.property.split(','),
          get         = ( split_props[0] === 'border-color' ) ? // if there are multiple props, only go off of one for color
                        'border-bottom-color' :
                        split_props[0];

      switch ( get ) {

        case 'box-shadow' :

          // Use regex to replace out extra arguments of shadow to only get the color
          css_value = $el.css( get ).replace(/(\d+), /g, "$1,").split(' ');

          return Colors.checkHex( css_value[0], true );

        default :
          return $el.css( get );

      } // switch this.targetProp

    }, // _getCssColor

    _setCssColor : function( color ) {

      var css_value   = '',
          $target     = this.options.$target,
          split_props = this.options.property.split(',');

      if (!$target) { return; }

      $.each( split_props, function( index, prop ) {

        switch ( prop ) {

          case 'box-shadow' :
            // Regex replace out extra bits aside from RGB
            css_value    = $target.css( prop ).replace(/(\d+), /g, "$1,").split(' ');
            css_value[0] = color;

            $target.css( prop, css_value.join(' ') );
            break;

          default :
            $target.css( prop, color );
            break;

        } // switch prop

      }); // each props

    }, // _setCssColor

    _initColor : function() {

      var opts            = this.options,
          initColor       = false,
          val             = false,
          $css_target     = this.options.$target,
          triggerFallback = false;

      if ( opts.default_color ) {
        initColor = opts.default_color;
      }
      else {

        // Loop through until a CSS value can be found
        while ( $css_target && $css_target.length && ( !val || val === 'transparent' ) ) {

          // Attempt to get color from CSS
          val =  Colors.rgbString2hex( this._getCssColor( $css_target ) );

          // In case browser reports 'FFF', then make it 'FFFFFF' aka guard against shorthand
          if ( val.length === 3 ) {
            val = val + val;
          }

          // Hit the end of the line
          if ( $css_target[0].tagName === 'BODY') {
            triggerFallback = true;
            break;

          }
          // Look up to the next element for property
          else {
            $css_target = $css_target.parent();
          }

        } // while !val

        initColor   = Colors.rgbString2hex(val);

      } // else this.default_color

      // Update swatch to right color
      this.element.css({'background-color': '#'+initColor});
      this._setCssColor( '#'+initColor );

      // This only hits if it goes transparent all the way up the chain
      if (triggerFallback) {
        this.element.trigger('transparentFallback' );
      }

      return initColor;

    } // _initColor

  })); // widget

  // TODO: Make one menu per picker to allow for multiple swatches, multiple menu layouts and "spots"
  // Singleton for menu with controls
  Menu = {

    updating_from_input : false,

    // Creates single menu for all colorpickers
    _create : function( widget ) {

      // Get reference to template script
      var $menu = $(widget.options.template());

      function hueUpdate( e, ui ) {

        Menu._updateHue();

      } // hueUpdate

      function paletteUpdate( e, ui ) {

        Menu._updateFromHue();

      } // paletteUpdate

      $menu.addClass( 'ui-colorpicker-menu' );

      // Add menu to body
      $(document.body).append( $menu.hide() );

      // User can drag menu
      $menu.draggable({
        containment : $(document.body)
      });

      widget._trigger( 'menucreated' );

      // Make sure clicking menu does not close itself
      $menu.on( CLOSE_EVT, function( e ) {
        e.stopPropagation();
      });

      // Define elements that are global for all colorpickers using widget
      $selector        = $menu.find('#colorpicker-selector');
      $hue             = $menu.find('#colorpicker-hue-slider');
      $palette         = $menu.find('#colorpicker-palette');
      palette_height   = $palette.height();
      palette_width    = $palette.width();
      $input           = $menu.find("#colorpicker-input");
      $r               = $menu.find("#colorpicker-input-r");
      $g               = $menu.find("#colorpicker-input-g");
      $b               = $menu.find("#colorpicker-input-b");
      $current_swatch  = $menu.find("#colorpicker-control-swatch");
      $original_swatch = $menu.find("#colorpicker-original-swatch");
      menu_height      = $menu.height();
      menu_width       = $menu.width();
      $save_btn        = $menu.find("#colorpicker-okbutton");
      $cancel_btn      = $menu.find("#colorpicker-cancelbutton");
      $spots           = $menu.find('.colorpicker-spot');
      $add_color       = $menu.find( '#add-to-my-colors' );
      $saved_colors    = $menu.find( '#saved-colors' );

      $selector.draggable({
        containment : $selector.parent(),
        zindex      : 1009,
        drag        : paletteUpdate
      });

      $hue.slider({
        orientation : 'vertical',
        min         : 0,
        max         : 1000,
        slide       : hueUpdate,
        change      : hueUpdate
      });

      $palette.on( 'mousedown', this._updateSelectorFromClick.bind( this ) );

      $input.on( 'change', this._updateFromInput.bind( this ) );
      $r.on( 'change', this._updateFromRGBInputs.bind( this ) );
      $g.on( 'change', this._updateFromRGBInputs.bind( this ) );
      $b.on( 'change', this._updateFromRGBInputs.bind( this ) );

      if ( $spots.length ) {
        this._initSpots(widget);
      }

      return $menu;

    }, // _create

    _initSpots : function(widget) {

      var opts = widget.options;

      if ( typeof $.cookie !== 'undefined' && $.cookie("spot_colors") ) {
        opts.spot_colors = $.cookie("spot_colors").split(',');
      }

      $spots.each( function( inc, spot ) {

        var $spot      = $(spot),
            spot_color = opts.spot_colors[ inc ];

        if ( spot_color === 'unselected' ) {
          spot_color = opts.default_spot_color;
          $spot.data('unselected',true);
        }

        $spot.css( 'background-color', '#' + spot_color );

        $spot.on( 'click', function() {

          var $unselected =  $spots.filter(':data(unselected)'),
              new_hex     = Colors.checkHex( $spot.css('background-color'), true );

          $input.val( new_hex );
          $input.trigger( 'change' );

          $spots.removeClass('selected');
          $spot.addClass('selected');
          $add_color.text( 'Add' );

          if ( opts.default_spot_color !== new_hex ) {
            $add_color.text( 'Replace' );
          }

        });



      }.bind( this )); // $spots each

      $add_color.on( 'click', function() {

        var $selected   = $spots.filter('.selected'),
            position    = 0,
            $unselected = $spots.filter(':data(unselected)');

        if ( !$selected.length ) {
          $selected = $unselected.first();
        }

        $selected.removeData( 'unselected' );

        position = $.inArray( $selected[0], $spots );

        opts.spot_colors[ position ] = $input.val();

        $selected.css( 'background-color', '#' + $input.val() );

        $add_color.text( 'Replace' );

        if ( typeof $.cookie !== 'undefined'  ) {
          $.cookie("spot_colors", opts.spot_colors.join(','), { path : '/', expires: new Date(9999999999999) });
        }

      }); // $add_color


      if ( $spots.filter(':data(unselected)').length === 0 ) {
        $add_color.text( 'Replace' );
      }

    }, // _initSpots

    open : function() {

      var widget = $active_element.data( 'uiColorpicker' );

      $save_btn.on( 'click', widget.close );
      $cancel_btn.on( 'click', widget.cancel );

      $menu.show();

    }, // open

    close : function() {

      var widget = $active_element.data( 'uiColorpicker' );

      $save_btn.off( 'click', widget.close );
      $cancel_btn.off( 'click', widget.cancel );

      $menu.hide();

    }, // close

    // Sets all menu widgets from hex value, including original swatch
    _setFromHex : function( hex ) {

      $input.val( hex );
      Menu._updateFromInput();
      $original_swatch.css({'background-color': '#' + hex });

    }, // _setFromHex

    // fires when user clicks into color palette
    _updateSelectorFromClick : function(e) {

      var xPos   = e.pageX,
          yPos   = e.pageY,
          pos    = $palette.offset(),
          left   = xPos - pos.left+'px',
          top    = yPos - pos.top+'px';

      $selector.trigger( e );
      $selector.css({left:left,top:top});
      this._updateFromHue();

    }, // _updateSelectorFromClick

    _updateFromRGBInputs : function( e ) {

      var rgb    = [],
          inc    = 0,
          hex    = false;

      rgb[0] = $r[0].value;
      rgb[1] = $g[0].value;
      rgb[2] = $b[0].value;

      for ( inc; inc < 3; ++inc ) {

        if ( !rgb[inc].match(/^\d+$/) ) {
          rgb[inc] = 255;
        }
        else if ( rgb[inc] < 0 ) {
          rgb[inc] = 0;
        }
        else if ( rgb[inc] > 255 ) {
          rgb[inc] = 255;
        }

      } // for inc

      hex = Colors.rgb2hex(rgb[0], rgb[1], rgb[2]);

      $input.val( hex )
        .trigger( 'change' );

    }, // _updateFromRGBInputs

    _updateFromInput : function() {

      this.updating_from_input = true;

      var field  = $input[0],
          rgb    = Colors.hex2rgb( field.value ),
          hsv    = Colors.rgb2hsv( rgb[0], rgb[1], rgb[2] ),
          left   = Math.round( hsv[1] * palette_width ) + "px",
          top    = Math.round( ( 1 - hsv[2] ) * palette_height ) + "px";

      this._updateAllValues( field.value, rgb );

      this._placeSelector({
        left : left,
        top  : top
      });

      // Important to note that _updateHue will be called by changing slider value
      $hue.slider( 'value', hsv[0] * $hue.slider( 'option', 'max' ) );

      this.updating_from_input = false;

    }, // _updateFromInput

    _placeSelector : function( css ) {

      $selector.css(css);

    }, // _placeSelector

    // Updates hue which then updates everything down the line hue_value, should be 0 -> 1
    _updateHue : function( hue_value ) {

      hue_value = hue_value || this._getHueValue();

      var rgb;

      // Make sure that the hue is consistent for 1 and 0 since hue wraps aruond
      if ( hue_value === 1 ) {
        hue_value = 0;
      }

      // Make overlay have right background color over grey gradient
      rgb = Colors.hsv2rgb( ( 1 - hue_value ), 1, 1 );
      $palette[0].style.backgroundColor = "rgb(" + rgb[0] + ", " + rgb[1] + ", " + rgb[2] + ")";

      this._updateFromHue( hue_value );

    }, // _updateHue

    // Does math to get hue_value based on slider,
    _getHueValue : function() {

      var max = $hue.slider( 'option', 'max' );

      // Make sure value gets turned from 0-1000 to 0-1
      return ( ( max - $hue.slider( 'option', 'value' ) ) / max );

    }, // _getHueValue

    // Updates inputs, background, and current hex values
    _updateAllValues : function( hex, rgb ) {

      var widget = $active_element.data( 'uiColorpicker' );

      if ( !rgb ) {
        rgb = Colors.hex2rgb( hex );
      }

      // Updates inputs in UI along with color comparison swatch
      $r[0].value                              = rgb[0];
      $g[0].value                              = rgb[1];
      $b[0].value                              = rgb[2];
      $input[0].value                          = hex;
      $current_swatch[0].style.backgroundColor = '#'+hex;
      widget.current_hex                       = hex;

    }, // _updateAllValues

    _updateFromHue : function( hue_value ) {

      // figure out where selector is in palette
      var widget          = $active_element.data( 'uiColorpicker' ),
          selector_left   = parseInt( $selector[0].style.left, 10 ),
          selector_top    = parseInt( $selector[0].style.top, 10 ),
          left_percentage = selector_left / palette_width,
          top_percentage  = ( palette_height - selector_top ) / palette_height,
          hsv             = '',
          rgb             = [], // array for rgb  from hsv conversion
          hex             = ''; // hex for after rgb conversion

      // Get the hue from what's passed in, and if it's not use the function
      hue_value = hue_value || this._getHueValue();

      if ( hue_value === 1 ) {
        hue_value = 0;
      }

      // Magic color math to get HSV based on percentage of gradient
      hsv = {
        hue        : 1 - hue_value, // Based on slider
        saturation : left_percentage, // Based on how far left or right selector is in gradient
        brightness : top_percentage // Based on how high or low selector is in gradient

      };

      widget._trigger( 'newhsv', {}, {
        hsv             : hsv,
        left_percentage : left_percentage,
        top_percentage  : top_percentage
      });

      // Get RGB based on the HSV, which is returned as an array
      rgb = Colors.hsv2rgb( hsv.hue, hsv.saturation, hsv.brightness );


      // Get hex from rgb
      hex = Colors.rgb2hex( rgb[0], rgb[1], rgb[2] );

      // If updating from input, it would have called _updateAllValues
      if ( !this.updating_from_input ) {
        this._updateAllValues( hex, rgb );
      }

      widget._trigger( 'update', {}, { hex : hex } );

    } // _updateFromHue

  }; // Menu

}));
