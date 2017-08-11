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

                    //console.log(user.estado);
                    if(user.estado != 'aprobado'){
                        $(".btnCrear").css('display', 'none !important');
                    }else{
                        $(".btnCrear").css('display', 'block !important');
                    }

                    window.localStorage.setItem('user',JSON.stringify(a));
                    window.localStorage.setItem('correo',user.email);
                    window.localStorage.setItem('password',user.pass);

                    requerimiento.getRequerimientos(user.email, user.pass);
                    propiedad.getPropiedades(user.email, user.pass);
                    
                    


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
    btnUbicacionExtra: $('#ubicacion_extra'),
    containerUbicaciones: $('#contenedor_ubicaciones'),
    agregarUbicacion: function(){
        var cant_ubicaciones = $('.ubicacion-requerimiento').length;
        console.log(cant_ubicaciones);
        var id = cant_ubicaciones + 1;
        requerimiento.containerUbicaciones.append('<div class="ubicacion-requerimiento">'
                                       +' <table style="width:100%;">'
                                           +' <tr style="margin:2px 0;">'
                                             +'   <td colspan="6">'
                                               +'     <hr style="margin:0!important;">'
                                                +' </td>' 
                                            +' </tr>' 
                                            
                                            +' <tr>' 
                                               +'  <td colspan="2" class="texto-nuevo-requerimiento">Departamento</td>' 
                                                +' <td colspan="3">' 
                                                +'     <select name="departamento-'+id+'" class="color-gris-oscuro select_formR departamento inputpz" style="border:none;">' 
                                                        
                                                 +'    </select>' 
                                               +'  </td>' 
                                           +'  </tr>' 
                                           +'  <tr style="margin:2px 0;">' 
                                             +'    <td colspan="5">' 
                                             +'        <hr style="margin:0!important;">' 
                                               +'  </td>' 
                                           +'  </tr>' 
                                           +'  <tr>' 
                                               +'  <td colspan="2" class="texto-nuevo-requerimiento">Municipio</td>' 
                                               +'  <td colspan="3">' 
                                               +'      <select name="municipio-'+id+'"  class="color-gris-oscuro select_formR municipio inputpz" style="border:none;">' 
                                                        
                                                  +'   </select>' 
                                               +'  </td>' 
                                           +'  </tr>' 
                                            +' <tr style="margin:2px 0;">' 
                                               +'  <td colspan="5">' 
                                                 +'   <hr style="margin:0!important;">' 
                                                +' </td>' 
                                            +' </tr>' 
                                            +' <tr>'                                             
                                               +'  <td colspan="2" class="texto-nuevo-requerimiento">Zona</td>' 
                                               +'  <td colspan="3">' 
                                                  +'   <select name="zona-'+id+'" class="color-gris-oscuro select_formR zona inputpz" style="border:none;">'
                                                     +'       <option value="1">1</option>'
                                                      +'      <option value="2">2</option>'
                                                       +'     <option value="3">3</option>'
                                                        +'    <option value="4">4</option>'
                                                         +'   <option value="5">5</option>'
                                                          +'  <option value="6">6</option>'
                                                           +' <option value="7">7</option>'
                                                            +'<option value="8">8</option>'
                                                            +'<option value="9">9</option>'
                                                            +'<option value="10">10</option>'
                                                            +'<option value="11">11</option>'
                                                            +'<option value="12">12</option>'
                                                            +'<option value="13">13</option>'
                                                            +'<option value="14">14</option>'
                                                            +'<option value="15">15</option>'
                                                            +'<option value="16">16</option>'
                                                            +'<option value="17">17</option>'
                                                            +'<option value="18">18</option>'
                                                            +'<option value="19">19</option>'
                                                            +'<option value="21">21</option> '
                                                   +'  </select>' 
                                                    +'<input type="hidden" name="cant_ubicaciones" value="'+cant_ubicaciones+'">'
                                            +' </tr>' 
                                           +'  <tr style="margin:2px 0;">' 
                                               +'  <td colspan="5">' 
                                                   +'  <hr style="margin:0!important;">' 
                                               +'  </td>' 
                                           +'  </tr>' 

                                           +'  <tr>' 
                                               +'  <td colspan="2" class="texto-nuevo-requerimiento">Km</td>' 
                                                +' <td colspan="3"><input name="km-'+id+'"  class="color-gris-oscuro inputpz inputText" style="text-align:center;border:none;width:100px;" type="number">' 
                                               +'  </td>'
                                           +'  </tr>'
                                           +'  <tr style="margin:2px 0;">'
                                               +'  <td colspan="5">'
                                                +'     <hr style="margin:0!important;">'
                                                +' </td>'
                                           +'  </tr>'

                                             +' <tr>'
                                              +'   <td colspan="3" class="texto-nuevo-requerimiento">Otras especificaciones</td>'
                                              +'   <td colspan="2" style="text-align: rigth;"><input name="otras_espec-'+id+'"  class="color-gris-oscuro inputpz inputText" style="text-align:center;border:none;width:100px;" placeholder="Ej: El naranjo..." type="text">'
                                              +'   </td>'
                                          +'   </tr>'
                                       +'  </table>'
                                   +'  </div>');
    },
    requerimiento: function(formData){
        formData.action = 'crear_requerimiento';
        formData.user_email = user.email;
        formData.user_pass = user.pass;

        
        console.log(JSON.stringify(formData));
        //console.log(formData.tipo_operacion);


        $.ajax({
            url:app.url_ajax,
            dataType: 'text',
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

                console.log(a);
               /* console.log(JSON.stringify(a));
                
                if(a.msj_error){
                    myModal.open('Oops',a.msj_error);
                }else{
                    myModal.open('Se ha creado el requerimiento con exito.');
                    requerimiento.getRequerimientos(user.email, user.pass);
                    requerimiento.toggle('hide');
                }*/
                
            },
            complete: function(){
                cortina.hide();
            }
        });
    },  
    getRequerimientos:function(user_email, user_pass){
        var formData = requerimiento.form.getFormData();
        formData.action = 'get_requerimientos';
        formData.user_email = user.email;
        formData.user_pass = user.pass;

        console.log(JSON.stringify(formData));

        $.ajax({
            url:app.url_ajax,
            dataType: 'text',
            data: formData,
            type: 'post',
            timeout: 15000,
            error: function(a,b,c){
                console.log('error '+JSON.stringify(a)+JSON.stringify(b));
                myModal.open('Oops','Parece que ha ocurrido un error. Por favor intenta de nuevo');
            },
            beforeSend: function(){
                console.log("Jalando requerimientos!!");
                //cortina.show();
            },
            success: function(a){
                console.log(a);
                if(a.msj_error){
                    myModal.open('Oops',a.msj_error);
                }else{
                    jQuery("#requerimientos-ul").html(a);                   
                }
                
            },
            complete: function(){
            }
        });
    },
    
    calcularPresupuesto:function(){
    	var tasa = $("#tasa_reque").val();
        var ingresos = $("#ingresos_reque").val();
        var egresos = $("#egresos_reque").val();
        var enganche = $("#enganche_reque").val();
        var plazo = $("#plazoA").val();

        $.ajax({
            url:app.url_ajax,
            dataType: 'text',
            data: {
                action: "calcular_presupuesto",
                tasa: tasa,
                ingresos: ingresos,
                egresos: egresos,
                enganche: enganche,
                plazo: plazo,

            },
            type: 'post',
            timeout: 15000,
            error: function(a,b,c){
                console.log('error '+JSON.stringify(a)+JSON.stringify(b));
                myModal.open('Oops','Parece que ha ocurrido un error. Por favor intenta de nuevo');
            },
            beforeSend: function(){
                console.log("Calculando presupuesto");
                cortina.show();
            },
            success: function(a){
                $("#presupuesto_max").val(a);
                $("#presupuesto_max").attr("readonly", "readonly");
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
                    propiedad.getPropiedades(user.email, user.pass);
                    propiedad.toggle('hide');
                }
                
            },
            complete: function(){
                cortina.hide();
            }
        });
    },      
    getPropiedades: function(user_email, user_pass){
        var formData = propiedad.form.getFormData();
        formData.action = 'get_propiedades';
        formData.user_email = user.email;
        formData.user_pass = user.pass;

        console.log(JSON.stringify(formData));

        $.ajax({
            url:app.url_ajax,
            dataType: 'text',
            data: formData,
            type: 'post',
            timeout: 15000,
            error: function(a,b,c){
                console.log('error '+JSON.stringify(a)+JSON.stringify(b));
                myModal.open('Oops','Parece que ha ocurrido un error. Por favor intenta de nuevo');
            },
            beforeSend: function(){
                console.log("Jalando propiedades!!");
                cortina.show();
            },
            success: function(a){
                console.log(a);
                if(a.msj_error){
                    myModal.open('Oops',a.msj_error);
                }else{
                    
                    //jQuery("#propiedades-ul").innerHTML = a;                  
                    jQuery("#propiedades-ul").html(a);                  
                    //var table = document.getElementById("tablePropiedades");
                    //table.innerHTML = a;
                    //alert(table.outerHTML);         
                    //table.innerHTML =  '<tr><td style="width:37%;position:relative;"><div style="background-image:url(\"http:\/\/megethosinmobiliaria.com/wp-content/uploads/2017/05/Fachada-de-moderna-casa-de-dos-pisos-wbhomes.com_.au-560x352.jpg\");" class="img-list-propiedades"></div></td><td><table class="table-propiedad"><tr><td colspan="5" class="color-azul font-600"># 1305</td></tr><tr><td colspan="3" class="color-azul font-600">casa en venta                        </td><td colspan="2" class="color-azul font-600">Q350,000                        </td></tr><tr><td colspan="5" class="color-gris" style="overflow:hidden;text-overflow:ellipsis;"> 3era calle B, 20-18 Zona 14                        </td></tr><tr><table style="margin-left:10px;width:100%"><tr class="color-gris" style="width:100%;"><td > 20mts<div class="icono-m2"></div></td><td > 2<div class="icono-niveles"></div></td><td > <div class="icono-habitaciones"></div></td><td > 2<div class="icono-parqueos"></div></td><td > <div class="icono-banos"></div></td></tr></table></tr></table></td></tr>';         

                }
                
            },
            complete: function(){
                cortina.hide();
            }
        });
    },
    
    
    getDepartamentos:function(){
    	
    	 $.ajax({
             url:app.url_ajax,
             dataType: 'text',
             data: {
                 action: "get_departamentos"
             },
             type: 'post',
             timeout: 15000,
             error: function(a,b,c){
                 console.log('error '+JSON.stringify(a)+JSON.stringify(b));
                 myModal.open('Oops','Parece que ha ocurrido un error. Por favor intenta de nuevo');
             },
             beforeSend: function(){
                 console.log("Jalando get_departamentos!!");
             },
             success: function(a){
                 console.log(a);
                 if(a.msj_error){
                     myModal.open('Oops',a.msj_error);
                 }else{
                     jQuery(".departamento").html(a);                    
                 }
                 
             },
             complete: function(){

             }
         });
    	
    	
    },
    
    getMisPropiedades: function(){
    	
    	 $.ajax({
             url:app.url_ajax,
             dataType: 'text',
             data: {
                 action: "get_mispropiedades",
                 user_email: user.email,
                 user_pass : user.pass
             },
             type: 'post',
             timeout: 15000,
             error: function(a,b,c){
                 console.log('error '+JSON.stringify(a)+JSON.stringify(b));
                 myModal.open('Oops','Parece que ha ocurrido un error. Por favor intenta de nuevo');
             },
             beforeSend: function(){
                 console.log("Jalando mis propiedades!!");
                 cortina.show();
             },
             success: function(a){
                 console.log(a);
                 if(a.msj_error){
                     myModal.open('Oops',a.msj_error);
                 }else{                
                     jQuery("#propiedades-ul").html(a);                  
                 }
                 
             },
             complete: function(){
                 cortina.hide();
             }
         });
    	
    },
    getMunicipios:function(depa){
    	 $.ajax({
             url:app.url_ajax,
             dataType: 'text',
             data: {
                 action: "get_municipios",
                 departamento: depa,

             },
             type: 'post',
             timeout: 15000,
             error: function(a,b,c){
                 console.log('error '+JSON.stringify(a)+JSON.stringify(b));
                 myModal.open('Oops','Parece que ha ocurrido un error. Por favor intenta de nuevo');
             },
             beforeSend: function(){
                 console.log("Jalando get_departamentos!!");
                 cortina.show();
             },
             success: function(a){
                 console.log(a);
                 if(a.msj_error){
                     myModal.open('Oops',a.msj_error);
                 }else{
                     jQuery(".municipio").html(a);                   
                 }
                 
             },
             complete: function(){
                 if(depa == 'GUA'){
                     $.ajax({
                         url:app.url_ajax,
                         dataType: 'text',
                         data: {
                             action: "get_zonas",
                             departamento: depa,

                         },
                         type: 'post',
                         timeout: 15000,
                         error: function(a,b,c){
                             console.log('error '+JSON.stringify(a)+JSON.stringify(b));
                             myModal.open('Oops','Parece que ha ocurrido un error. Por favor intenta de nuevo');
                         },
                         beforeSend: function(){
                             console.log("Jalando municipiops!!");
                         },
                         success: function(a){
                             $(".zona").html(a);
                         },
                         complete: function(){
                             cortina.hide();
                         }
                     });
                 }else{
                     cortina.hide();
                     $("#zona").attr("disabled", "disabled");
                 }
                 
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


var api_mapa = {

    data: null,        
    map: null,  
    markers: [],
    success: function(position){                
        //si queres centrar el mapa en la marca.
        api_mapa.map.setCenter(new google.maps.LatLng(position.coords.latitude,position.coords.longitude));        
        api_mapa.set_marker(position.coords.latitude,position.coords.longitude);
    },
    error: function(gps_error){
        console.log(JSON.stringify(gps_error));
        api_mapa.clean_markers();
    },
    init: function(){
        
        navigator.geolocation.getCurrentPosition(api_mapa.success,api_mapa.error,{ timeout: 30000 });
        
        api_mapa.appendMapScript();
    },
    
    appendMapScript: function() {
        if (typeof google === 'object' && typeof google.maps === 'object') {
            api_mapa.handleApiReady();
        } else {
            var script = document.createElement("script");
            script.type = "text/javascript";
            script.src = "http://maps.google.com/maps/api/js?sensor=false&libraries=geometry&callback=api_mapa.handleApiReady";
            document.body.appendChild(script);
        }
    },
    
    clean_markers: function(){
        for (var i = 0; i < api_mapa.markers.length; i++) {
            api_mapa.markers[i].setMap(null);
        }
        api_mapa.markers = [];  
    },
    
    set_marker: function(lat,lon){
        //aqui limpiamos las marcas actuales.
        for (var i = 0; i < api_mapa.markers.length; i++) {
            api_mapa.markers[i].setMap(null);
        }
        api_mapa.markers = [];  
        
        var marker = new google.maps.Marker({
            position: new google.maps.LatLng(lat, lon),
            map: api_mapa.map,
            info: {
                1: 'aqui va un JSON con data adicional que querras sacar'
            }
        });
            marker.addListener('click', function() {
                api_mapa.show_details(this);
        });

        api_mapa.markers.push(marker);
    },
    
    handleApiReady: function() {
                
        var center = new google.maps.LatLng(14.598497, -90.507067); //centro en zona 10
        var myOptions = {
            zoom: 14,
            center: center,       
        }
        api_mapa.map = new google.maps.Map(document.getElementById("mapa_"), myOptions);
        
       
    },
    
    ir: function(lat,lng){
        window.open("geo:"+lat+","+lng,'_system');
    },
    
    finish: function(){
        api_mapa.markers = null;  
        api_mapa.map = null;  
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
        propiedad.getDepartamentos();
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
        //login.screen.hide();
        
        setTimeout(function(){
            user.initialize();
        },1000);


        $(".departamento").on("change",function(){
	        var depa = $(this).val();
	        propiedad.getMunicipios(depa);
	       
    
        });


    $("#filtrocasa").click(function(){
        console.log($(this).attr('src'));

        if($(this).attr('src') == '../www/img/iconos/header-ver-propiedades.png'){
            $(this).attr('src', '../www/img/iconos/housewhite.png');
            $(this).css({
                'width' : '35px',
                'top' : '1px',
                'left' : '1px',
            });
            propiedad.getMisPropiedades();


        }else{
            $(this).attr('src','../www/img/iconos/header-ver-propiedades.png')
            $(this).css({
                'width' : '25px',
                'top' : '5px',
                'left' : '5px',
            });
            propiedad.getPropiedades();
        }
    });




    $(".mas").click(function(){
        var tr = $(this).closest('tr').prev();
        var valor = tr.find("input").val();
        var suma = parseInt(valor) + 1;
        tr.find("input").val(suma);
        
    });

    $(".menos").click(function(){
        var tr = $(this).closest('tr').prev();
        var valor = tr.find("input").val();
        if(valor > 0){
            var resta = parseInt(valor) -1;
            tr.find("input").val(resta);    
        }       
    });

    $("#formaPago").change(function(){
        var forma = $(this).val();
        console.log(forma);
        if(forma == "financiado"){
            $(".masInfoFinanciera").toggle('slow');
        }else if(forma == "contado"){
            $(".masInfoFinanciera").toggle('slow');
        }
    });


    $("#spanPre").click(function(){
       $(".masInfoPrecalificacion").toggle('slow');
       $("#presupuesto_max").removeAttr("readonly", "readonly");
    });

    $(".expandirInfo").click(function(){
        var div = $(this).closest('tr');
        var masInfo = div.closest('table').next();
        masInfo.toggle('slow');
        $(".arrowD").css("display", "none");
    });

    $(".contraerInfo").click(function(){
        $(".expandirInfo").click();
        $(".arrowD").css("display", "block");
    });

    $(".expandirInfoUbicacion").click(function(){
        var div = $(this).closest('tr');
        var masInfo = div.closest('tbody').next();
        masInfo.toggle();
        $(".arrowD").css("display", "none");
    });

    $(".contraerInfoUbicacion").click(function(){
        $(".expandirInfoUbicacion").click();
        $(".arrowD").css("display", "block");
    });

    $("#plazoA").change(function(){
        var anos = $(this).val();
        var result = parseInt(anos) * 12;
        $("#plazoM").val(result);
        requerimiento.calcularPresupuesto();
    });

    $("#micomi").change(function(){
        var precio = $("#precioP").val();
        var to = parseInt($(this).val())*parseInt(precio);
        var total = to / 100;
        $("#micomitotal").val(total);
    });

    $("#comicompar").change(function(){
        var totalcomi = $("#micomitotal").val();
        var to = parseInt($(this).val())*parseInt(totalcomi);;
        var total = to / 100;
        $("#comicompartotal").val(total);
    });

    api_mapa.init();

        
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

