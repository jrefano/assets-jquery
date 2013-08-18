(function($) {

  $.widget('be.autocomplete', $.extend( true, {}, $.ui.coreext, $.ui.listselector, {

    options : {
        dontResetTab          : false,                                    // Keep value in field when user tabs
        data_src              : null,                                     // URL to preload || 'ajax' || object of data
        data_field            : 'n',                                      // Default data object property to search
        text                  : 'Start typing to see list',               // Default text in input field
        engine                : 'regex',                                  // quicksilver | regex
        displayLimit          : 5,                                        // how many options show in dropdown before the scrollbar shows
        limit                 : 0,                                        // If limit is greater than zero, limits number of selections that can be made
        templateSelection     : '#autocomplete-selection-template',       // CSS selector to find template for selection
        templateOption        : '#autocomplete-option-template',          // CSS selector to find template for option
        templateForm          : '#autocomplete-form-template',            // CSS selector to find template for actual widget form
        allowNewEnter         : false,                                    // Whether or not a user is allowed to add a new option
        highlight             : false,                                    // highlight matching part of text in options
        filterCategory        : false,                                    // ??
        favorites_src         : null,                                     // ??
        list_position_element : null,                                     // change what element list of options clones position to
        noEnterText           : 'You must select an option on the list.', // Text used for validation bubble
        defaultValues         : {},                                       // an object keyed by *something* which maps to an array of default values
        delay                 : 150,                                      // delay for throttler
        noIdConstant          : '__NO_ID_CONSTANT__'                      // the ID given to options that do not have a mappable ID ( used for location DB )
    },

    _open             : false,

    _hideOptions : function() {
      $(window).unbind( 'resize scroll', this.positionOptionsProxy );
      this._options.hide();
    }, // hideOptions

    _init : function() {
    
      var thisObj          = this,
          $template        = false;

      this._id    = this.element[0].id;

      $template = this.template({id:this._id}, this.options.templateForm );

      $template.appendTo(this.element);

      this._baseInit();

      // grab references to pertinent elements
      this._options_wrap        = $('#'+this._id+'_options_wrap');
      this._options             = $('#'+this._id+'_options');
      this._no_results          = $('#'+this._id+'_no_results');
      this._new_option          = $('#'+this._id+'_new_option');
      this._favorites_toggle    = $('#'+this._id+'_favorites_toggle');
      this.positionOptionsProxy = $.proxy( this.positionOptions, this );

      // disregard templates, make sure absolute options float on page so no parent divs can effect
      $('body').append( this._options_wrap );

      this.hideOptions = $.proxy( this._hideOptions, this );

      this._options_wrap.bind( 'mouseover', function() {
        $(this).find('.keySelection').removeClass('keySelection');
      });

      this._options.bind( 'scroll', function( e ) {
        e.stopPropagation();
      });

      this._no_results.hide();
      this._new_option.hide();

      // bind a function to fire on the sameValue
      $(thisObj._field).bind('keydown', { thisObj : thisObj }, this._handleEvent );

      // Create a defaultValue object on the field
      this._field.defaultValue(this.options.text);

      // Create a throttler
      this._field.throttler({delay:this.options.delay, allow_bars : false});

      // Bind the ul to the callback
      thisObj._options.unbind('click', thisObj._makeSelection) // kill prior bind, just in case
                      .bind('click', thisObj, thisObj._makeSelection);

      // When there is a mouseup on the body of the document, close the dropdown
      // use mouseup since other plugins stop propogation of click
      Config.$document.ready(function() {
        Config.$body.bind('mouseup', thisObj, thisObj._checkClose);
      });
      
      this._field.on( 'beforeClickReset', function() {
        
        if ( this.selectFieldData( false ) === true ) {
          return false;
        }

      }.bind( this ));


      // Retrieve and load the autocomplete options.
      this._loadDataSource();
      
      this._field.on( 'contextmenu ', function( e ) {
        return false;
      });

      // This seems to be the function that actually searches
      this._field.bind('runFunction', function(trigger, evt) {
      
        // Don't run anything if user hit keys that are jsut going to select all or things liek that
        if ( evt.ctrlKey === true || evt.metaKey === true ) {

          var code       = ( evt.charCode ) ? evt.charCode : evt.keyCode,
              checkCodes = [
                  88, // x
                  86 // v
              ];


          // Skip out of here unless user cut or paste thinsg
          if ( $.inArray( code, checkCodes ) === -1 ) {
            return;
          }

        }
        
        if ( !thisObj._field.throttler('currentValue') ) {
          thisObj.element.trigger( 'noValue' );
        }

        if (thisObj.options.data_src === 'ajax' ) {
          thisObj.element.trigger('externalAjax', [thisObj.element]);
        }
        else {
          thisObj._runFunction(thisObj);
        }

      });

      this.element
        .addClass('autocomplete cfix')
        .data('autocomplete.initialized', true);


      if (this.options.data_src === 'ajax') {

        this.element.bind('externalAjaxSuccess', function() {
          thisObj._runFunction();
        });

      }

      if ( this.options.favorites_src !== null ) {
        thisObj._loadFavoritesSource();
        thisObj._favorites_on = false;

        // bind to standard click on toggle (star) button
        this._favorites_toggle.bind('click', function() {
          thisObj._toggleFavorites();
        });

        // bind to focus on field
        this._field.bind('focus', function(){
          thisObj._clearFavorites();
        });

        // bind to manual trigger
        this._field.bind('hideFavorites', function(){
          if ( thisObj._favorites_toggle.hasClass('autocomplete_favorites_on') ){
            thisObj._clearFavorites();
          }
        });

        // bind to a filter change
        this._field.bind('switchFilter', function() {
          if ( thisObj._favorites_toggle.hasClass('autocomplete_favorites_on') ){
            thisObj._insertFavorites();
          }
        });

        // Handle closing of favorites list properly (all clicks that are not on the toggle, or a filter, should close any open favorites lists)
        Config.$body.bind('click', function(e){
          var target = e.target;

          if ( $('.autocomplete_favorites_on').length > 0 &&
            !$(target).hasClass('autocomplete_favorites_toggle') &&
            !$(target).parent().hasClass('autocomplete_favorites_toggle') &&
            $(target).parents('.autocomplete_filter').length === 0 ){
              $('.autocomplete_favorites_on').parents('.autocomplete').data().autocomplete._clearFavorites();

            }
        });

      }

    }, // init

    destroy: function() {

      this._options_wrap.remove();
      this._options.remove();
      this._no_results.remove();
      this._new_option.remove();
      this._favorites_toggle.remove();
      $(window).unbind( 'resize scroll', this.hideOptions );

      return this;

    }, // destroy

    _runFunction : function () {
    
      var current_value = this._field.throttler('currentValue');

      this._open = ( !current_value ) ? false : true;

      if ( this._selection_items &&
         this.options.limit &&
         this._selection_items.length >= this.options.limit) {
        this.element.trigger('typingLimitHit');

        return;

      }

      if ( !current_value ) {
        this.refocus();
        return;
      }

      // Resetting after last search
      this._clearResults();

      // Get the selected values
      this._selected_values = this.selected();

      // if using ajax no need to filter any searching
      if ( this.options.data_src === 'ajax' ) {

        this._createOptions( this._data );
        this._handleMatches( this._data );

      }
      else {

        // Run the specified search method
        if ( this.options.engine === 'quicksilver' ) {
          this._searchQuicksilver();
        }
        else if ( this.options.engine === 'regex' ) {
          this._searchRegex();
        }
        else {
          throw 'Invalid search engine: ' + this.options.engine;
        }

      } // else

      // Get a reference the lis for the key-handling code
      this._lis = $('#'+this._id+'_options li');

      this.element.trigger('functionRan');


    },

    /***  Regex search implementation  ***/
    _searchRegex : function() {

      var thisObj             = this,
          search              = $(this._field).val(),
          filter              = this._filter,
          filtering           = false,
          matches             = [],
          exprs               = [],
          terms               = null,
          highlighted_results = [];


      function matching( field, val ) {

        var matched = true;

        field = $.isFunction( field ) ? field.call(val) : field ;
        

        // Loop through the expressions made by each word
        $.each(exprs, function(){
        
          if( ! field.match(this) ) {
            matched = false;
            return;
          }

          // TODO: rip out filtering from plugin to be used in some other way
          if ( filtering && val.c && val.c.toString() !== filter.toString() ){
            matched = false;
            return;
          }
        });
        
        return matched;

      } // matching

      /**** process the search terms.   *****/

      terms  = search.split(' ');

      if ( thisObj.options.filterCategory && typeof filter !== 'undefined' && filter !== '' ) {
        filtering = true;
      }

      // Loop through each word and make regex pattern for each one
      $.each( terms, function( i, term ){

        var ptn = [];

        $.each( term.split(''), function( i, val ) {
          ptn.push( $.Core.escapeRegEx( val ) );
        });

        ptn = ptn.join('\\w*');

        exprs.push( new RegExp( ptn, 'i') );

      }); // each terms

      if ( !thisObj._data ) {
        return;
      }

      // If the text matchs, push the index into an array
      $.each(thisObj._data, function(i, val){
      

        var selected_check = ( thisObj.options.class_values ) ? val : i,
            match          = false,
            match_against  = ( thisObj.options.matcher ) ?
                             thisObj.options.matcher.apply( val ) :
                             { data: val, fields : [ val[ thisObj.options.data_field ] ] };
                            
        if ( match_against === false || $.inArray( selected_check, thisObj._selected_values) >= 0 ) { 
          return; 
        }


        // Loop through every field to find match
        $.each( match_against.fields, function( index, field ) {
        
          // If the data is an instance of a class he field must be gotten via a function
          field = ( thisObj.options.class_values ) ?
                  match_against.data[ field ] : field;
        
          if ( !match ) {
            match = matching( field, match_against.data );
          }

          // Match found so no more searching required
          if ( match ) {
            return false;
          }
        
        }); // each match against fields

        if ( match ) {
          matches.push( ( ( thisObj.options.class_values ) ? {Klass:this}: this ) );
        }

      }); // each data
      
      if (!thisObj._handleMatches(matches)) {
        return;
      }

      if (  thisObj.options.displayLimit > 0 ) {
        matches = matches.slice( 0, +( thisObj.options.displayLimit ) );
      }
      
      if (thisObj.options.highlight){
        highlighted_results = thisObj._highlightTerms( matches, terms );
        thisObj._createOptions( highlighted_results );
      }
      else {
        thisObj._createOptions( matches );
      }

    },

    /*** Quicksilver search implementation ***/
    _searchQuicksilver : function() {
      var thisObj             = this,
          num                 = 0,
          scores              = [],
          results             = [],
          score               = false,
          fixSort             = function(a, b){return b.score - a.score;},
          object              = thisObj._data,
          highlighted_results = null,
          terms               = null,
          determineScore = function(id) {

            var field = this[thisObj.options.data_field];
            field = $.isFunction( field ) ? field.call(this) : field ;

            switch ( typeof(id) ) {

              case 'string' :
                break;

              case 'undefined' :
                return;

              default :
                id = id.toString();
                break;

            }

            if ( !field ) {
              return;
            }

            if ( $.inArray(id, thisObj._selected_values) >= 0 ) { return; }
            score = field.toLowerCase().score($(thisObj._field).val().toLowerCase());
            if (score > 0) { scores.push({score: score, data:{id:id,n:field}}); }

            if ( scores.length > 50 ) {
              return false;
            }

          };

      $.each( object, determineScore );

      if (!thisObj._handleMatches(scores)) {
        return;
      }

      // Sort the scores in DESC order
      scores = scores.sort(fixSort);

      // Loop through indexes in the scores array, show the top X
      if ( thisObj.options.displayLimit > 0 ) {
        for ( num=0; num < Math.min( +thisObj.options.displayLimit, scores.length ); ++num ) {
          results.push( scores[num].data );
        }
      }

      if (thisObj.options.highlight){
        highlighted_results = thisObj._highlightTerms( results, terms );
        thisObj._createOptions( highlighted_results );
      }
      else {
        thisObj._createOptions( results );
      }

    },

    _handleMatches : function(matches) {

      // If there are no results, fire a callback
      if ( matches.length === 0 ) {
        this.element.trigger('noResults', [ this._field ] );
        this._showOptions();
        return false;
      }
      else {
        this.element.trigger('foundResults', [ this._field, matches ] );
        return true;
      }

    },

    _highlightTerms : function( highlighted_results, terms ){

      $.each( highlighted_results, function(i){

        highlighted_results[i] = $.extend( {}, highlighted_results[i] );

        var data_string  = highlighted_results[i].n,
            p            = false,
            new_string   = '';

        p = new RegExp( '('+terms.join('|')+')','gi');
        highlighted_results[i].n = data_string.replace(p,"<span class='h'>$1</span>");

      });

      return highlighted_results;
    },


    _createOptions : function( options ) {

        var thisObj         = this;

        $.each(options, function(i,e){

          if ( parseFloat( i ) === parseFloat( thisObj.options.displayLimit) ) {
            return false;
          }
          
          thisObj.template(this, thisObj.options.templateOption )
            .appendTo(thisObj._options)
            .data('templateData',this).addClass('cfix');

        });


        this._showOptions();

    },

    _showOptions : function() {

      this._options.show();
      
      $(window).bind( 'resize scroll', this.positionOptionsProxy );

      this.positionOptions();

    }, // _showOptions

    positionOptions : function() {
    
      var clone_to = this.options.list_position_element || this._field;

      this._options_wrap.clonePosition( clone_to, {
        setHeight : false,
        setWidth  : true,
        offsetTop : clone_to.outerHeight()
      });

    }, // positionOptions

    selectFieldData : function( refocus ) {

      refocus = ( refocus === false ) ? false : true;

      var thisObj       = this,
          value         = this.field().val(),
          templateData  = null,
          $input        = $("#"+this._id),
          func          = false,
          $form         = false,
          created       = false,
          match         = false;
          
      function matching( field, val ) {
      
        field = $.isFunction( field ) ? field.call( val ) : field ;
        
        if ( field.toLowerCase() !== value.toLowerCase() ) {
          return false;
        }
        
        templateData = ( thisObj.options.class_values ) ?
                       { Klass : val } : val;
                       
        return true;
      
      
      } // matched

      $.each(this.listData(), function(i, val) {
      
        var match_against = ( thisObj.options.matcher ) ?
                            thisObj.options.matcher.apply( val ) :
                            { data: val, fields : [ val[ thisObj.options.data_field ] ] };
      

        $.each( match_against.fields, function( index, field ) {
        
           field = ( thisObj.options.class_values ) ?
                    match_against.data[ field ] : field;

          if ( matching( field, val ) ) {
            match = true;
            return false;
          }

        }); // each data_field

        
        
        // Match found so no need to search further list
        if ( match ) {
          return false;
        }
      
        
      }); // each listData

      if ( !templateData ) {

        $form = $input.closest('form:data(validation), .form:data(validation)');

        if (!this.options.allowNewEnter) {

          if ( $form.length ) {
            $.validation.buildPrompt( $form, $input, this.options.noEnterText );
          }
          return;
        }

        if ( this.options.limit && this._selection_items.length >= this.options.limit) {

          $form.trigger('stoppedByLimit');
          return;

        }

        if ( this.options.newDataCallback ) {
          templateData = this.options.newDataCallback.apply( value );
        }
        else {
          templateData = {
            id : value,
            n : value
          }
        }

      }

      if ( this.options.filterCategory && typeof this._filter !== 'undefined' ){
        templateData.c = this._filter;
      } // if filtering, add the filter value as the category

      // Will be false if event was stopped via beforeAddSelection
      
      this.refocus();
      created = this.createSelection( templateData, refocus );
      
      return created;

    }, // selectFieldData

    refocus : function () {

      // Hide the list
      this.reset(false);

      if ( this.options.auto_focus_blur && this._field.is(':visible') ) {

        try {
          // Focus on the input
          this._field[0].focus();
        }
        catch ( e ) {

        }

      }

    },

    reset : function( setDefaultValue ) {

      var def_value = this._field.data().defaultValue;

      setDefaultValue = ( typeof(setDefaultValue) !== 'undefined' )  ? setDefaultValue : true;

      // Reset the throttler
      this._field.throttler('reset');

      if ( setDefaultValue ) {
        this._field[0].value = def_value;
      }

      // Remove a class from the keyed elements
      this._selections.find('li.keySelection').removeClass('keySelection');

      this._clearResults();
      this._open = false;
      this._hideEntryForms();

    },

    _hideEntryForms : function() {
      this._new_option.hide();
      this._no_results.hide();
      this.element.trigger('formsHidden');
    },

    _clearResults : function() {
      this._hideEntryForms();
      this._options.html('');
      $(window).unbind( 'resize scroll', this.positionOptionsProxy );
      this._options.hide();
      this._options.css({height:'auto'});
    },

    listElement : function() {
      return this._options;
    },

    listElementWrap : function() {
      return this._options_wrap;
    },

    noResultsElement : function() {
      return this._no_results;
    },

    newOptionElement : function() {
      return this._new_option;
    },

    hideEntryForms : function() {
      this._hideEntryForms();
    },

     /**
     * Load options from either an object, URL
     *
     * @param {object|string} thisObj.options.data_src
     *   Either an object of data, or a URL on which to perform an ajax request.
     */
    _loadDataSource : function() {
      var thisObj = this;

      // Check for a data source.
      if ( !thisObj.options.data_src ) {
        throw 'data_src is required';
      }

      if ( typeof thisObj.options.data_src  === 'object' ) {

        thisObj._data = thisObj.options.data_src;
        thisObj._insertDefaultValues();
        thisObj.element.data('dataLoaded',true);
        thisObj.element.trigger( 'dataLoaded', [ thisObj._data ] );
        if ( $.isEmptyObject(thisObj._data) ){
          thisObj.element.addClass('autocomplete_empty');
        }
      }
      else if ( typeof(thisObj.options.data_src) === 'string' ) {

        if (thisObj.options.data_src === 'ajax') {
          thisObj._insertDefaultValues();
          // return;
        }
        else {

          $.ajax({
            url      : thisObj.options.data_src,
            success  : function ( json ) {

              // backwards compatibility
              if ( json.json ) {
                json = json.json;
              }

              thisObj._data = json;
              thisObj._insertDefaultValues();
              thisObj.element.data('dataLoaded',true);
              thisObj.element.trigger( 'dataLoaded', [ thisObj._data ] );
              if ( $.isEmptyObject(thisObj._data) ){
                thisObj.element.addClass('autocomplete_empty');
              }

            }
          });

        }

      }
      else {
        throw 'Invalid data_src';
      }

    }, // _loadDataSource

    /**
     * Load options from either an object, URL
     *
     * @param {object|string} thisObj.options.favorites_src
     *   Either an object of data, or a URL on which to perform an ajax request.
     */
    _loadFavoritesSource : function() {
      var thisObj = this;

      // Check for a data source.
      if ( !thisObj.options.favorites_src ) {
        throw 'favorites_src is required';
      }

      if ( typeof(thisObj.options.favorites_src) === 'array' || typeof(thisObj.options.favorites_src) === 'object' ) {

        // TODO: double check that this is functional when migrating over first sections that use favorites
        if ( !$.isEmptyObject( thisObj._data ) ){
          thisObj._favorites = thisObj.options.favorites_src;
          thisObj._favorites_toggle.parent().addClass('autocomplete_favorites_wrap');
          thisObj._selections.addClass('autocomplete_selections_favorites_included');
          thisObj._favorites_toggle.show();
          thisObj.element.trigger( 'favoritesLoaded', [ thisObj._favorites ] );
        }
      }
      else if ( typeof(thisObj.options.favorites_src) === 'string' ) {

        if ( thisObj.options.favorites_src === 'external' || thisObj.options.data_src === 'ajax' ) {
          return;
        }
        else {

          $.ajax({
            url      : thisObj.options.favorites_src,
            type     : thisObj.options.ajax_type,
            dataType : thisObj.options.ajax_dataType,
            success  : function (data, textStatus) {
              if ( !$.isEmptyObject(data.json) ){
                thisObj._favorites = data.json;
                thisObj._favorites_toggle.parent().addClass('autocomplete_favorites_wrap');
                thisObj._selections.addClass('autocomplete_selections_favorites_included');
                thisObj._favorites_toggle.show();
                thisObj.element.trigger( 'favoritesLoaded', [ thisObj._favorites ] );
              }

            }
          });

        }

      }
      else {
        throw 'Invalid favorites_src';
      }

    }, // _loadFavoritesSource

    _insertFavorites : function(){
      var thisObj   = this,
          favorites = [];

      // if filtering
      if ( thisObj.options.filterCategory && typeof thisObj._filter !== 'undefined' ){
        $.each(thisObj._favorites, function(){
          if ( this.c === thisObj._filter ){
            favorites.push(this);
          }
        });
      }
      else {
        favorites = thisObj._favorites;
      }

      thisObj.reset(false);
      thisObj._options.html('');
      thisObj._createOptions( favorites );
      thisObj._options.addClass('autocomplete_favorites').addClass('listselector_favorites');
      thisObj._options.parent().addClass('autocomplete_favorites_wrap').addClass('listselector_favorites_wrap');
      thisObj._favorites_toggle.addClass('autocomplete_favorites_on');
      thisObj._favorites_on = true;
      thisObj._field_wrap.find('.tooltip').addClass('autocomplete_favorites_hide_tooltip');
      thisObj.element.trigger('favoritesInserted');
    },

    _clearFavorites : function(){
      var thisObj = this;

      thisObj.refocus();
      thisObj._options.removeClass('autocomplete_favorites').removeClass('listselector_favorites');
      thisObj._options.parent().removeClass('autocomplete_favorites_wrap').removeClass('listselector_favorites_wrap');
      thisObj._favorites_toggle.removeClass('autocomplete_favorites_on');
      thisObj._favorites_on = false;
      thisObj._field_wrap.find('.tooltip').removeClass('autocomplete_favorites_hide_tooltip');
      thisObj.element.trigger('favoritesCleared');
    },

    _toggleFavorites : function(){
      var thisObj = this;

      if ( thisObj._options.hasClass('autocomplete_favorites') ){
        thisObj._clearFavorites();
      }
      else {

        $('.form-item.autocomplete').each( function(){
          var $this = $(this);

          if ( $this.attr('id') !== thisObj._id.toString() && $this.data().autocomplete._favorites_on ){
            $this.data().autocomplete._toggleFavorites();
          }
        });

        thisObj._insertFavorites();
      }
    },

    _switchFilter : function( filter ){
      var $thisObj = this;

      $thisObj._filter = filter;
      $thisObj._field.attr('filter', filter).trigger('switchFilter');
    },

    handleEvent : function( evt ) {

      if ( !evt.data ) {
        evt.data = {};
      }

      evt.data.thisObj = this;

      this._handleEvent( evt );

    },

    _handleEvent : function( evt ) {


      var thisObj      = evt.data.thisObj,
          stopEvent    = true,
          closer       = false,
          keySelection = false,
          before_event = $.Event( 'beforeHandleEvent' );


      thisObj.element.trigger( before_event);

      if ( before_event.isDefaultPrevented() ) {
        return;
      }

      if (!evt) { return; }

      switch (evt.keyCode) {
        case $.ui.keyCode.TAB :

          if ( !thisObj.options.dontResetTab ) {
            thisObj.reset();
          }

          stopEvent = false;
          break;
        case $.ui.keyCode.ESCAPE :
          thisObj.refocus();
          break;
        case $.ui.keyCode.ENTER :
        case $.ui.keyCode.NUMPAD_ENTER :

          keySelection = thisObj._options.find('.keySelection');

          if (keySelection.length) {
            thisObj.element.trigger('beforeKeyEnter');
            keySelection.trigger('click');
            thisObj.element.trigger('afterKeyEnter');
          }
          else {

            thisObj.element.trigger('beforeFieldKeyEnter');
            thisObj.selectFieldData();
            thisObj.element.trigger('afterFieldKeyEnter');

          }
          break;

        case $.ui.keyCode.UP:
          thisObj.element.trigger('beforeKeyUp');
          thisObj._decidePreviousKeySelection(thisObj._options,thisObj._lis,'li');
          thisObj.element.trigger('afterKeyUp');
          break;

        case $.ui.keyCode.DOWN:
          thisObj.element.trigger('beforeKeyDown');
          thisObj._decideNextKeySelection(thisObj._options, thisObj._lis,'li');
          thisObj.element.trigger('afterKeyDown');
          break;

        case $.ui.keyCode.DELETE :

          if (thisObj._selections.find('.keySelection .closeX, .keySelection .selection-close').length) {
            thisObj.element.trigger('beforeKeyDelete');
            thisObj._selections.find('.keySelection .closeX, .keySelection .selection-close').trigger('click');
            thisObj.element.trigger('afterKeyDelete');
          }
          else {
            stopEvent = false;
          }
          break;

        case $.ui.keyCode.BACKSPACE:

          closer = thisObj._selections.find('.keySelection .closeX, .keySelection .selection-close');

          if (closer.length) {
            thisObj.element.trigger('beforeBackspace');
            closer.trigger('click');
            thisObj.element.trigger('afterBackspace');
          }
          else {
            stopEvent = false;
          }
          break;

        default :
          stopEvent = false;
          break;

      } // switch keycode

      if (stopEvent) {
        evt.stopPropagation();
        evt.preventDefault();
      }


    } // _handleEvent


  }));

})(jQuery);
