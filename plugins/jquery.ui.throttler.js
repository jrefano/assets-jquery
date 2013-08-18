(function($) {

  $.widget("ui.throttler", $.extend({}, {
  
    options : {
      delay      : 250,
      allow_bars : true
    },
    
    _canRun : true,
    _currentValue : '',
    
    _init : function() {
      this.element.bind('keyup',this,this._setNewValue);
      return this.element;
      
    },
    
    _setNewValue : function( e ) { 
    
      // prevent non-value keys from adding value
      switch ( e.keyCode ) {
      
        case $.ui.keyCode.ALT :
        case $.ui.keyCode.CAPS_LOCK :
        case $.ui.keyCode.COMMAND :
        case $.ui.keyCode.COMMAND_LEFT :
        case $.ui.keyCode.COMMAND_RIGHT :
        case $.ui.keyCode.CONTROL :
        case $.ui.keyCode.DOWN :
        case $.ui.keyCode.END :
        case $.ui.keyCode.ENTER :
        case $.ui.keyCode.ESCAPE :
        case $.ui.keyCode.HOME :
        case $.ui.keyCode.INSERT :
        case $.ui.keyCode.LEFT :
        case $.ui.keyCode.MENU :
        case $.ui.keyCode.NUMPAD_ENTER :
        case $.ui.keyCode.PAGE_DOWN :
        case $.ui.keyCode.PAGE_UP :
        case $.ui.keyCode.RIGHT :
        case $.ui.keyCode.SHIFT :
        case $.ui.keyCode.TAB :
        case $.ui.keyCode.UP :
        case $.ui.keyCode.WINDOWS :
          return;
      
      
      } // switch e.keyCode
    
      var $this    = $(this),
          val      = $this.val(),
          orig_val = val;
      
      if ( !e.data.options.allow_bars ) {
        val = val.replace(/\|/g,' ');
        
        if ( val !== orig_val ) {
          $this.val(val);
        }

      }
      
      e.data._currentValue = val;
      if (e.data._canRun) {
        e.data._runFunc(e);
      }
      
      e.data._setTimer();
      
    }, // _setNewValue
    
    _setTimer : function() {
      var el=this.element,thisObj=this;
      clearTimeout(this._timer); 
      this._setCanRun(false);
      this._timer = setTimeout(function() {
                        thisObj._setCanRun(true);
                    }, this.options.delay);
      
    },
    _setCanRun : function(bool) {
      this._canRun = bool;
      if (this._lastValue != this._currentValue && bool) {
        this._runFunc(false);
      }
    },
    
    _runFunc : function(e) {
    
      if (this._currentValue == this._lastValue) {
        this.element.trigger('sameValue', e);
        return;
      }
      
      this._lastValue = this._currentValue;
      this.element.trigger('beforeRunFunction', e);
      this.element.trigger('runFunction', e);
      this.element.trigger('afterRunFunction', e);
    },
    
    reset : function() {

      this._lastValue = '';
      this._currentValue = '';
      $(this.element).val('');
      
    },
    
    currentValue : function() {
      return this._currentValue;
    }
    
  }));
  
  
})(jQuery); 