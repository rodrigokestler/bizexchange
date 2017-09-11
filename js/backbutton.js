var backbutton = {
	history_allowed: ['register','imagenes_adjuntas','crear_propiedad','single_propiedad',
	                  'crear_requerimiento', 'single_requerimiento'
	                  ],
    backButton: function(e){
    	
    	console.log('entro backbutton');
    	console.log('history length '+app.history.length);
    	console.log(app.history[app.history.length-1]);
    	if(app.history.length>0){
    		if(isNaN(app.history[app.history.length-1])){
    			switch(app.history[app.history.length-1]){
    			case 'register':
    				register.toggle('hide');
    				break;
    			case 'imagenes_adjuntas':
    				break;
    			case 'crear_propiedad':
    				propiedad.crearScreen.toggle('hide');
    				break;
    			case 'single_propiedad':
    				propiedad.verScreen.toggle('hide');
    				break;
    			case 'crear_requerimiento':
    				requerimiento.crearScreen.toggle('hide');
    				break;
    			case 'single_requerimiento':
    				requerimiento.verScreen.toggle('hide');
    				break;
    			
    			default:
    				break;
    			}
        	}else{
        		
        	}
    		if(ifmovil){
    			e.preventDefault();
    		}
    		
        	return false;
    	}else{
    		console.log('exit app');
    		navigator.app.exitApp();
    	}
    	
    }
};