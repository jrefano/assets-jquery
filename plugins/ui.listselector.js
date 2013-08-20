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
    auto_focus_blur : true
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
      thisObj.createSelection(templateData, $(selection) );
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

    if( this.options.use_ajax && this.options.data_src != 'external' && override === false) {
      throw('You may only set list data to external autocompletes');
    }
    
    this.options.data_src = data.json;
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
    var filter, $new_item;
    
    refocus = ( typeof(refocus) != 'undefined'  ) ? refocus : true;
    target  = ( typeof(target)  != 'undefined'  ) ? target  : $(this._selections[0]);
    filter  = ( this.options.filterCategory && typeof(this._filter) != 'undefined' ) ? this._filter : false;
    
    if ( filter && typeof (templateData.c) != 'undefined' ){
      target = $('#'+this._id+'_selections_'+templateData.c);
    }
    
    // Check if the selectionValue is already selected
    if ( !this._checkSelections(templateData.id) ) {
      return;
    }
    
    if ( typeof(this.options[target[0].id+'_extra_data']) == 'object') {
      templateData = $.extend(templateData, this.options[target[0].id+'_extra_data']);
    }
    
    $new_item = $(this.options.templateSelection).template(templateData);
      
    $new_item.addClass('cfix')
             .data('templateData', templateData)
             .data('autocompleteSelection', templateData)
             .appendTo(target)
             .find('.closeX')
             .bind('click', this, this._removeSelection);
      
    // Grab all selections.
    this._selection_items = $(this._selections).find('.listselector-selection');

    this.element.trigger('toggleSelection',[templateData]);
    
    this.element.trigger('addSelection',[ templateData, $new_item ]);
    
    if ( this.options.auto_focus_blur ) {
    
      if ( refocus) {
        this.refocus();
      }
      else {
        this._field.trigger('blur');
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
         return;
    }
    else {
      this.element.trigger('limitNotHit', [refocus]);
    }
    

  }, // createSelection
  
  _insertDefaultValues : function() {

    var thisObj = this;
    
    $.each(this.options.defaultValues, function() {
    
      var list_id = arguments[0];
      
      $.each(this, function(index, value) {
      
        if ( thisObj._data && typeof(thisObj._data[value] ) != 'undefined') {
          thisObj.createSelection(thisObj._data[value], false, $(list_id));
        }
        else {
          var obj = (typeof(value) == 'object') ? value : {id :value, n:value};
          thisObj.createSelection(obj, false, $(list_id));
        }
      });
    
    });
    
    // once default values are inserted, no need to recall
    this.options.defaultValues = {};
  
  },

  _checkClose : function(e) {
    var thisObj = e.data,
        target  = $(e.target);

    if ( !thisObj._open ) {
      return;
    }

    if ( !target.parents('#'+thisObj._options_wrap[0].id).length && target[0].id != thisObj._field[0].id ) {
      thisObj._field.trigger( 'beforeClickReset', [e] );
      thisObj.reset();
    }

  },
  
  _checkSelections : function(value) {

    var curValue; // 4, 109, 48
    
    if ( this._selection_items ) {

      // Loop through elements in selection element, and check if it's selected,
      // If so, trigger the selectedAlready function and bail.
      for ( var i = 0; i < this._selection_items.length; ++i ) {
        curValue = $(this._selection_items[i]).data('templateData').id;
        if (curValue == value) {
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
        templateData = lineItem.data('templateData');
        
    thisObj.element.trigger('beforeRemoveSelection',[templateData]);
    
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

  selected : function() {

    var values = [];

    if ( !this._selection_items ) {
      return values;
    }
    
    $.each(this._selection_items, function() {
      if ($(this).data('templateData') && $(this).data('templateData').id) {
        values.push( $(this).data('templateData').id.toString() );
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