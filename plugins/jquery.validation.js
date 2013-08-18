/*jslint sloppy:true */
(function(factory) {
  if (typeof define === 'function' && define.amd) {
    define(['jquery'], factory);
  }
  else {
    factory.call(this, jQuery);
  }
}(function($) {
  'use strict';

  $.extend( $.fn, {

    setValidationRules : function( new_rules ) {

      var _setRules = function() {

        var classes = this.className.split(' '), i;

        for ( i=0;i<classes.length;++i ) {

          if ( classes[i].match(/validate\[[^\]+]/) ) {
            classes[i] = 'validate['+new_rules.join(',')+']';
          }

        }

        this.className = classes.join(' ');

      };

      $.each( this, _setRules );

    }, // setValidationRules

    setValidationRequired : function( required ) {

      var _setRequired = function() {

        var classes = this.className.split(' '), i;

        for ( i=0;i<classes.length;++i ) {

          if ( classes[i].match(/validate\[[^\]+]/) ) {

            if ( required ) {
              classes[i] = classes[i].replace('optional','required');
            }
            else {
              classes[i] = classes[i].replace('required','optional');
            }

          } // match

        } // for

        this.className = classes.join(' ');

      };

      $.each( this, _setRequired );

    }, // setValidationRequired

    validation : function(settings) {

      settings = $.extend({
        promptPosition        : "topRight",  // OPENING BOX POSITION, IMPLEMENTED: topLeft, topRight, bottomLeft, centerRight, bottomRight
        success               : false,
        scrolling             : true,
        failure               : false,
        ajaxSuccessValidCheck : function( json ) {
          return ( json.valid === 1 || json.valid === 'yes' );
        }
      }, settings );

      var $form            = $(this).first(), // don't allow hooking up of multiple forms at same time
      $validate_fields = $form.find("[class*=validate]").not('a'), // all inputs that need to be validated
      WINDOW_BUFFER    = 15,

      _validateNow = function( e ) {

        var input = e.target;

        if ( input.value ) {
          input.value = $.trim( input.value );
        }

        $.validation.check( $(input), 2 );

      }, // _validateNow

      // builds error display
      // TODO: change to tooltip plugin
      buildPrompt = function( $input, prompt_text ) {

        var $error_div         = $( document.createElement('div') ),
        $error_content_div = $( document.createElement('div') ),
        $arrow             = $( document.createElement('div') ),
        $position_el       = $input,
        callerTopPosition  = false,
        callerLeftPosition = false,
        callerWidth        = false,
        callerHeight       = false,
        inputHeight        = false,
        errorWidth         = false,
        windowWidth        = $(window).width(),
        errorXEnd          = false,
        widthDiff          = false,
        $existing          = false,
        $position_input    = $input,
        input_type         = $input.prop( 'type' ),
        use_name           = ( input_type === "radio" || input_type === "checkbox" ),
        class_attr         = ( use_name ) ? 'name' : 'id';

        if ( $input.hasClass( 'autocomplete' ) ) {
          $input = $input.find('input').first();
        }

        $existing = $('.formError.' + $input.attr( class_attr ) );
        if ( $existing.length ) {
          $existing.remove();
        }

        $error_div.addClass("formError")
        .addClass( $input.attr( class_attr ) );

        $error_content_div.addClass("formErrorContent")
        .addClass("drop-shadow");

        $("body").append( $error_div );
        $error_div.append( $error_content_div );

        $arrow.addClass("formErrorArrow");

        $error_div.append( $arrow );

        if ( settings.promptPosition === "bottomLeft" || settings.promptPosition === "bottomRight" ){
          $arrow.addClass("formErrorArrowBottom");
          $arrow.html('<div class="line1">&nbsp;</div><div class="line2">&nbsp;</div><div class="line3">&nbsp;</div><div class="line4">&nbsp;</div><div class="line5">&nbsp;</div><div class="line6">&nbsp;</div><div class="line7">&nbsp;</div><div class="line8">&nbsp;</div>');
        }
        if ( settings.promptPosition === "topLeft" || settings.promptPosition === "topRight" ){
          $arrow.html('<div class="line8">&nbsp;</div><div class="line7">&nbsp;</div><div class="line6">&nbsp;</div><div class="line5">&nbsp;</div><div class="line4">&nbsp;</div><div class="line3">&nbsp;</div><div class="line2">&nbsp;</div><div class="line1">&nbsp;</div>');
        }

        $error_content_div.html('<ul>'+prompt_text+'</ul>');

        if ( use_name ) {
          $position_input = $('input').filter( '[name=' + $input.attr( 'name' ) + ']' ).first();
        }

        $position_el       = $.validation.getVisibleEl( $position_input );
        callerTopPosition  = $position_el.offset().top;
        callerLeftPosition = $position_el.offset().left;
        callerWidth        = $position_el.width();
        inputHeight        = $error_div.height();

        /* POSITIONNING */
        if ( settings.promptPosition === "topRight" ) {
          callerLeftPosition +=  callerWidth - 30;
          callerTopPosition  += -inputHeight - 10;
        }
        else if ( settings.promptPosition === "topLeft" ) {
          callerTopPosition  += -inputHeight - 10;
        }
        else if ( settings.promptPosition === "centerRight" ) {
          callerLeftPosition +=  callerWidth + 13;
        }
        else if ( settings.promptPosition === "bottomLeft" ) {

          callerHeight       = $position_el.height();
          callerTopPosition  = callerTopPosition + callerHeight + 15;

        }
        else if ( settings.promptPosition === "bottomRight" ) {

          callerHeight        =  $position_el.height();
          callerLeftPosition +=  callerWidth - 30;
          callerTopPosition  +=  callerHeight + 15;

        }


        errorWidth = $error_div.width();
        errorXEnd  = errorWidth + callerLeftPosition;

        // Fix position for things going over end of screen on right side
        if ( settings.promptPosition.indexOf( 'Right' ) !== -1 ) {

          if ( errorXEnd > windowWidth ) {

            widthDiff  = errorXEnd - windowWidth;

            callerLeftPosition = callerLeftPosition - widthDiff;

            $arrow.css( 'left', $arrow.cssToInt( 'left' ) + widthDiff );

          } // if xend > windowwidth

          // If bubble is touching edge of screen
          if ( ( callerLeftPosition + errorWidth ) ===  windowWidth ) {

            callerLeftPosition = callerLeftPosition - WINDOW_BUFFER;

            $arrow.css( 'left', $arrow.cssToInt( 'left' ) + WINDOW_BUFFER );

          }


        } // if right


        $error_div.css({
          top     : callerTopPosition,
          left    : callerLeftPosition,
          opacity : 0
        })
        .data('validationErrrorInput', $input );

        return $error_div.animate({"opacity":1},function(){return true;});

      }, // buildPrompt

      // update text error for existing prompt
      // TODO: change to tooltip plugin
      updatePromptText = function( $input, prompt_text ) {

        var updateThisPrompt   = ".formError." + $input.attr("id"),
        $position_el       = $input,
        $updatePrompt      = $(updateThisPrompt),
        callerTopPosition  = false,
        inputHeight        = false,
        callerLeftPosition = false,
        callerWidth        = false,
        callerHeight       = false;


        $updatePrompt.find(".formErrorContent").html('<ul>'+prompt_text+'</ul>');

        $position_el       = $.validation.getVisibleEl( $input );
        callerTopPosition  = $position_el.offset().top;
        inputHeight        = $updatePrompt.height();

        if ( settings.promptPosition === "bottomLeft" || settings.promptPosition === "bottomRight" ) {

          callerHeight      =  $position_el.height();
          callerTopPosition =  callerTopPosition + callerHeight + 15;

        }
        else if ( settings.promptPosition === "centerRight") {
          callerLeftPosition  = $position_el.offset().left;
          callerWidth         = $position_el.width();
          callerLeftPosition += callerWidth + 13;
        }
        else if ( settings.promptPosition === "topLeft" || settings.promptPosition === "topRight") {
          callerTopPosition = callerTopPosition  - inputHeight - 10;
        }

      }; // updatePromptText

      $form.bind("submit", function( e ) {

        $form.trigger( 'validation.beforesubmit' );

        if ( settings.$submit && settings.$submit.hasClass( 'form-button-disabled' ) ) {
          return false;
        }

        // if there is no error
        if ( $.validation.submitValidation( $form, settings.scrolling ) === false ) {

          // stop form on success, if there's a callback for that
          if ( typeof settings.success === 'function' ) {
            settings.success();
            $form.trigger( 'validation.aftersubmit' );
            return false;
          }


        } // if submitValidation = false
        else {

          if ( typeof settings.failure === 'function' ) {
            settings.failure();
          }


          $form.trigger( 'validation.aftersubmit' );

          // always want to stop if form fails
          return false;

        } // else

        $form.trigger( 'validation.aftersubmit' );

      }); // bind submit


      $form.delegate( 'input[class*=validate][type=checkbox]', 'click', _validateNow );
      $form.delegate( 'select[class*=validate], input[class*=validate][type!=checkbox], textarea[class*=validate]', 'blur selectmenuchange', _validateNow );
      $form.delegate( '.autocomplete[class*=validate]', 'toggleSelection', _validateNow );

      // $validate_fields.each(function() {

      // $.validation.check( $(this), 2 );

      // }); // $validate_fields each

      $form.data( 'validation', {

        updatePromptText : updatePromptText,
        buildPrompt      : buildPrompt,
        settings         : settings

      });

      return $form;

    } // validation

  });

  $.extend( $.fn.validation, {

    resetErrorPositions : function() {

      var $errors = $('.formError'),
      $form = $(this);

      $errors.each(function() {

        var $error  = $(this),
        $input      = $error.data( 'validationErrrorInput' ),
        error_html  = $error.find( 'ul' ).html();

        if ( !$input || !$input.length ) {
          return;
        }

        $error.remove();

        $error = $.validation.buildPrompt( $form, $input, error_html );

      });

      return $errors;

    }, // resetErrorPositions

    removeAllErrors : function() {

      $('.formError').remove();

    } // removeAllErrors

  });
  
  $.validation = $.validation || {};
  $.extend( $.validation, {
    
    rules : {

      "Generic":{
        "regex":/^[^<>]+$/,
        "alertText":"This field may not contain less than signs (&lt) or greater than signs (&gt;)"
      },
      "AlphaNumeric":{
        "regex":/^[0-9A-Za-z\u00C0-\u00FF\u0100-\u0259\u0386\u0388-\u04E9\u05D0-\u06D3\u1E80-\u200F]+$/,
        "alertText":"This field must contain only alphanumeric characters"
      },
      "Alpha":{
        "regex":/^[A-Za-z\u00C0-\u00FF\u0100-\u0259\u0386\u0388-\u04E9\u05D0-\u06D3\u1E80-\u200F]+$/,
        "alertText":"This field must contain only alpha characters"
      },
      "AlphaDash":{
        "regex":/^[A-Za-z\u00C0-\u00FF\u0100-\u0259\u0386\u0388-\u04E9\u05D0-\u06D3\u1E80-\u200F\-]+$/,
        "alertText":"This field must contain only alpha characters or dashes"
      },
      "ANDash":{
        "regex":/^[0-9A-Za-z\u00C0-\u00FF\u0100-\u0259\u0386\u0388-\u04E9\u05D0-\u06D3\u1E80-\u200F\-]+$/,
        "alertText":"This field must contain only alphanumeric characters or dashes"
      },
      "ANUnder":{
        "regex":/^[0-9A-Za-z\u00C0-\u00FF\u0100-\u0259\u0386\u0388-\u04E9\u05D0-\u06D3\u1E80-\u200F_]+$/,
        "alertText":"This field must contain only alphanumeric characters with or without underscores"
      },
      "ANUSpace":{
        "regex":/^[0-9A-Za-z\u00C0-\u00FF\u0100-\u0259\u0386\u0388-\u04E9\u05D0-\u06D3\u1E80-\u200F_ ]+$/,
        "alertText":"This field must contain only alphanumeric characters with or without underscores and spaces"
      },
      "ANEmail":{
        "regex":/^([_\dA-Za-z\u00C0-\u00FF\u0100-\u0259\u0386\u0388-\u04E9\u05D0-\u06D3\u1E80-\u200F\-]+|[A-Za-z0-9_\.\+\-]+@[A-Za-z0-9_\.\-]+\.[A-Za-z0-9_\-]+)$/,
        "alertText":"This field must contain a valid username or email"
      },
      "Integer":{
        "regex":/^\-?\d+$/,
        "alertText":"This field must only contain numbers, without any spaces"
      },
      "CreditCardNumber":{
        "regex":/^\d{13,16}$/,
        "alertText":"This field must only contain numbers, without any spaces or dashes"
      },
      "Decimal":{
        "regex":/^\-?\d+(\.\d+)?$/,
        "alertText":"This field must be a valid decimal number"
      },
      "Date":{
        "regex":/^\d{1,2}\-\d{1,2}-\d{4}( \d{2}:\d{2}:\d{2})?$/,
        "alertText":"This field must be a valid date"
      },
      "SqlDate":{
        "regex":/^\d{4}\-\d{2}\-\d{2}$/,
        "alertText":"This field must be a valid date"
      },
      "SqlDateTime":{
        "regex":/^\d{4}\-\d{2}\-\d{2}\s\d{2}\:\d{2}\:\d{2}$/,
        "alertText":"This field must be a valid datetime"
      },
      "SlashDate":{
        "regex":/^\d{1,2}\/\d{1,2}\/\d{4}$/,
        "alertText":"This field must be a valid date"
      },
      "Email":{
        "regex":/^[A-Za-z0-9_\.\+\-]+@[A-Za-z0-9_\.\-]+\.[A-Za-z0-9_\-]+$/,
        "alertText":"This field must be a valid email address"
      },
      "Name":{
        "regex":/^[\wA-Za-z\u00C0-\u00FF\u0100-\u0259\u0386\u0388-\u04E9\u05D0-\u06D3\u1E80-\u200F\'. \-]{2,50}$/,
        "alertText":"This field must be a valid name"
      },
      "Username":{
        "regex":/^[A-Za-z0-9_\-]+$/,
        "alertText":"This field contains invalid characters. Please use only letters, numbers, dash or underscore characters."
      },
      "Password":{
        "regex":/^\S{6,32}$/,
        "alertText":"This field must be between 6 and 32 characters"
      },
      "Address":{
        "regex":/^[\w0-9A-Za-z\u00C0-\u00FF\u0100-\u0259\u0386\u0388-\u04E9\u05D0-\u06D3\u1E80-\u200F# \' \.\,\&\-]+$/,
        "alertText":"This field must be a valid address"
      },
      "City":{
        "regex":/^[\wA-Za-z\u00C0-\u00FF\u0100-\u0259\u0386\u0388-\u04E9\u05D0-\u06D3\u1E80-\u200F \' \. \-]+$/,
        "alertText":"This field must be a valid city"
      },
      "Province":{
        "regex":/^[\wA-Za-z\u00C0-\u00FF\u0100-\u0259\u0386\u0388-\u04E9\u05D0-\u06D3\u1E80-\u200F ]+$/,
        "alertText":"This field must be a valid province"
      },
      "IntZip":{
        "regex":/^[A-Za-z0-9#\. \-]+$/,
        "alertText":"This field must be a valid zipcode"
      },
      "UsZip":{
        "regex":/^\d{5}(\-\d{4})?$/,
        "alertText":"This field must be a valid US zipcode"
      },
      "Country":{
        "regex":/^[\wA-Za-z\u00C0-\u00FF\u0100-\u0259\u0386\u0388-\u04E9\u05D0-\u06D3\u1E80-\u200F\'. \-]{2,50}$/,
        "alertText":"This field must be a valid country"
      },
      "IntPhone":{
        "regex":/^[0-9\+ \(\)\#\-]+$/,
        "alertText":"This field must be a valid phone"
      },
      "UsPhone":{
        "regex":/^\d{3}\-\d{3}\-\d{4}$/,
        "alertText":"This field must be a valid US phone"
      },
      "PicExt":{
        "regex":/^((jpg)|(jpeg)|(png)|(gif)){1}$/,
        "alertText":"This field must be a valid image extension"
      },
      "VideoExt":{
        "regex":/^((mpg)|(mpeg)|(mov)|(avi)|(dv)|(qt)|(asf)|(flv)){1}$/,
        "alertText":"This field must be a valid video extension"
      },
      "Url":{
        "regex":/^(http(?:s)?:\/\/|www.)[^<>]*$/,
        "alertText":"This field must be a URL starting with http:// or www."
      },
      "UrlExt":{
        "regex":/^((?:https?):\/\/)?(?:(?:(?:[\w\.\-\+!$&\'\(\)*\+,;=_]|%[0-9a-f]{2})+:)*(?:[\w\.\-\+%!$&\'\(\)*\+,;=]|%[0-9a-f]{2})+@)?(?:[A-Za-z0-9_\-]+\.)(?:[A-Za-z0-9\-\._])+(?::\d+)?(?:[\/|\?](?:[\w#!:\.\?\+=&@$\'~*,;_\/\(\)\[\]\-]|%[0-9a-f]{2})*)?$/,
          "alertText":"This field must be a valid URL"
      },
      "Html":{
        "regex":/<((?!\/?span|\/?h1|\/?h2|\/?h3|\/?h4|\/?h5|\/?h6|\/?a|\/?b|\/?ol|\/?ul|\/?li|\/?i|\/?em(?!bed)|\/?p|\/?div|\/?br|\/?unb|\/?uni|\/?\s|\/?\>)[^\>]*\>)/ig,
        "alertText":"This field must be properly formed HTML"
      },
      "Twitter":{
        "regex":/^[A-Za-z0-9_\-]{1,15}$/,
        "alertText":"This field must be a valid twitter username (without the @ character)"
      },
      "required":{
        // Add your regex rules here, you can take telephone as an example
        "regex":null,
        "alertText":"This field is required",
        "alertTextCheckboxMultiple":"Please select an option",
        "alertTextCheckboxe":"This checkbox is required"
      },
      "length":{
        "regex":null,
        "alertText":"Between ",
        "alertText2":" and ",
        "alertText3": " characters allowed"
      },
      "minCheckbox":{
        "regex":null,
        "alertText":"Checks allowed Exceeded"
      },
      "confirm":{
        "regex":null,
        "alertText":"Your field is not matching"
      }

    },
  
    buildPrompt : function( $form, $input, error_text ) {
      return $form.data( 'validation' ).buildPrompt( $input, error_text );
    }, // buildPrompt

    handleResponse : function( $form, params ) {
    
      var scroll_destination, validation = $form.data( 'validation' ),
          $message_container = params.$message_container || $form;

      // If JSON came back
      if ( params.data ) {
      
        // If there are messages to show
        if ( params.data.messages && typeof $.fn.showMessages === 'function' ) {
        
          $message_container.showMessages( params.data.messages, params.message_params );
          
        } // if data.messages
      
        // If there are errors, show prompts
        if ( params.data.errors ) {

          $.each( params.data.errors, function(key) {

            if ($('#' + key).length) {
              validation.buildPrompt( $('#' + key), params.data.errors[key] );
            }
            else {
              validation.buildPrompt( $form, params.data.errors[key] );
            }

          });
          
          if ( validation.settings.scrolling ) {
          
            scroll_destination = $('.formError').first().offset().top - 200;
            
            $.Core.scrollElement().animate({ scrollTop: scroll_destination}, 1100);
          
          }

        } // if data.errors
        
        // Looks for destination, redirect
        if ( typeof params.data.destination !== 'undefined' && params.data.destination ) {
          $form.trigger( 'validation.redirecting', [ params.data ] );
          window.location.href = params.data.destination;
          return false;
        }
        
        if ( validation.settings.ajaxSuccessValidCheck( params.data ) ) {

          $form.trigger( 'validation.success', [ params.data ] );
          return true;

        } // ajaxSuccessValidCheck
        
      } // if params.data

      $form.trigger( 'validation.failure', [ params.data ] );

      if ( typeof params.failure === 'function' ) {

        params.failure( params.data );
        return false;

      } // failure = function

      return true;

    }, // handleResponse

    // jquery only checks display, not visibility, so must double check $input visibility for positioning
    getVisibleEl : function( $input ) {

      if ( typeof $input.data( 'selectmenu' ) === 'object' ) {
        $input = $input.selectmenu('getNewElement');
      }
      
      if ( typeof $input.data( 'autocomplete' ) === 'object' ) {
        $input = $input.autocomplete('field');
      }
      
      if ( ! $input.is(':visible') || $input.css('visibility') === 'hidden' || $input.parent().hasClass('custom-checkbox') || $input.parent().hasClass('custom-radio') ) {
        $input = $input.parent().closest(':visible');
      }

      return $input;

    }, // getVisibleEl

    // checks input based on settings
    check : function( $input, validate ) {
    
      var rulesParsing = $input.attr('class'),
          rulesRegExp  = /validate\[(.*)\]/,
          getRules     = rulesRegExp.exec(rulesParsing),
          str, pattern, result;
          
      if ( !getRules ) {
        $.Core.exception( "No rules for ", rulesParsing, $input );
      }
          
      str          = getRules[1];
      pattern      = /\W+/; // this has to do with extra rules in matching...
      result       = str.split(pattern);

      return $.validation.validateRules( $input, result, validate );

    }, // check

    // execute validation based on rules
    validateRules : function( $input, rules, validate ) {

      var default_val  = $input.data( 'defaultValue' ),
          $form        = $input.closest( 'form' ),
          prompt_text  = "",
          prompt_class = $input.attr( 'id' ),
          input_name   = $input.attr( 'name' ),  // for radios / checkboxes
          input        = $input[0],
          input_type   = $(input).prop( 'type' ),
          error        = false,
          rule         = false,
          inc          = 0,

          _required = function() {   // VALIDATE BLANK FIELD

            var text_input = ( input_type === "text" || input_type === "password" || input_type === "textarea" ),
                use_name   = ( input_type === "radio" || input_type === "checkbox" ),
                name_prop  = 'alertTextCheckboxe';

            if ( text_input ) {

              if( $input.val() ) {
                return true;
              }

              error        = true;
              prompt_text += '<li>' + $.validation.rules[ rules[ inc ] ].alertText + '</li>';

              return false;

            } // if text_input

            if ( use_name ) {

              if( $("input[name="+input_name+"]:checked").length ) {
                return true;
              }

              error = true;

              if( $("input[name="+input_name+"]").length > 1 ) {
                name_prop = 'alertTextCheckboxMultiple';

              }

              prompt_text += '<li>' + $.validation.rules[ rules[ inc ] ][ name_prop ] + '</li>';

              return false;

            } // if use_name

            if ( input.tagName === 'SELECT' ) {

              if( $input.val() ) {
                return true;
              }

              error        = true;
              prompt_text += '<li>' + $.validation.rules[rules[ inc ]].alertText + '</li>';

              return false;

            } // if tagName = select

            if ( $input.hasClass('autocomplete') ) {
            
              if ( $input.autocomplete('delimited') ) {
                return true;
              }

              error        = true;
              prompt_text += '<li>' + $.validation.rules[rules[ inc ]].alertText + '</li>';
              return false;

            } // if hasClass autocomplete

          }, // _required

          _defaultRegex = function () {

            var obj     = $.validation.rules[rule],
                pattern = false,
                value   = $input.val();

            // @TODO: Don't know what this rule is, but abort if undefined. - has to do with tdo above about extra rules
            if ( !obj || typeof obj !== 'object' ) {
              return;
            }
            
            if ( $input.hasClass('autocomplete') ) {
              value = $input.autocomplete('delimited');
            }

            pattern = obj.regex;

            if (!pattern) {
              return;
            }

            if (rule === 'Html') {
              error = pattern.test( value );
            }
            else {
              error = !pattern.test( value );
            }

            if ( error ) {
              prompt_text += '<li>' + obj.alertText + '</li>';
            }

          }, // _defaultRegex

          _confirm = function() {
          
            var confirm_field_id = rules[ inc+1 ],
                $label           = $('label[for=' + confirm_field_id + ']'),
                msg              = ( $label.length ) ?
                                   'The ' + $label.text().toLowerCase() + 's you entered do not match' :
                                   $.validation.rules.confirm.alertText;
                                   
            if( $input.val() !== $("#"+confirm_field_id).val() ) {
              error        = true;
              prompt_text += '<li>' + msg + '</li>';
            }

          }, // _confirm

          _length = function() {

            var startLength = +rules[ inc + 1 ],
                endLength   = +rules[ inc + 2 ],
                fieldLength = $input.val().length;

            if ( fieldLength<startLength || fieldLength>endLength ){
              error = true;
              prompt_text += '<li>' + $.validation.rules.length.alertText+startLength+$.validation.rules.length.alertText2+endLength+$.validation.rules.length.alertText3 + '</li>';

            }

          }, // _length

          _minCheckbox = function() {      // VALIDATE CHECKBOX NUMBER

            var nbCheck   = +rules[ inc + 1 ],
                groupSize = $("input[name="+input_name+"]:checked").length;

            if( groupSize > nbCheck ){
              error        = true;
              prompt_text += '<li>' + $.validation.rules.minCheckbox.alertText + '</li>';
            }
          }; // _minCheckbox
          
      if ( default_val === $input.val() ) {
        $input.val('');
      }
      
      for ( inc; inc < rules.length; ++inc ) {

        rule = rules[ inc ];

        switch ( rule ) {

          case "optional":

            // if there is no value and it's optional, no error
            if( !$input.val() ) {

              $.validation.closePrompt( $input );
              return error;

            }
            break;

          case "required":

            // Returns false on a blank failure, stop validation here
            if ( !_required() ) {
              inc = rules.length;
            }
            break;

          case "length":
             _length();
            break;
          case "minCheckbox":
             _minCheckbox();
            break;
          case "confirm":
             _confirm();
            break;

          default :
            // TODO: clean up for when matching rule is added - leaves extra parts in rules
            // console.log("checking: ", rules[ inc ] );
            _defaultRegex();
            break;

        } // switch rules

      } // for inc

      if ( error === true ) {
      
        $input.trigger( 'validation.inputfailure', [ prompt_text ] );
        

        // only show error if through form submission, not on blur
        if ( validate === 1 ) {

          // TODO: make this only run once per validation attempt
          $input.closest('form').trigger( 'saveFailure' );

          if ( !$("div.formError."+prompt_class).length ) {
            $form.data( 'validation' ).buildPrompt( $input, prompt_text );
          }
          else {
            $form.data( 'validation' ).updatePromptText( $input, prompt_text );
          }

        }
      } // error = true
      else {

        $.validation.closePrompt( $input );

      }
      
      if ( default_val && $input.val() === '' ) {
        $input.val( default_val );
      }

      return error || false;

    }, // validateRules

    // close when error is corrected
    closePrompt : function( $input ) {

      // TODO: see if this is actually needed, it should always be jqueryified by now
      $input = $($input);
      
      if ( $input.hasClass( 'autocomplete' ) ) {
        $input = $input.autocomplete( 'field' );
      }

      var input_type = $input.prop( 'type' ),
          class_attr = ( input_type === "radio" || input_type === "checkbox" ) ? 'name' : 'id',
          $formError = $(".formError."+ $input.attr( class_attr ) );
          
      $formError.fadeTo("fast",0,function(){
        $formError.remove();
      });

    }, // closePrompt

    // fires first thing on submit of form
    submitValidation : function( $form, scrolling ) {

      var stopForm        = false,
          $destination_el = false,
          destination     = '';

      $form.find("[class*=validate]:not(a)").each( function() {

        var error = $.validation.check( $(this), 1 );

        if ( error ) {
          stopForm = true;
        }

      });

      // error
      if( stopForm ) {

        if ( scrolling ) {
        
          $destination_el = $(".formError").first();

          if ( $destination_el.length  ) {

            destination = $destination_el.offset().top - 200;
            $.Core.scrollElement().animate({ scrollTop: destination}, 1100);

          }

        } // if scrolling

        return true;

      }

      // it's good
      return false;

    } // submitValidation

  }); // $.validation extend

  return $.validation;

}));
