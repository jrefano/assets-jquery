/*
==========================================================================================================
DO NOT USE ON NEW CODE.
DO NOT USE ON NEW CODE.
DO NOT USE ON NEW CODE.
DO NOT USE ON NEW CODE.
==========================================================================================================
*/
/*
==========================================================================================================
DO NOT USE ON NEW CODE.
DO NOT USE ON NEW CODE.
DO NOT USE ON NEW CODE.
DO NOT USE ON NEW CODE.
==========================================================================================================
*/
/*
==========================================================================================================
DO NOT USE ON NEW CODE.
DO NOT USE ON NEW CODE.
DO NOT USE ON NEW CODE.
DO NOT USE ON NEW CODE.
==========================================================================================================
*/
/*
==========================================================================================================
DO NOT USE ON NEW CODE.
DO NOT USE ON NEW CODE.
DO NOT USE ON NEW CODE.
DO NOT USE ON NEW CODE.
==========================================================================================================
*/

$(document).ready(function($) {
  $.validationRules = {


    "Generic":{"regex":"/^[^\\<\\>]+$/g",
"alertText":"This field may not contain less than signs (&lt) or greater than signs (&gt;)"},
"AlphaNumeric":{"regex":"/^[0-9A-Za-z\\u00C0-\\u00FF\\u0100-\\u0259\\u0386\\u0388-\\u04E9\\u05D0-\\u06D3\\u1E80-\\u200F]+$/g",
"alertText":"This field must contain only alphanumeric characters"},
"Alpha":{"regex":"/^[A-Za-z\\u00C0-\\u00FF\\u0100-\\u0259\\u0386\\u0388-\\u04E9\\u05D0-\\u06D3\\u1E80-\\u200F]+$/g",
"alertText":"This field must contain only alpha characters"},
"AlphaDash":{"regex":"/^[A-Za-z\\u00C0-\\u00FF\\u0100-\\u0259\\u0386\\u0388-\\u04E9\\u05D0-\\u06D3\\u1E80-\\u200F-]+$/g",
"alertText":"This field must contain only alpha characters or dashes"},
"ANDash":{"regex":"/^[0-9A-Za-z\\u00C0-\\u00FF\\u0100-\\u0259\\u0386\\u0388-\\u04E9\\u05D0-\\u06D3\\u1E80-\\u200F-]+$/g",
"alertText":"This field must contain only alphanumeric characters or dashes"},
"ANUnder":{"regex":"/^[0-9A-Za-z\\u00C0-\\u00FF\\u0100-\\u0259\\u0386\\u0388-\\u04E9\\u05D0-\\u06D3\\u1E80-\\u200F_]+$/g",
"alertText":"This field must contain only alphanumeric characters with or without underscores"},
"ANUSpace":{"regex":"/^[0-9A-Za-z\\u00C0-\\u00FF\\u0100-\\u0259\\u0386\\u0388-\\u04E9\\u05D0-\\u06D3\\u1E80-\\u200F_ ]+$/g",
"alertText":"This field must contain only alphanumeric characters with or without underscores and spaces"},
"ANEmail":{"regex":"/^([_\\dA-Za-z\\u00C0-\\u00FF\\u0100-\\u0259\\u0386\\u0388-\\u04E9\\u05D0-\\u06D3\\u1E80-\\u200F-]+|[A-Za-z0-9_\\.\\+-]+@[A-Za-z0-9_\\.-]+\\.[A-Za-z0-9_-]+)$/g",
"alertText":"This field must contain a valid username or email"},
"Integer":{"regex":"/^\\-?[0-9]+$/g",
"alertText":"This field must only contain numbers, without any spaces"},
"CreditCardNumber":{"regex":"/^[0-9]{13,16}$/g",
"alertText":"This field must only contain numbers, without any spaces or dashes"},
"Decimal":{"regex":"/^\\-?[0-9]+(\\.[0-9]+)?$/g",
"alertText":"This field must be a valid decimal number"},
"Date":{"regex":"/^[0-9]{1,2}\\-[0-9]{1,2}-[0-9][0-9][0-9][0-9]( [0-9][0-9]\\:[0-9][0-9]\\:[0-9][0-9])?$/g",
"alertText":"This field must be a valid date"},
"SqlDate":{"regex":"/^[0-9]{4,4}\\-[0-9]{2,2}\\-[0-9]{2,2}$/g",
"alertText":"This field must be a valid date"},
"SqlDateTime":{"regex":"/^[0-9]{4,4}\\-[0-9]{2,2}\\-[0-9]{2,2}\\s[0-9]{2,2}\\:[0-9]{2,2}\\:[0-9]{2,2}$/g",
"alertText":"This field must be a valid datetime"},
"SlashDate":{"regex":"/^[0-9]{1,2}\\/[0-9]{1,2}\\/[0-9][0-9][0-9][0-9]$/g",
"alertText":"This field must be a valid date"},
"Email":{"regex":"/^[A-Za-z0-9_\\.\\+-]+@[A-Za-z0-9_\\.-]+\\.[A-Za-z0-9_-]+$/g",
"alertText":"This field must be a valid email address"},
"Name":{"regex":"/^[\\wA-Za-z\\u00C0-\\u00FF\\u0100-\\u0259\\u0386\\u0388-\\u04E9\\u05D0-\\u06D3\\u1E80-\\u200F\'. -]{2,50}$/g",
"alertText":"This field must be a valid name"},
"Username":{"regex":"/^[A-Za-z0-9_-]{3,}$/g",
"alertText":"This field contains invalid characters. Please use only letters, numbers, dash or underscore characters."},
"Password":{"regex":"/^\\S{6,32}$/g",
"alertText":"This field must be between 6 and 32 characters"},
"Address":{"regex":"/^[\\w0-9A-Za-z\\u00C0-\\u00FF\\u0100-\\u0259\\u0386\\u0388-\\u04E9\\u05D0-\\u06D3\\u1E80-\\u200F# \' \\.\\,\\&-]+$/g",
"alertText":"This field must be a valid address"},
"City":{"regex":"/^[\\wA-Za-z\\u00C0-\\u00FF\\u0100-\\u0259\\u0386\\u0388-\\u04E9\\u05D0-\\u06D3\\u1E80-\\u200F \' \\. -]+$/g",
"alertText":"This field must be a valid city"},
"Province":{"regex":"/^[\\wA-Za-z\\u00C0-\\u00FF\\u0100-\\u0259\\u0386\\u0388-\\u04E9\\u05D0-\\u06D3\\u1E80-\\u200F ]+$/g",
"alertText":"This field must be a valid province"},
"IntZip":{"regex":"/^[A-Za-z0-9#\\. -]+$/g",
"alertText":"This field must be a valid zipcode"},
"UsZip":{"regex":"/^[0-9]{5,5}(\\-[0-9]{4,4})?$/g",
"alertText":"This field must be a valid US zipcode"},
"Country":{"regex":"/^[\\wA-Za-z\\u00C0-\\u00FF\\u0100-\\u0259\\u0386\\u0388-\\u04E9\\u05D0-\\u06D3\\u1E80-\\u200F\'. -]{2,50}$/g",
"alertText":"This field must be a valid country"},
"IntPhone":{"regex":"/^[0-9\\+ \\(\\)\\#-]+$/g",
"alertText":"This field must be a valid phone"},
"UsPhone":{"regex":"/^[0-9]{3,3}\\-[0-9]{3,3}\\-[0-9]{4,4}+$/g",
"alertText":"This field must be a valid US phone"},
"PicExt":{"regex":"/^((jpg)|(jpeg)|(png)|(gif)){1}$/g",
"alertText":"This field must be a valid image extension"},
"VideoExt":{"regex":"/^((mpg)|(mpeg)|(mov)|(avi)|(dv)|(qt)|(asf)|(flv)){1}$/g",
"alertText":"This field must be a valid video extension"},
"Url":{"regex":"/^(http(s)?:\\/\\/|www.)[^<>]*$/g",
"alertText":"This field must be a URL starting with http:// or www."},
"UrlExt":{"regex":"/^((?:https?):\\/\\/)?(?:(?:(?:[\\w\\.\\-\\+!$&\'\\(\\)*\\+,;=_]|%[0-9a-f]{2})+:)*(?:[\\w\\.\\-\\+%!$&\'\\(\\)*\\+,;=_]|%[0-9a-f]{2})+@)?(?:[A-Za-z0-9_\\-]+\\.)(?:[A-Za-z0-9\\-\\._])+(?::[0-9]+)?(?:[\\/|\\?](?:[\\w#!:\\.\\?\\+=&@$\'~*,;_\\/\\(\\)\\[\\]\\-]|%[0-9a-f]{2})*)?$/g",
"alertText":"This field must be a valid URL"},
"Html":{"regex":"/\\<((?!\\/?span|\\/?h1|\\/?h2|\\/?h3|\\/?h4|\\/?h5|\\/?h6|\\/?a|\\/?b|\\/?ol|\\/?ul|\\/?li|\\/?table|\\/?thead|\\/?tbody|\\/?th|\\/?tr|\\/?td|\\/?code|\\/?strong|\\/?i|\\/?em(?!bed)|\\/?p|\\?pre|\\/?div|\\/?br|\\/?unb|\\/?uni|\\/?\\s|\\/?\\>)[^\\>]*\\>)/ig",
"alertText":"This field must be properly formed HTML"},
"Twitter":{"regex":"/^[A-Za-z0-9_-]{1,15}$/g",
"alertText":"This field must be a valid twitter username (without the @ character)"},
    "required":{          // Add your regex rules here, you can take telephone as an example
      "regex":"none",
      "alertText":"This field is required",
      "alertTextCheckboxMultiple":"Please select an option",
      "alertTextCheckboxe":"This checkbox is required"},
    "length":{
      "regex":"none",
      "alertText":"Between ",
      "alertText2":" and ",
      "alertText3": " characters allowed"},
    "minCheckbox":{
      "regex":"none",
      "alertText":"Checks allowed Exceeded"},
    "confirm":{
      "regex":"none",
      "alertText":"Your field is not matching"}

  };
});
(function($) {

  $.fn.setValidationRules = function( new_rules ) {

    var setRules = function() {

      var classes = this.className.split(' '), i;

      for ( i=0;i<classes.length;++i ) {

        if ( classes[i].match(/validate\[[^\]+]/) ) {
          classes[i] = 'validate['+new_rules.join(',')+']';
        }

      }

      this.className = classes.join(' ');

    };

    $.each( this, _setRules );

  }; // setValidationRules

  $.fn.setValidationRequired = function( required ) {

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

  }; // setValidationRequired

  $.fn.validationEngine = function(settings) {

    var ajaxValidate, allRules, callerType, closingPrompt, getRules, pattern, result, rulesParsing, rulesRegExp, str;

    allRules = $.validationRules;

   settings = jQuery.extend({
    allrules         : allRules,
    promptPosition   : "topRight",  // OPENING BOX POSITION, IMPLEMENTED: topLeft, topRight, bottomLeft, centerRight, bottomRight
    mode             : "ajax",
    response         : function(){},
    success          : false,
    scrolling        : true,
    failure          : function() {}
  }, settings);

  $.validationEngine.ajaxValidArray =[];  // ARRAY FOR AJAX: VALIDATION MEMORY

  $(this).bind("submit", function(caller){   // ON FORM SUBMIT, CONTROL AJAX FUNCTION IF SPECIFIED ON DOCUMENT READY
    $.validationEngine.onSubmitValid = true;

    if($.validationEngine.submitValidation(this,settings) == false){
      if($.validationEngine.submitForm(this,settings) == true) {return false;}
    }else{
      settings.failure && settings.failure();
      return false;
    }
  })

    $(this).find("[class*=validate]:not(a)[type!=checkbox]").live("blur", function(caller){  _inlinEvent(this)   })
    $(this).find("[class*=validate]:not(a)[type=checkbox]").live("click", function(caller){    _inlinEvent(this)   })

    function _inlinEvent(caller){
    
      if ( caller.value ) {
        caller.value = $.trim( caller.value );
      }
    
      if($.validationEngine.intercept == false || !$.validationEngine.intercept){    // STOP INLINE VALIDATION THIS TIME ONLY
        $.validationEngine.onSubmitValid=false;
        $.validationEngine.loadValidation(caller,settings,2);
      }else{
        $.validationEngine.intercept = false;
      }
    };

    $(this).find("[class*=validate]:not(a)").each(function() {
      var $self    = $(this),
          self     = this,
          inputObj = $self.find('.autocomplete_field');


      inputObj.live("blur", function(){

        setTimeout(function() {

          $.validationEngine.onSubmitValid=false;
          $.validationEngine.loadValidation(self,settings,2);

        },250);

      });

    });


    $(this).find("[class*=validate]:not(a)").each(function() {

      var self = this;

      setTimeout(function() {
          $.validationEngine.loadValidation(self,settings, 0);
      }, 100 );

    });
    
    return $(this);
};

$.validationEngine = {

  handleResponse: function( params ) {

    if ( params.data && params.data.valid === 'yes') {

      if ( typeof( params.data.destination ) != 'undefined' && params.data.destination ) {
        window.location = params.data.destination;
      }

      return;

    } // valid data

    if ( params.data && params.data.errors ) {

      $.each( params.data.errors, function(key) {

        if ($('#' + key).length) {
          $.validationEngine.buildPrompt( $('#' + key), params.data.errors[key], 'loading' );
        }
        else {
          $.validationEngine.buildPrompt( params.form, params.data.errors[key], 'loading' );
        }

      });

    }
    
    if ( params.form ) {
      params.form.trigger('saveFailure');
    }

    $.validationEngine.settings.failure( params.data );

  },

  submitForm : function(caller){

    if ($.validationEngine.settings.success){  // AJAX SUCCESS, STOP THE LOCATION UPDATE
      $.validationEngine.settings.success && $.validationEngine.settings.success();
      return true;
    }
    return false;
  },
  buildPrompt : function(caller,promptText,type,ajaxed) {      // ERROR PROMPT CREATION AND DISPLAY WHEN AN ERROR OCCUR
    var divFormError     = document.createElement('div'),
        formErrorContent = document.createElement('div'),
        $caller          = $(caller);
        
    $(divFormError).addClass("formError");

    if(type == "pass"){ $(divFormError).addClass("greenPopup") }
    if(type == "load"){ $(divFormError).addClass("blackPopup") }
    if(ajaxed){ $(divFormError).addClass("ajaxed") }

    $(divFormError).addClass($caller.attr("id"))
    $(formErrorContent).addClass("formErrorContent").addClass("drop-shadow");

    $("body").append(divFormError)
    $(divFormError).append(formErrorContent)

    if($.validationEngine.showTriangle != false){    // NO TRIANGLE ON MAX CHECKBOX AND RADIO
      var arrow = document.createElement('div')
      $(arrow).addClass("formErrorArrow")
      $(divFormError).append(arrow)
      if($.validationEngine.settings.promptPosition == "bottomLeft" || $.validationEngine.settings.promptPosition == "bottomRight"){
      $(arrow).addClass("formErrorArrowBottom")
      $(arrow).html('<div class="line1">&nbsp;</div><div class="line2">&nbsp;</div><div class="line3">&nbsp;</div><div class="line4">&nbsp;</div><div class="line5">&nbsp;</div><div class="line6">&nbsp;</div><div class="line7">&nbsp;</div><div class="line8">&nbsp;</div>');
    }
      if($.validationEngine.settings.promptPosition == "topLeft" || $.validationEngine.settings.promptPosition == "topRight"){
        $(divFormError).append(arrow)
        $(arrow).html('<div class="line8">&nbsp;</div><div class="line7">&nbsp;</div><div class="line6">&nbsp;</div><div class="line5">&nbsp;</div><div class="line4">&nbsp;</div><div class="line3">&nbsp;</div><div class="line2">&nbsp;</div><div class="line1">&nbsp;</div>');
      }
    }
    $(formErrorContent).html('<ul>'+promptText+'</ul>')

    $caller = this.getVisibleCaller( $caller );

    callerTopPosition = $caller.offset().top;
    callerleftPosition = $caller.offset().left;
    callerWidth =  $caller.width()
    inputHeight = $(divFormError).height()

    /* POSITIONNING */
    if($.validationEngine.settings.promptPosition == "topRight"){callerleftPosition +=  callerWidth -30; callerTopPosition += -inputHeight -10; }
    if($.validationEngine.settings.promptPosition == "topLeft"){ callerTopPosition += -inputHeight -10; }

    if($.validationEngine.settings.promptPosition == "centerRight"){ callerleftPosition +=  callerWidth +13; }

    if($.validationEngine.settings.promptPosition == "bottomLeft"){
      callerHeight =  $caller.height();
      callerleftPosition = callerleftPosition;
      callerTopPosition = callerTopPosition + callerHeight + 15;
    }
    if($.validationEngine.settings.promptPosition == "bottomRight"){
      callerHeight =  $caller.height();
      callerleftPosition +=  callerWidth -30;
      callerTopPosition +=  callerHeight + 15;
    }
    $(divFormError).css({
      top:callerTopPosition,
      left:callerleftPosition,
      opacity:0
    })
    return $(divFormError).animate({"opacity":1},function(){return true;});
  },

  getVisibleCaller : function( $caller ) {

    // jquery only checks display, not visibility
    if ( ! $caller.is(':visible') || $caller.css('visibility') == 'hidden' || $caller.parent().hasClass('custom-checkbox') || $caller.parent().hasClass('custom-radio') ) {
      $caller = $caller.parent();
    }

    return $caller;

  },

  updatePromptText : function(caller,promptText,type,ajaxed) {  // UPDATE TEXT ERROR IF AN ERROR IS ALREADY DISPLAYED
    var $caller          = $(caller),
        updateThisPrompt = $caller.attr("id"),
        updateThisPrompt = ".formError."+updateThisPrompt;


    (type == "pass") ? $(updateThisPrompt).addClass("greenPopup") : $(updateThisPrompt).removeClass("greenPopup");
    (type == "load") ? $(updateThisPrompt).addClass("blackPopup") : $(updateThisPrompt).removeClass("blackPopup");
    (ajaxed) ? $(updateThisPrompt).addClass("ajaxed") : $(updateThisPrompt).removeClass("ajaxed");

    $(updateThisPrompt).find(".formErrorContent").html('<ul>'+promptText+'</ul>');

    $caller = this.getVisibleCaller( $caller );


    callerTopPosition  = $caller.offset().top;
    inputHeight = $(updateThisPrompt).height()

    if($.validationEngine.settings.promptPosition == "bottomLeft" || $.validationEngine.settings.promptPosition == "bottomRight"){
      callerHeight =  $caller.height()
      callerTopPosition =  callerTopPosition + callerHeight + 15
    }
    if($.validationEngine.settings.promptPosition == "centerRight"){  callerleftPosition +=  callerWidth +13;}
    if($.validationEngine.settings.promptPosition == "topLeft" || $.validationEngine.settings.promptPosition == "topRight"){
      callerTopPosition = callerTopPosition  -inputHeight -10
    }

  },

  loadValidation : function(caller,settings,validate) {    // GET VALIDATIONS TO BE EXECUTED

    $.validationEngine.settings = settings
    rulesParsing = $(caller).attr('class');
    rulesRegExp = /validate\[(.*)\]/;
    getRules = rulesRegExp.exec(rulesParsing);
    str = getRules[1]
    pattern = /\W+/;
    result= str.split(pattern);

    if ( validate ) {
      var validateCalll = $.validationEngine.validateCall(caller,result, validate)
      return validateCalll
    }

    return true;

  },

  validateCall : function(caller,rules, validate) {  // EXECUTE VALIDATION REQUIRED BY THE USER FOR THIS FIELD
    var promptText =""
    var prompt = $(caller).attr("id");
    var caller = caller;
    ajaxValidate = false
    var callerName = $(caller).attr("name");
    $.validationEngine.isError = false;
    $.validationEngine.showTriangle = true
    callerType = $(caller).prop("type");

    for (i=0; i<rules.length;++i){
      switch (rules[i]){
      case "optional":
        if(!$(caller).val()){
          $.validationEngine.closePrompt(caller)
          return $.validationEngine.isError
        }
      break;
      case "required":
        if ( ! _required(caller,rules) ) {   // Returns false on a blank failure, stop validation here
          i = rules.length;
        }
      break;
      case "custom":
         _customRegex(caller,rules,i);
      break;
      case "ajax":
        if(!$.validationEngine.onSubmitValid){
          _ajax(caller,rules,i);
        }
      break;
      case "length":
         _length(caller,rules,i);
      break;
      case "minCheckbox":
         _minCheckbox(caller,rules,i);
      break;
      case "confirm":
         _confirm(caller,rules,i);
      break;
      default :
        _defaultRegex(caller,rules[i]);
        //alert('Undefined Rule: ' + rules[i]);
        break;
      };
    };
    if ($.validationEngine.isError == true){
    
      // only show error if through form submission, not on blur
      if ( validate === 1 ) {
        radioHackOpen();
        if ($.validationEngine.isError == true){ // show only one
        
          $(caller).parents('form').trigger('saveFailure');
          
          ($("div.formError."+prompt).size() ==0) ? $.validationEngine.buildPrompt(caller,promptText,"error")  : $.validationEngine.updatePromptText(caller,promptText);
          
        }
      }
    }else{
      radioHackClose();
      $.validationEngine.closePrompt(caller);
    }
    /* UNFORTUNATE RADIO AND CHECKBOX GROUP HACKS */
    /* As my validation is looping input with id's we need a hack for my validation to understand to group these inputs */
    function radioHackOpen(){
      if($("input[name="+callerName+"]").size()> 1 && callerType == "radio") {    // Hack for radio group button, the validation go the first radio
        caller = $("input[name="+callerName+"]:first");
        $.validationEngine.showTriangle = false;
        var callerId ="."+ $(caller).attr("id");
        if($(callerId).size()==0){ $.validationEngine.isError = true; }else{ $.validationEngine.isError = false;}
      }
      if($("input[name="+callerName+"]").size()> 1 && callerType == "checkbox") {    // Hack for checkbox group button, the validation go the first radio
        caller = $("input[name="+callerName+"]:first");
        $.validationEngine.showTriangle = false;
        var callerId ="div."+ $(caller).attr("id");
        if($(callerId).size()==0){ $.validationEngine.isError = true; }else{ $.validationEngine.isError = false;}
      }
    }
    function radioHackClose(){
      if($("input[name="+callerName+"]").size()> 1 && callerType == "radio") {    // Hack for radio group button, the validation go the first radio
        caller = $("input[name="+callerName+"]:first");
      }
      if($("input[name="+callerName+"]").size()> 1 && callerType == "checkbox") {    // Hack for checkbox group button, the validation go the first radio
        caller = $("input[name="+callerName+"]:first");
      }
    }
    /* VALIDATION FUNCTIONS */
    function _required(caller,rules){   // VALIDATE BLANK FIELD

      var $caller    = $(caller),
          returnVal  = true,
          callerType = $caller.prop("type");

      if (callerType == "text" || callerType == "password" || callerType == "textarea"){

        if(!$caller.val()){
          $.validationEngine.isError = true;
          // promptText += $.validationEngine.settings.allrules[rules[i]].alertText+"<br />";
          promptText += '<li>' + $.validationEngine.settings.allrules[rules[i]].alertText + '</li>';
          returnVal   = false;
        }
      }
      if (callerType == "radio" || callerType == "checkbox" ){
        callerName = $caller.attr("name");

        if($("input[name="+callerName+"]:checked").size() == 0) {
          $.validationEngine.isError = true;
          if($("input[name="+callerName+"]").size() ==1) {
            // promptText += $.validationEngine.settings.allrules[rules[i]].alertTextCheckboxe+"<br />";
            promptText += '<li>' + $.validationEngine.settings.allrules[rules[i]].alertTextCheckboxe + '</li>';
          }else{
             // promptText += $.validationEngine.settings.allrules[rules[i]].alertTextCheckboxMultiple+"<br />";
             promptText += '<li>' + $.validationEngine.settings.allrules[rules[i]].alertTextCheckboxMultiple + '</li>';
          }
          
          returnVal = false;
          
        }
      }
      if ( caller.tagName == 'SELECT' ) { // added by paul@kinetek.net for select boxes, Thank you
          callerName = $caller.attr("id");

        if(!$("select[name="+callerName+"]").val()) {
          $.validationEngine.isError = true;
          // promptText += $.validationEngine.settings.allrules[rules[i]].alertText+"<br />";
          returnVal = false;
          promptText += '<li>' + $.validationEngine.settings.allrules[rules[i]].alertText + '</li>';
        }
      }

      if ($caller.hasClass('autocomplete')) {
        if ($caller.autocomplete('delimited') == '') {
          $.validationEngine.isError = true;
          returnVal = false;
          // promptText += $.validationEngine.settings.allrules[rules[i]].alertText+"<br />";
          promptText += '<li>' + $.validationEngine.settings.allrules[rules[i]].alertText + '</li>';
        }
      }
      
      return returnVal;
    }

    function _defaultRegex(caller,rule) {
      var error = false;
      obj = $.validationEngine.settings.allrules[rule];
      if ( obj == undefined ) return; // @TODO: Don't know what this rule is, but abort if undefined.

      pattern = eval(obj.regex);
      
      var $caller = $(caller);
      var value = $caller.attr('value');
      
      if ($caller.hasClass('autocomplete')) {
        value = $caller.autocomplete('delimited');
      }
      

      if (rule == 'Html') {
        error = pattern.test( value );
      }
      else {
        error = !pattern.test( value );
      }

      if (error) {
        $.validationEngine.isError = true;
        promptText += '<li>' + obj.alertText + '</li>';
      }
    }

    function _customRegex(caller,rules,position){     // VALIDATE REGEX RULES
      customRule = rules[position+1];
      pattern = eval($.validationEngine.settings.allrules[customRule].regex);

      if(!pattern.test($(caller).attr('value'))){
        $.validationEngine.isError = true;
        // promptText += $.validationEngine.settings.allrules[customRule].alertText+"<br />";
        promptText += '<li>' + $.validationEngine.settings.allrules[customRule].alertText + '</li>';
      }
    }
    function _ajax(caller,rules,position){         // VALIDATE AJAX RULES

      customAjaxRule = rules[position+1];
      postfile = $.validationEngine.settings.allrules[customAjaxRule].file;
      fieldValue = $(caller).val();
      ajaxCaller = caller;
      fieldId = $(caller).attr("id");
      ajaxValidate = true;
      ajaxisError = $.validationEngine.isError;

      /* AJAX VALIDATION HAS ITS OWN UPDATE AND BUILD UNLIKE OTHER RULES */
      if(!ajaxisError){
        $.ajax({
             type: "POST",
             url: postfile,
             async: true,
             data: "validateValue="+fieldValue+"&validateId="+fieldId+"&validateError="+customAjaxRule,
             beforeSend: function(){    // BUILD A LOADING PROMPT IF LOAD TEXT EXIST
               if($.validationEngine.settings.allrules[customAjaxRule].alertTextLoad){

                 if(!$("div."+fieldId)[0]){
                  return $.validationEngine.buildPrompt(ajaxCaller,$.validationEngine.settings.allrules[customAjaxRule].alertTextLoad,"load");
                }else{
                  $.validationEngine.updatePromptText(ajaxCaller,$.validationEngine.settings.allrules[customAjaxRule].alertTextLoad,"load");
                }
               }
             },
          success: function(data){          // GET SUCCESS DATA RETURN JSON
            data = eval( "("+data+")");        // GET JSON DATA FROM PHP AND PARSE IT
            ajaxisError = data.jsonValidateReturn[2];
            customAjaxRule = data.jsonValidateReturn[1];
            ajaxCaller = $("#"+data.jsonValidateReturn[0])[0];
            fieldId = ajaxCaller;
            ajaxErrorLength = $.validationEngine.ajaxValidArray.length
            existInarray = false;

              if(ajaxisError == "false"){      // DATA FALSE UPDATE PROMPT WITH ERROR;

                _checkInArray(false)        // Check if ajax validation alreay used on this field

                if(!existInarray){           // Add ajax error to stop submit
                  $.validationEngine.ajaxValidArray[ajaxErrorLength] =  new Array(2)
                  $.validationEngine.ajaxValidArray[ajaxErrorLength][0] = fieldId
                  $.validationEngine.ajaxValidArray[ajaxErrorLength][1] = false
                  existInarray = false;
                }

                $.validationEngine.ajaxValid = false;
              // promptText += $.validationEngine.settings.allrules[customAjaxRule].alertText+"<br />";
              promptText += '<li>' + $.validationEngine.settings.allrules[customAjaxRule].alertText + '</li>';
              $.validationEngine.updatePromptText(ajaxCaller,promptText,"",true);
             }else{
               _checkInArray(true)

               $.validationEngine.ajaxValid = true;
                if($.validationEngine.settings.allrules[customAjaxRule].alertTextOk){  // NO OK TEXT MEAN CLOSE PROMPT
                           $.validationEngine.updatePromptText(ajaxCaller,$.validationEngine.settings.allrules[customAjaxRule].alertTextOk,"pass",true);
                }else{
                  ajaxValidate = false;
                  $.validationEngine.closePrompt(ajaxCaller);
                }
              }
               function  _checkInArray(validate){
                 for(x=0; x < ajaxErrorLength;x++){
                    if($.validationEngine.ajaxValidArray[x][0] == fieldId){
                      $.validationEngine.ajaxValidArray[x][1] = validate
                      existInarray = true;

                    }
                  }
               }
           }
        });
      }
    }
    function _confirm(caller,rules,position){     // VALIDATE FIELD MATCH
    
      confirmField = rules[position+1];
    
      var $input = $(caller),
          $label = $('label[for=' + confirmField + ']'),
          msg    = ( $label.length ) ?
                   'The ' + $label.text().toLowerCase() + 's you entered do not match' :
                   $.validation.rules.confirm.alertText;

      if( $input.attr('value') != $("#"+confirmField).attr('value')){
        $.validationEngine.isError = true;
        // promptText += $.validationEngine.settings.allrules["confirm"].alertText+"<br />";
        promptText += '<li>' + msg + '</li>';
      }
    }
    function _length(caller,rules,position){        // VALIDATE LENGTH

      startLength = eval(rules[position+1]);
      endLength = eval(rules[position+2]);
      feildLength = $(caller).attr('value').length;

      if(feildLength<startLength || feildLength>endLength){
        $.validationEngine.isError = true;
        // promptText += $.validationEngine.settings.allrules["length"].alertText+startLength+$.validationEngine.settings.allrules["length"].alertText2+endLength+$.validationEngine.settings.allrules["length"].alertText3+"<br />"
        promptText += '<li>' + $.validationEngine.settings.allrules["length"].alertText+startLength+$.validationEngine.settings.allrules["length"].alertText2+endLength+$.validationEngine.settings.allrules["length"].alertText3 + '</li>';

      }
    }
    function _minCheckbox(caller,rules,position){      // VALIDATE CHECKBOX NUMBER

      nbCheck = eval(rules[position+1]);
      groupname = $(caller).attr("name");
      groupSize = $("input[name="+groupname+"]:checked").size();

      if(groupSize > nbCheck){
        $.validationEngine.isError = true;
        // promptText += $.validationEngine.settings.allrules["minCheckbox"].alertText+"<br />";
        promptText += '<li>' + $.validationEngine.settings.allrules["minCheckbox"].alertText + '</li>';
      }
    }
    return($.validationEngine.isError) ? $.validationEngine.isError : false;
  },

  closePrompt : function(caller,outside) {            // CLOSE PROMPT WHEN ERROR CORRECTED
    if(outside){
      $(caller).fadeTo("fast",0,function(){
        $(caller).remove();
      });
      return false;
    }
    if(!ajaxValidate){
      closingPrompt = $(caller).attr("id");

      var $formError = $(".formError."+closingPrompt);

      $formError.fadeTo("fast",0,function(){
        $formError.remove();
      });
    }
  },

  submitValidation : function(caller,settings) {          // FORM SUBMIT VALIDATION LOOPING INLINE VALIDATION
    var stopForm = false;
    $.validationEngine.settings = settings
    $.validationEngine.ajaxValid = true
    $(caller).find(".formError").remove();
    var toValidateSize = $(caller).find("[class*=validate]:not(a)").size();

    $(caller).find("[class*=validate]:not(a)").each(function(){
      callerId = $(this).attr("id")
      if(!$("."+callerId).hasClass("ajaxed")){  // DO NOT UPDATE ALREADY AJAXED FIELDS (only happen is no normal errors, don't worry)
        var validationPass = $.validationEngine.loadValidation(this,settings, 1);
        return(validationPass) ? stopForm = true : "";
      }
    });
    ajaxErrorLength = $.validationEngine.ajaxValidArray.length    // LOOK IF SOME AJAX IS NOT VALIDATE
    for(x=0; x < ajaxErrorLength; ++x){
       if($.validationEngine.ajaxValidArray[x][1] == false){
         $.validationEngine.ajaxValid = false
       }
     }
    if(stopForm || !$.validationEngine.ajaxValid){    // GET IF THERE IS AN ERROR OR NOT FROM THIS VALIDATION FUNCTIONS
      if (settings.scrolling) {

        if ( $(".formError:not('.greenPopup'):first").length  ) {
          destination = $(".formError:not('.greenPopup'):first").offset().top - 200;
          $.scrollElement().animate({ scrollTop: destination}, 1100);
        }

      }
      return true;
    }else{
      return false
    }
  }
}
})(jQuery);