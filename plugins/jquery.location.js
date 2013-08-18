// @TODO: put US and CA in an array, and use that array is decide whether to be using state or not.
(function($) {

  $.fn.location = function() {

    $.each(this, function() {
    
      // Get references to the form elements.
      var $container  = $(this),
          city_text   = 'City',
          state_text  = 'State / Province',
          $country    = $container.find('.country:first'),
          $state      = $container.find('.state:first'),
          $city       = $container.find('.city:first');
      
      if ( $container.data( 'location' ) === true ) {
        return;
      }
          
      $container.data('location',true);

      // State initialization and binding
      $state.autocomplete({
        data_src          : 'external',
        limit             : 1,
        displayLimit      : 3,
        alwaysPromptAdd   : false,
        text              : state_text,
        templateForm      : '#autocomplete-common-autocomplete-form-template',
        templateOption    : '#autocomplete-common-autocomplete-option-template',
        templateSelection : '#autocomplete-common-autocomplete-selection-template'
      })
      .bind('limitHit', function(e) {
        
        // Picked a state. Enable city,
        $city.autocomplete('field').changeInput('enable');
        
        // If it is blank, focus on city field
        if ( $city.autocomplete('field').val() == city_text ) {
          $city.autocomplete('refocus');
        }

      })
      .bind('disable', function() {
        $state.autocomplete('field').val(state_text);
      })
      .bind('limitNotHit', function(e) {

          
          
          // Disable city and remove the value, as it is no longer valid
          $city.autocomplete('field').changeInput('disable');

          // Remove the selected city.
          if ( $city.autocomplete('numSelected') > 0 ){
            $city.autocomplete('selectedElements').find('.closeX').trigger('click');
          }

          // Enable the state field
          $state.autocomplete('field').changeInput('enable');

      })
      .bind('dataLoaded', function() {
        if ( $state.attr('value') ) {
          $state.autocomplete('createSelection', { id : $('#state_id', $container).val(), n : $state.attr('value') }, false);
          
        }
      });

      // City initialization and binding
      $city.autocomplete({
        data_src          : 'external',
        use_ajax          : true,
        limit             : 1,
        displayLimit      : 3,
        delay             : 200,
        alwaysPromptAdd   : false,
        text              : city_text,
        templateForm      : '#autocomplete-common-autocomplete-form-template',
        templateOption    : '#autocomplete-common-autocomplete-option-template',
        templateSelection : '#autocomplete-common-autocomplete-selection-template'
      })
      .bind('disable', function() {
        $city.autocomplete('field').val(city_text);
      })
      .bind('externalAjax', function() {
      
        if ($city.autocomplete('field').val().length <= 1) {
          return;
        }
        
        // Remove selection, no blurring so user can continue typing
        $(this).find('.closeX').trigger('click', [false] );
      
        // Load the cities for the country and state
        $.ajax({
          url      : '/utilities/location?level=3&country=' + $country.val() + '&stateprov=' + $state.autocomplete('delimited')+'&city='+$city.autocomplete('field').val(),
          dataType : 'json',
          type     : 'GET',
          success  : function(json) {
          
            // make sure it strips irrelevant ids
            $.each(json, function() {
                this.id = $city.autocomplete('noIdConstant');
            });
            
            $city.autocomplete('setExternalListData', { json : json }, true );
            $city.trigger('externalAjaxSuccess');
          }
        });
        
      });
      
      // Enable selection to be shown within text input. These binds are applied to $state and $city
      $state.add($city)
        .bind('limitHit', function() {
          
          var $this     = $(this),
              listData  = $this.autocomplete('listData'),
              selection = $this.autocomplete('delimited'),
              $input    = $this.autocomplete('field');
         
          if ( selection == $this.autocomplete('noIdConstant')) {
            $input.val( $this.find('.listselector-selection-display').html() ).blur();
          }
          else if ( listData[selection] && listData[selection].n ) {
            $input.val( listData[selection].n ).blur();
          }

        })
        .bind('typingLimitHit', function() {
          $(this).find('.closeX').trigger('click', [false]);
        });

      // When the value of the country changes, do some stuff.
      $country.bind('change loadStuff', function(e) {

        // Reset the autocompletes. This is probably a scope problem
        $state.autocomplete('field').changeInput('disable');
        $city.autocomplete('field').changeInput('disable');

        if ( $state.autocomplete('numSelected') > 0 ){
          $state.autocomplete('selectedElements').find('.closeX').trigger('click');
        }

        if ( $city.autocomplete('numSelected') > 0 ){
          $city.autocomplete('selectedElements').find('.closeX').trigger('click');
        }

        var country_value = $country.val(),
            level         = 3, // default the level of data retrieved later on to be city
            widget        = '';
            
            
        // all countries
        if ( country_value == '' ) {
          $state.show();
          return;
        }

        // Check if the value of the form is either US or CA
        if ( country_value == 'US' || country_value == 'CA' ) {

          $state.autocomplete('field').changeInput('enable');
          level  = 2;
          widget = $state;
          $state.show();

        }
        else {

          $state.autocomplete('field').changeInput('disable');
          $city.autocomplete('field').changeInput('enable');
          widget = $city;
          $state.hide();
          $country.css({'margin-right':'10px'});

        }
        
        // make sure only level 2 is checked, which means no cities will be searched for by selecting a country
        if ( level == 2 ) {

          // Retrieve state data for the state autocomplete
          $.ajax({
            url      : '/utilities/location?level=' + level + '&country=' + country_value,
            dataType : 'json',
            type     : 'GET',
            success  : function(json) {
              widget.autocomplete('setExternalListData', { json : json }, true);
            }
          });
        
        }

      });

      // Set up the widget with neccessary information to continue searching if there are things preselected
      $state.autocomplete('field').changeInput('disable');
      $city.autocomplete('field').changeInput('disable');

      // preload the states OR cities if there is a country selected
      if ( $country.val() != '' ) {
        $country.trigger('loadStuff');
      }
      
      // preload the city if there is one selected
      if ( $city.attr('value') && $city.attr('value') != 'City' ) {
        $city.autocomplete('field').changeInput('enable');
        $city.autocomplete('createSelection', { id : $city.autocomplete('noIdConstant'), n : $city.attr('value') }, false);
        $city.autocomplete('field').changeInput('enable');
      }


    }); // each

  }; // $.fn.location

})(jQuery);
