/*global jQuery*/

var setupPhotos = (function ($) {
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
  		var elm = document.createElement('div');
  		elm.className = 'photo';
  		var icon = document.createElement('div');
  		icon.id = fileId;
  		icon.className = "icon-large " + ((localStorage.getItem(fileId)=='true') ? "icon-heart" :	"icon-heart-empty");
  		elm.appendChild(img);
  		elm.appendChild(icon);
  		var holder = document.getElementById('photos');
  		holder.appendChild(elm);
		  
		  var favoriteClick =  function(event){
  		  event.preventDefault();
  		  localStorage.setItem(this.id,!(localStorage.getItem(this.id)=='true'));
  		  $(this).toggleClass('icon-heart icon-heart-empty');
  		  return false;
  		};
  		
  		$(icon).on('click',favoriteClick);
  		
  		return elm;
    }

    // ----
    
    var max_per_tag = 5;
    return function setup (tags, callback) {
		  var renderItem = function (items,err) {
        if(err && callback){ 
  				return callback(err); 
  			}
  			var photoElements = [];
        var renderPhoto = function(photo) {
            var deferred = $.Deferred();
            var img = new Image();
            img.onload = function(){
               var photoElement = imageAppender(img);
               photoElements.push(photoElement);
               deferred.resolve(photoElement);
            }
            img.onerror = deferred.reject();
            img.src = photo;
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
    };
}(jQuery));
