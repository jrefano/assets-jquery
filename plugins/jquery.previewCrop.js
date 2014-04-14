/*global jQuery */
(function ($) {

  $.Jcrop.defaults.keySupport = false;
  $.fn.previewCrop = function(cfg) {

    if (!cfg) {
      throw ('Must pass in config');
    }

    if (typeof(cfg) == 'string') {

      switch (cfg) {
        case 'destroy' :
          if (this.data('initialized.previewCrop')) {
            this.data('coords.previewCrop', false);
            this.data('cropped_file.previewCrop', false);
            this.data('original_image.previewCrop', false);
            this.data('json.previewCrop', false);
            this.data('initialized.previewCrop', false);
            this.data('btnSave.previewCrop').remove();
            this.data('btnCrop.previewCrop').remove();
            this.data('btnRecrop.previewCrop').remove();
            this.data('btnCancel.previewCrop').remove();
            this.html('');
          }
          return;

        case 'clearUpload' :
          this.data('coords.previewCrop', false);
          this.data('cropped_file.previewCrop', false);
          this.data('original_image.previewCrop', false);
          return;

        default :
          return this.data(cfg+'.previewCrop');
      }

    }


    // make sure you have what's needed for proper init
    if (!cfg.imgData) {
      throw ('Must pass in img data');
    }

    if (!cfg.previewDiv || !cfg.previewDiv.length) {
      throw ('Must pass div for preview');
    }

    if (!cfg.minSize) {
      throw ('Must pass min size');
    }

    if (!cfg.entity) {
      throw ('Must pass crop entity');
    }

    if (!cfg.uploadDiv) {
      throw ('Must pass upload div');
    }

    $(this).data('original_image.previewCrop',cfg.imgData);

    // elements
    var self            = this,
        originalPreview = cfg.previewDiv.html(),
        wrapImage       = $('<div class="pcrop-image-wrap"></div>'),                        // wraps image for Jcrop
        wrapButtons     = $('<div class="pcrop-buttons-wrap cfix"></div>'),                      // will contain crop,save,recrop buttons
        wrapPreview     = $('<div class="pcrop-preview-wrap"></div>'),                      // wraps preview for hiding overflow
        image           = $('<img src="'+cfg.imgData.src+'"  class="pcrop-image" />'),      // image to manipulate
        imagePreview    = $('<img src="'+cfg.imgData.src+'" class="pcrop-preview-img" />'), // image preview
        btnSave         = $('<a class="form-button form-button-default form-button-save pcrop-save-btn">Save</a>'),
        btnCrop         = $('<a class="form-button form-button-default form-button-crop pcrop-crop-btn">Crop</a>'),
        btnRecrop       = $('<a class="form-button form-button-default form-button-recrop pcrop-recrop-btn">Re-Crop</a>'),
        btnCancel       = $('<a class="form-button form-button-dark form-button-dark form-button-cancel pcrop-cancel-btn">Cancel</a>'),


        // element
        showSave       = (typeof(cfg.showSave)   != 'undefined') ? cfg.showSave   : true,
        showCrop       = (typeof(cfg.showCrop)   != 'undefined') ? cfg.showCrop   : true,
        showRecrop     = (typeof(cfg.showRecrop) != 'undefined') ? cfg.showRecrop : true,
        showCancel     = (typeof(cfg.showCancel) != 'undefined') ? cfg.showCancel : true,

        // measurements
        originalHeight = cfg.imgData.height,                                    // height of uploaded file
        originalWidth  = cfg.imgData.width,                                     // width of uploaded file
        originalCss    = {height:originalHeight+'px',width:originalWidth+'px'}, // same css applied to preview and main image
        changeCss      = {},                                                    // save css for recrop
        centerTop      = Math.round( ( originalHeight - cfg.minSize[1] ) / 2 ), // to center Jcrop selector
        centerLeft     = Math.round( ( originalWidth - cfg.minSize[0] ) / 2 ),  // to center Jcrop selector
        json           = {}, // saved for getter
        coords         = {   // saved for getter and recropping
                           x  : centerLeft,
                           x2 : centerLeft+cfg.minSize[0],
                           y  : centerTop,
                           y2 : centerTop+cfg.minSize[1]
                         },

        // url stuff
        url            = ( (cfg.url) ? cfg.url : '/uploadi/crop' ) + '?entity=' + cfg.entity;


    var crop = function() {
      if (coords.h === 0 || coords.w === 0) {
        return;
      }

      // what url should always expect - coordinates and image name
      var params = $.extend(coords, {file:cfg.imgData.name});

      params.x  = Math.round( params.x );
      params.x2 = Math.round( params.x2 );
      params.y  = Math.round( params.y );
      params.y2 = Math.round( params.y2 );

      $.ajax({
        url  : url,
        type : 'POST',
        data : $.param(params),
        success : function(json, textStatus) {

          self.trigger('cropSuccess',[json, textStatus]);

          if (json.valid == 'yes') {

            self.data('cropped_file.previewCrop',json);

            cfg.uploadDiv.show();

            // replace imagePreview with new image so it is not a shrunken version anymore
            imagePreview = $('<img src="'+json.local_path+json.name+'" class="pcrop-preview-img" />');
            imagePreview.css({height:'auto',width:'auto',top:'0px',left:'0px'});
            wrapPreview.html('');
            wrapPreview.append(imagePreview);

            self.data('image_preview.previewCrop', imagePreview);

            // show proper buttons
            btnCrop.hide();
            wrapImage.hide();
            btnRecrop.show();
            btnCancel.hide();
            self.trigger('cropValid',[json]);

          } // valid
          else {
            self.trigger('cropFailure',[json, textStatus]);
          }

        } // success

      }); // ajax

    }; // crop

    var recrop = function() {

      // make sure if you hit recrop and then save before hitting crop again, it knows to take new coordinates anyway
      self.data('cropped_file.previewCrop',false);

      cfg.uploadDiv.hide();

      // replace imagePreview with old image (it will be shrunken again)
      imagePreview = $('<img src="'+cfg.imgData.src+'" class="pcrop-preview-img" />');
      imagePreview.css(changeCss);
      wrapPreview.html('');
      wrapPreview.append(imagePreview);

      // show proper buttons
      btnCrop.show();
      wrapImage.show();
      btnRecrop.hide();
      btnCancel.show();

      self.trigger('recrop');

    }; // recrop

    var cancel = function() {

      cfg.uploadDiv.show();

      // show proper buttons
      btnCrop.hide();
      wrapImage.hide();
      btnRecrop.hide();
      btnCancel.hide();
      cfg.previewDiv.html(originalPreview);
      self.trigger('cancel');
    };

    var save = function() {
      if (coords.h === 0 || coords.w === 0) {
        return;
      }
      self.trigger('save');
    };

    // add wrappers for image manip and ubttons
    this.append(wrapImage);
    this.append(wrapButtons);

    // add all buttons and image
    wrapImage.append(image);

    if (showRecrop) { wrapButtons.append(btnRecrop); }
    if (showCrop)   { wrapButtons.append(btnCrop);   }
    if (showSave)   { wrapButtons.append(btnSave);   }
    if (showCancel) { wrapButtons.append(btnCancel); }

    // setup preview wrapper
    cfg.previewDiv.html('');
    cfg.previewDiv.append(wrapPreview);
    wrapPreview.append(imagePreview);
    wrapPreview.css({position:'relative',width:cfg.minSize[0]+'px',height:cfg.minSize[1]+'px',overflow:'hidden'});

    // assign events
    btnCrop.click(crop);
    btnSave.click(save);
    btnCancel.click(cancel);
    btnRecrop.click(recrop).hide();

    // setup preview image
    image.css(originalCss);
    imagePreview.css(originalCss);
    imagePreview.css({top : centerTop.toString()+'px', left : centerLeft.toString()+'px'});

    // add Jcrop functionality to image
    image.Jcrop({
      allowSelect : false,
      minSize     : cfg.minSize,
      setSelect   : [coords.x, coords.y, coords.x2, coords.y2],
      aspectRatio : cfg.minSize[0]/cfg.minSize[1],
      bgOpacity   : 0.4,
      onChange    : function(c) {
        var newWidth        = c.x2 - c.x,
            newHeight       = c.y2 - c.y,
            heightRatio     = cfg.minSize[1]/newHeight,
            widthRatio      = cfg.minSize[0]/newWidth,
            newZoomWidth    = Math.round(originalWidth * widthRatio),
            newZoomHeight   = Math.round(originalHeight * heightRatio),
            newZoomTop      = Math.round(c.y*heightRatio),
            newZoomLeft     = Math.round(c.x*widthRatio);


        changeCss = {
          width    : newZoomWidth+'px',
          height   : newZoomHeight+'px',
          top      : '-'+newZoomTop+'px',
          left     : '-'+newZoomLeft+'px',
          position : 'absolute'
        };

        imagePreview.css(changeCss);

        coords = c;

        self.data('coords.previewCrop',coords);
      }
    });

    this.data('btnSave.previewCrop',   btnSave);
    this.data('btnCrop.previewCrop',   btnCrop);
    this.data('btnRecrop.previewCrop', btnRecrop);
    this.data('btnCancel.previewCrop', btnCancel);

    this.data('initialized.previewCrop',true);

    cfg.uploadDiv.hide();

    return this;

  };

}(jQuery));
