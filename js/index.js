/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var user = {
	pass: null,
	email: null,
	role:null,
	estado:null
};
var myModal = {
		modal : $('#myModal'),
		modalHeader : $('#myModalHeader'),
		modalBody : $('#myModalBody'),
		open : function(header, body){
			myModal.modalHeader.html(header);
	        myModal.modalBody.html(body);
	        myModal.modal.modal();
		}
};
var login = {
	screen: $("#loginScreen"),
	form: $('#loginForm'),
	btnForm: $('#loginBtn'),
	login: function(formData){
		formData.action = 'login';
		$.ajax({
            url:app.url_ajax,
            dataType: 'json',
            data: formData,
            type: 'post',
            timeout: 15000,
            beforeSend: function(){
            	login.btnForm.loader('disable');
            },
            error: function(a,b,c){
                console.log('error '+JSON.stringify(a)+JSON.stringify(b));
                myModal.open('Oops','Parece que ha ocurrido un error. Por favor intenta de nuevo');
            },
            success: function(a){
            	console.log(JSON.stringify(a));
            	console.log(a.roles[0]);
            	if(a.msj_error){
            		myModal.open('Oops',a.msj_error);
            	}else{
            		user.pass = formData.user_pass;
            		user.email = formData.user_email;
            		user.estado = a.data.estado;
            		user.role = a.roles[0];
            		if(user.estado.toLowerCase()!='pendiente'){
            			login.screen.hide('slide',{direction:'left'},'fast');
            		}else{
            			myModal.open('Bienvenido','Tu cuenta todavía no ha sido aprobada. Un asesor se estará poniendo en contacto contigo pronto.');
            		}
            		
            		
            	}
           	    
            },
            complete: function(){ 
            	login.btnForm.loader('enable',"INICIAR SESION");
            }
       });
	},
	hide: function(){
		login.screen.hide('slide',{direction:'left'},'fast');
	}
};
var register = {
		screen: $('#registerScreen'),
		form: $('#registerForm'),
		btnForm: $('#registerBtn'),
		register: function(formData){
			formData.action = 'register_user';
			console.log(JSON.stringify(formData));
			$.ajax({
	            url:app.url_ajax,
	            dataType: 'json',
	            data: formData,
	            type: 'post',
	            timeout: 15000,
	            beforeSend: function(){
	            	register.btnForm.loader('disable');
	            },
	            error: function(a,b,c){
	                console.log('error '+JSON.stringify(a)+JSON.stringify(b));
	                myModal.open('Oops','Parece que ha ocurrido un error. Por favor intenta de nuevo');
	            },
	            success: function(a){
	            	console.log(JSON.stringify(a));
	            	if(a.success && a.success=='1'){
	            		$(':input',register.form)
	          	    	  .not(':button, :submit, :reset, :hidden')
	          	    	  .val('')
	          	    	  .removeAttr('checked')
	          	    	  .removeAttr('selected');
	            		register.toggle('hide');
	            		if(formData.tipo_usario=='cliente'){
	            			user.pass = formData.user_pass;
	            			user.email = formData.user_email;
	            			user.role = 'cliente';
	            			user.estado = 'aprobado';
	            			login.screen.hide();
	            		}else{
	            			
	            			myModal.open('Bienvenido','Tu cuenta todavía no ha sido aprobada. Un asesor se estará poniendo en contacto contigo pronto.');
	                		
	            		}
	            		
	            		
	            	}else if(a.success && a.success=="0"){
	            		myModal.open('Oops',a.msj_error);
	            	}
	           	    
	            },
	            complete: function(){ 
	            	register.btnForm.loader('enable',"REGISTRARSE");
	            }
	       });
		},
		toggle: function(tipo){
			if(tipo=='hide'){
				register.screen.hide('slide',{direction:'right'},'fast');
			}else if(tipo=='show'){
				register.screen.show('slide',{direction:'right'},'fast');
			}
		}
};
var app = {
    
    url : 'http://megethosinmobiliaria.com/',
    url_ajax : 'http://megethosinmobiliaria.com/wp-admin/admin-ajax.php',
    loader_block: '<div style="display:block;margin:0 auto;width:40px;"><i class="fa fa-cog fa-spin" style="font-size:30px;font-color:black;"></i></div>',
    loader : '<div style="display:inline-block;margin:0 auto;width:40px;"><i class="fa fa-cog fa-spin" style="font-size:30px;font-color:black;"></i></div>',
    initialize: function() {
        
        //if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
        //ifmovil
    	if(false){  
        	console.log('es movil');
        	document.addEventListener("deviceready", this.onDeviceReady, false);
        } else {
        	console.log('no es movil');
            app.onDeviceReady();
        }
    },
    loadEvents: function(){
    	//Login Screen
    	login.form.parsley().on('form:success',function(){
    		var formData = login.form.getFormData();
    		login.login(formData);
    	});
    	login.form.parsley().on('form:submit',function(){
    		return false;
    	});
    	$('#tutorial-login').slick({
		  dots: true,
		  infinite: true,
		  speed: 300,
		  slidesToShow: 1,
		  adaptiveHeight: true,
		  arrows: false
		});
        //Register
    	register.form.parsley().on('form:success',function(){
    		var formData = register.form.getFormData();
    		register.register(formData);
    	});
    	register.form.parsley().on('form:submit',function(){return false;});
    	register.form.parsley().on('form:error',function(){
    		
    	});
    	
    },	
    onDeviceReady: function() {
        
        console.log('device ready');
        app.loadEvents();
    },
      
};

app.initialize();
$.fn.loader = function(tipo, texto){
	if(tipo==='disable'){
		$(this).attr('disabled',true);
		$(this).append(app.loader);
	}else{
		$(this).attr('disabled',false);
		$(this).html(texto);
	}
};
$.fn.scrollTo = function( target, options, callback ){
	  if(typeof options == 'function' && arguments.length == 2){ callback = options; options = target; }
	  var settings = $.extend({
	    scrollTarget  : target,
	    offsetTop     : 50,
	    duration      : 500,
	    easing        : 'swing'
	  }, options);
	  return this.each(function(){
	    var scrollPane = $(this);
	    var scrollTarget = (typeof settings.scrollTarget == "number") ? settings.scrollTarget : $(settings.scrollTarget);
	    var scrollY = (typeof scrollTarget == "number") ? scrollTarget : scrollTarget.offset().top + scrollPane.scrollTop() - parseInt(settings.offsetTop);
	    scrollPane.animate({scrollTop : scrollY }, parseInt(settings.duration), settings.easing, function(){
	      if (typeof callback == 'function') { callback.call(this); }
	    });
	  });
	}

$.fn.getFormData = function(){
	var thisForm = this;
	var data = {};
	$(thisForm).find('.inputpz').each(function(){
		var name = $(this).attr('name');
		if($(this).is('select')){
			data[name] = $(this).val();
		}else if($(this).is('input')){
			var type = $(this).attr('type');
			switch (type){
			case 'hidden':
				data[name] = $(this).val();
				break;
			case 'text':
				data[name] = $(this).val();
				break;
			case 'radio':
				var valor = $('input[name='+name+']:checked', thisForm).val();
				data[name] = valor;
				break;
			case 'checkbox':
				var valor = $('input[name='+name+']:checked', thisForm).map(function(){
					return this.value;
				}).get();
				data[name] = valor;
				break;
			case 'date':
				data[name] = $(this).val();
				break;
			case 'email':
				data[name] = $(this).val();
				break;
			case 'number':
				data[name] = $(this).val();
				break;
			case 'password':
				data[name] = $(this).val();
				break;
			case 'time':
				data[name] = $(this).val();
				break;
			case 'tel':
				data[name] = $(this).val();
				break;
			}
		}else if($(this).is('textarea')){
			
			data[name] = $(this).val();
		}
		
		//eval("data."+name+" = $(this).val();");
	});
	
	return data;
}

