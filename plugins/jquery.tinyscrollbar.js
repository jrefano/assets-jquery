/*
 * Behanced Tiny Scrollbar 0.92
 * 2/29/2012
 *
 * Based on original Tiny Scrollbar by Maarten Baijs
 *
 */

(function() {
  var timeouts = [], 
      messageName = "zero-timeout-message",
      hasPostMessage = (
        typeof window.postMessage === "function" &&
        typeof window.addEventListener === "function"
        );

  // Like setTimeout, but only takes a function argument.  There's
  // no time argument (always zero) and no arguments (you have to
  // use a closure).
  function setZeroTimeout(fn) {
    timeouts.push(fn);
    window.postMessage(messageName, "*");
  }

  function handleMessage(event) {
    if (event.source == window && event.data == messageName) {
      event.stopPropagation();
      if (timeouts.length > 0) {
        var fn = timeouts.shift();
        fn();
      }
    }
  }

  if ( hasPostMessage ) {
    window.addEventListener("message", handleMessage, true);
  }

  // Add the one thing we want added to the window object.
  window.setZeroTimeout = (hasPostMessage ? setZeroTimeout : function(fn) {window.setTimeout(fn,0);});
}());

/*!
 * Tiny Scrollbar 1.66
 * http://www.baijs.nl/tinyscrollbar/
 *
 * Copyright 2010, Maarten Baijs
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.opensource.org/licenses/gpl-2.0.php
 *
 * Date: 13 / 11 / 2011
 * Depends on library: jQuery
 * 
 */

(function($){
  var defaults = {
    axis: 'y',          // vertical or horizontal scrollbar? ( x || y ).
    wheel: 60,          // how many pixels the custom mousewheel handler scrolls at a time.
    scroll: false,      // enable or disable the custom mousewheel handler;
    rigid: true,       // whether or not the content has dynamic size
    size: 'auto',       // set the size of the scrollbar to auto or a fixed number.
    sizethumb: 'auto',  // set the size of the thumb to auto or a fixed number.
    wait: 1000,         // number of ms to wait before calling the scroll stop callback
    update: 0           // number of ms for setInterval of update
  },
  html = '<div class="be-scroll-container"><div class="be-scrollbar"><div class="be-track"><div class="be-thumb"></div></div></div><div class="be-viewport"><div class="be-content"></div></div>';

function Scrollbar(root, options){
  var oSelf = this,
      oWrapper = root,
      oViewport = { obj: $('>.be-viewport', root) },
      oScrollbar = { obj: $('>.be-scrollbar', root) },
      oContent = { obj: $('>.be-content', oViewport.obj) },
      oTrack = { obj: $('.be-track', oScrollbar.obj) },
      oThumb = { obj: $('.be-thumb', oScrollbar.obj) },
      sAxis = options.axis == 'x', sDirection = sAxis ? 'left' : 'top', sSize = sAxis ? 'Width' : 'Height',
      sScroll = 'scroll'+sDirection.charAt(0).toUpperCase()+sDirection.slice(1),
      iScroll, iPosition = { start: 0, now: 0 }, iMouse = {}, dragging = false,

      alarm = {
        remind: function(f) {
          f();
          delete this.timeoutID;
        },

        setup: function(callback) {
          this.cancel();
          var self = this;
          this.timeoutID = setTimeout(function() {self.remind(callback);}, options.wait);
        },

        cancel: function() {
          if(typeof this.timeoutID == "number") {
            clearTimeout(this.timeoutID);
            delete this.timeoutID;
          }
        }
      };

  function style() {
    oWrapper.parent().triggerHandler('scroll.tiny', { 
      hasOverflow: oSelf.hasOverflow(), 
      scrollRatio: oSelf.getScrollRatio() 
    });
    oScrollbar.obj.addClass('scrolling');
    oWrapper.parent().addClass('scrolling-container');
    alarm.setup(function(){ 
      oScrollbar.obj.removeClass('scrolling'); 
      oWrapper.parent().removeClass('scrolling-container');
    });
  }
  function setSize(){
    oThumb.obj.css(sDirection, iScroll / oScrollbar.ratio);
    //oContent.obj.css(sDirection, -iScroll);
    oViewport.obj[0][sScroll] = iScroll;
    iMouse.start = oThumb.obj.offset()[sDirection];
    var sCssSize = sSize.toLowerCase(), sShim = sAxis ? 'height' : 'width';
    oScrollbar.obj.css(sCssSize, oTrack[options.axis]);
    oTrack.obj.css(sCssSize, oTrack[options.axis]);
    oThumb.obj.css(sCssSize, oThumb[options.axis]);
  }
  function wheel(oEvent){
    if (oContent.ratio < 1){
      oEvent = oEvent || window.event;
      var iDelta = oEvent.wheelDelta ? oEvent.wheelDelta/120 : -oEvent.detail/3;
      iScroll -= iDelta * options.wheel;
      iScroll = Math.min((oContent[options.axis] - oViewport[options.axis]), Math.max(0, iScroll));
      oThumb.obj.css(sDirection, iScroll / oScrollbar.ratio);
      //oContent.obj.css(sDirection, -iScroll);
      oViewport.obj[0][sScroll] = iScroll;
      oScrollbar.obj.addClass('scrolling');
      style();

      if ( !$.support.changeBubbles ) {
        oEvent = $.event.fix(oEvent);
      }
      oEvent.preventDefault();
    }
  }
  function drag(oEvent){
    if (oContent.ratio < 1){
      iPosition.now = Math.min((oTrack[options.axis] - oThumb[options.axis]), Math.max(0, (iPosition.start + ((sAxis ? oEvent.pageX : oEvent.pageY) - iMouse.start))));
      iScroll = iPosition.now * oScrollbar.ratio;
      oThumb.obj.css(sDirection, iPosition.now);
      //oContent.obj.css(sDirection, -iScroll);
      oViewport.obj[0][sScroll] = iScroll;
      style();
    }
    return false;
  }
  function scroll(oEvent){
    var local = this;
    if ( oContent.ratio < 1 ){
      window.setZeroTimeout( function() {
        var u = oContent[options.axis] - oViewport[options.axis];
        iScroll = local[sScroll]; // slowest part: DOM access reading scrollTop/Left
        iScroll = (iScroll < 0 ? 0 : iScroll);
        iScroll = (iScroll > u ? u : iScroll);
        oThumb.obj.css(sDirection, iScroll / oScrollbar.ratio);
        style();
      });
    }
    return false;
  }
  function end(oEvent){
    oSelf.dragging = false;
    $(document).unbind('mousemove', drag);
    $(document).unbind('mouseup', end);
    oThumb.obj.unbind('mouseup', end);
    document.ontouchmove = oThumb.obj[0].ontouchend = document.ontouchend = null;
    return false;
  }
  function start(oEvent){
    oSelf.dragging = true;
    iMouse.start = sAxis ? oEvent.pageX : oEvent.pageY;
    var oThumbDir = parseInt(oThumb.obj.css(sDirection), 10);
    iPosition.start = oThumbDir == 'auto' ? 0 : oThumbDir;
    $(document).bind('mousemove', drag);
    document.ontouchmove = function(oEvent){
      $(document).unbind('mousemove');
      drag(oEvent.touches[0]);
    };
    $(document).bind('mouseup', end);
    oThumb.obj.bind('mouseup', end);
    oThumb.obj[0].ontouchend = document.ontouchend = function(oEvent){
      $(document).unbind('mouseup');
      oThumb.obj.unbind('mouseup');
      end(oEvent.touches[0]);
    };
    return false;
  }
  function setEvents(){
    oThumb.obj.bind('mousedown', start);
    oThumb.obj[0].ontouchstart = function(oEvent){
      oEvent.preventDefault();
      oThumb.obj.unbind('mousedown');
      start(oEvent.touches[0]);
      return false;
    };
    oTrack.obj.bind('mouseup', drag);
    if(options.scroll && this.addEventListener){
      oWrapper[0].addEventListener('DOMMouseScroll', wheel, false);
      oWrapper[0].addEventListener('mousewheel', wheel, false );
    }
    else if(options.scroll){oWrapper[0].onmousewheel = wheel;}
    oViewport.obj.bind('scroll', scroll);
  }
  function teardown() {
    window.clearInterval(oSelf.interval);
    oWrapper.unbind('destroyed', teardown);
  }
  function initialize() {	
    oSelf.update();
    setEvents();
    if (options.update && options.update > 0) {
      oSelf.interval=window.setInterval(function(){
        if (oSelf.dragging) { return; }
        oSelf.update('relative');
      }, options.update);
      oWrapper.bind('destroyed', teardown);
    }
    return oSelf;
  }
    
  this.update = function update(sOpt){
    var sShim = sAxis ? 'height' : 'width';
    if (options.rigid) {
      oWrapper.width( oWrapper.parent().width() ).height( oWrapper.parent().height() );
      oContent.obj.css(sShim, oWrapper[sShim]());
    }
    oViewport[options.axis] = oViewport.obj[0]['client'+ sSize];
    oContent[options.axis] = oContent.obj[0]['scroll'+ sSize];
    oContent.ratio = oViewport[options.axis] / oContent[options.axis];
    oViewport.obj.css(sShim, oWrapper[sShim]() + (options.rigid || oContent.ratio < 1 ? oSelf.constructor[sShim] : 0 ));
    oScrollbar.obj.toggleClass('disable', oContent.ratio >= 1);
    if (oSelf.dragging) { end(); }
    oWrapper[ oContent.ratio < 1 ? 'addClass' : 'removeClass' ]('has-scrollbar');
    oTrack[options.axis] = options.size == 'auto' ? oViewport[options.axis] : options.size;
    oThumb[options.axis] = Math.min(oTrack[options.axis], Math.max(0, ( options.sizethumb == 'auto' ? (oTrack[options.axis] * oContent.ratio) : options.sizethumb )));
    oScrollbar.ratio = options.sizethumb == 'auto' ? (oContent[options.axis] / oTrack[options.axis]) : (oContent[options.axis] - oViewport[options.axis]) / (oTrack[options.axis] - oThumb[options.axis]);
    iScroll = (sOpt == 'relative' && oContent.ratio <= 1) ? Math.min((oContent[options.axis] - oViewport[options.axis]), Math.max(0, iScroll)) : 0;
    iScroll = (sOpt == 'bottom' && oContent.ratio <= 1) ? (oContent[options.axis] - oViewport[options.axis]) : isNaN(parseInt(sScroll, 10)) ? iScroll : parseInt(sScroll, 10);
    setSize();
  };

  this.hasOverflow = function() {
    return (oContent[options.axis] - oViewport[options.axis]) > 0;
  };

  this.getRemaining = function() {
    return oContent[options.axis] - oViewport[options.axis] - iScroll;
  };

  this.getScrollRatio = function() {
    return iScroll / (oContent[options.axis] - oViewport[options.axis]);
  };

  this.destroy = function() {
    teardown();
    var children = oContent.obj.children().detach();
    oWrapper
      .parent().removeData('tsb').end()
      .replaceWith(children);
  };

  return initialize();
} // Scrollbar

$.fn.tinyscrollbar = function(options) { 
  if (this.data('tsb')) {
    if (options === "destroy") {
      this.data('tsb').destroy();
      return;
    }
    this.data('tsb').update(options);
    return this;
  }
  if (!Scrollbar.width) {
    var shim = $('<div style="width:100px;height:100px;overflow:scroll;visibility:hidden;top:0;left:0;position:absolute"><div style="width:100%;height:100%"></div></div>').appendTo(document.body);
    Scrollbar.width = shim.width()-shim.children().width();
    Scrollbar.height = shim.height()-shim.children().height() || Scrollbar.width;
    shim.remove();
  }
  if ( ( typeof window.hasOwnProperty === 'function' && window.hasOwnProperty('ontouchstart') ) || (window.DocumentTouch && document instanceof DocumentTouch)) {
    // mobile
    this.css({ 'overflow-y' : 'scroll', '-webkit-overflow-scrolling' : 'touch'  });
    return this;
  }
  options = $.extend({}, defaults, options);
  this.each(function(){
    var $elem = $(this), $children = $elem.children().detach();
    $elem.data('tsb', new Scrollbar(
        $(html).appendTo( $elem )
        .find('.be-content').append($children).end(), options));
  });
  return this;
}; // $.fn.tinyscrollbar

}(jQuery));
