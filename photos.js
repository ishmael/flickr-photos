/*global jQuery*/

var setupPhotos = (function ($) {
    function each (items, callback) {
        var i;
        for (i = 0; i < items.length; i += 1) {
            setTimeout(callback.bind(this, items[i]), 0);
        }
    }

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
  			}).promise();
      });
		
		  $.when.apply(null,requests)
			  .done(function(){
            callback(photos);
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
		
  		$(icon).on('click',function(event){
  		  event.preventDefault();
  		  localStorage.setItem(this.id,!(localStorage.getItem(this.id)=='true'));
  		  $(this).toggleClass('icon-heart icon-heart-empty');
  		  return false;
  		});
    }

    // ----
    
    var max_per_tag = 5;
    return function setup (tags, callback) {
		  var renderItem = function (items,err) {
        if (err){ 
  				return callback(err); 
  			}
  			
        var renderPhoto = function(photo) {
            var img = new Image();
            img.src = photo;
            return img;
        };
        
        each(items.map(renderPhoto), imageAppender);
        if(callback){
  				  callback();
  		  }
      };
		
      loadAllPhotos(tags, max_per_tag, renderItem);
    };
}(jQuery));
