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
                    login.screen.hide('slide',{direction:'left'},'fast');
                }
                
            },
            complete: function(){ 
                setTimeout(function(){
                  cortina.hide();
                },3000)
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
        requerimiento.containerUbicaciones.append('<table style="width:100%;" class="tableUbicacion-'+id+'">'
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
                               +' <div id="contenedor_ubicaciones" class="tableUbicacion-'+id+'">'
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
                                                +'     <select name="departamento-'+id+'" class="color-gris-oscuro select_formR departamento inputpz" id="departamento-'+(parseInt(cant_ubicaciones) + 1)+'" data-id="municipio-'+(parseInt(cant_ubicaciones) + 1)+'" data-carre="carretera-'+id+'" style="border:none;">' 
                                                        
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
                                                   +'  </select>' 
                                            +' </tr>' 
                                           +'  <tr style="margin:2px 0;">' 
                                               +'  <td colspan="5">' 
                                                   +'  <hr style="margin:0!important;">' 
                                               +'  </td>' 
                                           +'  </tr>' 

                                           +'  <tr>' 
                                               +'  <td colspan="1" class="texto-nuevo-requerimiento">Km</td>' 
                                                +' <td colspan="1"><input name="km-'+id+'"  class="color-gris-oscuro inputpz inputText" style="text-align:center;border:none;width:30px;" type="number">' 
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
                                              +'   <td colspan="2" style="text-align: rigth;"><input name="otras_espec-'+id+'"  class="color-gris-oscuro inputpz inputText" style="text-align:center;border:none;width:100px;" placeholder="Ej: El naranjo..." type="text">'
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
                propiedad.getMunicipios(depa, municipio, carretera);
               
        
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
                //$("#departamento-"+arrow).closest("tr").prev().toggle();
                $("#"+masInfo).toggle("slow");
                $("#arrowD-"+arrow).toggle();
            });

            $(".contraerInfoUbicacion").click(function(){
                var arrow = $(this).attr("data-arrow");
                var depar = $("#departamento-"+arrow).val().toLowerCase();
                var muni = $("#municipio-"+arrow).val();
                var zona = $("#zona-"+arrow).val();

                if(zona){
                  $("#resumen-"+arrow).html("Zona "+zona+", "+muni+", "+depar+"...");  
                }else if(depar || muni || zona){
                  $("#resumen-"+arrow).html(muni+", "+depar+"...");  
                }else{
                  if(!depar || !muni || !zona){
                    $("#resumen-"+arrow).html();  
                  }
                }


                $("#departamento-"+arrow).closest("tr").toggle();
                //$("#departamento-"+arrow).closest("tr").prev().toggle();
                var masInfo = $(this).attr("data-id");
                $("#"+masInfo).toggle("slow");
                $("#arrowD-"+arrow).toggle();
            });

    },
    requerimiento: function(formData){
        formData.action = 'crear_requerimiento';
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
                console.log("Entro!!");
                cortina.show();
            },
            success: function(a){
                console.log(JSON.stringify(a));
                requerimiento.clean();


                if(a.msj_error){
                    myModal.open('Oops',a.msj_error);
                }else{
                    myModal.open('Se ha creado el requerimiento con exito.');
                    requerimiento.getRequerimientos(user.email, user.pass);
                    requerimiento.toggle('hide');
                }
                
            },
            complete: function(){
                cortina.hide();
            }
        });
    },  
    getRequerimientos:function(user_email, user_pass){

        $.ajax({
            url:app.url_ajax,
            dataType: 'html',
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
                    var aux = true;
                    $( "div.divTaphold" ).each(function( index ) {
                        if($(this).css("display") == "none"){
                          aux = true;
                        }else{
                          aux = false;
                          $(this).css("display", "none");
                          $(this).parent().removeClass("prevent_click");                                   
                          return false;
                        }
                    });

                    if(aux){
                      var id = $(this).attr("data-id");
                      var tipo = $(this).attr("data-tipo");
                      requerimiento.getSingleRequerimiento(id,tipo);        
                    }
                });    
                
                $('.requerimiento').each(function(){   //tagname based selector
                    var mc = new Hammer(this);
                    var autor = $(this).attr("data-mail");
                    var dis = $(this);
                    mc.on("press", function(e) {
                          console.log(e.type);
                          if(autor == user.email){
                            dis.addClass("prevent_click");    
                            var id = dis.attr("data-id");
                            var tipo = dis.attr("data-tipo");
                            dis.find("div.divTaphold").addClass("tapholdOptions");
                            dis.find("div.divTaphold").toggle("slow");  

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
    getMisRequerimientos: function(){
      
       $.ajax({
             url:app.url_ajax,
             dataType: 'text',
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
                 if(a.msj_error){
                     myModal.open('Oops',a.msj_error);
                 }else{                
                     jQuery("#requerimientos-ul").html(a);   

                }

                 $(".requerimiento").on("click", function(){
                    var aux = true;
                    $( "div.divTaphold" ).each(function( index ) {
                        if($(this).css("display") == "none"){
                          aux = true;
                        }else{
                          aux = false;
                          $(this).css("display", "none");
                          $(this).parent().removeClass("prevent_click");                                   
                          return false;
                        }
                    });

                    if(aux){
                      var id = $(this).attr("data-id");
                      var tipo = $(this).attr("data-tipo");
                      requerimiento.getSingleRequerimiento(id,tipo);        
                    }
                });    
                
                $('.requerimiento').each(function(){   //tagname based selector
                    var mc = new Hammer(this);
                    var autor = $(this).attr("data-mail");
                    var dis = $(this);
                    mc.on("press", function(e) {
                          console.log(e.type);
                          if(autor == user.email){
                            dis.addClass("prevent_click");    
                            var id = dis.attr("data-id");
                            var tipo = dis.attr("data-tipo");
                            dis.find("div.divTaphold").addClass("tapholdOptions");
                            dis.find("div.divTaphold").toggle("slow");  

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
    getSingleRequerimiento: function(id, tipo){
        console.log("ya dentro de la funcion "+id+" "+tipo);
        var id = id;
        var tipo = tipo;
        jQuery("#headerSingle_req").html("#"+id+" | "+tipo); 
        $('#headerSingle_req').css('textTransform', 'capitalize');
        $.ajax({
            url:app.url_ajax,
            dataType: 'text',
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
        $.ajax({
            url:app.url_ajax,
            dataType: 'html',
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
                    var aux = true;
                    $( "div.divTaphold" ).each(function( index ) {
                        if($(this).css("display") == "none"){
                          aux = true;
                        }else{
                          aux = false;
                          $(this).css("display", "none");
                          $(this).parent().removeClass("prevent_click");                                   
                          return false;
                        }
                    });

                    if(aux){
                      var id = $(this).attr("data-id");
                      var tipo = $(this).attr("data-tipo");
                      propiedad.getSinglePropiedad(id,tipo);        
                    }
                });    
                
                $('.propiedad').each(function(){   //tagname based selector
                    var mc = new Hammer(this);
                    var autor = $(this).attr("data-mail");
                    var dis = $(this);
                    mc.on("press", function(e) {
                          console.log(e.type);
                          if(autor == user.email){
                            dis.addClass("prevent_click");    
                            var id = dis.attr("data-id");
                            var tipo = dis.attr("data-tipo");
                            dis.find("div.divTaphold").addClass("tapholdOptions");
                            dis.find("div.divTaphold").toggle("slow");  

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

                $(".propiedad").on("click", function(){
                    var aux = true;
                    $( "div.divTaphold" ).each(function( index ) {
                        if($(this).css("display") == "none"){
                          aux = true;
                        }else{
                          aux = false;
                          $(this).css("display", "none");
                          $(this).parent().removeClass("prevent_click");                                   
                          return false;
                        }
                    });

                    if(aux){
                      var id = $(this).attr("data-id");
                      var tipo = $(this).attr("data-tipo");
                      propiedad.getSinglePropiedad(id,tipo);        
                    }
                });    
                
                $('.propiedad').each(function(){   //tagname based selector
                    var mc = new Hammer(this);
                    var autor = $(this).attr("data-mail");
                    var dis = $(this);
                    mc.on("press", function(e) {
                          console.log(e.type);
                          if(autor == user.email){
                            dis.addClass("prevent_click");    
                            var id = dis.attr("data-id");
                            var tipo = dis.attr("data-tipo");
                            dis.find("div.divTaphold").addClass("tapholdOptions");
                            dis.find("div.divTaphold").toggle("slow");  

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
    getDepartamentos:function(departamento, carretera){

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
                cortina.show();
                 console.log("Jalando get_departamentos!!");
             },
             success: function(a){
                 console.log(a);
                 if(a.msj_error){
                     myModal.open('Oops',a.msj_error);
                 }else{
                     jQuery("#"+departamento).html(a);                    
                 }
                 
             },
             complete: function(){
                cortina.hide();

                $.ajax({
                   url:app.url_ajax,
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
                       console.log("Jalando municipiops!!");
                   },
                   success: function(a){
                       $("#"+carretera).html(a);
                   },
                   complete: function(){
                       cortina.hide();
                   }
               });



             }
         });
    	
    	
    },

    getMunicipios:function(depa, municipio, carretera){
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
                     jQuery("#"+municipio).html(a);                   
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
    },
    clean: function(){
      $(':input','#propiedadForm')
        .not(':button, :submit, :reset, :hidden')
        .val('')
        .removeAttr('checked')
        .removeAttr('selected');
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
        propiedad.getDepartamentos("departamento-1", "carretera-1");
        propiedad.getDepartamentos("departamento-propiedades", "carretera-propiedades");
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
        
       /* $(".tab-content").on("swiperight",function() {
            console.log('swiperight');
            var $tab = $('#tablist li.active').prev();
            if ($tab.length > 0)
                $tab.find('a').tab('show');
        });
        $(".tab-content").on("swipeleft",function() {
            console.log('swipe left');
            var $tab = $('#tablist li.active').next();
            if ($tab.length > 0)
                $tab.find('a').tab('show');
        });*/ 
      


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
        console.log('load events');
        //login.screen.hide();
        
        setTimeout(function(){
            user.initialize();
        },1000);


      $(".departamento").on("change",function(){
        var depa = $(this).val();
          var municipio = $(this).attr("data-id"); 
        propiedad.getMunicipios(depa, municipio);
       
  
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
       $("#spanPresupuesto").toggle();
       var status = $("#spanPre").attr("data-status");
       if(status != "on"){
        $(this).attr("data-status", "on"); 
       }else{
        $(this).removeAttr("data-status"); 
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



    /*$(".expandirInfoUbicacion").click(function(){
        var div = $(this).closest('tr');
        var masInfo = div.closest('tbody').next();
        masInfo.toggle();
        $(".arrowD").css("display", "none");
    });

    $(".contraerInfoUbicacion").click(function(){
        $(".expandirInfoUbicacion").click();
        $(".arrowD").css("display", "block");
    });*/




    $(".expandirInfoUbicacion").click(function(){
        var masInfo = $(this).attr("data-id");
        var arrow = $(this).attr("data-arrow");
        $("#resumen-"+arrow).html("");
        $("#departamento-"+arrow).closest("tr").toggle();
        //$("#departamento-"+arrow).closest("tr").prev().toggle();
        $("#"+masInfo).toggle("slow");
        $("#arrowD-"+arrow).toggle();
    });

    $(".contraerInfoUbicacion").click(function(){
        var arrow = $(this).attr("data-arrow");
        var depar = $("#departamento-"+arrow).val().toLowerCase();
        var muni = $("#municipio-"+arrow).val();
        var zona = $("#zona-"+arrow).val();

        if(zona){
          $("#resumen-"+arrow).html("Zona "+zona+", "+muni+", "+depar+"...");  
        }else if(depar || muni || zona){
          $("#resumen-"+arrow).html(muni+", "+depar+"...");  
        }else{
          if(!depar || !muni || !zona){
            $("#resumen-"+arrow).html();  
          }
        }
//        $("#resumen-"+arrow).html("Zona "+zona+", "+muni+", "+depar+"...");
        var masInfo = $(this).attr("data-id");
        $("#departamento-"+arrow).closest("tr").toggle();
        //$("#departamento-"+arrow).closest("tr").prev().toggle();
        $("#"+masInfo).toggle("slow");
        $("#arrowD-"+arrow).toggle();
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
      //console.log($(this).prev());
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

    $("#moneda_ingresos").change(function(){
      var moneda = $(this).val();
      $(".moneda_IF").val(moneda);
      $("span.moneda_IF").html(moneda);
    });

//    api_mapa.init();

        
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

