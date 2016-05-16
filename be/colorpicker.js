define([
  'jquery',
  'beff/util/cookie',
  'utils/colors',
  'jqueryui/draggable',
  'jqueryui/slider'
], function($, cookie, Colors) {
  'use strict';

  var CLOSE_EVT = 'mousedown',
      Menu, activeInstance, $menu, menuHeight, menuWidth, $palette, paletteHeight,
      paletteWidth, $input, $r, $g, $b, $selector, $hue, $originalSwatch,
      $currentSwatch, elementWidth, $cancelBtn, $saveBtn, $body,
      $spots, $addColor, $savedColors;

  $.widget("be.colorpicker", $.extend({}, {

    options: {
      template: null,
      property: 'background-color',
      $target: null,
      default_color: null,
      set_position: null,
      $position_element: null,
      auto_element_update: false,
      auto_swatch_update: true,
      auto_target_update: true,
      default_spot_color: 'D5D5D5',
      label_add: 'Add',
      label_replace: 'Replace',
      spot_colors: [
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

    current_hex: null,
    opened_hex: null,
    is_open: false,

    _init: function() {
      var opts = this.options;

      $body = $(document.body);

      // If there is no menu, create it
      if (!$menu || !$menu.length) {
        $menu = Menu._create(this);
      }

      if (opts.default_color) {
        opts.default_color = Colors.checkHex(opts.default_color, true);
        this.current_hex = opts.default_color;
      }

      opts.$target = opts.$target || this.element;

      // Ensure that close, cancel, open always has the same context no matter what
      this.close = this.close.bind(this);
      this.cancel = this.cancel.bind(this);
      this.open = this.open.bind(this);

      this.element.on('click', this.open);

      this.element.on('colorpickerupdate', function(e, ui) {
        if (this.options.auto_target_update === true && this.options.$target) {
          this._setCssColor('#' + ui.hex);
        }

        if (this.options.auto_element_update === true) {
          this.element.css('background-color', '#' + ui.hex);
        }
      }.bind(this));

      elementWidth = this.element.width();

      this.current_hex = this._initColor();
    },

    clonePosition: function($moving, $source, options) {
      options = $.extend({
        offsetLeft: 0,
        offsetTop: 0
      }, options);

      var offset = $source.offset();

      return $moving.css({
        left: offset.left + options.offsetLeft + 'px',
        top: offset.top + options.offsetTop + 'px'
      });
    },

    open: function(e) {
      // Set "global" variable so Menu knows which element it's dealing with
      activeInstance = this;

      var setPos = this.options.set_position,
          docWidth = $(document).width(),
          docHeight = $(document).height(),
          menuOffset;

      Menu.open();

      this._trigger('open');

      // Position menu in relation to picker
      if (!setPos) {
        this.clonePosition($menu, this.options.$position_element || this.element, {
          offsetLeft: elementWidth + 15,
          offsetTop: Math.round(menuHeight / 2) * -1
        });

        // Now that menu is positioned, check that it's not off the page
        menuOffset = $menu.offset();

        if ((menuWidth + menuOffset.left) > docWidth) {
          $menu.css({left: (docWidth - menuWidth) - 15 + 'px'});
        }

        if ((menuOffset.top + menuHeight) > docHeight) {
          $menu.css({top: (docHeight - menuHeight) - 15 + 'px'});
        }
      }
      // Use callback function
      else {
        setPos.apply(this);
      }

      // Stop event bubbling so clicking swatch won't close menu
      if (e && e.stopPropagation) {
        e.stopPropagation();
      }

      // Update elements inside menu
      Menu._setFromHex(this.current_hex);

      // Close menu on click outside of element
      $body.on(CLOSE_EVT, this.close);

      this.opened_hex = this.current_hex;

      this.is_open = true;

      this._trigger('opened');
    },

    resetActiveInstance: function() {
      activeInstance = this;
    },

    cancel: function(e) {
      Menu._setFromHex(this.opened_hex);
      this.close(e);
    },

    close: function(e) {
      // No need to close if it's already closed
      if (!this.is_open) {
        return;
      }

      this._trigger('close', {}, { hex: this.current_hex });

      $body.off(CLOSE_EVT, this.close);

      if (this.options.auto_swatch_update === true) {
        this.element.css({'background-color': '#' + this.current_hex});
      }

      Menu.close();

      this.is_open = false;

      this._trigger('closed', {}, { hex: this.current_hex });

      // Stop bubbling so no other possible binds detect a click on body when closing menu
      if (e && e.stopPropagation) {
        e.stopPropagation();
      }
    },

    moveSelector: function(percentages) {
      var left = paletteWidth * percentages.left,
          top = paletteHeight * percentages.top;

      Menu._placeSelector({
        top: Math.round(top),
        left: Math.round(left)
      });
    },

    value: function(hex) {
      if (hex) {
        Menu._setFromHex(hex);
      }

      return this.current_hex;
    },

    selector: function() {
      return $selector;
    },

    menu: function() {
      return $menu;
    },

    _getCssColor: function($el) {
      var cssValue = '',
          splitProps = this.options.property.split(','),
          get = (splitProps[0] === 'border-color') ? 'border-bottom-color' : splitProps[0];

      switch (get) {

        case 'box-shadow':

          // Use regex to replace out extra arguments of shadow to only get the color
          cssValue = $el.css(get).replace(/(\d+), /g, "$1,").split(' ');

          return Colors.checkHex(cssValue[0], true);

        default:
          return $el.css(get);

      }
    },

    _setCssColor: function(color) {
      var cssValue = '',
          $target = this.options.$target,
          splitProps = this.options.property.split(',');

      if (!$target) { return; }

      $.each(splitProps, function(index, prop) {
        switch (prop) {

          case 'box-shadow':
            // Regex replace out extra bits aside from RGB
            cssValue = $target.css(prop).replace(/(\d+), /g, "$1,").split(' ');
            cssValue[0] = color;

            $target.css(prop, cssValue.join(' '));
            break;

          default:
            $target.css(prop, color);
            break;

        }
      });
    },

    _initColor: function() {
      var opts = this.options,
          initColor = false,
          val = false,
          $cssTarget = this.options.$target,
          triggerFallback = false;

      if (opts.default_color) {
        initColor = opts.default_color;
      }
      else {
        // Loop through until a CSS value can be found
        while ($cssTarget && $cssTarget.length && (!val || val === 'transparent')) {
          // Attempt to get color from CSS
          val =  Colors.rgbString2hex(this._getCssColor($cssTarget));

          // In case browser reports 'FFF', then make it 'FFFFFF' aka guard against shorthand
          if (val.length === 3) {
            val = val + val;
          }

          // Hit the end of the line
          if ($cssTarget[0].tagName === 'BODY') {
            triggerFallback = true;
            break;
          }
          // Look up to the next element for property
          else {
            $cssTarget = $cssTarget.parent();
          }
        }

        initColor = Colors.rgbString2hex(val);
      }

      // Update swatch to right color
      this.element.css({'background-color': '#' + initColor});
      this._setCssColor('#' + initColor);

      // This only hits if it goes transparent all the way up the chain
      if (triggerFallback) {
        this.element.trigger('transparentFallback');
      }

      return initColor;
    }

  })); // widget

  // TODO: Make one menu per picker to allow for multiple swatches, multiple menu layouts and "spots"
  // Singleton for menu with controls
  Menu = {

    updating_from_input: false,

    // Creates single menu for all colorpickers
    _create: function(widget) {
      // Get reference to template script
      var $menu = $(widget.options.template());

      function hueUpdate(e, ui) {
        Menu._updateHue();
      }

      function paletteUpdate(e, ui) {
        Menu._updateFromHue();
      }

      $menu.addClass('ui-colorpicker-menu');

      // Add menu to body
      $(document.body).append($menu.hide());

      // User can drag menu
      $menu.draggable({
        containment: $(document.body)
      });

      widget._trigger('menucreated');

      // Make sure clicking menu does not close itself
      $menu.on(CLOSE_EVT, function(e) {
        e.stopPropagation();
      });

      // Define elements that are global for all colorpickers using widget
      $selector = $menu.find('#colorpicker-selector');
      $hue = $menu.find('#colorpicker-hue-slider');
      $palette = $menu.find('#colorpicker-palette');
      paletteHeight = $palette.height();
      paletteWidth = $palette.width();
      $input = $menu.find("#colorpicker-input");
      $r = $menu.find("#colorpicker-input-r");
      $g = $menu.find("#colorpicker-input-g");
      $b = $menu.find("#colorpicker-input-b");
      $currentSwatch = $menu.find("#colorpicker-control-swatch");
      $originalSwatch = $menu.find("#colorpicker-original-swatch");
      menuHeight = $menu.height();
      menuWidth = $menu.width();
      $saveBtn = $menu.find("#colorpicker-okbutton");
      $cancelBtn = $menu.find("#colorpicker-cancelbutton");
      $spots = $menu.find('.colorpicker-spot');
      $addColor = $menu.find('#add-to-my-colors');
      $savedColors = $menu.find('#saved-colors');

      $selector.draggable({
        containment: $selector.parent(),
        zindex: 1009,
        drag: paletteUpdate
      });

      $hue.slider({
        orientation: 'vertical',
        min: 0,
        max: 1000,
        slide: hueUpdate,
        change: hueUpdate
      });

      $palette.on('mousedown', this._updateSelectorFromClick.bind(this));

      $input.on('change', this._updateFromInput.bind(this));
      $r.on('change', this._updateFromRGBInputs.bind(this));
      $g.on('change', this._updateFromRGBInputs.bind(this));
      $b.on('change', this._updateFromRGBInputs.bind(this));

      if ($spots.length) {
        this._initSpots(widget);
      }

      return $menu;
    }, // _create

    _initSpots: function(widget) {
      var opts = widget.options;

      if (cookie('spot_colors')) {
        opts.spot_colors = cookie('spot_colors').split(',');
      }

      $spots.each(function(inc, spot) {
        var $spot = $(spot),
            spotColor = opts.spot_colors[ inc ];

        if (spotColor === 'unselected') {
          spotColor = opts.default_spot_color;
          $spot.data('unselected', true);
        }

        $spot.css('background-color', '#' + spotColor);

        $spot.on('click', function() {
          var newHex = Colors.checkHex($spot.css('background-color'), true);

          $input.val(newHex);
          $input.trigger('change');

          $spots.removeClass('selected');
          $spot.addClass('selected');
          $addColor.text(opts.label_add);

          if (opts.default_spot_color !== newHex) {
            $addColor.text(opts.label_replace);
          }
        });
      }.bind(this)); // $spots each

      $addColor.on('click', function() {
        var $selected = $spots.filter('.selected'),
            position = 0,
            $unselected = $spots.filter(':data(unselected)');

        if (!$selected.length) {
          $selected = $unselected.first();
        }

        $selected.removeData('unselected');

        position = $.inArray($selected[0], $spots);

        opts.spot_colors[ position ] = $input.val();

        $selected.css('background-color', '#' + $input.val());

        $addColor.text(opts.label_replace);

        cookie("spot_colors", opts.spot_colors.join(','), {
          path: '/',
          secure: false,
          expires: new Date(9999999999999)
        });
      }); // $addColor

      if ($spots.filter(':data(unselected)').length === 0) {
        $addColor.text(opts.label_replace);
      }
    }, // _initSpots

    open: function() {
      $saveBtn.on('click', activeInstance.close);
      $cancelBtn.on('click', activeInstance.cancel);

      $menu.show();
    }, // open

    close: function() {
      $saveBtn.off('click', activeInstance.close);
      $cancelBtn.off('click', activeInstance.cancel);

      $menu.hide();
    }, // close

    // Sets all menu widgets from hex value, including original swatch
    _setFromHex: function(hex) {
      $input.val(hex);
      Menu._updateFromInput();
      $originalSwatch.css({'background-color': '#' + hex });
    }, // _setFromHex

    // fires when user clicks into color palette
    _updateSelectorFromClick: function(e) {
      var xPos = e.pageX,
          yPos = e.pageY,
          pos = $palette.offset(),
          left = xPos - pos.left + 'px',
          top = yPos - pos.top + 'px';

      $selector.trigger(e);
      $selector.css({left: left, top: top});
      this._updateFromHue();
    }, // _updateSelectorFromClick

    _updateFromRGBInputs: function(e) {
      var rgb = [],
          inc = 0,
          hex = false;

      rgb[0] = $r[0].value;
      rgb[1] = $g[0].value;
      rgb[2] = $b[0].value;

      for (inc; inc < 3; ++inc) {
        if (!rgb[inc].match(/^\d+$/)) {
          rgb[inc] = 255;
        }
        else if (rgb[inc] < 0) {
          rgb[inc] = 0;
        }
        else if (rgb[inc] > 255) {
          rgb[inc] = 255;
        }
      }

      hex = Colors.rgb2hex(rgb[0], rgb[1], rgb[2]);

      $input.val(hex).trigger('change');
    },

    _updateFromInput: function() {
      this.updating_from_input = true;

      var field = $input[0],
          rgb = Colors.hex2rgb(field.value),
          hsv = Colors.rgb2hsv(rgb[0], rgb[1], rgb[2]),
          left = Math.round(hsv[1] * paletteWidth) + "px",
          top = Math.round((1 - hsv[2]) * paletteHeight) + "px";

      this._updateAllValues(field.value, rgb);

      this._placeSelector({
        left: left,
        top: top
      });

      // Important to note that _updateHue will be called by changing slider value
      $hue.slider('value', hsv[0] * $hue.slider('option', 'max'));

      this.updating_from_input = false;
    },

    _placeSelector: function(css) {
      $selector.css(css);
    },

    // Updates hue which then updates everything down the line hueValue, should be 0 -> 1
    _updateHue: function(hueValue) {
      hueValue = hueValue || this._getHueValue();

      var rgb;

      // Make sure that the hue is consistent for 1 and 0 since hue wraps aruond
      if (hueValue === 1) {
        hueValue = 0;
      }

      // Make overlay have right background color over grey gradient
      rgb = Colors.hsv2rgb((1 - hueValue), 1, 1);
      $palette[0].style.backgroundColor = "rgb(" + rgb[0] + ", " + rgb[1] + ", " + rgb[2] + ")";

      this._updateFromHue(hueValue);
    },

    // Does math to get hueValue based on slider,
    _getHueValue: function() {
      var max = $hue.slider('option', 'max');

      // Make sure value gets turned from 0-1000 to 0-1
      return ((max - $hue.slider('option', 'value')) / max);
    },

    // Updates inputs, background, and current hex values
    _updateAllValues: function(hex, rgb) {
      if (!rgb) {
        rgb = Colors.hex2rgb(hex);
      }

      // Updates inputs in UI along with color comparison swatch
      $r[0].value = rgb[0];
      $g[0].value = rgb[1];
      $b[0].value = rgb[2];
      $input[0].value = hex;
      $currentSwatch[0].style.backgroundColor = '#' + hex;
      activeInstance.current_hex = hex;
    },

    _updateFromHue: function(hueValue) {
      // figure out where selector is in palette
      var selectorLeft = parseInt($selector[0].style.left, 10),
          selectorTop = parseInt($selector[0].style.top, 10),
          leftPercentage = selectorLeft / paletteWidth,
          topPercentage = (paletteHeight - selectorTop) / paletteHeight,
          hsv = '',
          rgb = [], // array for rgb  from hsv conversion
          hex = ''; // hex for after rgb conversion

      // Get the hue from what's passed in, and if it's not use the function
      hueValue = hueValue || this._getHueValue();

      if (hueValue === 1) {
        hueValue = 0;
      }

      // Magic color math to get HSV based on percentage of gradient
      hsv = {
        hue: 1 - hueValue, // Based on slider
        saturation: leftPercentage, // Based on how far left or right selector is in gradient
        brightness: topPercentage // Based on how high or low selector is in gradient
      };

      activeInstance._trigger('newhsv', {}, {
        hsv: hsv,
        left_percentage: leftPercentage,
        top_percentage: topPercentage
      });

      // Get RGB based on the HSV, which is returned as an array
      rgb = Colors.hsv2rgb(hsv.hue, hsv.saturation, hsv.brightness);

      // Get hex from rgb
      hex = Colors.rgb2hex(rgb[0], rgb[1], rgb[2]);

      // If updating from input, it would have called _updateAllValues
      if (!this.updating_from_input) {
        this._updateAllValues(hex, rgb);
      }

      activeInstance._trigger('update', {}, { hex: hex });
    }
  };
});
