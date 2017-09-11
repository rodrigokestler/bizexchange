var pic = {
	IMG_URI_PROFILE: null,
	msjSuccess: '',
	idPropiedad: null,
	imagenes: [],
	fotoSeleccionadaPromos: function(imageURI){
		console.log(imageURI);
		pic.IMG_URI_PROFILE = imageURI;
	    promosScreen.avatar.css('background-image','url("'+pic.IMG_URI_PROFILE+'")');
	    promosScreen.avatar.data('foto','chosen');
	},
	fotoSeleccionadaProfile: function(imageURI){
		console.log(imageURI);
		pic.IMG_URI_PROFILE = imageURI;
	    $(".avatar_perfil").css('background-image','url("'+pic.IMG_URI_PROFILE+'")');
	    //subirfoto y guardarla
	    
	    var url = app.url_ajax;
	    
	    var options = new FileUploadOptions();
	    var params = {};
	    
	    options.mimeType = 'image/jpeg';
	    params.image_user = "true";
	    params.video_user = "false";
	    
	    options.fileKey  = "file";
	    options.fileName = pic.IMG_URI_PROFILE.substr(pic.IMG_URI_PROFILE.lastIndexOf('/')+1);
	    options.chunkedMode = false;
	    console.log(options.fileName);
	    params.accion ='update_image_user';
	    params.user_email = user.correo;
	    params.user_pass = user.password;
	    options.params = params;
	    
	    
	    var ft = new FileTransfer();
	    ft.onprogress = function(progressEvent) {
	        if (progressEvent.lengthComputable) {
	            console.log(parseInt(progressEvent.loaded / progressEvent.total * 100)+"%");
	        } else {
	            console.log("otro");
	        }
	    };
	    
	    ft.upload(
	        pic.IMG_URI_PROFILE,
	        encodeURI(url),
	        function(r) {
	        	
	        	console.log(JSON.stringify(r));
	            pic.LAST_IMG = null;
				pic.IMG_URI_PROFILE = null;
	        },
	        function(error) {
	        	console.log(r);
	            jQuery(".avatar_perfil").css('background-image',pic.LAST_IMG);
	            pic.LAST_IMG = null;
				pic.IMG_URI_PROFILE = null;
	            navigator.notification.alert('Ocurrió un imprevisto, intenta de nuevo.',null,'Rumbafest','Ok');
	        }, options
	    );
	},
	fotoSeleccionadaLugar: function(imageURI){
		pic.IMG_URI_PROFILE = imageURI;
	    var url = app.url_ajax;
	    
	    var options = new FileUploadOptions();
	    var params = {};
	    
	    options.mimeType = 'image/jpeg';
	    params.image_user = "true";
	    params.video_user = "false";
	    
	    options.fileKey  = "file";
	    options.fileName = pic.IMG_URI_PROFILE.substr(pic.IMG_URI_PROFILE.lastIndexOf('/')+1);
	    options.chunkedMode = false;
	    console.log(options.fileName);
	    params.accion ='upload_image_lugar';
	    params.user_email = user.correo;
	    params.user_pass = user.password;
	    params.id_lugar = pic.idLugar;
	    options.params = params;
	    
	    
	    var ft = new FileTransfer();
	    ft.onprogress = function(progressEvent) {
	        if (progressEvent.lengthComputable) {
	            console.log(parseInt(progressEvent.loaded / progressEvent.total * 100)+"%");
	        } else {
	            
	        }
	    };
	    cortina.show();
	    ft.upload(
	        pic.IMG_URI_PROFILE,
	        encodeURI(url),
	        function(r) {
	        	console.log(JSON.stringify(r));
	            pic.LAST_IMG = null;
				pic.IMG_URI_PROFILE = null;
				cortina.hide();
				var respuesta = JSON.parse(r.response);
				if(respuesta.success=='1'){
					myModal.open('Muchas gracias',pic.msjSuccess);
				}else{
					myModal.open('Oops','Parece que ha ocurrido un error subiendo la imagen. Por favor intenta de nuevo');
		            
				}
				
	        },
	        function(error) {
	        	console.log(r);
	            
	            pic.LAST_IMG = null;
				pic.IMG_URI_PROFILE = null;
				cortina.hide();
	            myModal.open('Oops','Parece que ha ocurrido un error subiendo la imagen. Por favor intenta de nuevo');
	            
	        }, options
	    );
	},
	useCamera: function(){
		
			navigator.camera.getPicture(
			    	pic.imagenSeleccionada,
			        pic.onFail,
			        { 	quality: 49,
			        	destinationType: Camera.DestinationType.FILE_URI,
			            sourceType: Camera.PictureSourceType.CAMERA,
			            encodingType : Camera.EncodingType.JPEG,
			            allowEdit : true,
			            targetWidth : 320,
			    		targetHeight : 320,
			            correctOrientation: true
			        }
			    );
	},
	useFile: function(){
		
			navigator.camera.getPicture(
			    	pic.imagenSeleccionada,
			        pic.onFail,
			     	{
			        	quality: 49,
			        	destinationType: 2,
					    sourceType: 2,
			            encodingType : navigator.camera.EncodingType.JPEG,
			            allowEdit : true,
			            targetWidth : 320,
			    		targetHeight : 320,
			            correctOrientation: true
			        }
			    );
	},
	imagenSeleccionada: function(imageURI){
		
	},
	onFail: function(){
		pic.IMG_URI_PROFILE = null;
	}
};