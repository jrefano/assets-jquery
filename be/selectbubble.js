define([
  'jquery',
  'jquery/be/bubblelist',
  'jquery/ui/widget',
  'jquery/plugins/jquery.ui.selectmenu'
], function($, bubblelist) {
  return $.widget("ui.selectbubble", $.extend(true, {}, bubblelist, {

    options: {
      selectmenu: {}
    },

    _list: null,
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

      this.element.addClass('selectbubble');
    },

    _init: function() {
      var self = this, list = this._list = $('<ul/>'), defval;

      if (this.element.data('value')) {
        // TODO: Possibly make split an option so it can be on | vs space.
        this.element.data('value').toString().split(' ').forEach(function(id) {
          var value = self.element.find('option[value=' + id + ']').text();

          if ($.inArray(value, self.options.blacklist) > -1) {
            return;
          }

          self._makeBubbleWithData({
            id: parseFloat(id),
            n: value
          });
        });
      }

      // prepopulating the list
      $.each(this.options.defaultValues, function(index, value) {
        if ($.inArray(value, self.options.blacklist) > -1) { return; }
        self._makeBubbleWithData({id:index, n:value});
      });

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

      list.addClass(this.options.list_classes.join(' '));

      this.element.selectmenu(this.options.selectmenu)
      .parent()
        .append(list);

      defval = this.element.selectmenu('index');

      this.element.on('selectmenuselect', function(e, option) {
        var key = option.value,
            value = $(option.option).text();

        if (!key.length || $.inArray(key, self.options.blacklist) > -1) {
          self.element.selectmenu('index', defval);
          self._set_value();
          return;
        }

        if (list.find('.' + self.widgetName + '-item').length >= self.options.limit) {
          self._trigger('limit', null, [key, value]);
          self.element.selectmenu('index', defval);
          self._set_value();
          return;
        }

        self._makeBubbleWithData({id:key, n:value});
        self.options.blacklist.push(key);
        self.element.selectmenu('index', defval);
        self._set_value();
      });
    },

    _makeBubbleWithData: function(data) {
      this._make_bubble(data.n)
          .appendTo(this._list.removeClass(this.widgetName + '-empty'))
          .data('value', data);
    },

    _value: '',
    _set_value: function() {
      var combined = this._list.find('li').map(function() { return $(this).data('value').id; }).get();
      this._value = combined.join('|');
      this.element.val(combined[ combined.length - 1 ]);
      this._trigger('value', null, this._value);
    },

    value: function() {
      return this._value;
    },

    _remove_bubble: function(e) {
      var pos = $.inArray(e.data.parent.data('value').id, e.data.that.options.blacklist);

      if (pos > -1) {
        e.data.that.options.blacklist.splice(pos, 1);
      }

      e.data.parent.remove();
      if (!e.data.that._list.find('.text').length) {
        e.data.that._list.addClass(e.data.that.widgetName + '-empty');
      }
      e.data.that._set_value();
      e.stopPropagation();
    }

  }));
});
