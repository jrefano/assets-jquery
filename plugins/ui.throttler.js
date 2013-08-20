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
    
    _setNewValue : function(e) { 
    
      var $this = $(this),
          val = $this.val();
      
      if ( !e.data.options.allow_bars ) {
        val = val.replace(/\|/g,' ');
        $this.val(val);
      }
      
      e.data._currentValue = val;
      if (e.data._canRun) {
        e.data._runFunc(e);
      }
      e.data._setTimer();
      
    },
    
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
      
      if( !$(this.element).is(':disabled') ) {
        $(this.element).val('');
      }
      
    },
    
    currentValue : function() {
      return this._currentValue;
    }
    
  }));
  
  
})(jQuery); 