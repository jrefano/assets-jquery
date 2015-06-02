/*global jQuery */
(function(factory) {
  'use strict';
  if (typeof define === 'function' && define.amd) {
    define(['jquery', './autosuggest' ], function() {
      var module = factory.apply(this, arguments);
      return module;
    });
  }
  else {
    return jQuery && factory.call(this, jQuery);
  }
}(function( $ ) {
  'use strict';


  return $.widget( "be.autoselect", $.be.autosuggest, {

    options: {
      limit: 0,
      toggle: false,
      select: function( event, ui ) {
        $(this).autoselect('clear');
        return false;
      }
    },

    _selected : null,

    _create: function() {
      this._super();

      var that = this;

      this._on( this.menu.element, {
        menuselect: function( event, ui ) {
          var data = ui.item.data('ui-autocomplete-item');

          that.select(data);
        }
      });

      this._selected = $.isArray(this.options.value) ?
        this.options.value :
        [];

      if (this._selected.length) {
        // Suppress initial value event
        this._changeValue( true );
      }
    },

    select: function( data ) {
      data = $.isArray(data) ? data : [data];
      var i, j, item, changed = false;

      for (j=0; j<data.length; ++j) {
        item = data[j];
        if ( (i = this._selected.indexOf( item )) < 0 ) {
          if ( this._selected.length < (this.options.limit || Infinity) ) {
            this._selected.push(item);
            changed = true;
          }
          else {
            this._trigger( 'limit', null, { item: item } );
          }
        }
        else if ( this.options.toggle ) {
          this._selected.splice(i,1);
          changed = true;
        }
      }

      if (changed) {
        this._changeValue();
      }
    },

    unselect: function( data ) {
      var i;

      if ( (i = this._selected.indexOf( data )) >= 0 ) {
        this._selected.splice(i,1);
        this._changeValue();
      }
    },

    _changeValue: function( suppress ) {
      var disabled = this._selected.length >= (this.options.limit || Infinity),
      placeholder = this.options.messages[ disabled ? 'limited' : 'placeholder' ];

      this.element
        .prop( "disabled", disabled )
        .prop( "aria-disabled", disabled )
        .toggleClass( "ui-state-disabled", disabled );

      if ( disabled ) {
        this.element.blur();
      }

      if ( placeholder ) {
        this.element.prop( 'placeholder', placeholder );
      }

      if (!suppress) {
        this._trigger( 'value', null, { value: this._selected } );
      }
    },

    value: function() {
      return this._selected;
    },

    empty: function() {
      this._selected = [];
      this._changeValue();
    }

  });

}));
