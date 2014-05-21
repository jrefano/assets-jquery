(function($) {

  $.widget('ui.autocomplete', $.extend( true, {}, $.ui.coreext, $.ui.listselector, {

    options : {
      data_src          : null,
      use_ajax          : false,
      text              : 'Start typing to see list',
      mode              : 'suggest',
      engine            : 'quicksilver',
      displayLimit      : 5,
      alwaysPromptAdd   : true,
      notText           : 'the item',
      templateSelection : false,
      templateOption    : false,
      templateForm      : false,
      allowNewEnter     : false,
      highlight         : false,
      filterCategory    : false,
      favorites_src     : null,
      noEnterText       : 'You must select an option on the list.',
      defaultValues     : {},
      delay             : 150,
      noIdConstant      : '__NO_ID_CONSTANT__'
    },

    _open             : false,

    _init : function() {

      var thisObj = this;

      this._id    = this.element[0].id;

      $(this.options.templateForm)
        .template({id:this._id})
        .appendTo(this.element);

      this._baseInit();

      // grab references to pertinent elements
      this._options_wrap      = $('#'+this._id+'_options_wrap');
      this._options           = $('#'+this._id+'_options');
      this._no_results        = $('#'+this._id+'_no_results');
      this._new_option        = $('#'+this._id+'_new_option');
      this._favorites_toggle  = $('#'+this._id+'_favorites_toggle');

      // disregard templates, make sure absolute options float on page so no parent divs can effect
      $('body').append( this._options_wrap );
      $(window).bind( 'resize scroll', $.proxy( this.positionOptionsWrap, this ) );

      this._options_wrap.bind( 'mouseover', function() {
        $(this).find('.keySelection').removeClass('keySelection');
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
      $(document).ready(function() {
        $(document.body).bind('mouseup', thisObj, thisObj._checkClose);
      });


      // Retrieve and load the autocomplete options.
      this._loadDataSource();

      // This seems to be the function that actually searches
      this._field.bind('runFunction', function(trigger, evt) {

        if (thisObj.options.use_ajax) {
          thisObj.element.trigger('externalAjax', [thisObj.element]);
        }
        else {
          thisObj._runFunction(thisObj);
        }

      });

      this.element
        .addClass('autocomplete cfix')
        .data('autocomplete.initialized', true);


      if (this.options.use_ajax) {

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
        $(document.body).bind('click', function(e){
          var target = e.target;

          if ( $('.autocomplete_favorites_on').length > 0
            && !$(target).hasClass('autocomplete_favorites_toggle')
            && !$(target).parent().hasClass('autocomplete_favorites_toggle')
            && $(target).parents('.autocomplete_filter').length === 0 ){
              $('.autocomplete_favorites_on').parents('.autocomplete').data().autocomplete._clearFavorites();

            }
        });

      }

    }, // init

    _runFunction : function () {

      var current_value = this._field.throttler('currentValue');

      this._open = (current_value == '') ? false : true;

      if ( this._selection_items &&
         this.options.limit &&
         this._selection_items.length >= this.options.limit) {

        this.element.trigger('typingLimitHit');

        return;

      }

      if (current_value == '') {
        this.refocus();
        return;
      }

      // Resetting after last search
      this._clearResults();

      // Get the selected values
      this._selected_values = this.selected();

      // if using ajax no need to filter any searching
      if ( this.options.use_ajax ) {

        this._createOptions( this._data );

      }
      else {

        // Run the specified search method
        if ( this.options.engine == 'quicksilver' ) {
          this._searchQuicksilver();
        }
        else if ( this.options.engine == 'regex' ) {
          this._searchRegex();
        }
        else {
          throw 'Invalid search engine: ' + this.options.engine;
        }

      } // else

      // Get a reference the lis for the key-handling code
      this._lis = $('#'+this._id+'_options li');


    },

    /***  Regex search implementation  ***/
    _searchRegex : function() {

      var thisObj             = this,
          num                 = 0,
          search              = $(this._field).val(),
          filter              = this._filter,
          filtering           = ( thisObj.options.filterCategory && typeof filter != 'undefined' ) ? true : false, // checking this here to avoid doing it in the loop
          matches             = [],
          exprs               = [],
          results             = [],
          highlighted_results = [];

      /**** process the search terms.   *****/

      terms     = search.split(' ');

      $.each( terms, function( i, term ){

        var ptn = [];

        $.each( term.split(''), function( i, val ) {
          ptn.push( val.replace(/[\-\[\]{}()*+?.,\\\^$|#]/g, "\\$&") );
        });

        ptn = ptn.join('\\w*');

        exprs.push( new RegExp( ptn, 'i') );

      }); // each terms

      // If the text matchs, push the index into an array
      $.each(thisObj._data, function(i, val){

        if ( $.inArray(i, thisObj._selected_values) >= 0 ) { return; }

        var match = true;

        $.each(exprs, function(){
          if( ! val.n.match(this) ) {
            match = false;
            return;
          }

          if ( filtering && val.c != filter ){
            match = false;
            return;
          }
        });

        if ( match ) { matches.push( i ); }

      });

      if (!thisObj._handleMatches(matches)) {
        return;
      }

      // Loop through the indexes and show the matches
      $.each(matches, function(){
        if (num == thisObj.options.displayLimit && thisObj.options.displayLimit > 0) {
          return false;
        }

        results.push( thisObj._data[ this ] );

        ++num;
      });


      if (thisObj.options.highlight){
        highlighted_results = thisObj._highlightTerms( results, terms );
        thisObj._createOptions( highlighted_results );
      }
      else {
        thisObj._createOptions( results );
      }

    },

    /*** Quicksilver search implementation ***/
    _searchQuicksilver : function() {
      var thisObj        = this,
          num            = 0,
          scores         = [],
          results        = [],
          score          = false,
          fixSort        = function(a, b){return b[0] - a[0];},
          object         = thisObj._data,
          determineScore = function() {

            switch ( typeof(this.id) ) {

              case 'string' :
                break;

              case 'undefined' :
                return;

              default :
                this.id = this.id.toString();
                break;

            }

            if ( !this.n ) {
              return;
            }

            if ( $.inArray(this.id, thisObj._selected_values) >= 0 ) { return; }
            score = this.n.toLowerCase().score($(thisObj._field).val().toLowerCase());
            if (score > 0) { scores.push([score, this.id]); }

            if ( scores.length > 50 ) {
              return false;
            }

          },
          pushResults     = function(){
            if (num == thisObj.options.displayLimit && thisObj.options.displayLimit > 0) {
              return false;
            }

            results.push( thisObj._data[ this[1] ] );

            ++num;
          };

      $.each( object, determineScore );

      if (!thisObj._handleMatches(scores)) {
        return;
      }

      // Sort the scores in DESC order
      scores = scores.sort(fixSort);

      // Loop through indexes in the scores array, show the top X
      $.each(scores, pushResults);

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
        this.element.trigger('noResults');
        this._showOptions();
        return false;
      }
      else {
        this.element.trigger('foundResults');
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

        var thisObj   = this,
            $template = $(thisObj.options.templateOption);

        $.each(options, function(i,e){

          if (i == thisObj.options.displayLimit) {
            return false;
          }

          if ( ! $template.length ) {
            throw ('Invalid template: ' + thisObj.options.templateOption);
          }
          else {
            $template.template(this).appendTo(thisObj._options).data('templateData',this).addClass('cfix');
          }

        });


        this._showOptions();

    },

    _showOptions : function() {

      this._options.show();

      this.positionOptionsWrap();

    },

    positionOptionsWrap : function() {

      this._options_wrap.clonePosition( this._field, {
        setHeight : false,
        setWidth  : true,
        offsetTop : this._field.outerHeight()
      });

    }, // positionOptionsWrap

    selectFieldData : function( refocus ) {

      this._selectFieldData( refocus );

    },

    _selectFieldData : function( refocus ) {

      refocus = ( refocus === false ) ? false : true;

      var thisObj       = this,
          id            = false,
          name          = false,
          value         = this.field().val(),
          templateData  = {};

      $.each(this.listData(), function() {
        if (this.n.toLowerCase() == value.toLowerCase()) {
          id   = this.id;
          name = this.n;
        }
      });

      if (!id || !name) {
        if (!this.options.allowNewEnter) {
          $.validationEngine.buildPrompt( $("#"+this._id), this.options.noEnterText);
          return;
        }

        id   = value;
        name = value;
      }

      templateData = {id:id,n:name};

      if ( this.options.filterCategory && typeof this._filter != 'undefined' ){
        templateData.c = this._filter;
      } // if filtering, add the filter value as the category

      this.createSelection( templateData, refocus );
      thisObj.refocus();

    },

    refocus : function () {

      // Hide the list
      this.reset(false);

      if ( this.options.auto_focus_blur && this._field.is(':visible') ) {

        // Focus on the input
        this._field[0].focus();

      }

    },

    reset : function( setDefaultValue ) {

      setDefaultValue = ( typeof(setDefaultValue) != 'undefined' )  ? setDefaultValue : true;

      // Reset the throttler
      this._field.throttler('reset');

      if ( setDefaultValue ) {
        this._field.trigger('blur');
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

      if ( typeof(thisObj.options.data_src) == 'array' || typeof(thisObj.options.data_src) == 'object' ) {

        thisObj._data = thisObj.options.data_src;
        thisObj._insertDefaultValues();
        thisObj.element.data('dataLoaded',true);
        thisObj.element.trigger( 'dataLoaded', [ thisObj._data ] );
        if ( $.isEmptyObject(thisObj._data) ){
          thisObj.element.addClass('autocomplete_empty');
        }
      }
      else if ( typeof(thisObj.options.data_src) == 'string' ) {

        if (thisObj.options.data_src == 'external' || thisObj.options.use_ajax) {
          thisObj._insertDefaultValues();
          // return;
        }
        else {

          $.ajax({
            url      : thisObj.options.data_src,
            type     : thisObj.options.ajax_type,
            dataType : thisObj.options.ajax_dataType,
            success  : function (data, textStatus) {

              thisObj._data = data.json;

              /**
               * This plugin is almost totally off site
               * Hacking this in here as there is nothing good about this plugin
               * There is no way to modify the JSON outside of it
               */
              if ( thisObj.options.data_src === '/fields/all' ) {

                thisObj._data = {};

                $.each( data.json, function() {
                  thisObj._data[ this.id ] = this;
                });

              } // if data_src = fields

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

      if ( typeof(thisObj.options.favorites_src) == 'array' || typeof(thisObj.options.favorites_src) == 'object' ) {

        if ( !$.isEmptyObject(data.json) ){
          thisObj._favorites = thisObj.options.favorites_src;
          thisObj._favorites_toggle.parent().addClass('autocomplete_favorites_wrap');
          thisObj._selections.addClass('autocomplete_selections_favorites_included');
          thisObj._favorites_toggle.show();
          thisObj.element.trigger( 'favoritesLoaded', [ thisObj._favorites ] );
        }
      }
      else if ( typeof(thisObj.options.favorites_src) == 'string' ) {

        if (thisObj.options.favorites_src == 'external' || thisObj.options.use_ajax) {
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
      if ( thisObj.options.filterCategory && typeof thisObj._filter != 'undefined' ){
        $.each(thisObj._favorites, function(){
          if ( this.c == thisObj._filter ){
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

          if ( $this.attr('id') != thisObj._id && $this.data().autocomplete._favorites_on ){
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

      var thisObj = evt.data.thisObj;

      if (!evt) { return; }
      var stopEvent = true;

      switch (evt.keyCode) {
        case $.ui.keyCode.ESCAPE :
          thisObj.refocus();
          break;
        case $.ui.keyCode.ENTER :
        case $.ui.keyCode.NUMPAD_ENTER :

          var keySelection = thisObj._options.find('.keySelection');

          if (keySelection.length) {
            thisObj.element.trigger('beforeKeyEnter');
            keySelection.trigger('click');
            thisObj.element.trigger('afterKeyEnter');
          }
          else {

            thisObj.element.trigger('beforeFieldKeyEnter');
            thisObj._selectFieldData();
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

          if (thisObj._selections.find('.keySelection .closeX').length) {
            thisObj.element.trigger('beforeKeyDelete');
            thisObj._selections.find('.keySelection .closeX').trigger('click');
            thisObj.element.trigger('afterKeyDelete');
          }
          else {
            stopEvent = false;
          }
          break;

        case $.ui.keyCode.BACKSPACE:

          var closer = thisObj._selections.find('.keySelection .closeX');

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
