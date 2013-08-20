(function($) {

  $.widget('ui.selectlist', $.extend({}, $.ui.listselector, {
  
    options : {
      data_src          : null,
      templateSelection : false,
      templateForm      : false,
      defaultValues     : {},
      emptyText         : 'Please Choose',
      noIdConstant      : '__NO_ID_CONSTANT__',
      createNewConstant : 'createnew',
      createNewText     : 'Create New',
      createNew         : false
    },
  
    _init : function() {
    
      var thisObj  = this,
          onChange = function() {
      
            var $this = $(this);
          
            thisObj._makeSelection({
              data   : thisObj,
              target : $('#'+thisObj._id+'-list-selector-option-'+$this.val())
            });
            
            if ( $this.val() == thisObj.options.createNewConstant ) {
            
              thisObj.refocus();
              $this.trigger('toggleCreateNew', [ thisObj ]);
              
            }
        
          };
          
      this._id    = this.element[0].id;
      
      var func = ( $.fn.tmpl ) ? 'tmpl' : 'template';

      this.element.append( $(this.options.templateForm)[func]({id:this._id}) );
        
      this._baseInit();
      
      // Retrieve and load the  options.
      this._loadDataSource();
      
      $('#'+this._id+'_field').bind('change', onChange);
      
      this.element.bind('removeSelection', function( e, templateData ) {
      
        // an existing entry is an integer
        if ( templateData.id.toString().match( /^\d+$/ ) ) {
          $('.'+thisObj._id+'_selectlist_field .listselector-option[optionvalue='+templateData.id+']').show();
        }
        
      });
      
      this.element.bind('addSelection', function( e, templateData ) {
        
        // an existing entry is an integer
        if ( templateData.id.toString().match( /^\d+$/ ) ) {
          $('.'+thisObj._id+'_selectlist_field .listselector-option[optionvalue='+templateData.id+']').hide();
        }
        
      });
      
      this.element.bind('limitHit', function(e) {
        var $field  = $(this).selectlist('field'),
            $status = $field.siblings('.ui-selectmenu').find('.ui-selectmenu-status');

        $('.selectlist_container').selectlist('field').selectmenu('close');
        $field.changeInput('disable');
        $status.html( $status.text() + '<span class="selectlist-limit-text small-text"> (Select up to '+thisObj.options.limit+' options)</span>');
        
      }).bind('limitNotHit', function(e, refocus) {
        var $field  = $(this).selectlist('field'),
            $status = $field.siblings('.ui-selectmenu').find('.ui-selectmenu-status');
        
        $field.changeInput('enable');
        $status.find('.selectlist-limit-text').remove();
        
      });
      
      this.element.data('selectlist.initialized', true);
        
    }, // init
    
    reset : function( setDefaultValue ) {

      setDefaultValue = ( typeof(setDefaultValue) != 'undefined' )  ? setDefaultValue : true;

      if ( setDefaultValue ) {
        this._field.changeInput('value',0);
      }

    },
    
    refocus : function( $selection ) {
    
      this.reset();
      
    },

    /**
    * Load options from either an object
    */
    _loadDataSource : function() {
      var thisObj = this, $option;

      // Check for a data source.
      if ( !thisObj.options.data_src ) {
        throw 'data_src is required';
      }

      if ( typeof(thisObj.options.data_src) == 'array' || typeof(thisObj.options.data_src) == 'object' ) {

        thisObj._data = thisObj.options.data_src;

        // don't add notoption since it needs an actual value for it to be selected via templateData
        $option = $('<option value="0" class="listselector-option" id="'+thisObj._id+'-list-selector-option-0">'+this.options.emptyText+'</option>');
        $option.data('templateData', {
          id : 0,
          n: 'Please Choose'
        });
        thisObj._field.append($option);
        
        $.each( thisObj._data, function() {
          $option = $('<option value="'+this.id+'" class="listselector-option" id="'+thisObj._id+'-list-selector-option-'+this.id+'">'+this.n+'</option>');
          $option.data('templateData', {
            id : this.id,
            n: this.n
          });
          thisObj._field.append($option);
        });
        
        if ( thisObj.options.createNew ) {
        
          $option = $('<option value="'+thisObj.options.createNewConstant+'" class="listselector-option listselector-'+thisObj.options.createNewConstant+' listselector-notoption" id="'+thisObj._id+'-list-selector-option-'+thisObj.options.createNewConstant+'">'+this.options.createNewText+'</option>');
          $option.data('templateData', {
            id : thisObj.options.createNewConstant,
            n  : this.options.createNewText
          });
          thisObj._field.append($option);
          
        } // thisObj.options.createNew
        
        // timeout to make sure any binds are attached before events fire
        setTimeout(function() {
          thisObj._insertDefaultValues();
          thisObj.element.data('dataLoaded',true);
          thisObj.element.trigger('dataLoaded');
        }, 50);

      }
      else {
        throw 'Invalid data_src';
      }

    } // _loadDataSource
    
  }));

})(jQuery);
