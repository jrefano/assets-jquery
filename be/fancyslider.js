(function(factory) {
  'use strict';
  if (typeof define === 'function' && define.amd) {
    define([
      'jquery',
      'jquery/ui/slider'
    ], function() {
      var module = factory.apply(this, arguments);
      return module;
    });
  }
  else {
    return jQuery && factory.call(this, jQuery);
  }
}(function($) {
  'use strict';

  $.fn.fancyslider = function(options) {
    options = $.extend({
      animate: 'fast',
      input: 'value',
      value: 0,
      percent_default: 50
    }, options);

    var $slider = this,
        lastHit = false,
        percent = 100 * options.value / options.max,
        $progress = $('<div class="ui-progress"/>'),
        dinputValue = (options.input === 'value') ? options.value : percent,
        $input = $('input[type=text]').filter(function() {
          return $(this).data('forslider') === $slider[0].id;
        });

    // Guard against bad default value
    if (percent > 100) {
      percent = 100;
    }

    $progress.css('width', percent + '%');

    function updateFromInput(e, force) {
      var val = parseInt(e.target.value, 10),
          max = $slider.slider('option', 'max'),
          min = $slider.slider('option', 'min'),
          sliderValue;

      function exceedsMax() {
        return val > (options.input === 'value' ? max : 100);
      }

      function exceedsMin() {
        return val < (options.input === 'value' ? min : 0);
      }

      // no need to update if on blur same value as what's saved
      if (parseInt($slider.slider('value'), 10) === val && force !== true) {
        return;
      }

      // Default when the input is invalid
      if (isNaN(val)) {
        val = (options.input === 'value') ? $slider.slider('value') : options.percent_default;
      }

      // simulate slidestart to calculate some default values
      $slider.trigger('slidestart', { value: $slider.slider('value') });

      lastHit = false;

      if (options.input === 'value') {
        sliderValue = val;
      }
      else {
        sliderValue = Math.round($slider.slider('option', 'max') * (val / 100));
      }

      if (exceedsMax()) {
        sliderValue = max;
      }

      if (exceedsMin()) {
        sliderValue = min;
      }

      // set slider to new val
      $slider.slider('value', sliderValue);

      $slider.trigger('slide', { value: sliderValue });

      // after triggering slide, all new correct values are set, so correct in this scope
      sliderValue = $slider.slider('value');

      $slider.trigger('slidestop', { value: sliderValue });

      // make sure input is right val
      e.target.value = (options.input === 'value') ? sliderValue : (sliderValue / max) * 100;
    }

    function keyDown(e) {
      var trigger = false;

      switch (e.keyCode) {
        case $.ui.keyCode.ENTER:
          trigger = true;
          break;

        case $.ui.keyCode.UP:
        case $.ui.keyCode.DOWN:
          $input.val(parseInt($input.val(), 10) - 1);
          trigger = true;
          break;
      }

      if (trigger) {
        $input.trigger('blur').focus();
        return false;
      }
    }

    function checkKey() {
      // Only update based on timeout if enough time has elapsed and the input has a value
      if (lastHit && (new Date() - lastHit) > 500 && $input.val()) {
        $input.trigger('blur').focus();
        lastHit = false;
      }
    }

    function keyUp(e) {
      switch (e.keyCode) {
        // already handled in the up event
        case $.ui.keyCode.ENTER:
        case $.ui.keyCode.UP:
        case $.ui.keyCode.DOWN:
          return false;
      }

      lastHit = new Date();
      setTimeout(checkKey, 1000);
    }

    function getPercent(value) {
      // Getting min and max during slide just in case some options change during event binds
      var min         = $slider.slider('option', 'min'),
          max         = $slider.slider('option', 'max');

      return 100 * (value - min) / (max - min);
    }

    this.slider(options)
    .on('slide', function(e, ui) {
      var percent = getPercent(ui.value),
          inputValue = (options.input === 'value') ? ui.value : percent;

      $progress.css('width', percent + '%');

      $input.val(inputValue);
    })
    .prepend($progress);

    $input.val(dinputValue);

    $input
    .on('blur', updateFromInput)
    .on('keydown', keyDown)
    .on('keyup', keyUp);

    return this;
  };
}));
