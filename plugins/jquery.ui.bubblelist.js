(function( $, undefined ) {

  function escapeRegEx( str ) {
    return str.replace(/[\-\[\]{}()*+?.,\\\^$|#]/g, "\\$&");
  } // escapeRegEx

  $.ui.bubblelist = {

    widgetEventPrefix: "bubble",
    options : {
      blacklist       : [],
      btn_classes     : ['form-button', 'form-button-light-and-grey', 'right'],
      close_classes   : ['pointer','sprite-site-elements'],
      data            : {},
      data_src        : null,
      defaultValues   : null,
      delimiter       : ',',
      display_classes : [],
      icon_classes    : [],
      limit           : 3,
      list_classes    : ['form-list'],
      item_classes    : ['item']
    },

    _data: null,
    _delimiter: null,
    _optionHandler: {
      'disabled' : function(key, value) {
        this.widget()[ value ? "addClass" : "removeClass"](
            this.widgetFullName + "-disabled" + " " +
            "ui-state-disabled" )
          .attr( "aria-disabled", value );
      },
      'data_src' : function(key, value) {
        var self = this,
            data_src_type;

        if (value) {

          // If data_src is a deferred promise, use the promise
          // as a string, it's an AJAX data source
          // or a jQuery element containing data
          if ( value instanceof $ ) {
            try {
              data_src_type = $.when($.parseJSON( value.html() ));
            }
            catch (parseErr) {}
          }
          else if ( typeof value === "string" ) {
            try {
              data_src_type = $.ajax( value ).pipe(function(data) {
                return data.json || data;
              });
            }
            catch (parseErr) {}
          }
          else if ( typeof value.promise === "function" ) {
            data_src_type = value.promise();
          }

          this._data = data_src_type ?
            data_src_type.pipe(function(data) { return $.extend( data, self.options.data ); }) :
            null;
        }
        if ( !this._data ) {
          this._data = $.when( this.options.data );
        }
      },
      'delimiter' : function(key, value) {
        this._delimiter = new RegExp('['+
            escapeRegEx( $.isArray( value ) ? value.join('') : value.toString() ) +
            ']','g');
      },
      'defaultValues' : function(key, value) {
        if (!value) {
          this.options.defaultValues = this.element.is('input') ? this.element.val() : [];
        }
        else if ( !$.isArray(value) ) {
          this.options.defaultValues = value.toString().split( this._delimiter );
        }
      },
      'blacklist' : function(key, value) {
        if ( !$.isArray(value) ) {
          this.options.blacklist = value.toString().split( this._delimiter );
        }
      }
    },

    _make_bubble : function( $li, value ) {

      if (!( $li instanceof $ )) {
        value = $li;

        // TODO: Remove addClass without widgetName prefix with help of CSS upgrades
        $li = $('<li />').addClass( this.options.item_classes.join(' ') )
          .addClass( this.options.item_classes.concat(this.widgetName+'-item').join(' ') );
      }

      $('<span class="text" />')
        .addClass( this.options.display_classes.join(' ') )
        .text( value )
        .appendTo( $li.empty() );

      $('<span class="close-btn" />')
        .addClass( this.options.close_classes.join(' ') )
        .on( 'click', { that: this, parent : $li }, this._remove_bubble )
        .appendTo( $li );

      return $li;

    }, // _make_bubble

    _remove_bubble : function(e) {

      e.data.parent.remove();
      e.stopPropagation();

    } // _remove_bubble

  };

}(jQuery));
