/*global jQuery */
/**
 * Copied out of plugins folder as part of project editor refactor
 * Now supports AMD ( seems there was no Core dep here )
 */
(function(factory) {
  'use strict';
  if (typeof define === 'function' && define.amd) {
    define(['jquery',
            './bubblelist',
            'jqueryui/widget' ], function() {
      var module = factory.apply(this, arguments);
      return module;
    });
  }
  else {
    return jQuery && factory.call(this, jQuery);
  }
}(function($, bubblelist) {
  'use strict';

  $.widget("ui.textboxlist", $.extend({}, bubblelist, {

    options : {

        allow_numbers        : false,
        word_limit           : 3,
        char_buffer          : 5,
        min_length           : 2,
        adtl_close_classes   : ['pointer','sprite-site-elements'],
        adtl_display_classes : [],
        create_keys          : [ $.ui.keyCode.ENTER, $.ui.keyCode.NUMPAD_ENTER, $.ui.keyCode.TAB, $.ui.keyCode.COMMA, $.ui.keyCode.COLON, $.ui.keyCode.SEMICOLON ],
        add_from_input       : true,
        blacklist            : [],
        list_classes         : [],
        ignore_blur_override : false,
        limit                : 0,
        valueSeparator: ',',
        grow: false

    },

    keycodes : {},

    _id            : '',
    _$hiddenWidth : false,
    $_list         : false,

    _ignore_blur: false,

    _handleBlur: function(e) {
      var element = e.target;

      if ( this._ignore_blur === true ) {
        this._ignore_blur = false;
        return;
      }

      // If value is good on blur, create
      if ( this._good_value( element.value ) ) {
        this._create_bubble_from_input( element, false );
      }
      // Otherwise blank out field
      else {
        element.value = '';
      }
    },

    _init : function() {

      var textboxlist  = this;

       this.keycodes[ $.ui.keyCode.COMMA ]     = ',';
       this.keycodes[ $.ui.keyCode.COLON ]     = ':';
       this.keycodes[ $.ui.keyCode.SEMICOLON ] = ';';

      this._id = this.element.attr('id');
      this._$hiddenWidth = $('<div id="' + this._id + '-hidden" class="ui-textboxlist-hidden-width" />');
      this.$_list = $('<div id="' + this._id + '-list" class="ui-textboxlist" />');
      this.placeholder = this.element.attr('placeholder');

      this.$_list.addClass( this.options.list_classes.join(' ') )
      .on( 'focus blur', 'input', function( e ) {
        textboxlist.$_list.toggleClass( 'focus', e.type === 'focusin' );
      });

      this.element.addClass('ui-textboxlist-hidden-text')
      .after( this.$_list );

      if (this.options.grow) {
        this.$_list.css({
          minHeight: this.$_list.height(),
          height: 'auto'
        });
      }

      this.options.display_classes = this.options.adtl_display_classes.concat('ui-textboxlist-selection-display', this.options.display_classes);

      this.options.close_classes = this.options.adtl_close_classes.concat('ui-textboxlist-deletebutton', this.options.close_classes);


      if ( this.element.val() !== '' ) {
        // TODO: account for all delimiters such as colons and semicolons
        this.element.val().split(',').forEach(function(value) {
          textboxlist.addValue( value );
        });
      }

      this._update_hidden_text();

      this.$_list.addClass('ui-textboxlist');
      this.element.after( this._$hiddenWidth );


      // if comma will make new bubbles
      if ( this.options.create_keys.indexOf($.ui.keyCode.COMMA) !== -1 ) {

        // make bubbles based on paste
        this.$_list.on('paste', 'input', function(e) {


          var input = this;
          setTimeout( function() {

            if ( textboxlist.options.add_from_input !== true ) {
              textboxlist.element.trigger( 'textboxlist.change', [ input.value ] );
              return;
            }

            var values, $input,
                value        = input.value,
                value_array  = value.split( ' ' ),
                count        = 0,  // track when to split string
                new_term     = ''; // string to build up proper comma placement

            // if pasting something that will break the word limit
            if ( textboxlist.options.word_limit > 0 && value_array.length > textboxlist.options.word_limit ) {


              // Loop through terms to fake comma insertion so next block can handle
              value_array.forEach(function(currentValue){

                new_term += ' ' + currentValue;

                ++count;

                // trim first space of first word
                new_term = $.trim( new_term );

                // set this chunk of words as an actual new term
                if ( count === textboxlist.options.word_limit ) {

                  // set for creation later
                  new_term +=',';

                  // reset numbers for next block
                  count    = 0;

                }


              });

              // Remove trailing comma
              if ( new_term.substr( -1 ) === ',' ) {
                new_term = new_term.substr( 0, ( new_term.length-1 ) );
              }

              // finally set new value of input to handle proper splits
              input.value = new_term;


            }

            // TODO: account for all delimiters such as colons and semicolons
            // found at least one comma
            if ( input.value.indexOf( ',' ) !== -1 ) {

              values = input.value.split( ',' );

              $.each( values, function( i, value ) {

                textboxlist.addValue( $.trim( value ) );

              });

              // make sure the $input is always there since new ones are created through looping
              $input = textboxlist.$_list.find( 'input' );

              $input.val('');

            }

          }, 5 );
        });
      }

      this.$_list.on('keydown', 'input', function(e) {

        // if key is going to create bubble, no need to pay attention on blur
        if ( $.inArray( e.keyCode, textboxlist.options.create_keys ) ) {
          textboxlist._ignore_blur = true;
        }


        var input            = this,
            last_input_value = this.value;

        // input.value is not set yet
        setTimeout( function() {

          textboxlist._ignore_blur = false;

          var words        = [],
              word_count   = 0,
              auto_focus   = true,
              $last_delete = false;

          textboxlist._update_hidden( input );

          if ( last_input_value === '' && input.value === '' && e.keyCode === $.ui.keyCode.BACKSPACE ) {

            $last_delete = textboxlist.$_list.find('.ui-textboxlist-deletebutton').last();

            if ( $last_delete.length ) {
              $last_delete.trigger( 'click' );
            }
            else {
              textboxlist.element.trigger( 'textboxlist.change', [ input.value ] );
            }

            return;
          }

          // change is fired within _create_bubble_from_input normally
          if ( textboxlist.options.add_from_input !== true ) {
            textboxlist.element.trigger( 'textboxlist.change', [ input.value ] );
            return;
          }

          if ( textboxlist.options.create_keys.indexOf(e.keyCode) !== -1 ) {

            auto_focus = ( e.keyCode !== $.ui.keyCode.TAB );

            /**
             * TODO: Make an array of whatever this is supposed to mean
             * and use indexOf to know that value should be changed
             */
            switch( e.keyCode ) {

              case $.ui.keyCode.TAB :
              case $.ui.keyCode.ENTER :
              case $.ui.keyCode.NUMPAD_ENTER :
                break;

              default :
                input.value = input.value.substr(0, input.value.length-1 );
                break;


            }

            textboxlist._create_bubble_from_input( input, auto_focus );
            return;

          }

          // create bubble if there is a word limit that's hit
          if ( e.keyCode === $.ui.keyCode.SPACE && textboxlist.options.word_limit > 0 ) {

            words = input.value.split(' ');

            // there will always be one additional for empty character after last space
            word_count = words.length - 1;

            if ( word_count >= textboxlist.options.word_limit ) {

              input.value = input.value.substr(0, input.value.length-1 );
              textboxlist._create_bubble_from_input( input );
            }

          }

        }, 1 );

        if ( e.keyCode === $.ui.keyCode.ENTER || e.keyCode === $.ui.keyCode.NUMPAD_ENTER ) {
          e.stopPropagation();
          e.preventDefault();
        }

      });

      // make sure clicking dead space goes to input
      this.$_list.on( 'click', function() {
        $(this).find('input').focus();
      });

      this.$_list.on('focus', 'input', function() {
        textboxlist._update_hidden( this );
      });

      this._add_input( false );

      if (this.placeholder) {
        this.refresh();
      }

      return this.$_list;

    }, // _init

    _create_bubble : function( $li, value ) {

      var class_count = 0,
          codes       = this.keycodes,
          ptn         = '';

      // Loop through keys that are meant for separation
      this.options.create_keys.forEach(function(code ) {

        // If the keycode is visible, add it to pattern for removal
        if ( codes[ code ] ) {
          ptn += codes[code];
        }

      });

      // in case anything skips a beat, remove any delimiters
      ptn   = new RegExp( "[" + ptn + "]+", 'gi' );
      value = value.replace( ptn, '' );

      // Redefine $li since _make_bubble will make one for you, if $li did not get passed in
      $li = this._make_bubble( $li, value );

      $li.addClass( 'ui-textboxlist-bit-done' );

      this._update_hidden_text();

      // TODO: refactor so this returns $li and another function can take the $li and send back the remove bit
      return $li.find( '.ui-textboxlist-deletebutton' );

    }, // _create_bubble

    _good_value : function( value ) {

      value = $.trim( value.toString() );

      var lower_value = value.toLowerCase();

      if ( $.inArray( lower_value, this.options.blacklist ) !== -1 ) {
        this.element.trigger( 'textboxlist.blacklisted', [ value ] );
        return false;
      }

      if ( value === '' || value.match( /^\s+$/ ) ) {

        this.element.trigger( 'textboxlist.empty', [ value ] );
        return false;

      }

      if ( !this.options.allow_numbers && value.match( /^\d+$/ ) ) {
        this.element.trigger( 'textboxlist.numbersonly', [ value ] );
        return false;
      }

      if ( value.length < this.options.min_length ) {

        this.element.trigger( 'textboxlist.min_length', [ value ] );
        return false;

      }

      if ( $.inArray( value, this.dataArray() ) !== -1 ) {

        this.element.trigger( 'textboxlist.duplicate', [ value ] );
        return false;

      }

      // This should be last always or it may try to say limit is hit on a bad value
      if ( this.options.limit && this.dataArray().length >= this.options.limit ) {
        this.element.trigger( 'textboxlist.limitHit', [ value ] );
        return false;
      }

      return true;

    }, // _good_value

    _create_bubble_from_input : function( input, auto_focus ) {

      auto_focus = ( auto_focus === false ) ? false : true;

      var value       = $.trim( input.value ),
          $input      = $(input),
          $li         = $input.parent();

      if( !this._good_value( value ) ) {
        return;
      }


      $li.html( value );

      this._create_bubble( $li, value );

      return this._add_input( auto_focus );

    }, // _create_bubble_from_input

    _remove_bubble : function( e ) {

      var $parent     = e.data.parent,
          textboxlist = e.data.that;

      $parent.remove();

      textboxlist._update_hidden_text();

      textboxlist.refresh();

      e.stopPropagation();

      textboxlist.element.trigger( 'textboxlist.removedBit', [$parent] );

      if ( textboxlist.options.limit && textboxlist.dataArray().length < textboxlist.options.limit ) {
        textboxlist.element.trigger( 'textboxlist.limitNotHit' );
      }

    }, // _remove_bubble

    _update_hidden : function( input ) {

      var hiddenWidth,
          measureText = input.value,
          hasValue = !!this.element.val();

      if (hasValue) {
        $(input).removeAttr('placeholder');
      }
      else {
        measureText =  this.placeholder;
        $(input).attr('placeholder', this.placeholder);
      }

      this._$hiddenWidth[0].innerHTML = measureText;

      hiddenWidth = this._$hiddenWidth.width() + this.options.char_buffer;

      input.style.width = (hiddenWidth < 50) ? '50px' : hiddenWidth + 'px';

    }, // _update_hidden

    _add_item : function( $before ) {

      var $li         = $('<li />');

      if ( $before && $before.length ) {
        $before.before( $li );
      }
      else {
        this.$_list.append( $li );
      }

      $li.addClass('ui-textboxlist-bit');

      return $li;

    },

    _add_input : function( auto_focus ) {

      auto_focus = ( auto_focus === false ) ? false : true;

      var $input        = this.$_list.find( '.ui-textboxlist-bit-input' ),
          textboxlist   = this,
          $li           = this._add_item(),
          $input_parent = $input.parent();

      if ( !$input.length ) {
        $input = $('<input type="text" />');
      }
      else {
        $input_parent.remove();
      }

      $li.append( $input );

      $input.addClass('ui-textboxlist-bit-input');

      if ( auto_focus === true ) {
        $input.focus();
      }

      if ( this.options.ignore_blur_override !== true ) {
        $input.on('blur', this._handleBlur.bind(this));
      }

      return $input;

    }, // _add_input

    _update_hidden_text : function() {

      var vals = [];

      this.$_list.find( '.ui-textboxlist-bit-done').each( function() {
        vals[vals.length] = $(this).text();
      });

      this.element.val(vals.join(this.options.valueSeparator));

      this.element.trigger('textboxlist.change');

    }, // _update_hidden_text

    list : function() {
      return this.$_list;
    },

    refresh: function() {
      this._update_hidden(this.$_list.find('input')[0]);
    },

    addValue : function( value ) {

      if( !this._good_value( value ) ) {
        return;
      }

      var $li = this._add_item( this.$_list.find('.ui-textboxlist-bit-input').closest('li') );

      return this._create_bubble( $li, value );

    }, // addValue
    fieldValue : function() {
      return this.$_list.find( 'input' ).last().val();
    }, // fieldValue

    dataArray : function() {

      var vals = [],
          textboxlist = this;

      this.$_list.find( '.ui-textboxlist-bit-done').each( function() {

        var value       = $(this).text(),
            lower_value = value.toLowerCase();

        if ( $.inArray( lower_value, textboxlist.options.blacklist ) === -1 ) {
          vals[vals.length] = value;
        }

      });

      return vals;

    }

  }));

}));
