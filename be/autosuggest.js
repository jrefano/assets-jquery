/*global jQuery */
(function(factory) {
  'use strict';
  if (typeof define === 'function' && define.amd) {
    define(['jquery', 'jquery/ui/autocomplete' ], function() {
      var module = factory.apply(this, arguments);
      return module;
    });
  }
  else {
    return jQuery && factory.call(this, jQuery);
  }
}(function( $ ) {
  'use strict';

  function retFalse() { return false; }

  return $.widget( "be.autosuggest", $.ui.autocomplete, {

    options: {
      focus: retFalse
    },

    _create: function() {
      this._super();
      if ( this.options.messages && this.options.messages.placeholder ) {
        this.element.prop( 'placeholder', this.options.messages.placeholder );
      }
    },

    _resizeMenu: function() {
      var ul = this.menu.element,
      width = this.options.width;

      if ( $.isNumeric( width ) ) {
        ul.outerWidth( width );
      }
      else {
        this._super();
      }
    },

    _renderItem: function( ul, item ) {
      var templater = this.options.itemTemplate;
      if ( $.isFunction( templater ) ) {
        return $( templater( item ) ).appendTo( ul );
      }

      return this._super( ul, item );
    },

    clear: function() {
      this._value('');
    }

  });

}));
