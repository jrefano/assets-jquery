/*global jQuery */
/**
 * Copied out of plugins folder as part of project editor refactor
 * No longer uses Fn/Core.js, but can still use a bit of refactoring
 */
(function(factory) {
  'use strict';
  if (typeof define === 'function' && define.amd) {
    define([ 'jquery',
        'nbd/event',
        'jquery/be/bubblelist',
        'be/modal/simple',
        'lib/showMessages',
        'jquery/ui/widget' ], function() {
      var module = factory.apply(this, arguments);
      return module;
    });
  }
  else {
    return jQuery && factory.call(this, jQuery);
  }
}(function($, event, bubblelist, simple, showMessages) {
  'use strict';

  return $.widget('ui.popupbubble', $.extend(true, {}, bubblelist, {
    options: {
      popup           : {
        title        : 'Creative Fields',
        html   : '<ul id="all-data-list" class="ui-selectmenu-open" />',
        buttons: [{
          label: "Done",
          classes: ['form-button-default', 'js-confirm']
        }, {
          label: "Cancel",
          classes: ['form-button-cancel', 'js-cancel']
        }]
      }
    },
    _list  : null,
    _setOption : function( key, value ) {
      this.options[ key ] = value;
      if (this._optionHandler[ key ]) {
        this._optionHandler[ key ].call(this, key, value);
      }
      return this;
    },
    _create : function() {
      var self = this;
      // order matters!
      $.map(['data_src', 'delimiter', 'defaultValues', 'blacklist'], function(name) {
        self._optionHandler[name].call(self, name, self.options[name]);
      });

      this.element.addClass( 'ui-popupbubble');
    }, // _create
    _init : function() {
      var self = this, list = this._list = $('<ul tabindex="0"/>'), button = $('<a><span></span></a>');

      // prepopulating the list
      $.each( this.options.defaultValues, function(index, value) {
        if ( $.inArray( this.n, self.options.blacklist ) > -1 ) { return; }
        self._make_bubble(this.n)
          .data( 'value', this )
          .appendTo(list);
      });

      this._set_value();

      if ( this.options.defaultValues.length ) {
        list.removeClass(this.widgetName+'-empty');
      }
      else {
        list.addClass(this.widgetName+'-empty');
      }

      this.element.siblings('.form-label').on('click', function(){
        list.focus();
        return false;
      });

      list.addClass( this.options.list_classes.join(' ') )
        .on( 'focus', function(e) {
          if ($(this).hasClass(self.widgetName+'-empty')) {
            self._popup.apply(self,arguments);
          }
        });

      // set up the button
      button.on( 'click', $.proxy(this._popup, this) )
        .addClass( $.isArray(this.options.btn_classes) ? this.options.btn_classes.join(' ') : this.options.btn_classes )
        .children().addClass( $.isArray(this.options.icon_classes) ? this.options.icon_classes.join(' ') : this.options.icon_classes ).end()
        .appendTo(list);

      (this.element.is('input') ? this.element.hide().after : this.element.append).call(this.element, list);
    }, // _init
    modal : null,
    $popup : null,
    _popup : function(e) {
      if ( this.modal ) { return; }

      var self        = this,
          modal       = this.modal = simple(this.options.popup),
          $popup      = this.$popup = this.modal._view.$view.filter('.popup').addClass('all-creative-fields-pop'),
          $popuplist  = $('#all-data-list'),
          preselected = this._list.find('li').map(function(){ return $(this).data('value').id; }).get(),
          toggleItem, getItems;

      getItems = function() {
        return $popuplist.find('.selected').map(function(){return $(this).data('value');}).get();
      };

      toggleItem = function(e) {
        var $this = $(this);

        if ( !$this.hasClass('selected') && getItems().length >= self.options.limit) {
            showMessages($popup, [{
              type:'error',
              message:'You can only select up to '+self.options.limit+' items.'
            }],
            { fade : false });
        }
        else {
          $this.toggleClass('active selected');
        }

        self._trigger( 'toggle', null, { count : self.$popup.find( '.selected' ).length } );
      };

      function destroy() {
        self._trigger('destroyed');
        event.trigger('keyboard.off');
        self.modal = null;
        self.$popup = null;
      }

      // for each data
      self._data.done(function(data) {
        $.each(data, function() {
          // see if it's been selected already
          var selected = $.inArray( this.id, preselected ) > -1;

          $('<li' +
            ( selected ? ' class="active selected"' : '' ) +
            ' tabindex="-1">'+this.n+'<span class="icon icon-status-success sprite-site-elements"></span></li>')
          .data( 'value', this )
          .on( 'click', this, function(e) {
            $(document.activeElement).blur();
            toggleItem.call(this, e);
          })
          .appendTo( $popuplist );
        });
      });

      // On done
      modal.confirm = function() {
        if ( $(this).hasClass( 'disabled' ) ) {
          return;
        }

        self._list.addClass(self.widgetName+'-empty').children().remove('li');

        $.each( getItems(), function() {
          if ( $.inArray( this.n, self.options.blacklist ) > -1 ) { return; }
          self._make_bubble( this.n ).data( 'value', this )
            .addClass( self.options.item_classes.join(' ') )
            .appendTo( self._list.removeClass(self.widgetName+'-empty') );
        });

        self._set_value();
        self._list.focus();
        modal.resolve();
      };

      $popuplist.attr('tabIndex', 0);
      $popup.find('.js-confirm').attr('tabIndex', 1);
      $popup.find('.js-cancel').attr('tabIndex', 2);

      $('#all-data-list').focus();

      event.trigger('keyboard.on', self._key_commands($popup, $popuplist, toggleItem));

      self.modal.then(destroy, destroy);

      self._trigger('popup');
      return false;
    }, // _popup
    _set_value : function() {
      var combined = this._list.find('li')
        .map(function(){ return $(this).data('value').id; }).get().join('|');
      this._trigger('value', null, combined);
      this.element.val(combined);
    }, // _set_value
    value : function() {
      return this.element.val();
    }, // value
    _remove_bubble : function(e) {
      e.data.parent.remove();
      if ( !e.data.that._list.find('.text').length ) {
        e.data.that._list.addClass( e.data.that.widgetName + '-empty');
      }
      e.data.that._set_value();
      e.stopPropagation();
    }, // _remove_bubble
    _key_commands: function ($popup, $popuplist, toggleItem) {
      var self = this,
          keybindings = {
            escape: function () { $('#popup-cancel').click(); },
            tab: function (e) {
              $('[tabindex=' + (document.activeElement.tabIndex + 1) % 3 + ']', $popup).focus();
              e.preventDefault();
            },
            up: function (e) {
              var $focus = $(document.activeElement);
              if ($focus.attr('id') === 'all-data-list') {
                $popuplist.children().first().focus();
              }
              if ($focus[0].tagName.match(/li/i)) {
                $(document.activeElement).prev().focus();
              }

              e.preventDefault();
            },
            down: function (e) {
              var $focus = $(document.activeElement);
              if ($focus.attr('id') === 'all-data-list') {
                $popuplist.children().first().focus();
              }
              else if ($focus[0].tagName.match(/li/i)) {
                $(document.activeElement).next().focus();
              }

              e.preventDefault();
            },
            enter: function (e) {
              var $focus = $(document.activeElement);
              if ($focus.hasClass('form-button')) {
                $(document.activeElement).click();
              }
              else if ($focus[0].tagName.match(/li/i)) {
                toggleItem.call(document.activeElement, e);
              }

              e.preventDefault();
            }
          };

      function onCharKey(char) {
        return function(e) {
          $popuplist.children().filter(function () {
            return !!this.innerText[0].match(new RegExp(char, 'i'));
          }).first().focus();

          e.preventDefault();
        };
      }

      ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'].forEach(function (el) {
        keybindings[el] = onCharKey(el);
      });

      return keybindings;
    }
  }));
}));



