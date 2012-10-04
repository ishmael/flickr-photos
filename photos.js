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
  				jsonp: 'jsoncallback',
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

    function imageAppender (photoURL) {
  		var fileId = photoURL.substring(photoURL.lastIndexOf('/')+1,photoURL.lastIndexOf('.'));
		  var favoriteClick =  function(event){
  		  event.preventDefault();
  		  setFavorite(this.id);
  		  $(this).toggleClass('icon-heart icon-heart-empty');
  		  return false;
  		};
  		var $photo = $('<div/>').addClass('photo');
  		var $icon = $('<div/>')
  		  .attr('id',fileId)
        .addClass("icon-large " + (isFavorite(fileId) ? "icon-heart" :	"icon-heart-empty"))
  			.on('click',favoriteClick);
  		
  		$photo.append($icon);
  		this.append($photo);
  		
  		return $photo;
    }

    // ----
	
	function isFavorite(imgId){
		var currentCookieValue = getCookieValue();
		if(currentCookieValue){
			return (currentCookieValue.indexOf(imgId) != -1) ;
		}
		else{
			return false;
		}
		
	}
	function getCookieValue(){
		if(current_favorites.length){
			return current_favorites;
		}else if(document.cookie)
		{
			var cookies = document.cookie.split(';');
			var i;
			for(i=0;i<cookies.length;i++){
				var name= cookies[i].substring(0,cookies[i].indexOf('='));
				if(name == cookie_name){
					var cookie = cookies[i].split(';')[0];
					var value = unescape(cookie.substring(cookie.indexOf('=')+1));
					current_favorites = value.split(',');
					return current_favorites;
				}
			}
		}
	}
	
	function setFavorite(imgId){
		if(isFavorite(imgId)){
			current_favorites.splice(current_favorites.indexOf(imgId),1);
		}else{
			current_favorites.push(imgId);
		}
		setCookie(current_favorites);
	}
	
	function setCookie(value){
		var dateExpires = new Date();
		//default to 7 days of sliding expiration
		dateExpires.setDate(dateExpires.getDate() + days_to_expire_cookie);
		document.cookie = cookie_name + "="+ escape(value) + ";expires=" + dateExpires.toGMTString();
	}
    
    var max_per_tag = 5;
	var days_to_expire_cookie = 7;
	var cookie_name = 'flickrPhotos';
	var current_favorites = [];
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
			        var photoElement = imageAppender.call(element,photo);
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