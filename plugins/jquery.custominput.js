// ============================================================================
// = ALERT! ===================================================================
// = This plugin has been modified from its original source (line 27, 17-19). =
// = This plugin has been extended to support off-DOM rendering.              =
// ============================================================================

/*--------------------------------------------------------------------
 * jQuery plugin: customInput()
 * by Maggie Wachs and Scott Jehl, http://www.filamentgroup.com
 * Copyright (c) 2009 Filament Group
 * Dual licensed under the MIT (filamentgroup.com/examples/mit-license.txt) and GPL (filamentgroup.com/examples/gpl-license.txt) licenses.
 * Article: http://www.filamentgroup.com/lab/accessible_custom_designed_checkbox_radio_button_inputs_styled_css_jquery/
 * Usage example below (see comment "Run the script...").
--------------------------------------------------------------------*/
(function($){

function escapedInputName($input) {
  return $input.attr('name').replace(/([\[\]])/g, '\\$1');
}

$.fn.customInput = function(options) {
  options = $.extend( {
    container : $(document.body)
  }, options);

  $(this).each(function() {
    if ( $(this).is('[type=checkbox],[type=radio]') && $(this).parent( '.custom-' + $(this).attr('type') ).length === 0 ) {

      var input = $(this);

      // get the associated label using the input's id
      var label = options.container.find('label[for='+input.attr('id')+']');

      // Don't make items disappear because a label is missing
      if (!label.length) {
        return;
      }

      // get type, for classname suffix
      var inputType = ( input.is('[type=checkbox]') ) ? 'checkbox' : 'radio';

      // wrap the input + label in a div
      $('<div class="custom-'+ inputType +'"></div>').insertBefore(input).append(input, label);

      // find all inputs in this set using the shared name attribute
      var allInputs = options.container.find('input[name='+ escapedInputName( input ) +']');

      var $as = label.find('a[target=_blank]');

      $as.each( function() {

        var href= this.href;

        $(this).bind('click', function(e) {
          e.stopPropagation();
          e.preventDefault();
          window.open( href, '_blank' );
          return false;

        });

        this.href = '#';
        this.removeAttribute('target');

      });

      // necessary for browsers that don't support the :hover pseudo class on labels
      label.hover(
        function() {
          $(this).addClass('hover');

          if (inputType == 'checkbox') {
            input.trigger('customOver');
          }
          else {
            options.container.find('[name=' + escapedInputName( input ) + ']').each(function() {
              $(this).trigger('customOverName');
            });
          }

          if ( inputType == 'checkbox' && input.is(':checked') ) {
            $(this).addClass('checkedHover');
          }
        },
        function() {
          $(this).removeClass('hover checkedHover');
          if (inputType == 'checkbox') {
            input.trigger('customOut');
          }
          else {
            options.container.find('[name=' + escapedInputName( input ) + ']').each(function() {
              $(this).trigger('customOutName');
            });
          }
        }
      );

      // bind custom event;, trigger it; bind click, focus, blur events
      input.bind('updateState', function() {

        allInputs = options.container.find('input[name='+escapedInputName( input ) +']');

        if ( input.is(':checked') ) {
          if ( input.is(':radio') ) {
            allInputs.each(function() {
              options.container.find('label[for='+$(this).attr('id')+']').removeClass('checked');
            });
          }
          label.addClass('checked');
        }
        else {
          label.removeClass('checked checkedHover checkedFocus');
        }
      })
      .bind('updateState disable enable', function( e ) {

        // changeinput plugin triggers 'disable' before actually disabling
        if ( input.is(':disabled') || ( e && e.type === 'disable' ) ) {
          label.addClass('disabled');
          if ( input.is(':checked') ) {
            label.addClass('checkedDisabled');
          }
        }
        else {
          label.removeClass('disabled checkedDisabled');
        }
      })
      .trigger('updateState')
      .click(function(){
        $(this).trigger('updateState');
      })
      .focus(function(){
        label.addClass('focus');
        if ( inputType == 'checkbox' && input.is(':checked') ) {
          label.addClass('checkedFocus');
        }
      })
      .blur(function() {
        label.removeClass('focus checkedFocus');
      });

    }
  });
  return this;
};

})(jQuery);
