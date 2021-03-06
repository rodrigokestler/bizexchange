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

var depar_html = "";
var carretera_html = "";
var zonas_html = "";

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
            if(header){
              myModal.modalHeader.html(header);  
            }else{
              myModal.modalHeader.html('');  
            }

            if(body){
              myModal.modalBody.html(body);  
            }else{
              myModal.modalBody.html('');  
            }
            
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
                login.loginBtn.click();
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
            //async: false,
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
                    console.log(user.role+" , "+user.estado);

                    if(user.estado == 'aprobado' && user.role == 'asesor'){
                        //alert("si puede crear chivas");
                        $(".btnCrear").toggle();
                    }

                    window.localStorage.setItem('user',JSON.stringify(a));
                    window.localStorage.setItem('correo',user.email);
                    window.localStorage.setItem('password',user.pass);

                    propiedad.getPropiedades(user.email, user.pass);
                    requerimiento.getRequerimientos(user.email, user.pass);
                    
                    propiedad.getDepartamentos("departamento-propiedades", "carretera-propiedades");


                    //api_map.set_marker(14.598497, -90.507067);
                   

                    login.screen.hide('slide',{direction:'left'},'fast');
                }
                
            },
            complete: function(){ 
                setTimeout(function(){
                  cortina.hide();
                  
                },3000)

                api_mapa.set_marker(14.598497, -90.507067);
            }
       });
    },
    hide: function(){
        login.screen.hide('slide',{direction:'left'},'fast');
    },
    show: function(){
        login.screen.show('slide',{direction:'right'},'fast');
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
                async: false,
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

                        if(formData.tipo_usuario=='cliente'){
                            user.pass = formData.user_pass;
                            user.email = formData.user_email;
                            user.role = 'cliente';
                            user.estado = 'aprobado';
                            
                        }else{
                            
                            myModal.open('Bienvenido','Tu cuenta todavía no ha sido aprobada. Un asesor se estará poniendo en contacto contigo pronto.');
                            
                        }
                        
                        
                    }else if(a.success && a.success=="0"){
                        myModal.open('Oops',a.msj_error);
                    }
                    
                },
                complete: function(){
                    $("#user_email_login").val(user.email);
                    $("#user_pass_login").val(user.pass);

                    register.screen.toggle("hide");
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

var busqueda = {
        screen: $('#screen_busqueda'),
        form: $('#busquedaForm'),
        btnForm: $('#busquedaBtn'),
        busqueda: function(formData){
            formData.action = 'buscar_requerimiento';
            console.log(JSON.stringify(formData));

            $.ajax({
                url:app.url_ajax,
                dataType: 'json',
                async: false,
                data: formData,
                type: 'post',
                timeout: 15000,
                beforeSend: function(){
                    cortina.show();
                    //register.btnForm.loader('disable');
                },
                error: function(a,b,c){
                    console.log('error '+JSON.stringify(a)+JSON.stringify(b));
                    myModal.open('Oops','Parece que ha ocurrido un error. Por favor intenta de nuevo');
                },
                success: function(a){
                    console.log(JSON.stringify(a));
                    
                },
                complete: function(){
                    cortina.hide();
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
    verScreen :$('#single_requerimiento'),
    btnForm: $('#requerimientoBtn'),
    form: $('#requerimientoForm'), 
    btnUbicacionExtra: $('#ubicacion_extra'),
    containerUbicaciones: $('#contenedor_ubicaciones'),

    agregarUbicacion: function(){
        var cant_ubicaciones = $('.ubicacion-requerimiento').length;
        console.log(cant_ubicaciones);
        var id = cant_ubicaciones + 1;
        requerimiento.containerUbicaciones.append('<table style="width:100%;" class="tableUbicacion-'+id+' ubicacionNueva">'
                                    +'<tr>'
                                       +' <td colspan="5" class="titulo-container-form">'
                                      +'  UBICACION '+(parseInt(cant_ubicaciones) + 1)+' <span class="resumen_ubi" id="resumen-'+id+'"></span>'
                                      +'  </td>'
                                      +'<td class="expandirInfoUbicacion" data-id="masInfoUbicacion-'+id+'" data-arrow="'+id+'">'
                                                +'    <div class="arrowD" id="arrowD-'+id+'" style="background-image:url(../www/img/iconos/arrowD.png); display: none; margin-right:30px;" ></div>'
                                                +'</td> '
                                      +'  <td style="padding-bottom: 5px;" colspan="1"><button style="margin-left:-15px;" class="btn_mas_menos quitarUbi" data-id="tableUbicacion-'+id+'"  type="button">-</button></td>'
                                   +' </tr>'
                               +' </table>'
                               +' <div id="contenedor_ubicaciones " class="tableUbicacion-'+id+' ubicacionNueva">'
                                        +'<div class="ubicacion-requerimiento" id="ubicacion-'+(parseInt(cant_ubicaciones) + 1)+'">'
                                       +' <table style="width:100%;">'
                                           +' <tr style="margin:2px 0;">'
                                             +'   <td colspan="6">'
                                               +'     <hr style="margin:0!important;">'
                                                +' </td>' 
                                            +' </tr>' 
                                            
                                            +' <tr>' 
                                               +'  <td colspan="2" class="texto-nuevo-requerimiento">Departamento</td>' 
                                                +' <td colspan="3">' 
                                                +'     <select name="departamento-'+id+'" class="color-gris-oscuro select_formR departamento inputpz" id="departamento-'+(parseInt(cant_ubicaciones) + 1)+'" data-id="municipio-'+(parseInt(cant_ubicaciones) + 1)+'" data-carre="carretera-'+id+'" data-zona="zona-'+id+'" style="border:none;">' 
                                                        
                                                 +'    </select>' 
                                               +'  </td>' 
                                           +'  </tr>' 
                                           +'  <tr style="margin:2px 0;">' 
                                             +'    <td colspan="5">' 
                                             +'        <hr style="margin:0!important;">' 
                                               +'  </td>'
                                           +'  </tr>' 
                                           +'<tbody class="masInfoUbicacion" id="masInfoUbicacion-'+id+'">'
                                           +'  <tr>' 
                                               +'  <td colspan="2" class="texto-nuevo-requerimiento">Municipio</td>' 
                                               +'  <td colspan="3">' 
                                               +'      <select name="municipio-'+id+'" id="municipio-'+id+'" class="color-gris-oscuro select_formR municipio inputpz" style="border:none;">' 
                                                         +'<option>--Seleccione--</option>   '
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
                                                  +'   <select name="zona-'+id+'" id="zona-'+id+'" class="color-gris-oscuro select_formR zona inputpz" style="border:none;">' 
                                                  +'<option>--Seleccione--</option>   '
                                                   +'  </select>' 
                                            +' </tr>' 
                                           +'  <tr style="margin:2px 0;">' 
                                               +'  <td colspan="5">' 
                                                   +'  <hr style="margin:0!important;">' 
                                               +'  </td>' 
                                           +'  </tr>' 

                                           +'  <tr>' 
                                               +'  <td colspan="1" class="texto-nuevo-requerimiento">Km</td>' 
                                                +' <td colspan="1"><input name="km-'+id+'" id="km-'+id+'" class="color-gris-oscuro inputpz inputText inputOE" style="text-align:center;border:none;width:30px;" type="number" value="0">' 
                                               +'  </td>'
                                               +'<td colspan="3">'
                                                 +' <select name="carretera-'+id+'" id="carretera-'+id+'" class="color-gris-oscuro select_formR carretera inputpz" style="border:none;">'
                                                  +'</select>'
                                              +'</td>'
                                           +'  </tr>'
                                           +'  <tr style="margin:2px 0;">'
                                               +'  <td colspan="5">'
                                                +'     <hr style="margin:0!important;">'
                                                +' </td>'
                                           +'  </tr>'

                                             +' <tr>'
                                              +'   <td colspan="3" class="texto-nuevo-requerimiento">Otras especificaciones</td>'
                                              +'   <td colspan="2" style="text-align: rigth;"><input name="otras_espec-'+id+'"  id="otras_espec-'+id+'" class="color-gris-oscuro inputpz inputText inputOE" style="text-align:center;border:none;width:100px;" placeholder="Ej: El naranjo..." type="text">'
                                              +'   </td>'
                                          +'   </tr>'
                                         +' <tr>'
                                          +'      <td colspan="5">'
                                          +'          <hr style="margin:0!important;">'
                                          +'      </td>'
                                          +'      <td class="contraerInfoUbicacion" data-id="masInfoUbicacion-'+id+'" data-arrow="'+id+'" colspan="5">'
                                          +'          <div class="arrowU" style="background-image:url(../www/img/iconos/arrowU.png)" ></div>'
                                           +'     </td>'
                                           +' </tr>'
                                          +'</tbody>'
                                       +'  </table>'
                                   +'  </div><br>');
          
            propiedad.getDepartamentos("departamento-"+id, "carretera-"+id);

            $(".departamento").on("change",function(){
                var depa = $(this).val();
                var municipio = $(this).attr("data-id"); 
                var carretera = $(this).attr("data-carre");
                var zona = $(this).attr("data-zona");
                propiedad.getMunicipios(depa, municipio, zona);
               
        
            });

            $("#departamento-"+id).focus();


            $(".quitarUbi").click(function(){
                var ubi = $(this).attr("data-id");
                $("."+ubi).remove();
            });

            $(".expandirInfoUbicacion").click(function(){
                var masInfo = $(this).attr("data-id");
                var arrow = $(this).attr("data-arrow");
                $("#resumen-"+arrow).html("");
                $("#departamento-"+arrow).closest("tr").toggle();
                $("#"+masInfo).toggle("slow");
                $("#arrowD-"+arrow).toggle();
            });

            $(".contraerInfoUbicacion").click(function(){
                var arrow = $(this).attr("data-arrow");
                var depar = $("#departamento-"+arrow).val().toLowerCase();
                var muni = $("#municipio-"+arrow).val();
                var zona = $("#zona-"+arrow).val();
                var km = $("#km-"+arrow).val();
                var carretera = $("#carretera-"+arrow).val();
                var otras_espec = $("#otras_espec-"+arrow).val();
                var departamento = $("#departamento-"+arrow+ " :selected").text();

                if(depar == ""){
                  depar = false;
                }
                if(zona == "--Seleccione--" || zona == undefined){
                  zona = false;
                }else{
                  zona = "Zona "+zona;
                }
                if(km == 0){
                  km = false;
                }else{
                  km = "Km "+km;
                }
                if(departamento == "--Seleccione--"){
                  departamento = false;
                }
                if(carretera == "--Seleccione--"){
                  carretera = false;
                }else{
                  carretera = carretera.replace("_", " ");
                }
                if(muni == "--Seleccione--"){
                  muni = false;
                }else if(muni == ""){
                  console.log("entro aqui");
                  muni = $("#municipio-"+arrow+" :selected").text();
                  console.log(muni);
                }else if(muni == null){
                  muni = "";
                }

                var resu = $.grep([km, carretera, zona, otras_espec, muni, departamento], Boolean).join(", ");
                $("#resumen-"+arrow).html(resu);  


                $("#departamento-"+arrow).closest("tr").toggle();
                var masInfo = $(this).attr("data-id");
                $("#"+masInfo).toggle("slow");
                $("#arrowD-"+arrow).toggle();
            });

            $(".inputOE").on("focusin", function(){
              $(this).removeAttr("placeholder");
              $(this).val("");
            });

            $(".inputOE").on("focusout", function(){
              if($(this).val==""){
                  $(this).attr("placeholder", "000");
                  $(this).val(0);   
              }
              
            });


          

    },
    requerimiento: function(formData){
        formData.action = 'crear_requerimiento';
        formData.user_email = user.email;
        formData.user_pass = user.pass;

        
        console.log(JSON.stringify(formData));
      
        $.ajax({
            url:app.url_ajax,
            dataType: 'json',
            async: false,
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
                requerimiento.clean();


                if($("#requerimientoBtn").text() == "Crear"){
                      myModal.open('Se ha creado el requerimiento con exito.');  
                    }else{
                      myModal.open('Se ha actualizado el requerimiento con exito.');  
                    }
                    
                    requerimiento.getRequerimientos(user.email, user.pass);
                    requerimiento.toggle('hide');

            },
            complete: function(){
                cortina.hide();
                $("#titulo_requerimiento").html("NUEVO REQUERIMIENTO");
                $("#requerimientoBtn").html("Crear");
                $("#id_requerimiento").val(0);
                $(".ubicacionNueva").remove();
                
            }
        });
    },  
    getRequerimientos:function(user_email, user_pass){

        $.ajax({
            url:app.url_ajax,
            dataType: 'html',
            async: false,
            data: {
              action: "get_requerimientos",
              user_email : user_email,
              user_pass : user_pass
            },
            type: 'post',
            timeout: 30000,
            error: function(a,b,c){
                console.log('error '+JSON.stringify(a)+JSON.stringify(b));
                myModal.open('Oops','Parece que ha ocurrido un error. Por favor intenta de nuevo');
            },
            beforeSend: function(){
                console.log("Jalando requerimientos!!");
                cortina.show();
            },
            success: function(a){
                console.log(a);

                if(!a){
                  requerimiento.getRequerimientos(user_email, user_pass);
                }

                if(a.msj_error){
                    myModal.open('Oops',a.msj_error);
                }else{
                    jQuery("#requerimientos-ul").html(a);   

                }

                $(".requerimiento").on("click", function(){
                      var id = $(this).attr("data-id");
                      var tipo = $(this).attr("data-tipo");
                      requerimiento.getSingleRequerimiento(id,tipo);        
                });    
                
                $('.requerimiento').each(function(){   //tagname based selector
                    var top = $(this).position();
                    var mc = new Hammer(this);
                    var autor = $(this).attr("data-mail");
                    var dis = $(this);
                    var aux_1 = "";
                    var aux_2 = "";
                     mc.on("press", function(e) {
                          console.log(e.type);
                          if(autor == user.email){
                            var id = dis.attr("data-id");
                            var estado = dis.attr("data-estado");
                            var tipo = dis.attr("data-tipo");
                            var estado_ = dis.attr("data-value-estado");
                            if(estado_ == "disponible"){
                              aux_1 = "selected";
                            }else{
                              aux_2 = "selected";
                            }
                            var html = '<div class="divTaphold tapholdOptions" style="position:absolute; top:'+top.top+'px !important " >'
                                        +'<p style="padding-top: 5px;" data-id="'+id+'" class="editar_prop">Editar</p>'
                                        +'<p class="eliminar_x" data-id="'+id+'">Eliminar</p>'
                                        +'Estado   '
                                            +'<select id="select_estadoInmueble" data-id="'+id+'" style=" margin-top: 0px !important; margin-left: 5px !important;">'
                                               +' <option value="disponible" '+aux_1+'>Disponible</option>'
                                               +' <option value="'+estado+'" '+aux_2+'>'+estado+'</option>'
                                          +'  </select>'
                                    +'</div>';
                            dis.parent().parent().prepend(html);
                            dis.addClass("prevent_click"); 

                          }else{
                            return;
                          }

                    });

                });        
                
            },
            complete: function(){
              cortina.hide();
              $(".divTaphold").remove();
              
            }
        });
    },
    getMisRequerimientos: function(){
      
       $.ajax({
             url:app.url_ajax,
             dataType: 'text',
             //async: false,
             data: {
                 action: "get_misrequerimientos",
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
                 console.log("Jalando mis requerimientos!!");
                 cortina.show();
             },
             success: function(a){
                 console.log(a);

                 if(!a){
                  requerimiento.getMisRequerimientos();
                 }

                 if(a.msj_error){
                     myModal.open('Oops',a.msj_error);
                 }else{                
                     jQuery("#requerimientos-ul").html(a);   

                }

                 $(".requerimiento").on("click", function(){
                      var id = $(this).attr("data-id");
                      var tipo = $(this).attr("data-tipo");
                      requerimiento.getSingleRequerimiento(id,tipo);        
                });    
                
                $('.requerimiento').each(function(){ 
                     var top = $(this).position();
                    var mc = new Hammer(this);
                    var autor = $(this).attr("data-mail");
                    var dis = $(this);
                    var aux_1 = "";
                    var aux_2 = "";
                      mc.on("press", function(e) {
                          console.log(e.type);
                          if(autor == user.email){
                            var id = dis.attr("data-id");
                            var estado = dis.attr("data-estado");
                            var tipo = dis.attr("data-tipo");
                            var estado_ = dis.attr("data-value-estado");
                            if(estado_ == "disponible"){
                              aux_1 = "selected";
                            }else{
                              aux_2 = "selected";
                            }
                            var html = '<div class="divTaphold tapholdOptions" style="position:absolute; top:'+top.top+'px !important " >'
                                        +'<p style="padding-top: 5px;" data-id="'+id+'" class="editar_prop">Editar</p>'
                                        +'<p class="eliminar_x" data-id="'+id+'">Eliminar</p>'
                                        +'Estado   '
                                            +'<select id="select_estadoInmueble" data-id="'+id+'" style=" margin-top: 0px !important; margin-left: 5px !important;">'
                                               +' <option value="disponible" '+aux_1+'>Disponible</option>'
                                               +' <option value="'+estado+'" '+aux_2+'>'+estado+'</option>'
                                          +'  </select>'
                                    +'</div>';
                            dis.parent().parent().prepend(html);
                            dis.addClass("prevent_click"); 

                          }else{
                            return false;
                          }

                    });

                });          
                 
             },
             complete: function(){
                 cortina.hide();
                 $(".divTaphold").remove();
                 
             }
         });
      
    },
    getSingleRequerimiento: function(id, tipo){
        console.log("ya dentro de la funcion "+id+" "+tipo);
        var id = id;
        var tipo = tipo;
        jQuery("#headerSingle_req").html("#"+id+" | "+tipo); 
        $('#headerSingle_req').css('textTransform', 'capitalize');
        $.ajax({
            url:app.url_ajax,
            dataType: 'text',
            async: false,
            data: {
              action: "get_single_requerimiento",
              id : id,
              user_email: user.email,
              user_pass : user.pass,
            },
            type: 'post',
            timeout: 15000,
            error: function(a,b,c){
                console.log('error '+JSON.stringify(a)+JSON.stringify(b));
                myModal.open('Oops','Parece que ha ocurrido un error. Por favor intenta de nuevo');
            },
            beforeSend: function(){
                console.log("Jalando single requerimiento!!");
                cortina.show();
            },
            success: function(a){
                console.log(a);
                if(a.msj_error){
                    myModal.open('Oops',a.msj_error);
                }else{
                    jQuery(".div_requerimiento_single").html(a);  

                }


                $(".expandirInfoRequerimientoSingle").click(function(){
                    var masInfo = $(".masInfoRequerimientoSingle");
                    masInfo.toggle('slow');
                    $(this).find(".arrowD").css("display", "none");
                });

                $(".contraerInfoRequerimientoSingle").click(function(){
                    $(".expandirInfoRequerimientoSingle").click();
                    $(".arrowD").css("display", "block");
                });
                
                
            },
            complete: function(){
              requerimiento.verScreen.toggle('show');
              cortina.hide();
              
            }
        });


    },
    calcularPresupuesto:function(){

         var tasa = $("#tasa_reque").val();
        var ingresos = $("#ingresos_reque").val();
        var egresos = $("#egresos_reque").val();
        var enganche = $("#enganche_reque").val();
        var plazo = $("#plazoA").val();

        console.log("ingresos : "+ingresos+" , egresos : "+egresos+" , enganche : "+enganche+" , plazo : "+plazo+" , tasa : "+tasa);

       $.ajax({
            url:app.url_ajax,
            dataType: 'text',
            async: false,
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

                var pre = $("#presupuesto_max").val();
                var cuotaMax = $("#cuota_max").val();
                var tasa = $("#tasa_reque").val();
                var plazo = $("#plazoA").val();

                console.log("presupuesto : "+pre+" , cuotaMax : "+cuotaMax+" , tasa : "+tasa+" , plazo : "+plazo);

                $.ajax({
                    url:app.url_ajax,
                    dataType: 'text',
                    async: false,
                    data: {
                      action: "calcular_montomaximo",
                      tasa: tasa,
                      plazo: plazo,
                      presupuesto: pre,
                      cuotaMax : cuotaMax
                    },
                    type: 'post',
                    timeout: 15000,
                    error: function(a,b,c){
                        console.log('error '+JSON.stringify(a)+JSON.stringify(b));
                        myModal.open('Oops','Parece que ha ocurrido un error. Por favor intenta de nuevo');
                    },
                    beforeSend: function(){
                        console.log("Calculando monto maximo");
                    },
                    success: function(a){
                        $("#monto_maximo").val(a);
                        
                    },
                    complete: function(){
                        cortina.hide();
                        

                    }           
                });
      
            }
        });
    },
    calcularCuoutaMaxima: function(){
        var ingresos = $("#ingresos_reque").val();
        var egresos = $("#egresos_reque").val();
        
        $.ajax({
            url:app.url_ajax,
            dataType: 'text',
            async: false,
            data: {
                action: "calcular_cuotamaxima",
                ingresos: ingresos,
                egresos: egresos,

            },
            type: 'post',
            timeout: 15000,
            error: function(a,b,c){
                console.log('error '+JSON.stringify(a)+JSON.stringify(b));
                myModal.open('Oops','Parece que ha ocurrido un error. Por favor intenta de nuevo');
            },
            beforeSend: function(){
                console.log("Calculando cuota maxima");
                cortina.show();
            },
            success: function(a){
                $("#cuota_max").val(a);
            },
            complete: function(){
              cortina.hide();
              
            }
        });
      
    }, 



     editarRequerimiento: function(post_id){

      $.ajax({
         url:app.url_ajax,
         dataType: 'json',
         //async: false,
         data: {
             action: "editar_requerimiento",
             post_id: post_id,
             user_email : user.email,
             user_pass : user.pass,
         },
         type: 'post',
         timeout: 15000,
         error: function(a,b,c){
             console.log('error '+JSON.stringify(a)+JSON.stringify(b));
             myModal.open('Oops','Parece que ha ocurrido un error. Por favor intenta de nuevo');
         },
         beforeSend: function(){
            cortina.show();
             console.log("trayendo info del requerimiento");
         },
         success: function(json_data){
              console.log(json_data);

              $("#titulo_requerimiento").html("EDITAR REQUERIMIENTO #"+post_id);
              $("#id_requerimiento").val(post_id);
              
              $.each(json_data, function(key, value){
                  if(key == "tipo_operacion" || key == "tipo_inmueble"){
                      $.each($("#requerimientoForm input[name='"+key+"']"), function(key1, value1){
                          if($(this).val() == value){
                            $(this).attr("checked", "checked");
                          }
                      });
                      return;
                  }else if(key == "cuarto_servicio" || key=="estudio" || key=="cisterna" || key == "precalificacion" || key == "ubicaciones"){
                    return;
                  }
                  $( "#requerimientoForm input[name='"+key+"']" ).val(value);
                   $("#requerimientoForm select[name='"+key+"']" ).val(value);

              });

              $("#plazoM").val(json_data.plazo * 12);

              var cont = 1;
              $.each(json_data.ubicaciones, function(key2, value2){
                    var cont1 = 1;
                  $.each(this, function(k, v) {
                      //console.log(cont1 +" "+k +" "+v );
                      var depa = "";

                      if(k == "departamento-"+cont &&  v == 'Alta Verapaz'){
                        depa = "AV";
                      }else if(k == "departamento-"+cont && v == 'Baja Verapaz'){
                          depa = "BV";
                      }else if(k == "departamento-"+cont && v == 'Chimaltenango'){
                          depa = "CHI";
                      }else if(k == "departamento-"+cont && v == 'Chiquimula'){
                          depa = "CHQ";
                      }else if(k == "departamento-"+cont && v == 'Petén'){
                          depa = "PE";
                      }else if(k == "departamento-"+cont && v == 'El Progreso'){
                          depa = "EP";
                      }else if(k == "departamento-"+cont && v == 'Quiché'){
                          depa = "QCH";
                      }else if(k == "departamento-"+cont && v == 'Escuintla'){
                          depa = "ESC";
                      }else if(k == "departamento-"+cont && v == 'Guatemala'){
                          depa = "GUA";
                      }else if(k == "departamento-"+cont && v == 'Huehuetenango'){
                          depa = "HUE";
                      }else if(k == "departamento-"+cont && v == 'Izabal'){
                          depa = "IZA";
                      }else if(k == "departamento-"+cont && v == 'Jalapa'){
                          depa = "JAL";
                      }else if(k == "departamento-"+cont && v == 'Jutiapa'){
                          depa = "JUT";
                      }else if(k == "departamento-"+cont && v == 'Retalhuleu'){
                          depa = "REU";
                      }else if(k == "departamento-"+cont && v == 'Sacatepéquez'){
                          depa = "SAC";
                      }else if(k == "departamento-"+cont && v == 'San Marcos'){
                          depa = "SM";
                      }else if(k == "departamento-"+cont && v == 'Santa Rosa'){
                          depa = "SR";
                      }else if(k == "departamento-"+cont && v == 'Sololá'){
                          depa = "SL";
                      }else if(k == "departamento-"+cont && v == 'Suchitepéquez'){
                          depa = "SUC";
                      }else if(k == "departamento-"+cont && v == 'Totonicapán'){
                          depa = "TOT";
                      }else if(k == "departamento-"+cont && v == 'Zacapa'){
                          depa = "ZAC";
                      }

                      if(cont1 == 1 ){
                        console.log(k + " " +depa);
                        $("#"+k).val(depa);
                        propiedad.getMunicipios(depa, "municipio-"+cont,"zona-"+cont,v);

                      }else if(cont1 == 3 || cont1 == 5 ){
                        if(v){
                          $('#'+k+' option[value='+v+']').prop('selected',true);  
                        }
                        
                      }else{
                        $("#"+k).val(v);
                      }

                      cont1=cont1+1;

                  });
                  cont = cont + 1;
                  if(cont <= json_data.ubicaciones.length){

                    $("#ubicacion_extra").click();

                  }
                  
              });
              


              $("#requerimientoBtn").html("ACTUALIZAR");


              if(json_data.cisterna){
                  $("#cisternaR").click();
              }
              if(json_data.estudio){
                  $("#estudioR").click();
              }
              if(json_data.cuarto_servicio){
                  $("#dormServR").click();
              }
              if(json_data.negociable){
                  $("#negociableP").click();
              }
              if(json_data.gastos_escritura){
                  $("#spanPre").click();
              }




              requerimiento.crearScreen.toggle("show");

              return;
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
    },
    clean: function(){
      $(':input','#requerimientoForm')
        .not(':button, :submit, :reset, :hidden')
        .val('')
        .removeAttr('checked')
        .removeAttr('selected');
    }
};

var propiedad = {
    crearScreen: $('#crear_propiedad'),
    verScreen: $('#single_propiedad'),
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
            async: false,
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
                propiedad.clean();
                console.log($("#propiedadBtn").text());
                if(a.msj_error){
                    myModal.open('Oops',a.msj_error);
                }else{
                    if($("#propiedadBtn").text() == "Crear"){
                      myModal.open('Se ha creado la propiedad con exito.');  
                    }else{
                      myModal.open('Se ha actualizado la propiedad con exito.');  
                    }
                    
                    propiedad.getPropiedades(user.email, user.pass);
                    propiedad.toggle('hide');
                }
                
            },
            complete: function(){
                cortina.hide();
                $("#titulo_propiedad").html("NUEVA PROPIEDAD");
                $("#propiedadBtn").html("Crear");
                $("#id_propiedad").val(0);
            }
        });
    },      
    getPropiedades: function(user_email, user_pass){
        $.ajax({
            url:app.url_ajax,
            dataType: 'html',
            async: false,
            data: {
              action: 'get_propiedades',
              user_email : user_email,
              user_pass : user_pass
            },
            type: 'post',
            timeout: 30000,
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
                if(!a){
                  propiedad.getPropiedades(user_email, user_pass);  
                }
                

                if(a.msj_error){
                    myModal.open('Oops',a.msj_error);
                }else{
                    jQuery("#propiedades-ul").html(a);  


                }
                 
                $(".propiedad").on("click", function(){
                    var id = $(this).attr("data-id");
                    var tipo = $(this).attr("data-tipo");
                    propiedad.getSinglePropiedad(id,tipo);        
                    
                });    
                
                $('.propiedad').each(function(){
                     var top = $(this).position();
                    var mc = new Hammer(this);
                    var autor = $(this).attr("data-mail");
                    var dis = $(this);
                    var aux_1 = "";
                    var aux_2 = "";
                      mc.on("press", function(e) {
                          console.log(e.type);
                          if(autor == user.email){
                            var id = dis.attr("data-id");
                            var estado = dis.attr("data-estado");
                            var tipo = dis.attr("data-tipo");
                            var estado_ = dis.attr("data-value-estado");
                            if(estado_ == "disponible"){
                              aux_1 = "selected";
                            }else{
                              aux_2 = "selected";
                            }
                            var html = '<div class="divTaphold tapholdOptions" style="position:absolute; top:'+top.top+'px !important " >'
                                        +'<p style="padding-top: 5px;" data-id="'+id+'" class="editar_prop">Editar</p>'
                                        +'<p class="eliminar_x" data-id="'+id+'">Eliminar</p>'
                                        +'Estado   '
                                            +'<select id="select_estadoInmueble" data-id="'+id+'" style=" margin-top: 0px !important; margin-left: 5px !important;">'
                                               +' <option value="disponible" '+aux_1+'>Disponible</option>'
                                               +' <option value="'+estado+'" '+aux_2+'>'+estado+'</option>'
                                          +'  </select>'
                                    +'</div>';
                            dis.parent().parent().prepend(html);
                            dis.addClass("prevent_click"); 

                          }else{
                            return false;
                          }

                    });


                });  

                
            },
            complete: function(){
                cortina.hide();
                
            }
        });
    },

    getSinglePropiedad: function(id, tipo){
        console.log("ya dentro de la funcion "+id+" "+tipo);
        
        $("#headerSingle_prop").text("#"+id+" | "+tipo);                 
        $('#headerSingle_prop').css('textTransform', 'capitalize');
        $.ajax({
            url:app.url_ajax,
            dataType: 'html',
            async: false,
            data: {
              action: "get_single_propiedad",
              id : id,
              user_email: user.email,
              user_pass : user.pass,
            },
            type: 'post',
            timeout: 15000,
            error: function(a,b,c){
                console.log('error '+JSON.stringify(a)+JSON.stringify(b));
                myModal.open('Oops','Parece que ha ocurrido un error. Por favor intenta de nuevo');
            },
            beforeSend: function(){
                console.log("Jalando single propiedad!!");
                cortina.show();
            },
            success: function(a){
                console.log(a);
                if(a.msj_error){
                    myModal.open('Oops',a.msj_error);
                }else{
                    jQuery(".div_propiedad_single").html(a);  
                }
                setTimeout(function(){
                  $('#carrusel-propiedades').slick({
                    dots: true,
                    infinite: true,
                    speed: 300,
                    slidesToShow: 1,
                    adaptiveHeight: true,
                    arrows: false
                  });
                }, 2000);
                 

              $(".expandirInfoPropiedadSingle").click(function(){
                  var masInfo = $(".masInfoPropiedadSingle");
                  masInfo.toggle('slow');
                  $(this).find(".arrowD").css("display", "none");
              });

              $(".contraerInfoPropiedadSingle").click(function(){
                  $(".expandirInfoPropiedadSingle").click();
                  $(".arrowD").css("display", "block");
              });

              $(".ratingSingle").starRating({
                totalStars: 5,
                starShape: 'rounded',
                starSize: 20,
                emptyColor: 'lightgray',
                hoverColor: 'rgb(0,110,202)',
                activeColor: 'rgb(0,110,202)',
                useGradient: false,
                readOnly: true,
                useFullStars : false
              });

              $(".ratingSingle").each(function(){
                  $(this).starRating("setRating", $(this).data("value"));
              });



                
            },
            complete: function(){
              propiedad.verScreen.toggle('show');
              cortina.hide();
              
            }
        });
    },

    getMisPropiedades: function(){  
       $.ajax({
             url:app.url_ajax,
             dataType: 'text',
             //async: false,
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

                if(!a){
                  propiedad.getMisPropiedades();  
                }

                 if(a.msj_error){
                     myModal.open('Oops',a.msj_error);
                 }else{                
                     jQuery("#propiedades-ul").html(a);  

                }

                $(".propiedad").on("click", function(){
                     var id = $(this).attr("data-id");
                    var tipo = $(this).attr("data-tipo");
                    propiedad.getSinglePropiedad(id,tipo);        
                });    
                
                $('.propiedad').each(function(){   //tagname based selector
                     var top = $(this).position();
                    var mc = new Hammer(this);
                    var autor = $(this).attr("data-mail");
                    var dis = $(this);
                    var aux_1 = "";
                    var aux_2 = "";
                     mc.on("press", function(e) {
                          console.log(e.type);
                          if(autor == user.email){
                            var id = dis.attr("data-id");
                            var estado = dis.attr("data-estado");
                            var tipo = dis.attr("data-tipo");
                            var estado_ = dis.attr("data-value-estado");
                            if(estado_ == "disponible"){
                              aux_1 = "selected";
                            }else{
                              aux_2 = "selected";
                            }
                            var html = '<div class="divTaphold tapholdOptions" style="position:absolute; top:'+top.top+'px !important " >'
                                        +'<p style="padding-top: 5px;" data-id="'+id+'" class="editar_prop">Editar</p>'
                                        +'<p class="eliminar_x" data-id="'+id+'">Eliminar</p>'
                                        +'Estado   '
                                            +'<select id="select_estadoInmueble" data-id="'+id+'" style=" margin-top: 0px !important; margin-left: 5px !important;">'
                                               +' <option value="disponible" '+aux_1+'>Disponible</option>'
                                               +' <option value="'+estado+'" '+aux_2+'>'+estado+'</option>'
                                          +'  </select>'
                                    +'</div>';
                            dis.parent().parent().prepend(html);
                            dis.addClass("prevent_click"); 

                          }else{
                            return false;
                          }

                    });
                });              
                 
             },
             complete: function(){
                 cortina.hide();
                 
             }
         });
      
    },    
    calcularIUSI: function(){  
      var precio = $("#precioP").val();
       $.ajax({
             url:app.url_ajax,
             dataType: 'text',
             async: false,
             data: {
                 action: "calcular_IUSI",
                 precio:precio,
             },
             type: 'post',
             timeout: 15000,
             error: function(a,b,c){
                 console.log('error '+JSON.stringify(a)+JSON.stringify(b));
                 myModal.open('Oops','Parece que ha ocurrido un error. Por favor intenta de nuevo');
             },
             beforeSend: function(){
                 console.log("calculando iusi");
                 cortina.show();
             },
             success: function(a){
                 console.log(a);
                 if(a.msj_error){
                     myModal.open('Oops',a.msj_error);
                 }else{                
                     jQuery("#iusi").val(a);  

                }

                 
             },
             complete: function(){
                 cortina.hide();
                 
             }
         });
      
    },  

    getDepartamentos:function(departamento, carretera){

      if(depar_html){
          $("#"+departamento).html(depar_html);
          $("#"+carretera).html(carretera_html);
      }else{

       $.ajax({
             url:app.url_ajax,
             dataType: 'text',
             //async: false,
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
                  cortina.show();
                 console.log("Jalando get_departamentos!!");
             },
             success: function(a){
                 console.log(a);

                 if(!a){
                    propiedad.getDepartamentos(departamento, carretera);
                 }

                 if(a.msj_error){
                     myModal.open('Oops',a.msj_error);
                 }else{
                     depar_html = a;                   
                     $( "#"+departamento).html(a);
                 }
                 
             },
             complete: function(){
                if(carretera_html){
                    $("#"+carretera).html(carretera_html);
                }else{
                    $.ajax({
                       url:app.url_ajax,
                      //async: false,
                       dataType: 'text',
                       data: {
                           action: "get_carreteras",
                       },
                       type: 'post',
                       timeout: 15000,
                       error: function(a,b,c){
                           console.log('error '+JSON.stringify(a)+JSON.stringify(b));
                           myModal.open('Oops','Parece que ha ocurrido un error. Por favor intenta de nuevo');
                       },
                       beforeSend: function(){
                           console.log("Jalando carreteras!!");
                       },
                       success: function(a){
                            console.log(a);
                           carretera_html = a;
                           $("#"+carretera).html(a);
                       },
                       complete: function(){
                           cortina.hide();
                           
                      }
                  });
              }
             }
         });

      }
      
      
    },
    getMunicipios:function(depa, municipio,zona,v=null){
       $.ajax({
             url:app.url_ajax,
             dataType: 'text',
             async: false,
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
                 console.log("Jalando municipios de "+depa);
                 cortina.show();
             },
             success: function(a){
                 console.log(a);
                 if(!a){
                    getMunicipios(depa, municipio, zona, v);
                 }
                 if(a.msj_error){
                     myModal.open('Oops',a.msj_error);
                 }else{
                     jQuery("#"+municipio).html(a);   
                     if(v!=null){
                      console.log(municipio);
                      console.log("v no es null "+v);
                      $('#'+municipio+' option:contains("' + v + '")').prop('selected',true); 
                    }


                 }
                 
             },
             complete: function(){    
              if(zonas_html){
                  $("#"+zona).html(zonas_html);
                  //$('#'+municipio+' option:contains("' + v + '")').prop('selected',true); 
              } else{

               $.ajax({
                   url:app.url_ajax,
                   dataType: 'text',
                   data: {
                       action: "get_zonas",
                   },
                   async: false,
                   type: 'post',
                   timeout: 15000,
                   error: function(a,b,c){
                       console.log('error '+JSON.stringify(a)+JSON.stringify(b));
                       myModal.open('Oops','Parece que ha ocurrido un error. Por favor intenta de nuevo');
                   },
                   beforeSend: function(){
                       console.log("Jalando zonas...");
                   },
                   success: function(a){
                        zonas_html = a;
                        $("#"+zona).html(a);
                   },
                   complete: function(){
                       cortina.hide();
                   }
                });
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
    },
    clean: function(){
      $(':input','#propiedadForm')
        .not(':button, :submit, :reset, :hidden')
        .val('')
        .removeAttr('checked')
        .removeAttr('selected');
    },
    borrarPost: function(post_id){
      $.ajax({
         url:app.url_ajax,
         dataType: 'text',
         //async: false,
         data: {
             action: "borrar_post",
             post_id: post_id,

         },
         type: 'post',
         timeout: 15000,
         error: function(a,b,c){
             console.log('error '+JSON.stringify(a)+JSON.stringify(b));
             myModal.open('Oops','Parece que ha ocurrido un error. Por favor intenta de nuevo');
         },
         beforeSend: function(){
              cortina.show();
             console.log("borrando post");
         },
         success: function(a){
              console.log(a);
              if(a == "propiedades" && $("#filtrocasa").attr("src") == "../www/img/iconos/housewhite.png"){
                  propiedad.getMisPropiedades();
              }else if(a == "propiedades" && $("#filtrocasa").attr("src") != "../www/img/iconos/housewhite.png"){
                  propiedad.getPropiedades(user.email, user.pass);

              }if(a == "requerimientos" && $("#filtrocasa").attr("src") == "../www/img/iconos/housewhite.png"){
                  requerimiento.getMisRequerimientos();
              }else if(a == "requerimientos" && $("#filtrocasa").attr("src") != "../www/img/iconos/housewhite.png"){
                  requerimiento.getRequerimientos(user.email, user.pass);

              }
             myModal.open('', 'Se ha borrado con exito.');

         },
         complete: function(){
             cortina.hide();
             
             $(".divTaphold").remove();
         }
     });
    },


    cambiarEstado: function(post_id, estado){
      $.ajax({
         url:app.url_ajax,
         dataType: 'text',
         //async: false,
         data: {
             action: "cambiar_estado",
             post_id: post_id,
             estado : estado

         },
         type: 'post',
         timeout: 15000,
         error: function(a,b,c){
             console.log('error '+JSON.stringify(a)+JSON.stringify(b));
             myModal.open('Oops','Parece que ha ocurrido un error. Por favor intenta de nuevo');
         },
         beforeSend: function(){
              cortina.show();
             console.log("Cambiando estado");
         },
         success: function(a){
              console.log(a);
              if(a == "propiedades" && $("#filtrocasa").attr("src") == "../www/img/iconos/housewhite.png"){
                  propiedad.getMisPropiedades();
              }else if(a == "propiedades" && $("#filtrocasa").attr("src") != "../www/img/iconos/housewhite.png"){
                  propiedad.getPropiedades(user.email, user.pass);

              }if(a == "requerimientos" && $("#filtrocasa").attr("src") == "../www/img/iconos/housewhite.png"){
                  requerimiento.getMisRequerimientos();
              }else if(a == "requerimientos" && $("#filtrocasa").attr("src") != "../www/img/iconos/housewhite.png"){
                  requerimiento.getRequerimientos(user.email, user.pass);

              }
             myModal.open('', 'El estado se ha cambiado con exito.');

         },
         complete: function(){
             cortina.hide();
             
             $(".divTaphold").remove();
         }
     });
    },


    editarPropiedad: function(post_id){

      $.ajax({
         url:app.url_ajax,
         dataType: 'json',
         //async: false,
         data: {
             action: "editar_propiedad",
             post_id: post_id,
             user_email : user.email,
             user_pass : user.pass,
         },
         type: 'post',
         timeout: 15000,
         error: function(a,b,c){
             console.log('error '+JSON.stringify(a)+JSON.stringify(b));
             myModal.open('Oops','Parece que ha ocurrido un error. Por favor intenta de nuevo');
         },
         beforeSend: function(){
              cortina.show();
             console.log("trayendo info de la propiedad");
         },
         success: function(json_data){
              console.log(json_data);
              //var arreglo = JSON.parse(a);
              //console.log(arreglo);

              $("#titulo_propiedad").html("EDITAR PROPIEDAD #"+post_id);
              $("#id_propiedad").val(post_id);
              $.each(json_data, function(key, value){
                  console.log(key, value);
                  if(key == "tipo_operacion" || key == "tipo_inmueble"){
                      $.each($("#propiedadForm input[name='"+key+"']"), function(key1, value1){
                          //console.log($(this).val() +"=="+value);
                          if($(this).val() == value){
                            $(this).attr("checked", "checked");
                          }
                      });
                      return;
                  }else if(key == "cuarto_servicio" || key=="estudio" || key=="cisterna" || key == "negociable" || key=="gastos_escritura"){
                    return;
                  }
                  $( "#propiedadForm input[name='"+key+"']" ).val(value);
                   $("#propiedadForm select[name='"+key+"']" ).val(value);

              });

              var depa = "";
              if(json_data.departamento == 'Alta Verapaz'){
                depa = "AV";
              }else if(json_data.departamento == 'Baja Verapaz'){
                  depa = "BV";
              }else if(json_data.departamento == 'Chimaltenango'){
                  depa = "CHI";
              }else if(json_data.departamento == 'Chiquimula'){
                  depa = "CHQ";
              }else if(json_data.departamento == 'Petén'){
                  depa = "PE";
              }else if(json_data.departamento == 'El Progreso'){
                  depa = "EP";
              }else if(json_data.departamento == 'Quiché'){
                  depa = "QCH";
              }else if(json_data.departamento == 'Escuintla'){
                  depa = "ESC";
              }else if(json_data.departamento == 'Guatemala'){
                  depa = "GUA";
              }else if(json_data.departamento == 'Huehuetenango'){
                  depa = "HUE";
              }else if(json_data.departamento == 'Izabal'){
                  depa = "IZA";
              }else if(json_data.departamento == 'Jalapa'){
                  depa = "JAL";
              }else if(json_data.departamento == 'Jutiapa'){
                  depa = "JUT";
              }else if(json_data.departamento == 'Retalhuleu'){
                  depa = "REU";
              }else if(json_data.departamento == 'Sacatepéquez'){
                  depa = "SAC";
              }else if(json_data.departamento == 'San Marcos'){
                  depa = "SM";
              }else if(json_data.departamento == 'Santa Rosa'){
                  depa = "SR";
              }else if(json_data.departamento == 'Sololá'){
                  depa = "SL";
              }else if(json_data.departamento == 'Suchitepéquez'){
                  depa = "SUC";
              }else if(json_data.departamento == 'Totonicapán'){
                  depa = "TOT";
              }else if(json_data.departamento == 'Zacapa'){
                  depa = "ZAC";
              }


              propiedad.getDepartamentos("departamento-propiedades", "carretera-propiedades");
              $("#departamento-propiedades").val(depa);
              propiedad.getMunicipios(depa, "municipio-propiedades", "zona-propiedades");
              $("#municipio-propiedades").val(json_data.municipio);
              $("#zona-propiedades").val(json_data.zona);
              $("#carretera-propiedades").val(json_data.carretera);

              $("#propiedadBtn").html("ACTUALIZAR");

              $.each($(".rating"), function(key2, value2){
                  var rat = $(this).next().val();
                  $(this).starRating('setRating', rat);     
              }); 

              $(".ratingResult").starRating('setRating', json_data.comunidad); 
              //$(".ratingResult").next().val((Math.round(prome * 2) / 2).toFixed(1));

              if(json_data.cisterna){
                  $("#cisternaP").click();
              }
              if(json_data.estudio){
                  $("#estudioP").click();
              }
              if(json_data.cuarto_servicio){
                  $("#dormServP").click();
              }
              if(json_data.negociable){
                  $("#negociableP").click();
              }
              if(json_data.gastos_escritura){
                  $("#gastosEscritura").click();
              }




              propiedad.crearScreen.toggle("show");
         },
         complete: function(){
             cortina.hide();
             
             
         }
     });


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
            //position: center,
            position: new google.maps.LatLng(lat, lon),
            map: api_mapa.map,
            draggable : true,
            info: {
                1: 'aqui va un JSON con data adicional que querras sacar'
            }, 
        });
        //    marker.addListener('click', function() {
        //});
                //api_mapa.show_details(this);
        google.maps.event.addListener(marker, 'click', function () { 

        });
        google.maps.event.addListener(marker, 'dragend', function () {
            console.log(marker.getPosition());
            api_mapa.map.setCenter(marker.getPosition());
            $('#coordenadas').val(marker.getPosition());
        });

        api_mapa.markers.push(marker);
    },
    
    handleApiReady: function() {
                
        var center = new google.maps.LatLng(14.598497, -90.507067); //centro en zona 10

        var myOptions = {
            zoom: 14,
            center: center,
            draggable: true
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

//ASESORES
var imagenes = {
	screen: $('#listado_imagenes_adjuntas')
};
var asesor = {
    aprobarScreen: $('#aprobar_asesor'),
    verScreen: $('#listado_asesores'),
    btnForm: $('#actualizarAsesorBtn'),
    form: $('#asesorForm'), 
    asesor: function(formData){
        formData.action = 'aprobar_asesor';
        formData.user_email = user.email;
        formData.user_pass = user.pass;

        console.log(JSON.stringify(formData));

        $.ajax({
            url:app.url_ajax,
            dataType: 'text',
            async: false,
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
                asesor.clean();
                myModal.open('Se ha aprobado al asesor con exito.');
                asesor.aprobarScreen.toggle('hide');
                $("#listado_asesores").css("display", "block");

                //asesor.verScreen.html(a);
                    
              
                
            },
            complete: function(){
                cortina.hide();
                
            }
        });
    },

    verAsesor: function(){

      $.ajax({
            url:app.url_ajax,
            dataType: 'text',
            async: false,
             data: {
                 action: "get_asesores",
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
                console.log("Entro!!");
                cortina.show();
            },
            success: function(a){
                console.log(JSON.stringify(a));
                propiedad.clean();
                if(a.msj_error){
                    myModal.open('Oops',a.msj_error);
                }else{
                    $("#body_asesores").html(a);
                    $("#listado_asesores").toggle("slow");
                }
                
            },
            complete: function(){
                cortina.hide();
                
            }
        });

    },
    traer_single_asesor: function(attr){
        var id = $(attr).data('id');
        $.ajax({
            url:app.url_ajax,
            dataType: 'json',
            async: false,
             data: {
                 action: "get_single_asesor",
                 user_email: user.email,
                 user_pass : user.pass,
                 asesor_id : id,
             },
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

                $("#tipo_cuentaA").val("Asesor");
                $("#id_cuentaA").val(id);


                $("#nombre_asesor").val(a.nombre);
                $("#correo_asesor").val(a.correo);
                $("#telefono_asesor").val(a.telefono);

                var fechaNac = a.fecNac.split("/");
                $("#diaNac_asesor").val(fechaNac[0]);
                $("#mesNac_asesor").val(fechaNac[1]);
                $("#anosNac_asesor").val(fechaNac[2]);


                $("#oficinasA").val(a.oficina);
                $("#empresaA").val(a.nom_empresa);
                $("#telOfiA").val(a.tel_empresa);
                $("#direccionOfiA").val(a.dir_empresa);
                $("#urlOfiA").val(a.url_empresa);

                var fechaExp = a.experiencia.split("/");
                $("#diaExp_asesor").val(fechaExp[0]);
                $("#mesExp_asesor").val(fechaExp[1]);
                $("#anosExp_asesor").val(fechaExp[2]);


                $("#regionA").val(a.region);
                $("#infoAdiA").val(a.informacion);

                    //$("#body_asesores").html(a);
                  asesor.clean();
                  asesor.aprobarScreen.toggle("show");

            },
            complete: function(){
                cortina.hide();
                
            }
        });

    },     
    toggle:function(tipo){
        if(tipo=='hide'){
            asesor.crearScreen.hide('slide',{direction:'right'},'fast');
           // asesor.verScreen.hide('slide',{direction:'right'},'fast');
        }else if(tipo=='show'){
            asesor.crearScreen.show('slide',{direction:'right'},'fast');
            //asesor.verScreen.show('slide',{direction:'right'},'fast');
        }
    },
    clean: function(){
      $(':input','#asesorForm')
        .not(':button, :submit, :reset, :hidden')
        .val('')
        .removeAttr('checked')
        .removeAttr('selected');
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
            document.addEventListener("backbutton", backbutton.backButton, false);
        } else {
            console.log('no es movil');
            app.onDeviceReady();
        }
    },

    onDeviceReady: function(){
    	console.log('start on device ready');
        propiedad.getDepartamentos("departamento-1", "carretera-1");
        propiedad.getDepartamentos("departamento-propiedades", "carretera-propiedades");
        //api_map.set_marker(14.598497, -90.507067);
        api_mapa.init();
        $('.history_subscreen').on('show',function(e){
    		e.stopPropagation();
    		var close = $(e.target).data('cerrar');
    		if(close==undefined || app.history[app.history.length-1]==close){
    			return false;
    		}
    		app.history.push(close);
    		console.log('show. length '+app.history.length+' data '+close);
    	    
    	});
    	$('.history_subscreen').on('hide',function(e){
    		e.stopPropagation();
    		console.log('subscreen hide and pop');
    		console.log('target');
    		console.log(e.target);
    		console.log('current target');
    		console.log(e.currentTarget);
    		var id = $(e.target).attr('id');
    		if(app.history_allowed.indexOf(id)==-1){
    			return false;
    		}
    		app.history.pop();
    		console.log('history.pop');
    	});

        for(var i=1960;i<2051;i++)
        {
            $(".selectAno").append(new Option(i,i));
        }

        for(var i=1;i<32;i++)
        {
            $(".selectDia").append(new Option(i,i));
        }
        //Tabs Home
        /*
          var tabs = document.querySelector(".tab-content");
          var mc = new Hammer(tabs);

          mc.on("panleft", function(ev) {
            console.log('swipe left');
            var $tab = $('#tablist li.active').next();
            if ($tab.length > 0)
            $tab.find('a').tab('show');
            
        });

        mc.on("panright", function(ev) {
            console.log('swipe right');
            var $tab = $('#tablist li.active').prev();
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

        $("#tipo_usuario").on("change", function(){
            $("#container-codigo-asesor").toggle("show");
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


        //Asesor
        asesor.form.parsley().on('form:success',function(){
            var formData = asesor.form.getFormData();
            asesor.asesor(formData);
        });
        asesor.form.parsley().on('form:submit',function(){return false;});
        asesor.form.parsley().on('form:error',function(){
            
        });



        //BUSQUEDA
        busqueda.form.parsley().on('form:success',function(){
            var formData = busqueda.form.getFormData();
            busqueda.busqueda(formData);
        });
        busqueda.form.parsley().on('form:submit',function(){return false;});
        busqueda.form.parsley().on('form:error',function(){
            
        });

        //console.log('load events');
        
        setTimeout(function(){
            user.initialize();
        },1000);

      $(".departamento").on("change",function(){
        var depa = $(this).val();
          var municipio = $(this).attr("data-id"); 

          var zona = $(this).attr("data-zona");
        propiedad.getMunicipios(depa, municipio, zona);

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
            requerimiento.getMisRequerimientos();
        }else{
            $(this).attr('src','../www/img/iconos/header-ver-propiedades.png')
            $(this).css({
                'width' : '25px',
                'top' : '5px',
                'left' : '5px',
            });
            propiedad.getPropiedades(user.email, user.pass);
            requerimiento.getRequerimientos(user.email, user.pass);
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
            $(".masInfoFinanciera").toggle("slow");

        }else if(forma == "contado"){
            $("#presupuesto_max").removeClass("inputCalc"); 
            $("#presupuesto_max").addClass("inputIF"); 
            var status = $("#spanPre").attr("data-status");
            if(status == "on"){
              $("#spanPre").click();
            }
            $(".masInfoFinanciera").css("display", "none");
            $(".masInfoPrecalificacion").css("display", "none");

        }
    });


    $("#spanPre").click(function(){
       $(".masInfoPrecalificacion").toggle('slow');
       $("#presupuesto_max").removeClass("inputIF"); 
       $("#presupuesto_max").addClass("inputCalc");
        $("#presupuesto_max").val(0);
       var status = $("#spanPre").attr("data-status");
       if(status != "on"){
        $(this).attr("data-status", "on"); 
        $("#spanPresupuesto").attr("disabled", "disabled");
        $("#spanPresupuesto").removeClass("arrowD2");
       }else{
        $(this).removeAttr("data-status"); 
        $("#spanPresupuesto").removeAttr("disabled");
        $("#spanPresupuesto").addClass("arrowD2");

        $("#presupuesto_max").addClass("inputIF"); 
        $("#presupuesto_max").removeClass("inputCalc"); 
        $("#presupuesto_max").val("");
        $("#presupuesto_max").attr("placeholder", "20000"); 
       }
       
        $("#presupuesto_max").removeAttr("readonly", "readonly");
        
        
    });

    $(".expandirInfo").click(function(){
        var masInfo = $(this).attr("data-id");
        var arrow = $(this).attr("data-arrow");
        $("#"+masInfo).toggle('slow');
        $("#"+arrow).css("display", "none");
    });

    $(".contraerInfo").click(function(){
        var masInfo = $(this).attr("data-id");
        var arrow = $(this).attr("data-arrow");
        $("#"+masInfo).toggle('slow');
        $("#"+arrow).css("display", "block");
    });

     $(".expandirInfoContacto").click(function(){
        var arrow = $(this).attr("data-id");
        console.log(arrow);
        if(arrow == "arrowD-contactoR"){
          var masInfo = $("#masInfoContactoR");  
        }else{
          var masInfo = $("#masInfoContactoP");  
        }
        
        masInfo.toggle('slow');
        $("#"+arrow).css("display", "none");
    });

    $(".contraerInfoContacto").click(function(){
        var arrow = $(this).attr("data-id");
        console.log(arrow);
        if(arrow == "arrowD-contactoR"){
          var masInfo = $("#masInfoContactoR");  
        }else{
          var masInfo = $("#masInfoContactoP");  
        }
        masInfo.toggle('slow');
        $("#"+arrow).css("display", "block");
    });

     $(".expandirInfoPrecio").click(function(){
        var arrow = $(this).attr("data-id");
        console.log(arrow);
        var masInfo = $("#infoPrecio");
        masInfo.toggle('slow');
        $("#"+arrow).css("display", "none");
    });

    $(".contraerInfoPrecio").click(function(){
        var arrow = $(this).attr("data-id");
        console.log(arrow);
        var masInfo = $("#infoPrecio");
        masInfo.toggle('slow');
        $("#"+arrow).css("display", "block");
    });


    $(".expandirInfoUbicacionRe").click(function(){
        var masInfo = $(this).attr("data-id");
        var arrow = $(this).attr("data-arrow");
        $("#resumen-"+arrow).html("");
        $("#departamento-"+arrow).closest("tr").toggle();
        $("#"+masInfo).toggle("slow");
        $("#arrowD-"+arrow).toggle();
    });

    $(".contraerInfoUbicacionRe").click(function(){
        var arrow = $(this).attr("data-arrow");
        var depar = $("#departamento-"+arrow).val().toLowerCase();
        var muni = $("#municipio-"+arrow).val();
        var zona = $("#zona-"+arrow).val();
        var km = $("#km-"+arrow).val();
        var carretera = $("#carretera-"+arrow).val();
        var otras_espec = $("#otras_espec-"+arrow).val();
        var departamento = $("#departamento-"+arrow+ " :selected").text();

        if(depar == ""){
          depar = false;
        }
        if(zona == "--Seleccione--"){
          zona = false;
        }else{
          zona = "Zona "+zona;
        }
        if(km == 0){
          km = false;
        }else{
          km = "Km "+km;
        }
        if(departamento == "--Seleccione--"){
          departamento = false;
        }
        if(carretera == "--Seleccione--"){
          carretera = false;
        }else{
          carretera = carretera.replace("_", " ");
        }
        if(muni == "--Seleccione--"){
          muni = false;
        }else if(muni == ""){
          console.log("entro aqui");
          muni = $("#municipio-"+arrow+" :selected").text();
          console.log(muni);
        }else if(muni == null){
          muni = "";
        }


        var resu = $.grep([km, carretera, zona, otras_espec, muni, departamento], Boolean).join(", ");
        $("#resumen-"+arrow).html(resu);  


        var masInfo = $(this).attr("data-id");
        $("#departamento-"+arrow).closest("tr").toggle();
        $("#"+masInfo).toggle("slow");
        $("#arrowD-"+arrow).toggle();
    });





   $(".expandirInfoUbicacionP").click(function(){
        var masInfo = $(this).attr("data-id");
        var arrow = $(this).attr("data-arrow");
        $("#resumen-"+arrow).html("");
        $("#"+masInfo).toggle("slow");
        $("#arrowD-"+arrow).toggle();
    });

    $(".contraerInfoUbicacionP").click(function(){
        var arrow = $(this).attr("data-arrow");
        var depar = $("#departamento-"+arrow).val().toLowerCase();
        var muni = $("#municipio-"+arrow).val();
        var zona = $("#zona-"+arrow).val();
        var km = $("#km-"+arrow).val();
        var carretera = $("#carretera-"+arrow).val();
        var otras_espec = $("#direccion-"+arrow).val();
        var departamento = $("#departamento-"+arrow+ " :selected").text();

        if(depar == ""){
          depar = false;
        }
        if(zona == "--Seleccione--"){
          zona = false;
        }else{
          zona = "Zona "+zona;
        }
        if(km == 0){
          km = false;
        }else{
          km = "Km "+km;
        }
        if(departamento == "--Seleccione--"){
          departamento = false;
        }
        if(carretera == "--Seleccione--"){
          carretera = false;
        }else{
          carretera = carretera.replace("_", " ");
        }
        if(muni == "--Seleccione--"){
          muni = false;
        }else if(muni == ""){
          console.log("entro aqui");
          muni = $("#municipio-"+arrow+" :selected").text();
          console.log(muni);
        }else if(muni == null){
          muni = "";
        }

        var resu = $.grep([km, carretera, zona, otras_espec, muni, departamento], Boolean).join(", ");
        $("#resumen-"+arrow).html(resu);  


        var masInfo = $(this).attr("data-id");
        $("#"+masInfo).toggle("slow");
        $("#arrowD-"+arrow).toggle();
    });


    $("#precioP").on("change", function(){
      propiedad.calcularIUSI();
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

    $(".texto_operacion").click(function(){
      $(this).prev().attr("checked", "true");
    });


    $("#requerimientoForm input").click(function(){
        if($(this).val() == 0){
          $(this).val("");
        }
    });

    $("#propiedadForm input").click(function(){
        if($(this).val() == 0){
          $(this).val("");
        }
    });

    $(".caracteristicas_extras").on("focusin", function(){
      $(this).removeAttr("placeholder");
    });

    $(".caracteristicas_extras").on("focusout", function(){
      if($(this).val==""){
          $(this).attr("placeholder", "teatro en casa, piscina, etc");
      }
      
    });

    $(".inputIF").on("focusin", function(){
      $(this).removeAttr("placeholder");
    });

    $(".inputIF").on("focusout", function(){
      if(!$(this).val){
          $(this).attr("placeholder", "000");
      }
      
    });

    $(".inputOE").on("focusin", function(){
      $(this).removeAttr("placeholder");
    });

    $(".inputOE").on("focusout", function(){
      if(!$(this).val){
          $(this).attr("placeholder", "000");
      }
      
    });

    $("#moneda_ingresos").change(function(){
      var moneda = $(this).val();
      $(".moneda_IF").val(moneda);
      $("span.moneda_IF").html(moneda.toUpperCase());
      $("#spanPresupuesto").val(moneda);
      
    });

    $("#moneda_Prop").change(function(){
      var moneda = $(this).val();
      $("span.moneda_IFP").html(moneda.toUpperCase());

    });

    $("#egresos_reque").on("change",function(){
        console.log("Llamando funcion cuota maxima");
        requerimiento.calcularCuoutaMaxima();
    });


    $(".ratingResult").starRating({
      totalStars: 5,
      starShape: 'rounded',
      starSize: 20,
      emptyColor: 'lightgray',
      hoverColor: 'rgb(0,110,202)',
      activeColor: 'rgb(0,110,202)',
      useGradient: false,
      readOnly: true,
      useFullStars : false
    });

    
    $(".rating").starRating({
      totalStars: 5,
      starShape: 'rounded',
      starSize: 20,
      emptyColor: 'lightgray',
      hoverColor: 'rgb(239,175,0)',
      activeColor: 'rgb(239,175,0)',
      useGradient: false,
      disableAfterRate : false,
      useFullStars : true,
      callback: function(currentRating, $el){
          var suma = 0;
          var prome = 0;
          $($el).next().val(currentRating);


          $(".rating").each(function(){
              var rat = $(this).starRating("getRating");
              if(rat != "0.00")suma += +rat;

              prome = suma/7;
          });

          console.log("suma de estrellas "+suma);

          console.log("promedio "+(Math.round(prome * 2) / 2).toFixed(1));
          $(".ratingResult").starRating('setRating', (Math.round(prome * 2) / 2).toFixed(1)); 
          $(".ratingResult").next().val((Math.round(prome * 2) / 2).toFixed(1));


      }
    });

    $(".expandirInfoMapa").click(function(){

        $("#infoMapa").toggle("slow");
        $("#arrow-mapa").css("display", "none");
    });

    $(".contraerInfoMapa").click(function(){
        $("#arrow-mapa").css("display", "block");
        $("#infoMapa").toggle("slow");
    });



    $(".expandirInfoEstrellas").click(function(){

        $("#infoEstrellas").toggle("slow");
        $("#arrow-star").css("display", "none");
    });

    $(".contraerInfoEstrellas").click(function(){
        $("#arrow-star").css("display", "block");
        $("#infoEstrellas").toggle("slow");
    });


    $("#dot_menu").click(function(){
      //asesor.verAsesor();
      $(".dot_submenu").css("display", "block");
    });

    $(".dot_submenu").click(function(e){
      //e.stopPropagation();

    });

    $('.screen').on("click", function(e) {
      console.log(e.target);
      if($(e.target).is('#dot_menu') || $(e.target).is(".dot_submenu") || $(e.target).is(".dot_submenu p") || $(e.target).is("#tapholdOptions") || $(e.target).is(".tapholdOptions p") | $(e.target).is(".tapholdOptions select")){
           return;
        }else{
          $(".dot_submenu").css("display", "none");  
          $(".divTaphold").css("display", "none"); 
          $(".requerimiento").removeClass("prevent_click");   
          $(".propiedad").removeClass("prevent_click"); 
          $('.tapholdOptions').remove();  
        }
    });

    $(".aprobar_asesor").click(function(){
        asesor.verAsesor();
    });


    $(".cerrar_sesion").click(function(){
        window.localStorage.removeItem('correo');
        window.localStorage.removeItem('password');
        login.screen.show();
    });


      $('#requerimientos').on('click', '.eliminar_x', function(e){
          e.stopPropagation();
          var id= $(this).attr("data-id");
          propiedad.borrarPost(id);
      });

      $('#requerimientos').on('change', '#select_estadoInmueble', function(e){
          var id = $(this).attr("data-id");
          var estado = $(this).val();
          propiedad.cambiarEstado(id, estado);
      });

       $('#propiedades').on('click', '.eliminar_x', function(e){
              e.stopPropagation();
              var id= $(this).attr("data-id");
              propiedad.borrarPost(id);
        });


        $('#propiedades').on('change', '#select_estadoInmueble', function(e){
            var id = $(this).attr("data-id");
            var estado = $(this).val();
            propiedad.cambiarEstado(id, estado);
        });

        



    $('#propiedades').on('click', '.editar_prop', function(e){
        e.stopPropagation();
        var id = $(this).attr("data-id");
        propiedad.editarPropiedad(id);
        
    });

    $('#requerimientos').on('click', '.editar_prop', function(e){
        e.stopPropagation();
        var id = $(this).attr("data-id");
        requerimiento.editarRequerimiento(id);
        
    });

    $("#li_requerimientos").click(function(){
        propiedad.getDepartamentos("departamento-1", "carretera-1");
    });

    $("input[name='tipo_busqueda']").click(function(){
        if($(this).val() == "propiedades"){
            $("#busqueda_propiedades").css("display", "table-row-group");
            $("#busqueda_requerimientos").css("display", "none");
        }else{  
            $("#busqueda_propiedades").css("display", "none");
            $("#busqueda_requerimientos").css("display", "table-row-group");
        }
    });


    $("#lupa_buscar").click(function(){
        propiedad.getDepartamentos("departamento-b", "carretera-b");
    });

    

    },  
    onDeviceReady: function() {
        
        console.log('device ready');
        app.loadEvents();
    }
      
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
app.initialize();
