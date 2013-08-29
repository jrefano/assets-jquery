/*jslint sloppy:true */
/*global jQuery */
/********************************************************************
 * jQuery plugin: changeInput()
 * Usage:
 *   $(selector).changeInput('check');
 * Triggers custom events: check, uncheck, disable, enable
 * Triggers click handler (not click event) on state change
 * Optional second param to toggle options for state (true/false)
 ********************************************************************/
(function($) {

$.fn.changeInput = function( option, state, options ) {

  var extra_event_args = ( typeof options === 'object' && typeof options.extra_event_args !== 'undefined' ) ? options.extra_event_args : [];

  if ( typeof( option ) != 'undefined' ) {

    $(this).each(function(i) {

      var $this = $(this), startValue, startDisabled, className, startChecked, disabled;

      // Elements permitted to have 'value' attribute.
      if ( $this.is('input, button, textarea, select, optgroup, option') ) {

        startValue = $this.val();

        // Update element properties.
        if ( typeof state !== 'undefined' && (option === 'val' || option === 'value') ) {
          // This is to account for jQueryUI 1.10 behavior of namespaced data elements AND old jQueryUI
          if ( $this.data('uiSelectmenu') || $this.data('selectmenu') ) {
            $this.selectmenu( 'value', state );
          }
          else {
            $this.val( state );
            $this.triggerHandler('change', extra_event_args);
          }
        }

      }

      // Elements permitted to have 'disabled' attribute.
      if ( $this.is('input:not([type=hidden]), button, textarea, select, optgroup, option, .form-button') ) {

        startDisabled = this.disabled;
        disabled      = false;

        // Update element properties.
        switch ( option ) {

          case 'disable':
            disabled = true;
            break;

          case 'enable':
            disabled = false;
            break;

          case 'toggleDisabled':
            if ( typeof( state ) != 'undefined' ) {
              disabled = Boolean(state);
            }
            else {
              disabled = !this.disabled;
            }
            break;

        }

        if ( disabled != startDisabled ) {

          className = $this.is('[type=submit], [type=button], button, .form-button, .form-submit') ? 'disabled form-button-disabled' : 'disabled';

          // Trigger custom events.
          if ( disabled ) {
            $this.addClass(className).trigger('disable', extra_event_args).attr('disabled', true);

            if ($this.is('select')){
              $this.next().addClass(className);
            }

            if ( $this.data('uiSelectmenu') || $this.data('selectmenu') ) {
              $this.selectmenu( 'disable' );
            }


          }
          else {
            $this.removeClass(className).attr('disabled', false).trigger('enable', extra_event_args);

            if ($this.is('select')){
              $this.next().removeClass(className);
            }

            if ( $this.data('uiSelectmenu') || $this.data('selectmenu') ) {
              $this.selectmenu( 'enable' );
            }

          }

        }

      }

      // Elements permitted to have 'checked' attribute.
      if ( $this.is('[type=checkbox], [type=radio]') ) {

        startChecked = this.checked;

        // Update element properties.
        switch ( option ) {

          case 'check':
            this.checked = true;
            break;

          case 'uncheck':
            this.checked = false;
            break;

          case 'toggleChecked':
            if ( typeof( state ) != 'undefined' ) {
              this.checked = Boolean(state);
            }
            else {
              this.checked = !this.checked;
            }
            break;

        }

        if ( this.checked != startChecked ) {

          // Trigger click handler (but *not* full click event).
          $this.triggerHandler('click', extra_event_args);

          // Trigger custom events.
          if ( this.checked ) {
            $this.addClass('checked').attr('checked', true).trigger('check', extra_event_args);
          }
          else {
            $this.removeClass('checked').attr('checked', false).trigger('uncheck', extra_event_args);
          }

        }

      }

    });

  }

  return this;

};

}(jQuery));
