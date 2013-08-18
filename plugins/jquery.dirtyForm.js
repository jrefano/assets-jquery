/*global jQuery*/
//TODO: consolidate field finding logic between getValues, getFields, and anywhere else that seems duplicated

(function($) {

  "use strict";

  var rules = {

    'text' : {

      fields   : ['input:text','input:file','input:password','textarea'],
      nots     : ['.ui-popupbubble', '.dirty-form-ignore', '.autocomplete_field', '.textboxlist-bit-editable-input', '.ui-textboxlist-bit-input', '.textboxlist-hidden', '.selectbubble'],
      css_rule : [],
      event    : 'focus'

    },

    'textboxlist' : {

      fields   : ['input.textboxlist-hidden'],
      nots     : ['.dirty-form-ignore'],
      css_rule : [],
      event    : 'focus'

    },

    'ui-textboxlist' : {

      fields   : ['.ui-textboxlist-hidden-text'],
      nots     : ['.dirty-form-ignore'],
      css_rule : [],
      event    : 'onLoad'

    },

    'dirty-form-html' : {

      fields   : ['.dirty-form-html'],
      nots     : ['.dirty-form-ignore'],
      css_rule : [],
      event    : 'focus'

    },

    'autocomplete' : {

      fields       : ['div.autocomplete .autocomplete_field'],
      nots         : ['.dirty-form-ignore'],
      css_rule     : [],
      event        : 'onLoad',
      parent_rules : 'div.autocomplete'

    },
    
    'popupbubble' : {

      fields       : ['.ui-popupbubble'],
      nots         : ['.dirty-form-ignore'],
      css_rule     : [],
      event        : 'onLoad'
    },
    
    'selectlist' : {

      fields       : ['.selectlist_container'],
      nots         : ['.dirty-form-ignore', '.selectlist_field'],
      css_rule     : [],
      event        : 'selectmenuopen',
      parent_rules : 'form'

    },
    
    'selectbubble' : {

      fields       : ['select.selectbubble'],
      nots         : ['.dirty-form-ignore', '.selectlist_field'],
      css_rule     : [],
      event        : 'selectmenuopen',
      parent_rules : 'form'

    },

    'checkbox' : {

      fields   : ['input:checkbox'],
      nots     : ['.dirty-form-ignore'],
      css_rule : [],
      event    : 'customOver'

    },

    'radio' : {

      fields   : ['input:radio'],
      nots     : ['.dirty-form-ignore'],
      css_rule : [],
      event    : 'customOverName'

    },

    'color-swatch' : {

      fields   : ['div.color-swatch'],
      nots     : ['.dirty-form-ignore'],
      css_rule : [],
      event    : 'mousedown'

    },

    'select' : {

      fields   : ['select'],
      nots     : ['.dirty-form-ignore', '.selectbubble'],
      css_rule : [],
      event    : 'selectmenuopen'

    },

    'activatable-list' : {

      fields   : ['ul.activatable-list'],
      nots     : ['.dirty-form-ignore'],
      css_rule : [],
      event    : 'loaded'

    }



  };


  // sets up rules
  $.each ( rules , function( rules_key ) {

    // loop through fields
    $.each( this.fields, function() {

      var fullRule = this;

      // see if there are negating rules and then add the :not
      if (rules[rules_key].nots.length) {
        fullRule += ':not("';
      }

      // loop through negating rules
      $.each(rules[rules_key].nots, function() {
        fullRule += this+',';
      }); // each this.nots


      // truncate last comma and cap off the :not
      if (rules[rules_key].nots.length) {
        fullRule = fullRule.substr( 0, ( fullRule.length-1 ) );
        fullRule += '")';
      }

      rules[rules_key].css_rule.push( fullRule );

    }); // each for individual rule

    rules[rules_key].css_rule = rules[rules_key].css_rule.join(',');

  }); // each rules

  // runs on the form
  $.fn.dirtyForm = function() {

    return this.each(function() {

      var $form = $(this);

      if ( !$form.hasClass( 'dirtyForm' ) ) {
        $form.addClass('dirtyForm').data( 'dirtyForm', { 'dirty' : 0, 'fields' : [] } );
      }

      $.each ( rules, function( rules_key ) {

        rules_key = ( rules_key === 'autocomplete_remove' ) ? 'autocomplete' : rules_key;

        var self      = this,
            configure = function() {
            
              var $this   = $(this), $parent;
              
              if ( $this.data( 'dirtyForm' ) && $this.data( 'dirtyForm' ).configured ) {
                return;
              }

              $parent = $this.parent();

              if ( typeof ( self.parent_rules ) !== 'undefined' ) {
                $parent = $this.closest(self.parent_rules);
              }

              $.fn.dirtyForm.configureField($this, $form, rules_key);
              $.fn.dirtyForm.setStartingValues( $form, { $container : $parent, clean : false } );


            };
            
        $form.delegate( this.css_rule, this.event, configure);
        $form.delegate( this.css_rule, 'dirtyForm.forceConfig', configure);

        // sometimes you just can't wait
        if ( this.event === 'onLoad' ) {
          $form.find( this.css_rule ).trigger('onLoad');
        }


      });

    });

  };

  $.fn.dirtyForm.setStartingValues = function($form, options) {
  
    options    = options || {};
    
    var $container = ( typeof( options.$container ) !== 'undefined' ) ? options.$container : $form,
        clean      = ( typeof( options.clean ) !== 'undefined' ) ? options.clean : true,
        configured = ( typeof( options.configured ) !== 'undefined' ) ? options.configured : true,
        preset     = { dirty : false, configured : configured };

    // note that hidden is never configured, but can be used manually
    $container.find('input:hidden, input:text, input:file, input:password, textarea, select')
    .not( rules.text.nots.join(', ') )
    .each(function(i, el) {

       var $el = $(el);
       $el.data( 'dirtyForm', $.extend( {}, preset, { 'original' : $el.val() } ) );

       if (clean) {
         $.fn.dirtyForm.clean($form, $el);
       }

    }); // text inputs, selects

    $container.find('input.textboxlist-hidden').each(function(i, el) {

       var $el = $(el);
       $el.data( 'dirtyForm', $.extend( {}, preset, { 'original' : $el.val() } ) );

       if (clean) {
         $.fn.dirtyForm.clean($form, $el);
       }

    }); // textboxlist hidden
    
    $container.find('.ui-textboxlist-hidden-text').each(function(i, el) {

       var $el = $(el);
       $el.data( 'dirtyForm', $.extend( {}, preset, { 'original' : $el.val() } ) );

       if (clean) {
         $.fn.dirtyForm.clean($form, $el);
       }

    }); // textboxlist hidden

    $container.find('.autocomplete_field').each(function(i, el) {

      var $el           = $(el),
          $autocomplete = $el.closest('div.autocomplete');

      if ($autocomplete.data('dataLoaded') === true || $autocomplete.autocomplete('option', 'data_src' ) === 'ajax' ) {
        $el.data( 'dirtyForm', $.extend( {}, preset, { 'original' : $autocomplete.autocomplete('delimited') } ) );
      }
      else {
        $autocomplete.bind('dataLoaded', function() {
          $el.data( 'dirtyForm', $.extend( {}, preset, { 'original' : $autocomplete.autocomplete('delimited') } ) );
        });
      }

      if (clean) {
        $.fn.dirtyForm.clean($container, $el);
      }

    }); //autocompletes
    
    $container.find('.ui-popupbubble').each(function(i, el) {

      var $el           = $(el);
      
      $el.data( 'dirtyForm', $.extend( {}, preset, { 'original' : $el.popupbubble('value') } ) );

      if (clean) {
        $.fn.dirtyForm.clean($container, $el);
      }

    }); //autocompletes
    
    $container.find('.selectlist_container').each(function(i, el) {
    
      var $el         = $(el);
        
      if ($el.data('dataLoaded') === true) {
        $el.data( 'dirtyForm', $.extend( {}, preset, { 'original' : $el.selectlist('delimited') } ) );
      }
      else {
        $el.bind('dataLoaded', function() {
          $el.data( 'dirtyForm', $.extend( {}, preset, { 'original' : $el.selectlist('delimited') } ) );
        });
      }

    }); //selectlist_container
    
    $container.find('select.selectbubble').each(function(i, el) {
    
      var $el         = $(el);
      
      $el.data( 'dirtyForm', $.extend( {}, preset, { 'original' : $el.selectbubble('value') } ) );

    }); // selectbubble

    $container.find('ul.activatable-list').each(function(i, el) {

      var $el = $(el);

      $el.data( 'dirtyForm', $.extend( {}, preset, { 'original' : $el.find('li.active').pluck('id').join('|') } ) );


      if (clean) {
        $.fn.dirtyForm.clean($container, $el);
      }

    }); //activatable-lists

    $container.find('input:checkbox, input:radio').each(function(i, el) {

      var $el = $(el);
      $el.data( 'dirtyForm',$.extend( {}, preset, { 'original' : $el.is(':checked') } ) );

      if (clean) {
        $.fn.dirtyForm.clean($container, $el);
      }

    }); // checkboxes, radios

    $container.find('.dirty-form-html').each(function(i, el) {

       var $el = $(el);
       $el.data( 'dirtyForm', $.extend( {}, preset, { 'original' : $el.html() } ) );

       if (clean) {
         $.fn.dirtyForm.clean($container, $el);
       }

    }); // innerHTML

    $container.find('.color-swatch').each(function(i, el) {

       var $el = $(el);
       $el.data( 'dirtyForm', $.extend( {}, preset, { 'original' : $el.css('background-color') } ) );

       if (clean) {
         $.fn.dirtyForm.clean($container, $el);
       }

    }); // innerHTML

    if (clean) {
      $form.data('dirtyForm').dirty = 0;
    }

    return true;

  }; // setStartingValues

  $.fn.dirtyForm.dirty = function($container, $el) {

    if ( !$el.data('dirtyForm').dirty ) {

      $el.addClass('dirtyField').data('dirtyForm').dirty = true;

      var dirtyCount = $container.data('dirtyForm').dirty + 1;
      $container.data('dirtyForm').dirty = dirtyCount;

      $el.trigger('fieldDirty.dirtyForm')
         .trigger('fieldChange.dirtyForm', [dirtyCount, 'dirty', $el]);

      $container.trigger('formDirty.dirtyForm', [$el])
                .trigger('formChange.dirtyForm', [dirtyCount, 'dirty', $el]);

    } // element was clean

  }; // dirty

  $.fn.dirtyForm.clean = function($container, $el) {

    if ( $el.data('dirtyForm') && $el.data('dirtyForm').dirty ) {

      $el.removeClass('dirtyField').data('dirtyForm').dirty = false;

      var dirtyCount = $container.data('dirtyForm').dirty - 1;
      $container.data('dirtyForm').dirty = dirtyCount;

      $el.trigger('fieldClean.dirtyForm')
         .trigger('fieldChange.dirtyForm', [dirtyCount, 'clean', $el]);

      $container.trigger('formClean.dirtyForm', [$el])
                .trigger('formChange.dirtyForm', [dirtyCount, 'clean', $el]);

    } // element was dirty

  }; // clean

  $.fn.dirtyForm.configureField = function($el, $container, type) {

    var $namedRadio, $autocomplete,
        current_fields = $container.data('dirtyForm').fields;
        
    current_fields.push($el);
    $container.data('dirtyForm').fields = current_fields;
    
    switch (type) {

      case 'text' :
      
        $el.bind('keyup', function() {
        
          if ( $el.val() !== $el.data('dirtyForm').original ) {
            $.fn.dirtyForm.dirty($container, $el);
          }
          else {
            $.fn.dirtyForm.clean($container, $el);
          }

        });
        break; // text
        
      case 'selectbubble' :

        $el.bind('bubblevalue', function() {
        
          if ( $el.selectbubble( 'value' ) !== $el.data('dirtyForm').original ) {
            $.fn.dirtyForm.dirty($container, $el);
          }
          else {
            $.fn.dirtyForm.clean($container, $el);
          }

        });

        break; // selectbubble

      case 'select' :

        $el.bind('change', function() {
          if ( $el.val() !== $el.data('dirtyForm').original ) {
            $.fn.dirtyForm.dirty($container, $el);
          }
          else {
            $.fn.dirtyForm.clean($container, $el);
          }

        });

        $el.bind('keyup', function() {
          if ( $el.val() !== $el.data('dirtyForm').original ) {
            $.fn.dirtyForm.dirty($container, $el);
          }
          else {
            $.fn.dirtyForm.clean($container, $el);
          }

        });

        break; // select

      case 'checkbox' :

        $el.bind('change', function() {
          if ( $el.is(':checked') !== $el.data('dirtyForm').original ) {
            $.fn.dirtyForm.dirty($container, $el);
          }
          else {
            $.fn.dirtyForm.clean($container, $el);
          }

        });

        $el.bind('keyup', function() {
          if ( $el.is(':checked') !== $el.data('dirtyForm').original ) {
            $.fn.dirtyForm.dirty($container, $el);
          }
          else {
            $.fn.dirtyForm.clean($container, $el);
          }

        });

        break; // checkbox

      case 'radio' :

        $el.bind('change', function() {

          $('[name=' + $el.attr('name') + ']').each(function(i, namedRadio) {
            $namedRadio = $(namedRadio);

            if ( $namedRadio.is(':checked') !== $namedRadio.data('dirtyForm').original ) {
              $.fn.dirtyForm.dirty($container, $namedRadio);
            }
            else {
              $.fn.dirtyForm.clean($container, $namedRadio);
            }
          });

        }); // change

        $el.bind('keyup', function() {

          $('[name=' + $el.attr('name') + ']').each(function(i, namedRadio) {

            $namedRadio = $(namedRadio);

            if ( $namedRadio.is(':checked') !== $namedRadio.data('dirtyForm').original ) {
              $.fn.dirtyForm.dirty($container, $namedRadio);
            }
            else {
              $.fn.dirtyForm.clean($container, $namedRadio);
            }


          });

        }); // keyup

        break; // radio

      case 'autocomplete' :

        $autocomplete = $el.closest('div.autocomplete');

        $autocomplete.bind('toggleSelection', function(e) {
        
          if ( ( $autocomplete.autocomplete('option','data_src') !== 'ajax' && !$autocomplete.data('dataLoaded') ) || !$el.data('dirtyForm')) {
            return;
          }
          
          if ( $autocomplete.autocomplete('delimited') !== $el.data('dirtyForm').original ) {
            $.fn.dirtyForm.dirty($container, $el);
          }
          else {
            $.fn.dirtyForm.clean($container, $el);
          }

        });
        break; //autocomplete

      case 'popupbubble' :
      
        $el.bind('bubblevalue', function(e, value) {
        
          if ( value !== $el.data('dirtyForm').original ) {
            $.fn.dirtyForm.dirty($container, $el);
          }
          else {
            $.fn.dirtyForm.clean($container, $el);
          }

        });
        break; //autocomplete

      case 'selectlist' :
      
        $el.bind( 'toggleSelection', function() {
        
          if (!$el.data('dataLoaded') || !$el.data('dirtyForm')) {
            return;
          }
        
          if( $el.selectlist('delimited') !== $el.data('dirtyForm').original ) {
            $.fn.dirtyForm.dirty($container, $el);
          }
          else {
            $.fn.dirtyForm.clean($container, $el);
          }
          
        });
        
        break; // selectlist
        
      case 'activatable-list' :

        $el.find('li').live('click', function(e) {

          if ( $el.find('li.active').pluck('id').join('|') !== $el.data('dirtyForm').original ) {
            $.fn.dirtyForm.dirty($container, $el);
          }
          else {
            $.fn.dirtyForm.clean($container, $el);
          }

        });
        break; //activatable-list

      case 'ui-textboxlist' :

        $el.bind('textboxlist.change', function() {
        
          if ( $el.val() !== $el.data('dirtyForm').original ) {
            $.fn.dirtyForm.dirty($container, $el);
          }
          else {
            $.fn.dirtyForm.clean($container, $el);
          }

        });

        break; // textboxlist

      case 'dirty-form-html' :

        $el.bind('html.change', function() {

          if ( $el.html() !== $el.data('dirtyForm').original ) {
            $.fn.dirtyForm.dirty($container, $el);
          }
          else {
            $.fn.dirtyForm.clean($container, $el);
          }

        });

        break; //innerHTML

      case 'color-swatch' :

        $el.bind('colorpicker.close', function() {

          if ( $el.css('background-color') !== $el.data('dirtyForm').original ) {
            $.fn.dirtyForm.dirty($container, $el);
          }
          else {
            $.fn.dirtyForm.clean($container, $el);
          }

        });

        $el.bind('colorpicker.revert', function() {

          if ( $el.css('background-color') !== $el.data('dirtyForm').original ) {
            $.fn.dirtyForm.dirty($container, $el);
          }
          else {
            $.fn.dirtyForm.clean($container, $el);
          }

        });

      break; // colorswatch

    } // switch on type

  }; // configureField

  $.fn.dirtyForm.getValues = function($container) {

    var values = {};
    
    function safeVal( value ) {
      
      if ( typeof value === 'string' ) {
        value = value.replace( /[\x01-\x1F]/g, '' );
      }
      
      return value;
      
    } // safeVal

    $container.find('input[type=text], input[type=file], input[type=password], textarea, select, input[type=hidden]').not('.dirty-form-ignore').each(function(i, el) {

      var $el = $(el);
      
      if ( !$el.is('.autocomplete_field, .textboxlist-bit-editable-input, .ui-textboxlist-bit-input, .selectlist_field, .selectbubble') ) {
        
        if ( $el.is('textarea') ) {
          values[el.id] = $el.val();
        }
        else {
          values[el.id] = safeVal( $el.val() );
        }
        
      }

    }); // text inputs, selects

    $container.find('.textboxlist-hidden').not('.dirty-form-ignore').each(function(i, el) {

      values[el.id] = safeVal( $(el).val().replace(/,/g,'|') );

    }); //textboxlists

    $container.find('.ui-textboxlist-hidden-text').not('.dirty-form-ignore').each(function(i, el) {

      values[el.id] = safeVal( $(el).val().replace(/,/g,'|') );

    }); //textboxlists

    $container.find('div.autocomplete .autocomplete_field').not('.dirty-form-ignore').each(function(i, el) {
      values[el.name] = safeVal( $(el).closest('.form-item.autocomplete').autocomplete('delimited') );

    }); //autocompletes

    $container.find('input:checkbox').not('.dirty-form-ignore').each(function(i, el) {

      values[el.id] = ( $(el).is(':checked') ) ? el.value : '0';

    }); // checkboxes

    $container.find('input:radio').not('.dirty-form-ignore').each(function(i, el) {

      $('[name=' + $(el).attr('name') + ']').each(function(i, namedRadio) {
        var $namedRadio = $(namedRadio);

        if ( $namedRadio.is(':checked') ) {
          values[namedRadio.name] = $namedRadio.val();
        }

      });

    }); // radios
    
    $container.find('.selectlist_container').not('.dirty-form-ignore').each(function(i, el) {
      
      values[el.id] = safeVal( $(el).selectlist('delimited') );
      
    }); // selectlists
    
    $container.find('select.selectbubble').not('.dirty-form-ignore').each(function(i, el) {
      
      values[el.id] = safeVal( $(el).selectbubble('value') );
      
    }); // selectbubble
    
    $container.find('.ui-popupbubble').not('.dirty-form-ignore').each(function(i, el) {
      
      values[el.id] = safeVal( $(el).popupbubble('value') );
      
    }); // selectbubble
    

    $container.find('.dirty-form-html').not('.dirty-form-ignore').each(function(i, el) {

      var $el = $(el);
      values[el.id] = $el.html();

    }); // inner HTML
    
    // Remove any values found on elements without IDs
    delete( values[''] );
    
    $.each( values, function( key, value ) {
      values[ key ] = $.trim( value );
    });

    return values;

  }; // getValues
  
  $.fn.dirtyForm.resetValues = function($container) {

    // $container.find('input[type=text], input[type=file], input[type=password], textarea, select, input[type=hidden]').not('.dirty-form-ignore').each(function(i, el) {
    // 
    //   var $el = $(el);
    //   
    //   if ( !$el.is('.autocomplete_field, .textboxlist-bit-editable-input, .ui-textboxlist-bit-input, .selectlist_field') ) {
    //     
    //     if ( $el.is('textarea') ) {
    //       values[el.id] = $el.val();
    //     }
    //     else {
    //       values[el.id] = safeVal( $el.val() );
    //     }
    //     
    //   }
    // 
    // }); // text inputs, selects
    // 
    // $container.find('.textboxlist-hidden').not('.dirty-form-ignore').each(function(i, el) {
    // 
    //   values[el.id] = safeVal( $(el).val().replace(/,/g,'|') );
    // 
    // }); //textboxlists
    // 
    // $container.find('.ui-textboxlist-hidden-text').not('.dirty-form-ignore').each(function(i, el) {
    // 
    //   values[el.id] = safeVal( $(el).val().replace(/,/g,'|') );
    // 
    // }); //textboxlists
    // 
    // $container.find('div.autocomplete .autocomplete_field').not('.dirty-form-ignore').each(function(i, el) {
    //   values[el.name] = safeVal( $(el).closest('.form-item.autocomplete').autocomplete('delimited') );
    // 
    // }); //autocompletes

    $container.find('input:checkbox').not('.dirty-form-ignore').each(function(i, el) {

      var $el     = $(el),
          df_data = $el.data('dirtyForm');
      
      if ( typeof df_data !== 'undefined' ) {
        
        // original will be either truey or false
        $el.changeInput( ( df_data.original ? 'check' : 'uncheck' ) );
        
      } // if df_data is not 'undefined'

    }); // checkboxes

    $container.find('input:radio').not('.dirty-form-ignore').each(function(i, el) {
    
      $('[name=' + $(el).attr('name') + ']').each(function(i, namedRadio) {
        
        var $namedRadio = $(namedRadio),
            df_data     = $namedRadio.data('dirtyForm');
    
        if ( typeof df_data !== 'undefined' ) {

          // original will be either truey or false
          $namedRadio.changeInput( ( df_data.original ? 'check' : 'uncheck' ) );

        } // if df_data is not 'undefined'
    
      });
    
    }); // radios
    
    // $container.find('.selectlist_container').not('.dirty-form-ignore').each(function(i, el) {
    //   
    //   values[el.id] = safeVal( $(el).selectlist('delimited') );
    //   
    // }); // selectlists
    // 
    // 
    // $container.find('.dirty-form-html').not('.dirty-form-ignore').each(function(i, el) {
    // 
    //   var $el = $(el);
    //   values[el.id] = $el.html();
    // 
    // }); // inner HTML
    
  }; // getValues
  
  $.fn.dirtyForm.getFields = function( $container ) {
  
    var $fields = $('');
    
    $fields = $fields.add( $container.find('input[type=text], input[type=file], input[type=password], textarea, select, input[type=hidden]').not('.dirty-form-ignore') );

    $fields = $fields.add( $container.find('.textboxlist-hidden').not('.dirty-form-ignore') );

    $fields = $fields.add( $container.find('.ui-textboxlist-hidden-text').not('.dirty-form-ignore') );
    
    $fields = $fields.add( $container.find('div.autocomplete .autocomplete_field').not('.dirty-form-ignore') );

    $fields = $fields.add( $container.find('input:checkbox').not('.dirty-form-ignore') );
    
    $fields = $fields.add( $container.find('input:radio').not('.dirty-form-ignore') );

    $fields = $fields.add( $container.find('.selectlist_container').not('.dirty-form-ignore') );
    
    $fields = $fields.add( $container.find('.dirty-form-html').not('.dirty-form-ignore') );
    
    $fields = $fields.add( $container.find('.ui-popupbubble').not('.dirty-form-ignore') );

    return $fields;
  
  }; // getFields

}(jQuery));
