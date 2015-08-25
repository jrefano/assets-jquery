define([
  'jquery',
  './bubblelist',
  'be/modal/simple',
  'lib/showMessages',
  'hgn!templates/discover/sort-fields',
  'jqueryui/widget'
], function($, bubblelist, simple, showMessages, fieldsTmpl) {
  'use strict';

  return $.widget('ui.creativefieldspopup', $.extend(true, {}, bubblelist, {
    _list: null,

    options: {
      limit: 3,
      populars: [],
      fields: [],
      buttons: [{
        label: "Done",
        classes: ['form-button-default', 'js-confirm']
      }, {
        label: "Cancel",
        classes: ['form-button-cancel', 'js-cancel']
      }]
    },

    _setOption: function(key, value) {
      this.options[ key ] = value;
      if (this._optionHandler[ key ]) {
        this._optionHandler[ key ].call(this, key, value);
      }
      return this;
    },

    _create: function() {
      var self = this;
      // order matters!
      $.map(['data_src', 'delimiter', 'defaultValues', 'blacklist'], function(name) {
        self._optionHandler[name].call(self, name, self.options[name]);
      });

      this.element.addClass('ui-popupbubble');
    },

    _init: function() {
      var self = this,
          list = this._list = $('<ul tabindex="0"/>'),
          button = $('<a><span></span></a>');

      // prepopulating the list
      $.each(this.options.defaultValues, function(index, value) {
        if ($.inArray(this.n, self.options.blacklist) > -1) { return; }
        self._make_bubble(this.n)
          .data('value', this)
          .appendTo(list);
      });

      this._set_value();

      if (this.options.defaultValues.length) {
        list.removeClass(this.widgetName + '-empty');
      }
      else {
        list.addClass(this.widgetName + '-empty');
      }

      this.element.siblings('.form-label').on('click', function() {
        list.focus();
        return false;
      });

      list
      .attr('placeholder', this.element.attr('placeholder'))
      .addClass(this.options.list_classes.join(' '))
      .on('click', function() { this.focus(); })
      .on('focus', function(e) {
        if ($(this).hasClass(self.widgetName + '-empty')) {
          self._popup.apply(self, arguments);
        }
      });

      // set up the button
      button.on('click', $.proxy(this._popup, this))
        .addClass($.isArray(this.options.btn_classes) ? this.options.btn_classes.join(' ') : this.options.btn_classes)
        .children().addClass($.isArray(this.options.icon_classes) ? this.options.icon_classes.join(' ') : this.options.icon_classes).end()
        .appendTo(list);

      (this.element.is('input') ? this.element.hide().after : this.element.append).call(this.element, list);
    },

    modal: null,

    _popup: function(e) {
      if (this.modal) {
        return;
      }

      var self = this,
          preselected = this._list.find('li').map(function() { return $(this).data('value').id; }).toArray(),
          $fieldLists, $popup, popOptions, modal, $fullList;

      popOptions = {
        buttons: this.options.buttons,
        hideClose: true,
        html: fieldsTmpl({
          mustSelect: true,
          populars: this.options.populars,
          fields: this.options.fields
        })
      };

      /**
       * Updates bubblelist
       */
      function confirm() {
        var newValue;

        self._list.children().remove('li');

        getItems().each(function() {
          var $item = $(this),
              id = $item.data('key'),
              label = $item.find('.js-label').text(),
              value = { id: id, n: label };

          self._make_bubble(value.n).data('value', value)
          .addClass(self.options.item_classes.join(' '))
          .appendTo(self._list);
        });

        newValue = self._set_value();

        self._list.toggleClass(self.widgetName + '-empty', !newValue);

        self._trigger('value', null, newValue);
        self.element.val(newValue);
      }

      function closed() {
        self._trigger('destroyed');
        self.modal = null;
      }

      /**
       * @return {jQuery}
       */
      function getItems() {
        return $fullList.find('.js-selected');
      }

      /**
       * Selects/deselects item and handles limits
       *
       * @param {jQuery}
       */
      function toggleItem($item) {
        var $toggles;

        if (!$item.hasClass('js-selected') && getItems().length >= self.options.limit) {
          showMessages($popup, [{
            type: 'error',
            message: 'You can only select up to ' + self.options.limit + ' items.'
          }], {
            fade: false
          });
        }
        else {
          // Toggle both items ( from full list, and popular if applicable )
          $toggles = $fieldLists.find('[data-key=' + $item.data('key') + ']');
          $toggles.toggleClass('js-selected');
          $toggles.find('a').toggleClass('active');

          // Hide error if user removes fields
          if (!$item.hasClass('js-selected')) {
            $popup.find('.messages').hide();
          }
        }

        self._trigger('toggle', null, { count: getItems().length });
      }

      modal = this.modal = simple(popOptions);

      modal
      .then(confirm)
      .finally(closed);

      $popup = modal._view.$view.filter('.popup').addClass('creative-fields');
      $fieldLists = $popup.find('.js-fields-list');
      $fullList = $fieldLists.filter('.js-fields-list-full');

      // Hook up clicks to all items in both lists
      $fieldLists.find('[data-key]').each(function() {
        var $item = $(this),
            $link = $item.find('a');

        $link.on('click', function(e) {
          e.preventDefault();
          toggleItem($item);
        });
      });

      // Toggle all selected items on load
      $fullList.find('.js-item').each(function() {
        var $item = $(this);
        if (preselected.indexOf($item.data('key')) !== -1) {
          toggleItem($item);
        }
      });

      self._trigger('popup');
      return false;
    },

    _remove_bubble: function(e) {
      var self = e.data.that;

      // Parent of actual bubble
      e.data.parent.remove();

      if (!self._list.find('.text').length) {
        self._list.addClass(self.widgetName + '-empty');
      }
      self._set_value();
      e.stopPropagation();
    },

    /**
     * @return {string}
     */
    _set_value: function() {
      var combined = this._list.find('li').map(function() {
        return $(this).data('value').id;
      }).get().join('|');

      this._trigger('value', null, combined);
      this.element.val(combined);

      return combined;
    },

    /**
     * @return {string}
     */
    value: function() {
      return this.element.val();
    }
  }));
});
