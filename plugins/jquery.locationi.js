/*jslint sloppy:true */
/*global jQuery*/
(function($) {

  $.fn.locationi = function( options ) {

    options = $.extend({
      templateSelection : '#autocomplete-selection-template',
      templateOption    : '#autocomplete-option-template',
      templateForm      : '#autocomplete-form-template',
      containerClass    : '.form-item',
      selectmenu        : true
    }, options );

    // This really should run on multiple elements at once
    return $.each(this, function() {

      // Get references to the form elements.
      var $container          = $(this),
          city_text           = 'City',
          state_text          = 'State / Province',
          $country            = $container.find( '.country' ).first(),
          $state              = $container.find( '.state' ).first(),
          $province           = $container.find( '.province' ).first(),
          $city               = $container.find( '.city' ).first(), // doesn't have container ( yet? )
          $city_field         = null,
          $hidden_state       = $container.find( '.hidden-state' ),
          $state_container    = $state.closest( options.containerClass ),
          $province_container = $province.closest( options.containerClass ),
          $city_value         = $( '#' + $city.attr('id') + '-value' ),
          city_request        = false, // ajax request for city
          auto_params         = {},
          $country_option, default_country_value;

      // The defaults from options are setup before any hooks are set on change
      if ( options.state ) {
        $state.changeInput( 'value', options.state );
      }

      if ( options.province ) {
        $province.changeInput( 'value', options.province );
      }

      if ( options.country ) {

        $country_option = $country.find( '[code=' + options.country + ']' );

        default_country_value = ( $country_option.attr( 'value' ) ) ?
          $country_option.attr( 'value' ) :
          $country_option.text();

        $country.changeInput( 'value', default_country_value );
      }

      function resetCity() {

        $city_field.val('').trigger( 'blur' );

        // Guard against IE bug where it tries to click invalid element
        try {
          $city.find('.closeX').trigger( 'click' );
        }
        catch( e ) {}

      }

      // Trigger updates in the proper order to make sure UI handles everything correctly
      function insertDefaults() {

        var country_value  = $country.val(),
            state_value    = $state.val(),
            province_value = $province.val(),
            city_value     = $city.autocomplete( 'delimited' );

        if ( country_value ) {
          $country.trigger( 'change' );
        }

        if ( state_value ) {
          $state.changeInput( 'value', state_value );
        }

        if ( province_value ) {
          $province.changeInput( 'value', province_value );
        }

        if ( $city.is( ':visible' ) && city_value ) {

          $city.autocomplete( 'createSelection', {
            id : city_value,
            n  : city_value
          }, false );

        } // if city is visible

      } // insertDefaults

      // Hook up country change actions
      $country.on( 'change keyup', function() {

        if ( city_request ) {
          city_request.abort();
        }

        var show_state_func    = 'addClass',
            show_province_func = 'addClass',
            show_city_func     = 'enable';

        // Reset fields
        resetCity();
        $province.changeInput( 'value', '' );
        $state.changeInput( 'value', '' );

        // US should show state dropdown, hide city until state is chosen
        if ( this.value === 'US' || this.value === 'United States' ) {
          show_state_func = 'removeClass';

          if ( !$state.val() ) {
            show_city_func  = 'disable';
          }

        } // if this.value  = us
        // Canada should show province dropdown, hide city until province is chosen
        else if ( this.value === 'CA' || this.value === 'Canada' ) {
          show_province_func = 'removeClass';

          if ( !$province.val() ) {
            show_city_func     = 'disable';
          }

        } // if this.value = canada
        // No country means nothing shows
        else if ( this.value === '' ) {
          show_city_func = 'disable';
        }

        // Show or hide depending on country value
        $city_field.changeInput( show_city_func );
        $state_container[show_state_func]( 'hide' ).toggle( show_state_func === 'removeClass' );
        $province_container[show_province_func]( 'hide' ).toggle( show_province_func === 'removeClass' );

        // Make sure state and province get selectmenus
        $state.add( $province ).each(function() {

          var $this        = $(this),
              option_width = $this.find('option').outerWidth()+15,
              updateUi = function() {
                $(this).changeInput( 'value', this.value );
              };

          if ( options.selectmenu && !$this.data('selectmenu') && $this.is(':not(:hidden)') ) {
            $this.selectmenu({
              style: 'dropdown',
              maxHeight: 200,
              menuWidth : ( $this.outerWidth() > option_width ) ? $this.outerWidth() : option_width
            });
          }

        }); // each $state $province

      }); // country on change

      auto_params = {
        data_src          : 'ajax',
        limit             : 1,
        dontResetTab      : true,
        displayLimit      : 3,
        delay             : 200,
        alwaysPromptAdd   : false,
        auto_focus_blur   : false,
        defaultValues     : ( $city_value.length ) ? $.parseJSON( $city_value.html() ) : {},
        text              : city_text,
        templateSelection : options.templateSelection,
        templateOption    : options.templateOption,
        templateForm      : options.templateForm
      };

      if ( options.city ) {
        auto_params.defaultValues = options.city;
      }

      // Hook up city autocomplete and then it's change actions
      $city.autocomplete( auto_params)
      .on( 'beforeAddSelection', function( e, templateData ) {
        templateData.n = templateData.n.replace( /[<>]*/g, '' );
      })
      .on( 'disable', function() {
        $city.autocomplete('field').val(city_text);
      })
      .on( 'externalAjax', function() {

        var stateprov = '';

        if ( $country.val() === 'United States' || $country.val() === 'US' ) {
          stateprov = $state.find('option:selected').attr( 'code' );
        }

        if ( $country.val() === 'Canada' || $country.val() === 'CA' ) {
          stateprov = $province.find('option:selected').attr( 'code' );
        }

        if ($city.autocomplete('field').val().length <= 1) {
          return;
        }

        // Remove selection, no blurring so user can continue typing
        try {
          $(this).find('.closeX').trigger('click', [false] );
        }
        catch( e ){}

        // Load the cities for the country and state
        city_request = $.ajax({
          url      : '/utilities/location?level=3&country=' +
                      $country.find('option:selected').attr( 'code' ) + '&stateprov=' +
                      stateprov +'&city='+$city.autocomplete('field').val(),
          dataType : 'json',
          type     : 'GET',
          success  : function(json) {

            city_request = false;

            // make sure it strips irrelevant ids
            $.each(json, function() {
                this.id = this.n;
            });

            $city.autocomplete('setExternalListData', { json : json }, true );
            $city.trigger('externalAjaxSuccess');
          }
        });

      }) // externalAjax
      .on( 'limitHit', function() {

        var selection = $city.autocomplete('delimited'),
            $input    = $city.autocomplete('field');

        $input.val( $city.find('.listselector-selection-display').html() ).blur();

      }) // limitHit
      // When user searches again
      .on( 'typingLimitHit noValue', function() {

        // Remove selection, no blurring so user can continue typing
        try {
          $(this).find('.closeX').trigger('click', [false] );
        }
        catch( e ){}

      });

      $state.add( $province ).on( 'change keyup', function() {

        var val       = $(this).val(),
            city_func = ( val || ( !$(this).is(':visible') && val ) ) ? 'enable' : 'disable';

        // Guard against external forces changing dropdown
        if ( $country.val() && $country.val() !== 'US' && $country.val() !== 'CA' ) {
          city_func = 'enable';
        }

        $city_field.changeInput( city_func );

        $hidden_state.val( val );

        resetCity();


      }); // state province on change

      $city_field = $city.autocomplete( 'field' ).changeInput( 'disable' );

      $city_field.on( 'input propertychange keyup', function() {
        if ( !this.value ) {
          try {
            $city.find('.closeX').trigger('click', [false] );
          }
          catch( e ) {}

        }
      });

      // Set data object for external references
      $container.data( 'location', {

        $country  : $country,
        $city     : $city,
        $state    : $state,
        $province : $province,
        values    : function() {

          var stateprov_code  = '',
              stateprov_value = '';

          if ( $country.val() === 'United States' || $country.val() === 'US' ) {
            stateprov_code  = $state.find('option:selected').attr( 'code' );
            stateprov_value = $state.val();
          }

          if ( $country.val() === 'Canada'  || $country.val() === 'CA' ) {
            stateprov_code  = $province.find('option:selected').attr( 'code' );
            stateprov_value = $province.val();
          }

          return {

            stateprov : {

              code  : stateprov_code,
              value : stateprov_value

            },

            country : {

              code : $country.find('option:selected').attr( 'code' ),
              value : $country.val()

            },

            city : {
              value : ( $city_field.val() !== $city_field.data( 'defaultValue' ) ) ? $city_field.val() : ''
            }


          };

        }

      });

      insertDefaults();

    }); // each

  }; // $.fn.location

}(jQuery));
