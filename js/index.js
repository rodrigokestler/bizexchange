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
var cortina = {
		cortina: $('#cortina'),
		container: $('#cortina_container'),
		show: function(){
			cortina.container.html(app.loader);
			cortina.cortina.show();
		},
		hide: function(){
			cortina.container.html('');
			cortina.cortina.hide();
		}
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
var user = {
	pass: null,
	email: null,
	role:null,
	estado:null,
	
	initialize: function(){
		user.email = window.localStorage.getItem('correo');
        console.log(user.email);
        user.pass = window.localStorage.getItem('password');
        console.log(user.pass);
        
        if(user.email != '' && user.pass != '' && user.email != undefined && user.pass != undefined){
        	
        		$('#user_email_login').val(user.email);
        		$('#user_pass_login').val(user.pass);
        		//login.loginBtn.trigger('click');
        		login.loginBtn.click();
        		//var formData = login.form.getFormData();
        		//login.login(formData);
            
        }
	}
};

var login = {
	screen: $("#loginScreen"),
	form: $('#loginForm'),
	btnForm: $('#loginBtn'),
	loginBtn: $('#loginBtn'),
	login: function(formData){
		formData.action = 'login';
		$.ajax({
            url:app.url_ajax,
            dataType: 'json',
            data: formData,
            type: 'post',
            timeout: 15000,
            beforeSend: function(){
            	cortina.show();
            },
            error: function(a,b,c){
                console.log('error '+JSON.stringify(a)+JSON.stringify(b));
                myModal.open('Oops','Parece que ha ocurrido un error. Por favor intenta de nuevo');
            },
            success: function(a){
            	console.log(JSON.stringify(a));
            	
            	if(a.msj_error){
            		myModal.open('Oops',a.msj_error);
            	}else{
            		
            		user.pass = formData.user_pass;
            		user.email = formData.user_email;
            		user.estado = a.data.estado;
            		user.role = a.roles[0];
            		window.localStorage.setItem('user',JSON.stringify(a));
            		window.localStorage.setItem('correo',user.email);
            		window.localStorage.setItem('password',user.pass);
            		login.screen.hide('slide',{direction:'left'},'fast');
            		/*
            		if(user.estado.toLowerCase()!='pendiente'){
            			login.screen.hide('slide',{direction:'left'},'fast');
            		}else{
            			myModal.open('Bienvenido','Tu cuenta todav�a no ha sido aprobada. Un asesor se estar� poniendo en contacto contigo pronto.');
            		}
            		*/
            		
            	}
           	    
            },
            complete: function(){ 
            	cortina.hide();
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
			if(formData.tipo_usuario=='asesor' && $("#telRegister",register.form).val().length!=8){
				myModal.open('Oops','Debes ingresar un número de teléfono de 8 digitos para poder contactarte. Todos los asesores serán aprobados previamente a utilizar la aplicación')
				return true;
			}
			
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
	            		if(formData.tipo_usuario=='cliente'){
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

var requerimiento = {
	crearScreen: $('#crear_requerimiento'),
	btnForm: $('#requerimientoBtn'),
	form: $('#requerimientoForm'), 
	requerimiento: function(formData){
		formData.action = 'crear_requerimiento';
		formData.user_email = user.email;
		formData.user_pass = user.pass;

		console.log(JSON.stringify(formData));

		if(formData.tipo_operacion==""){
			myModal.open('Oops','Debes elegir un tipo de requerimiento');
			return false;
		}

		if(formData.tipo_inmueble==""){
			myModal.open('Oops','Debes elegir un inmueble');
			return false;
		}

		$.ajax({
            url:app.url_ajax,
            dataType: 'json',
            data: formData,
            type: 'post',
            timeout: 15000,
            error: function(a,b,c){
                console.log('error '+JSON.stringify(a)+JSON.stringify(b));
                myModal.open('Oops','Parece que ha ocurrido un error. Por favor intenta de nuevo');
            },
            beforeSend: function(){
            	console.log("Entro!!");
            	cortina.show();
            },
            success: function(a){
            	console.log(JSON.stringify(a));
            	
            	if(a.msj_error){
            		myModal.open('Oops',a.msj_error);
            	}else{
            		myModal.open('Se ha creado el requerimiento con exito.');
            		requerimiento.toggle('hide');
            	}
           	    
            },
            complete: function(){
            	cortina.hide();
        	}
       	});
	},		
	toggle:function(tipo){
		if(tipo=='hide'){
			requerimiento.crearScreen.hide('slide',{direction:'right'},'fast');
		}else if(tipo=='show'){
			requerimiento.crearScreen.show('slide',{direction:'right'},'fast');
		}
	}
};





var propiedad = {
	crearScreen: $('#crear_propiedad'),
	btnForm: $('#propiedadBtn'),
	form: $('#propiedadForm'), 
	propiedad: function(formData){
		formData.action = 'crear_propiedad';
		formData.user_email = user.email;
		formData.user_pass = user.pass;

		console.log(JSON.stringify(formData));

		if(formData.tipo_operacion==""){
			myModal.open('Oops','Debes elegir un tipo de requerimiento');
			return false;
		}

		if(formData.tipo_inmueble==""){
			myModal.open('Oops','Debes elegir un inmueble');
			return false;
		}

		$.ajax({
            url:app.url_ajax,
            dataType: 'json',
            data: formData,
            type: 'post',
            timeout: 15000,
            error: function(a,b,c){
                console.log('error '+JSON.stringify(a)+JSON.stringify(b));
                myModal.open('Oops','Parece que ha ocurrido un error. Por favor intenta de nuevo');
            },
            beforeSend: function(){
            	console.log("Entro!!");
            	cortina.show();
            },
            success: function(a){
            	console.log(JSON.stringify(a));
            	
            	if(a.msj_error){
            		myModal.open('Oops',a.msj_error);
            	}else{
            		myModal.open('Se ha creado la propiedad con exito.');
            		requerimiento.toggle('hide');
            	}
           	    
            },
            complete: function(){
            	cortina.hide();
        	}
       	});
	},		
	toggle:function(tipo){
		if(tipo=='hide'){
			propiedad.crearScreen.hide('slide',{direction:'right'},'fast');
		}else if(tipo=='show'){
			propiedad.crearScreen.show('slide',{direction:'right'},'fast');
		}
	}
};



var app = {
    
    url : 'http://megethosinmobiliaria.com/',
    url_ajax : 'http://megethosinmobiliaria.com/wp-admin/admin-ajax.php',
    loader_block: '<div style="display:block;margin:0 auto;width:40px;"><i class="fa fa-cog fa-spin" style="font-size:30px;font-color:black;"></i></div>',
    loader2 : '<div style="display:inline-block;margin:0 auto;width:40px;"><i class="fa fa-cog fa-spin" style="font-size:30px;font-color:black;"></i></div>',
    loader: '<i class="fa fa-circle-o-notch fa-spin fa-3x fa-fw"></i>',
    initialize: function() {
        
        //if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
        //ifmovil
    	if(movil){  
        	console.log('es movil');
        	document.addEventListener("deviceready", this.onDeviceReady, false);
        } else {
        	console.log('no es movil');
            app.onDeviceReady();
        }
    },
    loadEvents: function(){
    	//Tabs Home
    	/*
    	$(".tab-content").on("swiperight",function() {
    		console.log('swiperight');
            var $tab = $('#tablist .active').prev();
            if ($tab.length > 0)
                $tab.find('a').tab('show');
        });
        $(".tab-content").on("swipeleft",function() {
        	console.log('swipe left');
            var $tab = $('#tablist .active').next();
            if ($tab.length > 0)
                $tab.find('a').tab('show');
        });
        */
    	//General forms
    	$(document).on('focus','.inputpz',function(){
    		console.log('focus inputpz');
    		console.log($(this));
    		var parent = $(this).closest('.container');
    		console.log(parent);
    		parent.scrollTo(this);
    	});
    	
    	//Login Screen
    	
    	login.form.parsley().on('form:success',function(){
    		var formData = login.form.getFormData();
    		console.log(formData);
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




    	//Requerimiento
    	requerimiento.form.parsley().on('form:success',function(){
    		var formData = requerimiento.form.getFormData();
    		console.log('requerimiento success');
    		
    		requerimiento.requerimiento(formData);
    	});
    	requerimiento.form.parsley().on('form:submit',function(){return false;});
    	requerimiento.form.parsley().on('form:error',function(){

    	});



    	//Propiedad
    	propiedad.form.parsley().on('form:success',function(){
    		var formData = propiedad.form.getFormData();
    		propiedad.propiedad(formData);
    	});
    	propiedad.form.parsley().on('form:submit',function(){return false;});
    	propiedad.form.parsley().on('form:error',function(){
    		
    	});
    	console.log('load events');
    	login.screen.hide();
    	/*
    	setTimeout(function(){
    		user.initialize();
    	},2000);
    	*/
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
	    offsetTop     : 120,
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
	};

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
};

//REQUERIMIENTO





