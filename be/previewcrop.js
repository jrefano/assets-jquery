/*global jQuery */
(function(factory) {
  'use strict';
  if (typeof define === 'function' && define.amd) {
    define(['jquery', 'be/buttons', 'jquery/plugins/jquery.Jcrop'], function() {
      var module = factory.apply(this, arguments);
      return module;
    });
  }
  else {
    return jQuery && factory.call(this, jQuery);
  }
}(function($, buttons) {
  'use strict';


  var MODE_DATA = 'data',
      MODE_LINK = 'link';


  $.widget("ui.previewCrop", $.extend({}, {

    options : {

      center_select : true,        // whether ot not selector should be auto-centered
      mode          : MODE_DATA,   // accepts data || link depending on server sending back URL to image or actual image source
      preview_ratio : 1,           // ratio between selector tool and preview
      img_data      : null,        // object containing server image size, src, and mime
      $preview_el   : null,        // element containing preview
      $upload_el    : null,        // element containing uploader
      encoding      : 'base64',    // encoding for img src
      min_size      : [ 100, 100 ],// min size for width and height of cropper
      url           : '/crop',     // what URL to hit when cropping
      show_save     : true,        // whether or not to show related button
      show_crop     : true,        // whether or not to show related button
      show_recrop   : true,        // whether or not to show related button
      show_cancel   : true,        // whether or not to show related button
      max_height    : 400,         // Keep uploaded image constrained to certain height, regardless of what server sent back
      max_width     : 600,         // Keep uploaded image constrained to certain width, regardless of what server sent back
      shrink_box    : false        // Whether or not the bounding box should be resized on top of constrained proportion

    }, // options

    original_preview       : null, // Original HTML of preview before any mods

    $save_btn              : null, // jQuery element for button
    $crop_btn              : null, // jQuery element for button
    $recrop_btn            : null, // jQuery element for button
    $cancel_btn            : null, // jQuery element for button

    $img_container         : null, // wraps image for Jcrop
    $btns_container        : null, // will contain crop,save,recrop buttons
    $preview_img_container : null, // wraps preview image for hiding overflow

    $img                   : null, // image to manipulate
    $img_preview           : null, // image preview

    original_height        : null, // height of uploaded file
    original_width         : null, // width of uploaded file
    last_css               : null, // last css stored for when recrop is hit

    data_source            : '', // data source of image for 'data' mode
    local_path             : '', // local path of image src for 'link' mode
    name                   : '', // updated filename for image src with 'link' mode

    last_state             : null,

    // Underscored vars have public getter
    _updated               : null,
    _coords                : null,

    coords : function() {
      var x, y, w, h, aspect;

      if ( !this._coords ) {
        return false;
      }

      aspect = this.options.min_size[1] / this.options.min_size[0];

      x = this._coords.x;
      y = this._coords.y;
      w = this._coords.x2 - this._coords.x;
      h = this._coords.y2 - this._coords.y;

      w = Math.round( w );
      h = Math.round( w*aspect );
      // Make sure the coords are not extending off the original image
      x = x + w > this.original_width ? this.original_width - w : x;
      y = y + h > this.original_height ? this.original_height - h : y;
      x = Math.round(x);
      y = Math.round(y);

      return {
        x : x, x2 : x+w,
        y : y, y2 : y+h,
        w : w, h  : h
      };

    }, // coords

    updated : function() {
      return this._updated;
    }, // updated

    // If user uploaded a file and never cropped
    cropReady : function() {

      return ( !this._updated && (this.options.img_data.source || this.options.img_data.name ) );

    }, // cropReady

    source : function() {
      return ( this.options.mode === MODE_DATA ) ?
             this.data_source :
             this.local_path + this.name;
    }, // source

    uploadedFilename : function() {
      return this.options.img_data.uploaded_filename;
    }, // uploadedFilename

    // filename after manipulation from server
    filename : function() {

      if ( this.options.mode !== MODE_LINK ) {
        throw "No filenames are available if mode is not link";
      }

      return this.name;

    }, // filename

    destroy : function() {
      this.element.html('');
    }, // destroy

    crop : function() {
      return this._crop();
    }, // crop

    recrop : function() {
      return this._recrop();
    }, // recrop

    cancel : function() {
      return this._cancel();
    }, // cancel

    // Updates the img_data option and stores previous version, useful for cancel
    pushState : function( new_image_data ) {

      this.last_state = {
          coords      : this.coords(),
          img_data    : $.extend( {}, this.options.img_data ),
          data_source : this.data_source,
          local_path  : this.local_path,
          name        : this.name
      };

      this.options.img_data = new_image_data;

      this.element.html('');

      this._init();

    }, // pushState

    generateMarkup : function() {

      var img_src = this._imgSource();

      // Create elements for image manipulation.
      // TODO: Options for additional classes
      this.$img         = $('<img src="' + img_src + '"  class="pcrop-image" />');
      this.$img_preview = $('<img src="' + img_src + '" class="pcrop-preview-img" />');

      // Generate buttons.
      // TODO: Options for additional classes
      this.$save_btn   = $('<a class="form-button form-button-default form-button-save pcrop-save-btn">Save</a>');
      this.$crop_btn   = $('<a class="form-button form-button-default form-button-crop pcrop-crop-btn">Crop</a>');
      this.$recrop_btn = $('<a class="form-button form-button-default form-button-recrop pcrop-recrop-btn">Re-Crop</a>');
      this.$cancel_btn = $('<a class="form-button form-button-dark form-button-cancel pcrop-cancel-btn">Cancel</a>');

      // Generate extra containers.
      // TODO: Options for additional classes
      this.$img_container         = $('<div class="pcrop-image-wrap"></div>');
      this.$btns_container        = $('<div class="pcrop-buttons-wrap cfix"></div>');
      this.$preview_img_container = $('<div class="pcrop-preview-wrap"></div>');

    }, // generateMarkup

    appendMarkup : function() {

      var widget = this,
          append_buttons = false,
          opts   = this.options,
          // Define what argument is for what button
          btns = {
            show_recrop : '$recrop_btn',
            show_crop   : '$crop_btn',
            show_save   : '$save_btn',
            show_cancel : '$cancel_btn'
          };

      // Add containers for image manip and buttons
      this.element.append( this.$img_container );

      // Append required buttons
      $.each( btns, function( show, key ) {

        if ( opts[show] === true ) {
          widget.$btns_container.append( widget[ key ] );
          append_buttons = true;
        }

      }); // each btns

      if ( append_buttons ) {
        this.element.append( this.$btns_container );
      }

      // Add image
      this.$img_container.append( this.$img );

      // Append preview image container to preview container
      opts.$preview_el.html( this.$preview_img_container );

      // Add preview image to preview image container
      this.$preview_img_container.append( this.$img_preview );

    }, // appendMarkup

    bindButtons : function() {

      // Attach events to buttons
      this.$crop_btn.on( 'click', $.proxy( this._crop, this ) );
      this.$recrop_btn.on( 'click', $.proxy( this._recrop, this ) ).hide();
      this.$save_btn.on( 'click', $.proxy( this._save, this ) );
      this.$cancel_btn.on( 'click', $.proxy( this._cancel, this ) );

    }, // bindButtons

    jCrop : function() {

      var widget             = this,
          opts               = this.options,
          original_css       = {},                   // original shared css for preview and main image
          center_top         = 0,                    // know where to place cropper on initial load
          center_left        = 0,                    // know where to place cropper on initial load
          min_width          = opts.min_size[0],     // The minimum width of the crop selector
          min_height         = opts.min_size[1],     // The minimum height of the crop selector
          constrained_width  = opts.img_data.width,  // The width to be used for CSSing down the main image
          constrained_height = opts.img_data.height, // The height to be used for CSSing down the main image
          proportion         = 1,                    // The constraining proportion for both dimensions
          crop_proportion;                           // The constraining proportion for the crop box handles


      proportion         = this.determineProportion();
      constrained_width  = opts.img_data.width * proportion;
      constrained_height = opts.img_data.height * proportion;


      crop_proportion    = ( opts.shrink_box ) ?
                           this.determineCropBoxProportion( constrained_width, constrained_height ) :
                           1;

      min_width          = min_width * proportion * crop_proportion;
      min_height         = min_height * proportion * crop_proportion;

      // Initialize vars for coordinates and assocaited css
      this._coords  = {};
      this.last_css = {};


      this.$preview_img_container.css({
        position : 'relative',
        width    : ( opts.min_size[0] * opts.preview_ratio ) + 'px',
        height   : ( opts.min_size[1] * opts.preview_ratio ) + 'px',
        overflow : 'hidden'
      });


      // Get coords for centering
      if ( opts.center_select ) {
        center_top  = Math.round( ( constrained_height - min_height ) / 2 );
        center_left = Math.round( ( constrained_width - min_width ) / 2 );
      }
      else {
        center_top = center_left = 0;
      }


      // Set the initial _coords of cropper
      this._coords = {
        x  : center_left,
        x2 : center_left + min_width,
        y  : center_top,
        y2 : center_top + min_height
      };

      // Set the CSS for both images on load
      original_css = {
        width  : constrained_width,
        height : constrained_height
      };

      // setup preview image
      this.$img.css(original_css);
      this.$img_preview.css( $.extend( original_css, {
        top  : center_top + 'px',
        left : center_left + 'px'
      }));

      // add Jcrop functionality to image
      this.$img.Jcrop({
        allowSelect : false,
        minSize     : [ Math.ceil(min_width), Math.ceil(min_height) ],
        setSelect   : [ this._coords.x, this._coords.y, this._coords.x2, this._coords.y2 ],
        aspectRatio : min_width / min_height,
        bgOpacity   : 0.4,
        onChange    : function( c ) {

          var u, v, p, width, height,
          cwidth, cheight, dwidth, dheight, zwidth, zheight, zleft, ztop;

          // Coordinate corrections
          if (c.x<0) {
            c.x2 -= c.x;
            c.x = 0;
          }

          if (c.y<0) {
            c.y2 -= c.y;
            c.y = 0;
          }

          width  = ( c.x2 - c.x );
          height = ( c.y2 - c.y );

          // Cropper dimensions
          u = Math.min(width, constrained_width)/width;
          v = Math.min(height, constrained_height)/height;
          p = Math.min(u,v);
          cwidth = Math.round(width*p);
          cheight = Math.round(height*p);

          // Desired preview dimensions
          dwidth  = opts.preview_ratio * opts.min_size[0];
          dheight = opts.preview_ratio * opts.min_size[1];
          // Preview image size
          zwidth  = dwidth * constrained_width / cwidth;
          zheight = dheight * constrained_height / cheight;
          // Preview position
          zleft = dwidth * c.x / cwidth;
          ztop  = dheight * c.y / cheight;

          // Preview cover size
          widget.last_css = {
            width    : zwidth + 'px',
            height   : zheight + 'px',
            left     : -zleft + 'px',
            top      : -ztop + 'px',
            position : 'absolute'
          };

          widget.$img_preview.css( widget.last_css );

          // True crop area in original image dimensions
          c.w  = width / proportion;
          c.h  = height / proportion;
          c.x  /= proportion;
          c.y  /= proportion;

          u = Math.min(c.w, opts.img_data.width)/c.w;
          v = Math.min(c.h, opts.img_data.height)/c.h;
          p = Math.min(u,v);

          c.h *= p;
          c.w *= p;

          c.x2 = c.x+c.w;
          c.y2 = c.y+c.h;

          widget._coords = c;

          widget._trigger( 'change', new $.Event(), { coords : c } );

        } // onchange

      }); // jcrop

    }, // jCrop

    determineProportion : function() {

      var opts        = this.options,
          max_height  = opts.max_height,
          max_width   = opts.max_width;

      // Calculate the constraining proportion
      return (function() {
        var u = opts.img_data.width / max_width,
            v = opts.img_data.height / max_height;

        return 1/Math.max(u,v,1);
      }());

    }, // determineProportion

    determineCropBoxProportion : function( constrained_width, constrained_height ) {

      var opts        = this.options,
          min_height  = opts.min_size[1],
          min_width   = opts.min_size[0];

      // Calculate the constraining proportion
      return (function() {
        var u = constrained_width / min_width,
            v = constrained_height / min_height;

        return Math.min(u,v,1);
      }());

    }, // determineCropBoxProportion

    _setOption: function( key, value ) {

      var ret = this._super( key, value );

      if ( key === 'max_width' || key === 'max_height' ) {

        if ( this.$img && this.$img.data( 'Jcrop' ) ) {
          this.$img.data( 'Jcrop' ).destroy();
          this.jCrop();
        }

      }

      return ret;

    },  // _setOption

    _init : function() {

      var opts               = this.options,
          req                = [ 'img_data', '$preview_el', '$upload_el', 'url' ],
          constrained_width  = opts.img_data.width,  // The width to be used for CSSing down the main image
          constrained_height = opts.img_data.height; // The height to be used for CSSing down the main image

      // Make sure required "options" were passed
      $.each( req, function( i, key ) {

        if ( !opts[key] ) {
          $.error( 'Must pass in ' + key );
        }

      }); // each req

      this.generateMarkup();

      // Save off original markup
      this.original_preview = opts.$preview_el.html();
      this._updated         = false;

      // Ensure numbers we are about to compare are numbers and not strings
      opts.img_data.height = parseFloat( opts.img_data.height );
      opts.img_data.width  = parseFloat( opts.img_data.width );

      // Save off original dimensions
      this.original_height = opts.img_data.height;
      this.original_width  = opts.img_data.width;

      this.appendMarkup();
      this.bindButtons();


      this.jCrop();

      // Hide uploader
      opts.$upload_el.hide();

      this._trigger( 'initialized', new $.Event(), { cw : constrained_width, ch : constrained_height } );

    }, // _init

    _imgSource : function() {

      var data = this.options.img_data;

      if ( this.options.mode === MODE_DATA ) {

        return 'data:' + data.mime + ';' + this.options.encoding + ',' + data.source;

      } // if mode = data

      if ( this.options.mode === MODE_LINK ) {
        return data.local_path + data.name;
      }

      throw new Error('Unknown mode: [' + this.options.mode + ']');

    }, // _imgSource

    _crop : function() {

      var widget = this,
          opts   = this.options,
          params = this.coords();

      function failure( json ) {

        buttons.show(widget.$btns_container);
        widget.$crop_btn.show();
        widget.$recrop_btn.hide();
        widget.$cancel_btn.show();

        if ( json && json.messages ) {
          widget.element.showMessages( json.messages );
        }
        else {
          widget.element.showMessages([{type:'error','message': 'Image failed to crop. Please try again later.'}]);
        }

        widget._trigger( 'failure', new $.Event(), json );

      } // failure

      if ( opts.mode === MODE_DATA ) {
        params.source = this.options.img_data.source;
      }
      else {
        params.file =  this.options.img_data.name;
      }

      // Guard against invalid crop
      if ( !params.h || !params.w ) {

        this._trigger( "badcoords", new $.Event() );
        return;

      } // if ! coords

      buttons.hide(this.$btns_container, 'Cropping...');


      $.ajax({
        url  : this.options.url,
        type : 'POST',
        data : params
      })
      .fail(failure)
      .done(function( json ) {

          var img_src;

          if ( !json || !json.valid ) {

            failure( json );

            return;

          } // if !json

          if ( widget.options.mode === MODE_DATA ) {
            widget.data_source = json.source;
          }
          else {
            widget.local_path = json.local_path;
            widget.name       = json.name;
          }

          if (!widget._trigger( 'success', new $.Event(), json )) {
            return;
          }

          // Show uploader again
          opts.$upload_el.show();

          // replace image preview with new image so it is not a shrunken version anymore
          widget.$img_preview = $('<img />');

          img_src = ( opts.mode === MODE_DATA ) ?
                    'data:' + json.mime + ';' + opts.encoding + ',' + json.source :
                    json.local_path + json.name;

          widget.$img_preview.css({
              width  : opts.min_size[0] * opts.preview_ratio,
              height : opts.min_size[1] * opts.preview_ratio,
              top    : '0px',
              left   : '0px'
          })
          .addClass( 'pcrop-preview-img' )
          .attr( 'src', img_src );

          widget.$preview_img_container.html( widget.$img_preview );

          widget.$img_container.hide();

          widget.original_preview = opts.$preview_el.html();
          widget._updated         = true;

          widget._trigger( 'valid', new $.Event(), json );

          buttons.show(widget.$btns_container);

          // show proper buttons
          widget.$crop_btn.hide();

          widget.$recrop_btn.show();
          widget.$cancel_btn.hide();

      }); // ajax

      return this.element;

    }, // _crop

    _recrop : function() {

      // Hide uploader
      this.options.$upload_el.hide();

      // replace imagePreview with old image (it will be shrunken again)
      this.$img_preview = $('<img src="' + this._imgSource() + '" class="pcrop-preview-img" />')
        .css( this.last_css );

      this.$preview_img_container.html( this.$img_preview );

      // show proper buttons
      this.$img_container.show();
      this.$crop_btn.show();
      this.$recrop_btn.hide();
      this.$cancel_btn.show();

      this._trigger( 'recrop' );

    }, // _recrop

    _cancel : function() {

      // Show uploader
      this.options.$upload_el.show();

      // Hide all buttons
      this.$img_container.hide();
      this.$crop_btn.hide();
      this.$recrop_btn.hide();
      this.$cancel_btn.hide();

      // Reset HTML
      this.options.$preview_el.html( this.original_preview );

      // If canceling after having uploaded an image prior to the one being canceled
      // Plugin doesn't guarantee that logic off the bat but pushState shouldn't be getting used otherwise
      if ( this.last_state ) {

        this.options.img_data = $.extend( {}, this.last_state.img_data );
        this.data_source      = this.last_state.data_source;
        this.local_path       = this.last_state.local_path;
        this.name             = this.last_state.name;
        this.last_state       = false;
        this._coords          = $.extend( {}, this.last_state.coords );
        this._updated         = true;

      }
      // If canceling without ever accepting an image, set back to defaults
      else {

        this.options.img_data = {};
        this.data_source      = '';
        this.local_path       = '';
        this.name             = '';
        this._updated         = false;
        this._coords          = null;

      }

      this._trigger( 'cancel' );

    }, // _ cancel

    _save : function() {

      // Guard against invalid crop
      if ( !this._coords.h || !this._coords.w ) {

        this._trigger( "badcoords" );
        return;

      } // if ! coords

      this._trigger( 'save' );

    } // _save

  })); // widget

}));
