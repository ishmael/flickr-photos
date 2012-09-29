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
  		
  		$photo.append(img,$icon);
  		this.append($photo);
  		
  		return $photo;
    }

    // ----
    
    var max_per_tag = 5;
    $.fn.flickrPhotos = function(tags, callback) {
		  var renderItem = function (items,err) {
        if(err && callback){ 
  				return callback(err); 
  			}
  			var photoElements = [];
        var renderPhoto = function(photo) {
            var deferred = $.Deferred();
            var img = new Image();
            img.onload = function(){
               var photoElement = imageAppender.call(this,img);
               photoElements.push(photoElement);
               deferred.resolve(photoElement);
            }.bind(this);
            img.onerror = deferred.reject;
            img.src = photo;
            return deferred.promise();
        }.bind(this);
            
        $.when.apply(null,items.map(renderPhoto))
  			  .done(function(){
              if(callback){
        				  callback(photoElements);
        		  }
    			});
      }.bind(this);
      loadAllPhotos(tags, max_per_tag, renderItem);
  		return this;
    };
}(jQuery));