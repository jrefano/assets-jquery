/*jslint sloppy:true */
(function(factory) {
  if (typeof require === 'function') {
    require(['jquery', 'vendor/spin', 'Core', 'Fn' ], factory);
  }
  else {
    factory($, Spinner, $.Core);
  }
}(function($, Spinner, Core ) {
  $.widget("ui.usercheck", {
    widgetEventPrefix : "user",
    options : {
      ajax_type           : 'POST',
      data_prop           : 'url',
      icon_classes        : [],
      icon_valid_classes  : ['valid'],
      icon_invalid_classes: ['invalid'],
      include_label       : true,
      prefix              : '',
      prefix_classes      : [],
      prefix_pad          : false,
      spinner             : { lines: 10, length: 0, width: 2, radius: 6, color: '#f82d1e', speed: 1.3, trail: 38, shadow: false },
      spinner_css         : {},
      throttle            : 300,
      url                 : '',
      valid               : 1,
      valid_prop          : 'valid',
      wrapper_classes     : []
    },
    message : function() {
      return this._message;
    },
    valid : function() {
      return this._valid;
    },

    _last    : '',
    _message : '',
    _valid : false,
    _timeout : null,
    _spinner : null,

    _wrapper : null,
    _prefix  : null,
    _icon    : null,
    _wrapped : null,

    _create : function() {
      this.options.url = this.element.data('check') || this.options.url;
      this.options.icon_classes.push( this.widgetName+'-icon' );
      this.options.prefix_classes.push( this.widgetName+'-base' );
      this.options.wrapper_classes.push( this.widgetName+'-wrapper' );
      this._spinner = Spinner ? new Spinner($.extend( this.options.spinner, Spinner.defaults )) : null ;
    }, // _create

    _init : function() {
      var self = this,
          icon    = this._icon = $('<span/>').addClass( this.options.icon_classes.join(' ') ),
          prefix  = this._prefix = $('<span class="'+ this.options.prefix_classes.join(' ') +'">'+this.options.prefix+'</span>'),
          wrapper = $('<div class="'+ this.options.wrapper_classes.join(' ') +'"/>');

      // Set up key binding to AJAX
      this._bindCheck();

      // Put in the DOM elements we want
      this._wrapped = this.options.include_label ? this.element.siblings('label').andSelf() : this.element;
      this._wrapper = this._wrapped.wrapAll(wrapper).parent();
      this.element.before(prefix).after(icon);

      // Modify element paddings, if requested
      this._nudgeElement();

    }, // _init

    _bindCheck : function() {
      var self = this;

      this.element
        .on( 'keyup input propertychange', function(e) {
          var input = this;

          if ( self._last === this.value ) { return; }

          if ( self._timeout !== null ) {
            clearTimeout( self._timeout );
            self._timeout = null;
          }

          // Clear icon classes
          self._icon.removeClass( self.options.icon_invalid_classes.concat( self.options.icon_valid_classes ).join(' ') );

          if ( !this.value ) { 
            self._spinner.stop();
            self._trigger( 'valid', null, null );
            return;
          }

          // Throttled check
          self._timeout = setTimeout(function() {

            if ( !self.options.url ) { 
              $.error( self.widgetName + ": No URL given" );
            }

            var data;
            if ( !self.options.data_prop ) {
              data = input.value;
            }
            else {
              data = {}; 
              data[ self.options.data_prop ] = input.value;
            }

            $.ajax({
              type : self.options.ajax_type,
              url  : self.options.url,
              data : data
            })
            .done(function(response) {
              self._spinner.stop();
              if ( response[ self.options.valid_prop ] === self.options.valid ) {
                self._icon.removeClass( self.options.icon_invalid_classes.join(' ') )
                  .addClass( self.options.icon_valid_classes.join(' ') );
                self._valid = true;
                self._trigger( 'valid', null, response );
              }
              else {
                self._icon.removeClass( self.options.icon_valid_classes.join(' ') )
                  .addClass( self.options.icon_invalid_classes.join(' ') );
                self._valid = false;
                self._trigger( 'invalid', null, response );
              }
              self._icon.attr('title', self._message = response.message);
              self._timeout = null;
            });

          }, self.options.throttle);

          // Spinner
          if ( self._spinner && !self._wrapper.find( self._spinner.el ).length ) {
            self._icon.before( $(self._spinner.spin().el).css($.extend({position : 'absolute'}, self.options.spinner_css)) );
          }

          self._last = this.value;

        });

    }, // _bindCheck

    _nudgeElement : function() {

      var prefix_dir, element_dir, prefix_width, element_pad, element_width;

      if (this.options.prefix_pad) {

        if ( typeof this.options.prefix_pad === 'boolean' ) {
          prefix_dir = 'paddingLeft';
          element_dir = 'width';
        }
        else {
          switch( this.options.prefix_pad ) {
            case "top":
            case "bottom":
              element_dir = 'height';
              prefix_dir = 'padding'+Core.uCWord(this.options.prefix_pad);
              break;
            case "left":
            case "right":
              element_dir = 'width';
              prefix_dir = 'padding'+Core.uCWord(this.options.prefix_pad);
              break;
            default:
              return;
          }
        }

        // padding calculations
        element_width = this.element[element_dir]();
        element_pad = parseInt(this.element.css(prefix_dir), 10);
        prefix_width = this._prefix['outer'+Core.uCWord(element_dir)]();

        // payload
        this._wrapped.css( prefix_dir, element_pad + prefix_width );
        this.element.css( element_dir, element_width - prefix_width );

      } // if prefix_pad

    } // _nudgeElement

  }); // widget

}));
