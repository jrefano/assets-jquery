define(['jquery', 'jquery/plugins/jquery.ui.selectmenu'], function($) {

  "use strict";

  $.fn.autoselectmenu = function() {

    return this.each( function() {
      var $select      = $(this),
          option_width = $select.find('option').outerWidth(),
          params       = {},
          updateUi     = function() {
            $select.changeInput( 'value', this.value );
          };

        // Don't do anything if it's already customized or if it's hidden.
        // TODO: Determine if initializing hidden ones still breaks things
        if ( $select.data('uiSelectmenu') || !$select.is(':visible') ) {
          return;
        }

        params = {
          style     : 'dropdown',
          maxHeight : 200,
          menuWidth : $select.outerWidth()
        };

        // Position a dropdown rightaligned to the select
       if ( $select.hasClass('ui-selectmenu-dropdown-right') ) {
          params.positionOptions = {
            my     : "right top",
            at     : "right bottom",
            offset : null
          };
        }

        // Intentionalyl allows for auto width
        if ( $select.width() > 0 ) {
          params.width = 'auto';
        }

        $select.selectmenu(params).on( 'change keyup', updateUi );

    });

  }; // autoselectmenu

});
