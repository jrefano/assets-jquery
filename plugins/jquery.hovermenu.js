(function($) {
  $.fn.hoverMenu = function( menuEl, passed_options) {

    var $window = $(window);

    passed_options = passed_options || {};

    return $.each( this, function( index ) {

      var $menuEl;

      if ( typeof( menuEl ) == 'string') {
        if ( menuEl == 'next' ) {
          $menuEl = $(this).next();
        }
      }
      else {
        $menuEl = $(menuEl);
      }

      if ( typeof($menuEl) != 'object' || !$menuEl.length || typeof($menuEl.offset) != 'function' ) {
        return;
      }

      var $this       = $(this),
          coordLimits = false,
          $title      = $menuEl.find('.tooltip-title'),
          options     = $.extend( {}, {

            container_position : 'static',
            alignment          : 'left',
            mode               : 'menu',
            submenu            : false,
            tolerance          : 0,
            always_refresh     : false,
            submenu_alignment  : 'right',
            vertical_alignment : 'bottom',
            submenu_top_offset : 0

          }, passed_options ),

      outOfToggle = function(e) {
        return (
             e.pageX - $window.scrollLeft() < ( coordLimits.toggleLeft - options.tolerance )   ||
             e.pageX - $window.scrollLeft() > ( coordLimits.toggleRight + options.tolerance )  ||
             e.pageY - $window.scrollTop() < ( coordLimits.toggleTop - options.tolerance )    ||
             e.pageY - $window.scrollTop() > ( coordLimits.toggleBottom + options.tolerance ) );
      },

      outOfMenu = function(e) {

        return (
             e.pageX - $window.scrollLeft() < ( coordLimits.menuLeft - options.tolerance )   ||
             e.pageX - $window.scrollLeft() > ( coordLimits.menuRight + options.tolerance )  ||
             e.pageY - $window.scrollTop() < ( coordLimits.menuTop - options.tolerance )    ||
             e.pageY - $window.scrollTop() > ( coordLimits.menuBottom + options.tolerance ) );
      },

      checkForSubmenu = function (m){
        return ( m.find('.hovermenu-hover').length > 0 );
      },

      closeMenu = function(e) {

        var o1 = outOfToggle(e),
            o2 = outOfMenu(e),
            c  = checkForSubmenu($menuEl);

        if ( o1 && o2 && !c ) {

            closeMenuAction();

          }

      },

      closeMenuAction = function() {
        $menuEl.hide();

        $this.removeClass('hovermenu-hover');
        $(document.body).unbind('mousemove.'+$this[0].id, closeMenu);
        $this.trigger('hovermenu.close', [ $menuEl ]);
      },

      setCoords = function() {

        var menuCoords      = {},
            toggleLeft      = false,
            toggleCoords    = $this.offset(),
            // scrollTop       = $window.scrollTop(),
            // scrollLeft      = $window.scrollLeft(),
            toggleTopBase   = ( options.container_position === 'static' ) ? $this.offset().top                  : 0,
            toggleTop       = ( options.vertical_alignment === 'bottom' ) ? $this.outerHeight() + toggleTopBase : toggleTopBase,
            toggleAlignBase = ( options.container_position === 'static' ) ? $this.offset().left                 : $this.position().left;

            switch ( options.alignment ) {

              case 'corner_left' :
                toggleLeft = toggleAlignBase - $menuEl.outerWidth();
                break;

              case 'right' :
                toggleLeft = toggleAlignBase + $this.outerWidth() - $menuEl.outerWidth();
                break;

              case 'center' :
                toggleLeft = toggleAlignBase - ( Math.abs( $this.outerWidth() - $menuEl.outerWidth() ) / 2 );

                // If not static, position was used so margins would impact here
                if( options.container_position !== 'static' ) {
                  toggleLeft = toggleLeft + parseInt( $this.css( 'marginLeft' ), 10 );
                }

                break;

              case 'left' :
                toggleLeft = toggleAlignBase;
                break;

              default :
                toggleLeft = toggleAlignBase;
                break;

            } // options.alignment

            if ( options.submenu === true ) {

              toggleTop  = ( options.container_position == 'static' ) ? toggleTopBase                         : $this.position().top + $this.outerHeight();
              toggleLeft = ( options.submenu_alignment == 'right' )   ? toggleAlignBase + $this.outerWidth()  : toggleAlignBase - $menuEl.outerWidth();

              toggleTop += options.submenu_top_offset;

            } // options.submenu = true

        $menuEl.css({ left : toggleLeft + 'px', top : toggleTop + 'px' });

        menuCoords = $menuEl.offset();

        coordLimits = {
          menuLeft	   : menuCoords.left,
          menuRight	   : menuCoords.left + $menuEl.outerWidth(),
          menuTop	     : menuCoords.top,
          menuBottom   : menuCoords.top + $menuEl.outerHeight(),
          toggleLeft	 : toggleCoords.left, // - scrollLeft,
          toggleRight	 : toggleCoords.left + $this.outerWidth(), // - scrollLeft,
          toggleTop	   : toggleCoords.to, // - scrollTop,
          toggleBottom : toggleCoords.top + $this.outerHeight(), // - scrollTop
        };

      },

      openMenu = function() {

        $menuEl.show();
        $this.addClass('hovermenu-hover');

        if ( !coordLimits || options.always_refresh ) {
          setCoords();
        }

        $(document.body).bind('mousemove.'+$this[0].id, closeMenu);
        $this.trigger('hovermenu.open', [ $menuEl ]);

      };


      if ( !this.id ) {
        this.id = "tooltip-hovermenu-" + index + "-" + Math.round( Math.random()*100000 );
      }

      if ( $title.length && $title.html() == '' ) {
        $title.remove();
      }

      if ( options.submenu === true ){
        $this.addClass('hovermenu-has_submenu');
      }


      if( $this.hasClass('onclick') ){
        $this.click(openMenu);
      }

      else {
        $this.mouseover(openMenu);
      }

      this.setCoords   = setCoords;
      this.closeAction = closeMenuAction;


      $(window).bind('resize', function() {
        coordLimits = false;

      });

      if ( options.mode == 'tooltip' ) {
        $menuEl.wrapInner('<div class="tooltip-content drop-shadow" />')
               .append( $('<div class="tooltip-nub tooltip-nub-top tooltip-nub-top-image arrow" />') );
      }



    }); // each

  };
})(jQuery);
