$.ui.listselector = {

  _selections       : false, // ul containing selections
  _field            : false, // field controlling options
  _field_wrap       : false, // wrap of field controlling options
  _limit            : false,
  _id               : null,
  _open             : false,
  _data             : null,
  _selected_values  : [],
  _selection_items  : [],

  options : {
    auto_focus_blur : true,
    class_values    : false
  },

  template : function( data, script) {

    var $script, func;

    if ( typeof script !== 'string' ) {
      return $( script( data ) );
    }

    $script = $(script);

    if ( !$script.length ) {
      throw( "Invalid script: " + script );
    }

    func = ( $.fn.tmpl ) ? 'tmpl' : 'template';

    return $script[func]( data );

  },

  _baseInit : function() {

    this._selections = $('#'+this._id+' .listselector_selections');
    this._field      = $('#'+this._id+'_field');
    this._field_wrap = $('#'+this._id+'_field_wrap');

  },

  // this function is bound to the list. When child elements are clicked, the event will bubble up to here.
  _makeSelection : function(e) {

    // initialize variables
    var thisObj      = e.data,
        selection    = $(e.target),
        templateData = {};

    while ( !$(selection).is('.listselector-option') ) {

      // if you've selected the actual list just get out of here
      if ($(selection)[0].tagName == 'UL' || $(selection)[0].tagName == 'SELECT' ) {
        return;
      }

      selection = selection.parent();

    }

    if ( $(selection).hasClass('listselector-notoption') ) {
      return;
    }

    // get data before element removed in refocus
    templateData = $(selection).data('templateData');

    // used for please choose option
    if ( templateData.id === 0 ) {
      return;
    }

    // Reset the list, if not a favorites list
    if ( $(selection).parents('.listselector_favorites').length === 1 ){
      thisObj.createSelection(templateData, false );
    }
    else {
      thisObj.refocus( $(selection) );
      // Create an element based on the display and value of the selection in the
      // Selected Items element
      thisObj.createSelection(templateData, false );
    }

  }, // _makeSelection

  delimited : function(glue, data) {


    glue = ( typeof(glue) != 'undefined' ) ? glue : '|';
    data = ( typeof(data) != 'undefined' ) ? data : this.selected();

    return data.join(glue);

  }, // delimited

  filtered : function(filter, param, glue, format ) {
    var retval;

    if ( typeof(filter) == 'undefined'){
      return false;
    }

    if( typeof(glue) == 'undefined' ) {
      glue = '|';
    }

    if ( typeof(format) == 'undefined'){
      format = 'string';
    }

    data = this.filterSelected( filter, param );

    switch( format ){
      case 'array':
        retval = data.join(glue);
        break;

      case 'string':
      default:
        retval = data.join(glue);
        break;

    } // swtitch

    return retval;

  }, // delimited

  setExternalListData : function(data, override) {

    // If override is not supplied, default to false
    override = ( typeof override == 'undefined' ) ? false : override ;

    if( this.options.data_src !== 'ajax' && override === false) {
      throw new Error('You may only set list data to ajax autocompletes, without override');
    }

    this._data = data.json;
    this._loadDataSource();

  }, // setExternalListData

  /**
   * @param {object} templateData
   *   Template data (must contain 'id' member)
   * @param {boolean} refocus
   *   Whether to refocus on the autocomplete text field
   * @param {object} target - what list it will append to
   *
   */
  createSelection : function(templateData, refocus, target) {


    var filter, $new_item,
        before_event    = $.Event( 'beforeAddSelection' );

    refocus = ( typeof refocus !== 'undefined'  ) ? refocus : true;
    target  = ( typeof target  !== 'undefined' && target.length  ) ? target  : $(this._selections[0]);
    filter  = ( this.options.filterCategory && typeof(this._filter) != 'undefined' ) ? this._filter : false;

    // trigger beforesend so user can modify params
    this.element.trigger( before_event, [ templateData, refocus, target ] );

    if ( before_event.isDefaultPrevented() ) {
      return false;
    }

    if ( filter && typeof templateData.c !== 'undefined' && $('#'+this._id+'_selections_'+templateData.c).length > 0 ) {
      target = $('#'+this._id+'_selections_'+templateData.c);
    }

    // Check if the selectionValue is already selected
    if ( !this._checkSelections( templateData ) ) {
      return true;
    }
    if ( typeof(this.options[target[0].id+'_extra_data']) == 'object') {
      templateData = $.extend(templateData, this.options[target[0].id+'_extra_data']);
    }

    $new_item = this.template( templateData, this.options.templateSelection );

    $new_item.addClass('cfix')
             .data('templateData', templateData)
             .data('autocompleteSelection', templateData)
             .appendTo(target)
             .find('.closeX, .selection-close')
             .bind('click', this, this._removeSelection);

    // Grab all selections.
    this._selection_items = $(this._selections).children();

    this.element.trigger('toggleSelection',[templateData]);

    this.element.trigger('addSelection',[ templateData, $new_item, refocus ]);

    if ( this.options.auto_focus_blur ) {

      if ( refocus) {
        this.refocus();
      }
      else {
        this.reset( false );
      }

    }

    // can't really have an error if it's created a selection
    $(".formError."+this._id).remove();

    // Check that if there are items selected, and a limit imposed in the options,
    // If there are more options selected than the option dictates, trigger the limitHit function
    if ( this._selection_items &&
         this.options.limit &&
         this._selection_items.length == this.options.limit) {
         this.element.trigger('limitHit');
    }
    else {
      this.element.trigger('limitNotHit', [refocus]);
    }

    return true;


  }, // createSelection

  removeSelection : function( id, refocus ) {

    var obj = this;

    this._selection_items.each( function() {

      var current_id = $(this).data().templateData.id;

      if ( current_id === id ) {
        obj._removeSelection.apply( this, [{ data : obj }, refocus] );
        return false;
      }

    });

  }, // removeSelection

  _insertDefaultValues : function() {

    var thisObj       = this,
        defaultValues = this.options.defaultValues,
        insertValue   = function( list_id, values ){

          $.each(values, function(index, value) {

            var field;

            // Don't add blanks
            if ( !value ) {
              return;
            }

            if ( thisObj._data && typeof(thisObj._data[value] ) != 'undefined') {
              field = thisObj._data[value][thisObj.options.data_field];
              field = $.isFunction( field ) ? field.call(thisObj._data[value]) : field;

              thisObj.createSelection($.extend(thisObj._data[value], {n:field,id:value}), false, $(list_id));
            }
            else {
              var obj = (typeof(value) == 'object') ? value : {id :value, n:value};
              thisObj.createSelection(obj, false, $(list_id));
            }
          });

        }; // insertValue

    if ( $.isArray( defaultValues ) ) {

      insertValue( $(this._selections[0]), defaultValues );

    } // if defaultValues is an array of values, the values go into first selections list

    else {

      $.each(defaultValues, function( list_id, values ) {

        insertValue( list_id, values );

      }); // loop through objects

    } // otherwise, defaultValues must be an object containing arrays of values, keyed by the ID of the selections list they belong in

    // once default values are inserted, no need to recall
    this.options.defaultValues = {};

  }, // _insertDefaultValues

  _checkClose : function(e) {
    var thisObj   = e.data,
        target    = $(e.target),
        before_ev = $.Event( 'beforeClickReset' );

    if ( !thisObj._open ) {
      return;
    }

    if ( !target.parents('#'+thisObj._options_wrap[0].id).length && target[0].id != thisObj._field[0].id ) {
      thisObj._field.trigger( before_ev, [e] );

      if ( !before_ev.isDefaultPrevented() ) {
        thisObj.reset();
      }
    }

  },

  // templateData is the data of the item attempting to be selected
  _checkSelections : function( templateData ) {

    var checkAgainst = ( templateData.Klass ) ? templateData.Klass : templateData.id,
        curValue, // current value of iterated selected item
        curData; // current templateData of iterated selected item



    if ( this._selection_items ) {

      // Loop through elements in selection element, and check if it's selected,
      // If so, trigger the selectedAlready function and bail.
      for ( var i = 0; i < this._selection_items.length; ++i ) {

        curData = $(this._selection_items[i]).data('templateData');

        curValue = ( curData.Klass ) ? curData.Klass : curData.id;

        if ( curValue === checkAgainst ) {
          this.element.trigger('selectedAlready');
          return false;
        }

      }

    } // if _selections_items

    return true;

  },

  _removeSelection : function(e, refocus) {

    var thisObj      = e.data,
        lineItem     = $(this).closest('li'),
        templateData = lineItem.data('templateData'),
        beforeEvent  = $.Event( 'beforeRemoveSelection' );

    thisObj.element.trigger( beforeEvent,[templateData]);

    if ( beforeEvent.isDefaultPrevented() ) { return; }

    lineItem.remove();

    thisObj._selection_items = $(thisObj._selections).find('li');

    if ( ( refocus != 'undefined' && refocus === true ) || refocus == 'undefined') {
      thisObj.refocus();
    }

    thisObj.element.trigger('toggleSelection');
    thisObj.element.trigger('limitNotHit', [true]);
    thisObj.element.trigger('removeSelection',[templateData]);

  },

  numSelected : function() {
    return (this._selection_items) ? this._selection_items.length : 0;
  },

  field : function() {
    return this._field;
  },

  noIdConstant : function() {
    return this.options.noIdConstant;
  },

  listData : function() {
    return ( this._data ) ? this._data : {};
  },

  selectedElements : function() {
    return $(this._selection_items);
  },

  selectionElementWrap : function() {
    return this._selections;
  },

  selected : function() {

    var values = [];

    if ( !this._selection_items ) {
      return values;
    }

    $.each(this._selection_items, function() {

      var $item = $(this),
          data  = $item.data('templateData');

      if ( !data ) {
        return;
      }

      if ( data.Klass ) {
        values.push( data.Klass );
      }

      else if ( data.id ) {
        values.push( data.id.toString() );
      }

    });

    return values;

  },

  filterSelected : function( filter, param ) {

    var values = [];

    if ( typeof(param) == 'undefined'){
      param = 'id';
    }


    if ( !this._selection_items ) {
      return values;
    }

    $.each(this._selection_items, function() {
      if( $(this).data('templateData') && $(this).data('templateData').id && $(this).data('templateData').c == filter ) {

        values.push( $(this).data('templateData')[param].toString() );
      }
    });

    return values;

  }

};
