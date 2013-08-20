(function ($) {

  $.fn.popup = function() {

    var _outerDiv,      // object of div that surrounds contents
        _shim,          // object of iframe
        _self   = this, // object of div where contents are displayed
        input   = '<div>Loading...</div>',
        _body   = Config.$body || $('body'),
        _window = $(window),
        _params = _self.data('params') || {
          removeAll       : true,               // call to clear prior popups
          blockingDiv     : true,               // should a blocking div be created
          outerDiv        : true,               // should an outer div be created
          outerZIndex     : 500,                // for layering of outer div
          outerPad        : 30,                 // for fake padding of outer div
          innerZIndex     : 501,                // for laying of inner div
          input           : input,              // html string to insert into popup
          observeScroll   : true,               // should we position on scroll
          observeResize   : true,               // should we position on resize
          observeKeyUp    : true,               // should we close on escape
          innerClass      : '',                 // extra classes to apply to inner div
          innerWrapClass  : 'popup-inner-wrap', // class to apply to input wrap div (set to empty to remove)
          outerWrapClass  : 'popup-outer',      // class to apply to outer div
          lightbox        : false,              // make outer div black out everything behind
          innerDivOffset  : 0                   // if lightbox is true, inner won't be auto repositioned vertically
        },

        _createWindow = function() {

          _self.trigger('beforeWindowCreate');

          _body.append(_self);

          _self.css({
            'position' : 'absolute',
            'z-index'  :  _params.innerZIndex
          });

          _self.addClass('popup-inner');

          if ( _params.innerClass ) {
            _self.addClass(_params.innerClass);
          }

          _self.trigger('afterWindowCreate');

        },

        _shimClone = function() {

          if ( _shim ) {

            _shim.clonePosition(_self);
            _shim.css({
              'position' : 'absolute',
              'display'  : 'block',
              'z-index'  :  0,
              'border'   : 'none'
            });

          } // if _shim

        },

        _update = function($html) {

          _self.trigger('beforeUpdate');

          if ( _params.innerWrapClass ) {
            $html = $('<div>').addClass(_params.innerWrapClass).html($html);
          }

          _self.html($html);

          _position();

          _self.trigger('afterUpdate');
          
          $('#popup-force-close').click(function() {
            _destroy();
          });

          return _self;

        },
        
        _destroy = function() {
        
          if (_self.data('outerDiv.popup')) {
            _self.data('outerDiv.popup').remove();
          }

          if ( _self.data('blockingDiv.popup') ) {
            _self.data('blockingDiv.popup').remove();
          }
          
          $.each(_self.find('[class*=validate]'), function() {
            $('.formError.'+this.id).remove();
          });


          _window.unbind('scroll.popup', _self.data('popup.position'));
          _window.unbind('resize.popup', _self.data('popup.position'));

          _self.remove();
          
          return _self;
        
        },

        // creates layer behind inner for transparency effects
        _createOuterDiv = function() {

          if ( _self.data('outerDiv.popup') ) {
            return;
          }

          var x = $('<div>')
                    .css({
                      'position' : 'absolute',
                      'z-index'  : _params.outerZIndex
                    });
                    
          if ( _params.outerWrapClass ) {
            x.addClass(_params.outerWrapClass);
          }
          
          if (_params.lightbox) {
            x.addClass('full-screen');
          }

          _body.append(x);
          
          _self.data('outerDiv.popup', x);
        },

        _position = function() {

          // gather height and width of elements for positinoing
          var innerHeight  = _self.height(),
              innerWidth   = _self.width(),
              viewWidth    = window.innerWidth || _window.width(),
              viewHeight   = window.innerHeight || _window.height(),
              scrollPosX   = _window.scrollLeft(),
              scrollPosY   = _window.scrollTop(),
              ScrollWin    = null,
              newInnerTop  = null,
              newInnerLeft = null,
              outerOffset  = null;

          // vertically center _self
          ScrollWin       = scrollPosY + (viewHeight/2);
          newInnerTop     = (_params.lightbox) ? _params.innerDivOffset : Math.max(0, ScrollWin  - (innerHeight/2));

          // horizontally center _self
          ScrollWin       = Math.max(0, scrollPosX + (viewWidth/2));
          newInnerLeft    = ScrollWin  - (innerWidth/2);
          _self.css({'top':newInnerTop+'px', 'left': newInnerLeft+'px'});
          _shimClone();

          _outerDiv = _self.data('outerDiv.popup');

          if (_outerDiv) {
          
            if (!_params.lightbox) {

              outerOffset = Math.round((_params.outerPad/2) - _params.outerPad);
              _outerDiv.clonePosition(_self, {
                offsetLeft: outerOffset,
                offsetTop: outerOffset
              });
              
            }

            _outerDiv.css({
              'width'  : (innerWidth+_params.outerPad)+'px',
              'height' : (_params.lightbox) ? $(document).height()+'px' : (innerHeight+_params.outerPad)+'px'
            });

          } // if _outerDiv

          $.each(_self.find('[class*=validate]'), function() {

            var $this  = $(this),
                $error = $('.formError.'+this.id);

            $error.css({top: $this.offset().top-$error.outerHeight()+'px', left: $this.offset().left+$this.outerWidth()-$error.outerHeight()+'px'});

          });
          
          _self.trigger('popup.positioned');
          
          return _self;

        },

        _remove = function() {
          if (this._self) {
            this._self.remove();
          }
 
          if (this._outerDiv) {
            this._outerDiv.remove();
          }
 
          if (this._shim) {
            this._shim.remove();
          }
 
          this._self     = null;
          this._outerDiv = null;
          this._shim     = null;
        },

        _create = function() {

          if (_params.removeAll) {
            $('.popup-inner').popup('destroy');
          }

          if (_params.outerDiv) {
            _createOuterDiv();
          }
          
          if ( _params.blockingDiv ) {
          
            var y = $('<div class="blocking-div">')
            .css({
              'position' : 'absolute',
              'z-index'  : _params.outerZIndex,
              'width'    : '100%',
              'height'   : '100%',
              'top'      : '0px',
              'left'     : '0px'
            });
            
            $('body').append(y);
            
            _self.data('blockingDiv.popup', y);
            _self.data('popup.position', _position);
            
          }

          _createWindow();

          _update(_params.input);

          if (_params.observeScroll) {
            _window.bind('scroll.popup',_position);
          }

          if (_params.observeResize) {
            _window.bind('resize.popup',_position);
          }

        };

    if ( !arguments.length || typeof(arguments[0]) == 'object' ) {

        if ( typeof(arguments[0]) == 'object' ) {
          _params = $.extend(_params, arguments[0]);
        }

        _self.data('params', _params);

      _create();

      return this;
    }
    else if ( arguments.length && typeof(arguments[0]) == 'string' ) {

      switch ( arguments[0] ) {

        case 'destroy':
          _self.trigger('popup.destroyed');
          return _destroy();
          break;

        case 'position':
          return _position();

        case 'html':
        
          if ( typeof(arguments[1]) == 'string' ) {
            return _update( $('<div>').html(arguments[1]) );
          }
          else if ( arguments[1] instanceof jQuery ) {
            return _update(arguments[1]);
          }
          else {
            return _self.html();
          }
          break;

      } // switch arguments[0]

    }

  }; // fn.popup

}(jQuery));
