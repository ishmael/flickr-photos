/*global jQuery*/
(function ($) {
    function loadAllPhotos (tags, max, callback) {   
  		var photos = [];
  	  var requests =  $.map(tags, function(tag){
        return $.ajax({
  				url: 'http://api.flickr.com/services/feeds/photos_public.gne',
  				data: {
  					tags: tag,
  					lang: 'en-us',
  					format: 'json'
  				},
  				dataType: 'jsonp',
  				jsonp: "jsoncallback",
  				success: function(data){
            var i;
    				for (i = 0; i < max; i += 1) {
    					photos.push(data.items[i].media.m);
    				}
  				}
  			});
      });
		
		  $.when.apply(null,requests)
			  .done(function(){
            callback(photos);
  			})
  			.fail(function(){
  			  callback(null,'Network error');
  			});
		
    }

    function imageAppender (img) {
  		var fileId = img.src.substring(img.src.lastIndexOf('/')+1,img.src.lastIndexOf('.'));
		  var favoriteClick =  function(event){
  		  event.preventDefault();
  		  localStorage.setItem(this.id,!(localStorage.getItem(this.id)=='true'));
  		  $(this).toggleClass('icon-heart icon-heart-empty');
  		  return false;
  		};
  		var $photo = $('<div/>').addClass('photo');
  		var $icon = $('<div/>')
  		  .attr('id',fileId)
        .addClass("icon-large " + ((localStorage.getItem(fileId)=='true') ? "icon-heart" :	"icon-heart-empty"))
  			.on('click',favoriteClick);
  		
  		$photo.append($icon);
  		this.append($photo);
  		
  		return $photo;
    }

    // ----
    
    var max_per_tag = 5;
    $.fn.flickrPhotos = function(tags, callback) {
      return this.each(function(){
        var element = $(this);
        var renderItem = function (items,err) {
          if(err && callback){ 
    				return callback(err); 
    			}
    			var photoElements = [];
          var renderPhoto = function(photo) {
              var deferred = $.Deferred();
              var img = new Image();
			        var photoElement = imageAppender.call(element,img);
              img.onload = function(){
                photoElement.prepend(img);
				        photoElements.push(photoElement);
                deferred.resolve(photoElement);
              }
              img.onerror = deferred.reject;
			  setTimeout(function(){
				img.src = photo;
			  },0);
              return deferred.promise();
          };

          $.when.apply(null,items.map(renderPhoto))
    			  .done(function(){
                if(callback){
          				  callback(photoElements);
          		  }
      			});
        };
        loadAllPhotos(tags, max_per_tag, renderItem);        
      });

  		
    };
}(jQuery));