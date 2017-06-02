

var fb = {
	button: $('#fb_login_button'),
	buttonHtml: 'Conectar con<div id="icono-facebook"></div>',
	fbLoginSuccess : function (userData) {
	    console.log("UserInfo: " + JSON.stringify(userData));
	},
	login: function(){
		fb.button.append(app.loader);
        fb.button.prop('disabled',true);
		facebookConnectPlugin.getLoginStatus(function(response) {
		  console.log(JSON.stringify(response));
		  if (response.status === 'connected') {
			    
			    console.log('entro connected');
			    var uid = response.authResponse.userID;
			    var accessToken = response.authResponse.accessToken;
			    fb.getInfo();
		  } else {
			  facebookConnectPlugin.login(["public_profile"],
					    function(response2){
				  			console.log("" + JSON.stringify(response2));
				  			var uid = response2.authResponse.userID;
				  			fb.getInfo();
						},
					    function (error) { 
							fb.button.html(fb.buttonHtml);
						     fb.button.prop('disabled',false);
						     myModal.open('Error','Ha ocurrido un error al conectarse a Facebook. Por favor intenta de nuevo');
							
							console.log("" + JSON.stringify(error));
						}
					);  
		  }
			 },function(error){
				 fb.button.html(fb.buttonHtml);
			     fb.button.prop('disabled',false);
			     myModal.open('Error','Ha ocurrido un error al conectarse a Facebook. Por favor intenta de nuevo');
				 console.log(""+JSON.stringify(error))
			 });
	},
	getInfo: function(){
		facebookConnectPlugin.api("/me/?fields=id,name,email",["public_profile"],
    		    function(response){
    		console.log("user info "+JSON.stringify(response));
    		
            if(typeof response.name != 'undefined' && response.name != null){
            	var user_name = response.name;                
            }else{ 
            	var user_name = 'Fiestero Perez';
            }      
            
            if(typeof response.email != 'undefined' && response.email != null){
            	var user_email = response.email;
            }else{
            	var user_email = response.id+"@"+response.id+'.com';
            }
            fb.wp_login(response.id,user_name, user_email);
    	},
    		function (error) {
    		 fb.button.html(fb.buttonHtml);
		     fb.button.prop('disabled',false);
		     myModal.open('Error','Ha ocurrido un error al conectarse a Facebook. Por favor intenta de nuevo');
			
    		console.log("error friends" + JSON.stringify(error)); 
    		}
    		);
	},
	getFriends: function(){
		console.log('get friends');
		facebookConnectPlugin.getLoginStatus(function(status){
        	console.log('Login Status: '+JSON.stringify(status));
        	facebookConnectPlugin.api("/me/friends?fields=uid",["user_friends"],
        		    function(respone){
        		console.log("friends "+JSON.stringify(respone));
        		
        	},
        		    function (error) { console.log("error friends" + JSON.stringify(error)); }
        		);
        	
        	
        	},function(error){
        		
        	});
		
	},
	wp_login: function(id,user_name,user_email){
		$.ajax({
            url:app.url_ajax,
            dataType: 'json',
            data: {
            	accion: 'fb_login',
            	user_login: id,
            	user_pass: id,
            	user_email: user_email,
            	user_name: user_name
            },
            type: 'post',
            timeout: 15000,
            error: function(a,b,c){
                console.log('error '+JSON.stringify(a)+JSON.stringify(b));
            },
            success: function(a){
                console.log(JSON.stringify(a));
                if(a.response !== undefined && a.response ==='1'){
                    user.setProps(id,id,(loginScreen.recordarPassword.prop('checked')+''));
                    loginScreen.loginPantalla.hide();
                    carteleraScreen.eventosSubscreen.get();
                    
                }else{
                	myModal.open('Error',a.msj_error);
                }
            },
            complete: function(){
            	fb.button.html(fb.buttonHtml);
   		     	fb.button.prop('disabled',false);
                
            }

    });
	}
};
