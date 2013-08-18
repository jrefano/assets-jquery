(function($) {

  $.widget("be.tooltip", {

    options : {
      direction : "up",
      content : null,
      cooldown : 5000,
      dataSrc : null,
      formatter : null
    },

    _block   : false,
    _content : null,
    _hadDown : false,
    _hadLeft : false,

    _setOption : function( key, value ) {
      this.options[ key ] = value;
      if (this._optionHandler[ key ]) {
        this._optionHandler[ key ].call(this, key, value);
      }
      return this;
    },

    _optionHandler : {
      direction : function( key, value ) {
        this._hadDown = value === "down";
        this._hadLeft = value === "left";
        this._hadRight = value === "right";
      }
    },

    _init : function() {

      var self = this,
          tooltip = this.element.find( '.tooltip' );

      function hover(e) {

        var oldcontent = self._content,
            container = tooltip.offsetParent(),
            vmask, hmask,
            ver_offset, hor_offset, tool_offset,
            flags = {};

        function format( data ) {
          if ( self.options.formatter ) {
            return self.options.formatter.apply(this,arguments);
          }
          return data.html || oldcontent;
        }

        function setContent() {
          self._content = format.apply(this,arguments);
          tooltip.html( self._content );
        }

        function oldContent() {
          tooltip.html( oldcontent );
        }

        if ( !self._block ) {

          if ( self.options.dataSrc ) {
            self._content = self._content || $('<div/>').spin();
            tooltip.html( self._content );

            self._block = true;
            setTimeout(function() {
              self._block = false;
            }, self.options.cooldown);

            ($.isFunction( self.options.dataSrc.promise ) 
              ? self.options.dataSrc.promise()
              : $.ajax( self.options.dataSrc )
            ).then( setContent, oldContent );
          }

          tooltip.html( self._content );

        }

        // Tooltip positioning
        vmask = container.parents().filter(function() {
          return $(this).css('overflow-y') !== "visible";
        }).first();
        ver_offset = vmask.offset();
        
        hmask = container.parents().filter(function() {
          return $(this).css('overflow-x') !== "visible";
        }).first();
        hor_offset = hmask.offset();

        tooltip.toggleClass( "tooltip-down", self._hadDown );
        tooltip.toggleClass( "tooltip-left", self._hadLeft );
        tooltip.toggleClass( "tooltip-right", self._hadRight );

        tool_offset = tooltip.offset();

        flags.over = tool_offset.top < ver_offset.top;
        flags.under = tool_offset.top + tooltip.outerHeight(true) > ver_offset.top + vmask.innerHeight();
        flags.before = tool_offset.left < hor_offset.left;
        flags.after = tool_offset.left + tooltip.outerWidth(true) > hor_offset.left + hmask.innerWidth();

        if ( flags.over ) {
          tooltip.addClass( "tooltip-down" );
        }
        else if ( flags.under ) {
          tooltip.removeClass( "tooltip-down" );
        }

        if ( flags.after ) {
          tooltip.addClass( "tooltip-left" );
          tooltip.removeClass( "tooltip-right" );
        }
        else if ( flags.before ) {
          if ( tooltip.hasClass( "tooltip-left" ) ) {
            tooltip.removeClass( "tooltip-left" );
          }
          else {
            tooltip.addClass( "tooltip-right" );
          }
        }

      } // hover

      if ( tooltip.length ) {
        this._content = tooltip.html();
      }
      else {
        tooltip = $( '<div class="tooltip" />' );
        this.element.addClass( 'tooltip-container' ).append( tooltip );
        this._content = this.options.content;
      }

      this.tooltip = tooltip;
      this._hadDown = this.options.direction === "down" || tooltip.hasClass('tooltip-down');
      this._hadLeft = this.options.direction === "left" || tooltip.hasClass('tooltip-left');
      this._hadRight = this.options.direction === "right" || tooltip.hasClass('tooltip-right');

      this.element.on( 'mouseenter', hover );

      this.element.bind( "remove." + this.widgetName, function() {
        $(this).off( 'mouseenter', hover );
      });

    }

  });

}(jQuery));
