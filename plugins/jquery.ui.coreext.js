$.ui.coreext = {
  _selectFirst : function(lis) {
  
    var i;
    
    if ( lis && lis.length) {
      for ( i=0;i<lis.length;i++) {
        if ($(lis[i]).is(':visible')) {
          $(lis[i]).addClass('keySelection');
          break;
        }
      }
    }
  },

  _selectLast : function(lis) {
  
    var i;
    
    if ( lis && lis.length ) {
      for (i=lis.length-1;i>=0;i--) {
        if ($(lis[i]).is(':visible')) {
          $(lis[i]).addClass('keySelection');
          break;
        }
      }
    }
  },

  _decidePreviousKeySelection : function(container,lis, css_rule) {
    var previousLI, maxScroll, _selectLast,
        keySelection = $(container).find('.keySelection');

    if (keySelection) {
      keySelection.removeClass('keySelection');
      previousLI = keySelection.prev(css_rule);
      
      while (previousLI && previousLI.length > 0 && (!$(previousLI).is(':visible') || $.inArray(previousLI[0], lis) === -1)) {
        previousLI = previousLI.prev(css_rule) || false;
      }

      if (previousLI.length) {
        previousLI.addClass('keySelection');
        this._scrollUp(container, previousLI);
      } 
    } 
    
    _selectLast = (!keySelection.length || !previousLI.length) ? true : false;
    if (_selectLast) {
      this._selectLast(lis);
      maxScroll = $(container)[0].scrollHeight-$(container).height();
      if (maxScroll > 1) {
        $(container)[0].scrollTop = 10000;
      }
    }
  },

  _decideNextKeySelection : function(container,lis, css_rule) {
    var nextLI, _selectFirst, maxScroll,
        keySelection = $(container).find('.keySelection');

    if (keySelection.length === 1) {
      keySelection.removeClass('keySelection');
      nextLI = keySelection.next(css_rule);

      while (nextLI && nextLI.length > 0 && (!$(nextLI).is(':visible') || $.inArray(nextLI[0], lis) === -1)) {
        nextLI = nextLI.next(css_rule) || false;
      }

      if (nextLI) {
        nextLI.addClass('keySelection');
        this._scrollDown(container, nextLI);
        
      } 
    } 
    
    _selectFirst = (!keySelection.length || !nextLI.length) ? true : false;

    if (_selectFirst) {

      this._selectFirst(lis);
      maxScroll = $(container)[0].scrollHeight-container.height();
      if (maxScroll > 1) {
        $(container)[0].scrollTop = 0;
      }
    }
  },
  _scrollDown : function(container, scrollToElement) {
    var $scrollToElement = $(scrollToElement),
        scrollTop        = $(container)[0].scrollTop,
        maxScroll        = $(container)[0].scrollHeight-$(container).height(),
        scrollElHeight   = $scrollToElement.height(),
        scrollELHeight2  = scrollElHeight * 2;
        
    if (maxScroll > 1) {
      while (scrollTop <= maxScroll && $scrollToElement.is(':visible') && $scrollToElement.offset().top+scrollELHeight2 > $(container).parent().offset().top+$scrollToElement.parent().height()) {
        scrollTop                 = scrollTop+1;
        $(container)[0].scrollTop = scrollTop;
      }
    }

  },

  _scrollUp : function(container, scrollToElement) {
    var $scrollToElement = $(scrollToElement),
        scrollTop        = $(container)[0].scrollTop,
        maxScroll        = $(container)[0].scrollHeight-$(container).height();
    
    if (maxScroll > 1) {
      while ( $scrollToElement.offset().top < $(container).parent().offset().top && $scrollToElement.is(':visible') ) {
        scrollTop                 = scrollTop-1;
        $(container)[0].scrollTop = scrollTop;
      }
    }
  }
};

$.extend( $.ui.keyCode, {
  COLON: 59,
  SEMICOLON: 59
});