$.fn.animateHeight = function( height, options ) {

  return this.each(function() {

    $(this).animate({
      height : height+'px'
    }, {

      duration : options.duration,
      queue    : options.queue,
      complete : options.complete

    });

    // For JS strict compliance
    return true;

  });

};


// makes it a plug-in
$.fn.clock = function( options ) {
  // make sure the object exists as an object if it does not exist
  var settings = {
        tickInterval : 1000,
        duration     : 250
      },
      initClock = function() {

        var $this         = $(this),  // jquery ref
            current       = [],       // current digits for each place
            nextIncrement = 0,        // how many milliseconds until next increment
            incrementTime = 0,        // keep track of how many seconds have passed since last update
            $clock        = [],
            rateOfChange  = $this[0].getAttribute( 'rateofchange' ),
            start_number  = $this[0].getAttribute( 'start_number' ),
            start_time    = $this[0].getAttribute( 'start_time' ),
            check_length  = start_number.length, // max amount of digits there are in this clock
            time_now      = Math.round( new Date().getTime() / 1000 ),
            actualStart   = parseInt( ( parseInt( start_number, 10 ) + parseInt( ( rateOfChange * ( time_now-start_time ) ), 10) ), 10 ),

            // takes in final number and sets up initial clock
            start = function( number ){
              current         = number.split('');
              var counter               = 0,
                  bg_counter            = 1,
                  leading_zero          = true,
                  html                  = '',
                  upper_half_back_html  = '',
                  lower_half_back_html  = '',
                  upper_half_front_html = '',
                  lower_half_front_html = '';

              // two digit implementation of plugin
              if (check_length === 2){
                // place the backgrounds
                upper_half_back_html  += '<img class="pngfix bg1 bg-up-back bg-up-back-2" src="/assets/img/facts/Up/bg2.png" />';
                lower_half_back_html  += '<img class="pngfix bg1 bg-down-back bg-down-back-2" src="/assets/img/facts/Down/bg2.png" />';
                lower_half_back_html  += '<img class="pngfix bg1 bg-down-back-static-2" src="/assets/img/facts/Down/bg2static.png" />';
                upper_half_front_html += '<img class="pngfix bg1 bg-up-front bg-up-front-2" src="/assets/img/facts/Up/bg2.png" />';
                lower_half_front_html += '<img class="pngfix bg1 bg-down-front bg-down-front-2" src="/assets/img/facts/Down/bg2.png" />';

                // place the digits over the bg
                for (counter = 0; counter < check_length; ++counter){
                  upper_half_back_html  += '<img class="pngfix clock clock-up-back clock-up-back-'+counter+'" src="/assets/img/facts/Up/'+current[counter]+'.png" />';
                  lower_half_back_html  += '<img class="pngfix clock clock-down-back clock-down-back-'+counter+'" src="/assets/img/facts/Down/'+current[counter]+'.png" />';
                  upper_half_front_html += '<img class="pngfix clock clock-up-front clock-up-front-'+counter+'" src="/assets/img/facts/Up/'+current[counter]+'.png" />';
                  lower_half_front_html += '<img class="pngfix clock clock-down-front clock-down-front-'+counter+'" src="/assets/img/facts/Down/'+current[counter]+'.png" />';
                }
              }
              else{
                if ( check_length % 3 === 2 ){
                  upper_half_back_html  += '<img class="pngfix bg'+bg_counter+' bg-up-back bg-up-back-2" src="/assets/img/facts/Up/bg2.png" />';
                  lower_half_back_html  += '<img class="pngfix bg'+bg_counter+' bg-down-back bg-down-back-2" src="/assets/img/facts/Down/bg2.png" />';
                  lower_half_back_html  += '<img class="pngfix bg'+bg_counter+' bg-down-back-static-2" src="/assets/img/facts/Down/bg2static.png" />';
                  upper_half_front_html += '<img class="pngfix bg'+bg_counter+' bg-up-front bg-up-front-2" src="/assets/img/facts/Up/bg2.png" />';
                  lower_half_front_html += '<img class="pngfix bg'+bg_counter+' bg-down-front bg-down-front-2" src="/assets/img/facts/Down/bg2.png" />';
                }
                for ( counter=0;counter<check_length;++counter ) {
                  // set spacers for where there are supposed to be commas
                  if ( (check_length - counter) % 3 === 0 && counter !== 0){
                      ++bg_counter;
                      upper_half_back_html  += '<img src="/assets/img/facts/spacer.png" class="pngfix spacer" />';
                      lower_half_back_html  += '<img src="/assets/img/facts/spacer.png" class="pngfix spacer" />';
                      upper_half_front_html += '<img src="/assets/img/facts/spacer.png" class="pngfix spacer" />';
                      lower_half_front_html += '<img src="/assets/img/facts/spacer.png" class="pngfix spacer" />';
                  }

                  if (current[counter] !== 0){
                    leading_zero = false;
                  }
                  if (leading_zero){
                    upper_half_back_html  += '<img class="pngfix bg'+bg_counter+' clock clock-up-back clock-up-back-'+counter+'" src="/assets/img/facts/spacer.png" />';
                    lower_half_back_html  += '<img class="pngfix bg'+bg_counter+' clock clock-down-back clock-down-back-'+counter+'" src="/assets/img/facts/spacer.png" />';
                    upper_half_front_html += '<img class="pngfix bg'+bg_counter+' clock clock-up-front clock-up-front-'+counter+'" src="/assets/img/facts/spacer.png" />';
                    lower_half_front_html += '<img class="pngfix bg'+bg_counter+' clock clock-down-front clock-down-front-'+counter+'" src="/assets/img/facts/spacer.png" />';
                  }
                  else{
                    upper_half_back_html  += '<img class="pngfix bg'+bg_counter+' clock clock-up-back clock-up-back-'+counter+'" src="/assets/img/facts/Up/'+current[counter]+'.png" />';
                    lower_half_back_html  += '<img class="pngfix bg'+bg_counter+' clock clock-down-back clock-down-back-'+counter+'" src="/assets/img/facts/Down/'+current[counter]+'.png" />';
                    upper_half_front_html += '<img class="pngfix bg'+bg_counter+' clock clock-up-front clock-up-front-'+counter+'" src="/assets/img/facts/Up/'+current[counter]+'.png" />';
                    lower_half_front_html += '<img class="pngfix bg'+bg_counter+' clock clock-down-front clock-down-front-'+counter+'" src="/assets/img/facts/Down/'+current[counter]+'.png" />';
                  }

                  if ( (check_length - counter) % 3 === 1 && counter > 1 ){
                    upper_half_back_html  += '<img class="pngfix bg'+bg_counter+' bg-up-back bg-up-back-3" src="/assets/img/facts/Up/bg3.png" />';
                    lower_half_back_html  += '<img class="pngfix bg'+bg_counter+' bg-down-back bg-down-back-3" src="/assets/img/facts/Down/bg3.png" />';
                    lower_half_back_html  += '<img class="pngfix bg'+bg_counter+' bg-down-back-static-3" src="/assets/img/facts/Down/bg3static.png" />';
                    upper_half_front_html += '<img class="pngfix bg'+bg_counter+' bg-up-front bg-up-front-3" src="/assets/img/facts/Up/bg3.png" />';
                    lower_half_front_html += '<img class="pngfix bg'+bg_counter+' bg-down-front bg-down-front-3" src="/assets/img/facts/Down/bg3.png" />';
                  }
                }
              }

              // generate html for the page within clock-wrapper div
              if (check_length === 3){
                html += '<div class="clock-container fix">';
              }
              else{
                html += '<div class="clock-container">';
              }

              html += '<div class="clock-half clock-half-upper clock-half-back"><img src="/assets/img/facts/spacer.png" class="pngfix spacer-first" />';

                html += upper_half_back_html;

              html += '</div>'; // upperHalfBack

              html += '<div class="clock-half clock-half-lower clock-half-back"><img src="/assets/img/facts/spacer.png" class="pngfix spacer-first" />';

                html += lower_half_back_html;

              html += '</div>'; // lowerHalfBack

              html += '<div class="clock-front">';

                html += '<div class="clock-half clock-half-upper clock-half-front"><img src="/assets/img/facts/spacer.png" class="pngfix spacer-first" />';

                  html += upper_half_front_html;

                html += '</div>'; // upperHalfFront

                html += '<div class="clock-half clock-half-lower clock-half-front"><img src="/assets/img/facts/spacer.png" class="pngfix spacer-first" />';

                  html += lower_half_front_html;

                html += '</div>'; // lowerHalfFront

              html += '</div>'; // clock-front

              html += '</div>';


              $this.html( html );

              $this[0].cacheReferenceElements();
            }; // start

        // function to animate numbers
        $this[0].flip = function( counter, last) {

          // set clock variables for each animated number and background

          if (counter < 0) {
            return;
          }

          var $clock_up_front   = $clock[counter].up_front.digit,
              $clock_up_back    = $clock[counter].up_back.digit,
              $clock_down_front = $clock[counter].down_front.digit,
              $clock_down_back  = $clock[counter].down_back.digit,
              $bg_up_front      = $clock[counter].up_front.bg,
              $bg_down_front    = $clock[counter].down_front.bg,
              pathUpper         = '/assets/img/facts/Up/',
              pathLower         = '/assets/img/facts/Down/',
              changeNumber      = current[counter],

              bg_downFrontComplete  = function(){
                $bg_down_front.height(0);
              },
              bg_upFrontComplete  = function(){
                $bg_down_front.height(0);
                $bg_up_front.height(0);
              },

              upFrontComplete   = function(){
                $bg_down_front.height(0);
                $bg_down_front.animateHeight(38,{
                  queue         : false,
                  duration      : settings.duration,
                  complete      : bg_downFrontComplete
                });

                $clock_down_front[0].setAttribute('src', pathLower + changeNumber + ".png");

                $clock_down_front.height(0);

                $clock_down_back.height(27);

                $clock_down_front.animateHeight(27, {
                  queue: false,
                  duration: settings.duration,
                  complete: function(){

                    $clock_down_back.height(0);

                    setTimeout( function() {
                      $clock_down_back[0].setAttribute('src', pathLower + changeNumber + ".png" );

                    }, 0 );

                    if (last === true){
                      $this.trigger("updateNextClock");
                    }

                  }
                });

                $clock_up_front[0].setAttribute('src', $clock_up_back[0].getAttribute('src'));

              };

          $clock_up_back[0].setAttribute('src', pathUpper + changeNumber + ".png");
          $clock_up_front.height(27);
          $clock_up_front.animateHeight(0,{
            queue         : false,
            duration      : settings.duration,
            complete      : upFrontComplete
          });
          $bg_up_front.height(38);
          $bg_up_front.animateHeight(0,{
            queue         : false,
            duration      : settings.duration,
            complete      : bg_upFrontComplete
          });

        }; // flip


        // increment the numbers
        $this[0].increment = function(incrementNumber){

          var checkingForZero = 0,
              leading_zero    = 0,
              counter         = check_length-1,
              bg_counter      = 0;

          for (checkingForZero = 0; checkingForZero < check_length; ++checkingForZero){
            if (current[checkingForZero] !== 0){
              leading_zero = checkingForZero;
              break;
            }
          }

          current[counter] = parseInt(current[counter], 10) + incrementNumber;

          // regular flipping
          if (check_length > 2){
            for (counter = check_length-1; counter >= 0; --counter){
              if (current[counter] > 9){
                // do carry over for math addition
                while (current[counter] > 9){
                  current[counter] = parseInt(current[counter], 10) - 10;
                  current[counter-1] = parseInt(current[counter-1], 10) + 1;
                }
                if (counter === 0){
                  $this[0].flip( counter , true );
                }
                else{
                  $this[0].flip( counter );
                }
                ++bg_counter;
                if (bg_counter > 2){
                  bg_counter = 0;
                }
              }
              else {
                if (current[counter] !== 0){

                  $this[0].flip( counter, true );

                  if (counter !== 0) {

                    if ( bg_counter === 0 ) {

                      $this[0].flip( counter-1  );
                      if ( counter > leading_zero ){
                        $this[0].flip( counter-2  );
                      }

                    } // bg_counter === 0

                    if ( bg_counter === 1 ) {

                      if ( counter > leading_zero ){
                        $this[0].flip( counter-1 );
                      }
                    } // if bg_counter === 1

                  } // coutner !== 0

                }
                break;
              } // else
            }
          }
          // special case for flipping clocks with length two
          else{
            while (current[1] > 9){
              current[1] = parseInt(current[1], 10) - 10;
              current[0] = parseInt(current[0], 10) + 1;
            }
            while (current[0] > 9){
              current[0] = parseInt(current[0], 10) - 10;
            }
            $this[0].flip( 1  );
            $this[0].flip( 0 , true );
          }
        }; // increment


        // check to see how much to increment by, increment the clock, then trigger animation of next clock
        $this[0].update = function(){

          if (nextIncrement === 0){
            $this.trigger("updateNextClock");
            return;
          }

          var now           = (new Date()).getTime(),
              increment     = 0,
              timeDiff      = now - incrementTime;

          if ( timeDiff > nextIncrement ) {

            while ( timeDiff > nextIncrement ) {
              timeDiff -= nextIncrement;
              increment += 1;
            }

            incrementTime = now + nextIncrement;
            $this[0].increment(increment);
          }
          else {
            $this.trigger("updateNextClock");
          }

        }; // update


        // cache the elements on the page before loading
        $this[0].cacheReferenceElements = function(){
          var counter,
              loc = function(){
                return {
                  digit:null,
                  bg:null,
                  flip:null
                };
              };
          for (counter = 0; counter < check_length; ++counter){
            $clock[counter] = {
                                up_front:loc(),
                                up_back:loc(),
                                down_front:loc(),
                                down_back:loc()
                              };

            $clock[counter].up_front.digit   = $($this.find( '.clock-up-front-'+counter ));
            $clock[counter].up_back.digit    = $($this.find( '.clock-up-back-'+counter ));
            $clock[counter].down_front.digit = $($this.find( '.clock-down-front-'+counter ));
            $clock[counter].down_back.digit  = $($this.find( '.clock-down-back-'+counter ));

            var bgCounter = Math.floor((counter-2)/3) + 2;
            $clock[counter].up_front.bg   = $($this.find( '.bg'+( bgCounter )+'.bg-up-front' ));
            $clock[counter].up_back.bg    = $($this.find( '.bg'+( bgCounter )+'.bg-up-back' ));
            $clock[counter].down_front.bg = $($this.find( '.bg'+( bgCounter )+'.bg-down-front' ));
            $clock[counter].down_back.bg  = $($this.find( '.bg'+( bgCounter )+'.bg-down-back' ));

            $clock[counter].up_front.flip    = false;
            $clock[counter].up_back.flip     = false;
            $clock[counter].down_front.flip  = false;
            $clock[counter].down_back.flip   = false;
          }
        }; // cacheReferenceElements

        // calculate how many milliseconds it takes until the next increment
        if ( rateOfChange !== 0 ){
          nextIncrement = 1000 / rateOfChange;
        }
        incrementTime = ( new Date() ).getTime() + nextIncrement;

        // add leading zeros to the final number, padding for empty backgrounds
        if ( check_length === 2 ){
          actualStart = actualStart % 100;
        }
        else if( check_length === 3 ){
          actualStart = actualStart % 1000;
        }
        else{
          actualStart = actualStart % 100000000;
        }

        actualStart = actualStart.toString();

        while ( actualStart.length < check_length ){
          actualStart = "0" + actualStart;
        }

        // start the clock plugin
        start( actualStart );
      }; // initClock

  if(options) {
    $.extend( settings, options );
  }

  // run through array of elements, initialize them, and return this (this being the jQuery object)
  return this.each( initClock );

}; // fn.clock

