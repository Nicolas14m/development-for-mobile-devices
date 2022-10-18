// Variables Globales
let map;
// if(localStorage.getItem('apiKey')){
    // let userId = localStorage.getItem('id');
// }
let nombreUsuario;

// Definimos listas
let listaCiudades = [];
let listaDepartamentos = [];
let listaEnvios = [];
let listaCategorias = [];

// páginas de nuestra app
let paginaRegistro = document.querySelector("pagina-registro");
let paginaHome = document.querySelector("pagina-home");
let paginaLogin = document.querySelector("pagina-login");
let paginaCalculadora = document.querySelector("pagina-calculadora");
let paginaEnvio = document.querySelector("pagina-envio");
let paginaHistorialEnvios = document.querySelector("pagina-historial");
let paginaDetalleEnvio = document.querySelector("pagina-detalle-envio");
let paginaGastoTotal = document.querySelector("pagina-gasto-total");
let paginaTop5 = document.querySelector("pagina-top5");
let paginaUbicacion = document.querySelector("pagina-ciudad-cercana"); 

// div's para los mapas
let divMapaCalculadora = document.getElementById('map');
let divMapaEnvio = document.getElementById('mapaEnvio');
let divMapaUbicacion = document.getElementById('mapaUbicacion');

// window.localStorage.clear();

// cada vez que cambia la ruta de navegación muestro u oculto cosas
let router = document.querySelector("ion-router");
router.addEventListener("ionRouteDidChange", cambioDeRuta);

// caputuramos items de menu
let itemsMenu = document.getElementsByClassName("item-menu");

// Asignamos funcion cerrar menu a los items del menu
for (let i = 0; i < itemsMenu.length; i++) {
    itemsMenu[i].addEventListener("click", cerrarMenu);
}

function cerrarMenu() {
    document.querySelector("ion-menu").close();  
}


// Funcion para Cambiar la Ruta de Navegacion
function cambioDeRuta(event) {
    let navegacion = event.detail;

    // ocultar todas las páginas y sus componentes html
    let paginas = document.getElementsByClassName('pagina');
   
    for (let i = 0; i < paginas.length; i++) {
        paginas[i].style.visibility = "hidden";
        // paginas[i].style.display = "none";
    }

    // segun la pagina a la que estemos navegando, hacemos visibles sus componentes
    if (navegacion.to === "/" || navegacion.to === "/home") {

        if(localStorage.getItem('apiKey')){
            paginaHome.style.visibility = "visible";
            if (!nombreUsuario){
                nombreUsuario = "a nuestra app.";
            }
            document.getElementById('mensajeBienvenida').innerHTML = `Bienvenid@ ${nombreUsuario}`;
            obtenerCiudades();
            obtenerCategorias();
            obtenerDepartamentosAPI();
            obtenerEnvios();
            limpiarCampos();  
        } else {
            router.push('/login');
        }
    }
    
    if (navegacion.to === "/registro") {
        paginaRegistro.style.visibility = "visible";
    }
    
    if (navegacion.to === "/envio") {
        if (localStorage.getItem('apiKey')) {
            paginaEnvio.style.visibility = "visible";
            cargarCiudadesSelect();
            cargarCategoriasSelect();    
        } else {
            router.push('/login');
        }
    }

    if (navegacion.to === "/calculadora") {
        if (localStorage.getItem('apiKey')) {
            paginaCalculadora.style.visibility = "visible";
            cargarCiudadesSelect();    
        } else {
            router.push('/login');
        }
    }

    if (navegacion.to === "/login") {
        paginaLogin.style.visibility = "visible";
    }

    if  (navegacion.to === "/historial"){
        if (localStorage.getItem('apiKey')) {
            paginaHistorialEnvios.style.visibility = "visible";
            obtenerHistorialEnvios(); // necesario para cargar el historial
        } else {
            router.push('/login');
        }
    }

    if (navegacion.to === "/detalle-envio"){
        if (localStorage.getItem('apiKey')) {
            paginaDetalleEnvio.style.visibility = "visible";
            cargarDetalleEnvio();
        } else {
            router.push('/login');
        }
    }

    if (navegacion.to === "/gastoTotal"){
        if (localStorage.getItem('apiKey')) {
            paginaGastoTotal.style.visibility = "visible";
            obtenerGastosTotales();
        } else {
            router.push('/login');
        }
    }

    if (navegacion.to === "/top5"){
        if (localStorage.getItem('apiKey')) {
            paginaTop5.style.visibility = "visible";   
            obtenerTop5();
        } else {
            router.push('/login');
        }
    }

    if (navegacion.to === "/ciudadCercana") {
        if (localStorage.getItem('apiKey')) {
            paginaUbicacion.style.visibility = "visible";
        } else {
            router.push('/login');
        }
    }
}


// SECCION 3 ============================================================================
// CALCULADORA DE DISTANCIA ============================================================

// Funcion para Obtener las ciudades de la API 
function obtenerCiudades(){
    listaCiudades = [];

    fetch("https://envios.develotion.com/ciudades.php",{
            method: 'GET',
            // body: new URLSearchParams(),
            headers: {
                "apikey": localStorage.getItem("apiKey"),
                "Content-Type": "application/json"
            }
        })
        .then(respuesta => respuesta.json())
        .then(function (data){
            if(data.codigo === 200){ 
                for (let i = 0; i < data.ciudades.length; i++) {
                    let unaCiudad = data.ciudades[i];
                    listaCiudades.push(unaCiudad);
                }
            } else {
                // mostrar mensaje de error usando un componente Toast de Ionic
                presentToast(data.error, 'Error', 'danger');
            }
        })
}

// Cargamos values al select de ciudades dinamicamente
function cargarCiudadesSelect(){
    let ciudadesOrigen = document.querySelector("#origen");
    let ciudadesDestino = document.querySelector("#destino");
    let origenEnvio = document.querySelector("#origenEnvio");
    let destinoEnvio = document.querySelector("#destinoEnvio");

    for (let i = 0; i < listaCiudades.length; i++) {
        let unaCiudad = listaCiudades[i];
        ciudadesOrigen.innerHTML += `<ion-select-option value=${unaCiudad.id}>${unaCiudad.nombre}</ion-select-option>`; 
        ciudadesDestino.innerHTML += `<ion-select-option value=${unaCiudad.id}>${unaCiudad.nombre}</ion-select-option>`;
        origenEnvio.innerHTML += `<ion-select-option value=${unaCiudad.id}>${unaCiudad.nombre}</ion-select-option>`; 
        destinoEnvio.innerHTML += `<ion-select-option value=${unaCiudad.id}>${unaCiudad.nombre}</ion-select-option>`;   
    }
}

// Funcion para mostrar distancia entre Ciudades
document.getElementById('btnCalcularDistancia').onclick = function(){
    let ciudadOrigenId = document.getElementById('origen').value;
    let ciudadDestinoId = document.getElementById('destino').value;
    var ciudadOrigen = obtenerCiudad(ciudadOrigenId);
    var ciudadDestino = obtenerCiudad(ciudadDestinoId);
    var latlng1 = L.latLng(ciudadOrigen.latitud, ciudadOrigen.longitud);
    var latlng2 = L.latLng(ciudadDestino.latitud, ciudadDestino.longitud);

    if (map != undefined) {
        // si el mapa ya existe, lo borro para poder crear el nuevo
        map.remove();
    }
    var distancia = medirDistancia(latlng1, latlng2);
    mostrarMapa(ciudadOrigen, ciudadDestino);

    document.getElementById('distancia').innerHTML = `<p class="ion-text-center">La distancia entre ${ciudadOrigen.nombre} y ${ciudadDestino.nombre} es ${distancia} Km.</p>`;  
}

// Funcion para obtener Ciudad segun su Identificador
function obtenerCiudad(id){
    let ciudad;
    let encontreCiudad = false;
    let i = 0; 
    while (!encontreCiudad) {
        if(id == listaCiudades[i].id){    
            encontreCiudad = true;
            ciudad = listaCiudades[i];  
        }
        i++;
    }
    return ciudad;   
}

// Funcion para mostrar mapa y calcular distancia
function mostrarMapa(ciudad1, ciudad2) {
    divMapaCalculadora.style.display = "block";
    const lat1 = ciudad1.latitud;
    const long1 = ciudad1.longitud;
    const lat2 = ciudad2.latitud;
    const long2 = ciudad2.longitud;

    var latlng1 = L.latLng(lat1, long1);
    var latlng2 = L.latLng(lat2, long2);

    if (map != undefined) {
        // si el mapa ya existe, lo borro para poder crear el nuevo
        map.remove();
    }
     
    map = L.map('map').setView([lat1, long1], 8);
 
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
        
    L.marker([lat1, long1]).addTo(map)
        .bindPopup(ciudad1.nombre)
        .openPopup();
        
    L.marker([lat2, long2]).addTo(map)
    .bindPopup(ciudad2.nombre)
    .openPopup();

    if (latlng1 && latlng2) {
        //Dibujamos una línea entre los dos puntos
        L.polyline([latlng1, latlng2], {
        color: 'red'
        }).addTo(map);
    }
}

// Funcion para medir distancia en Km. entre ciudades
function medirDistancia(coord1, coord2) {
    map = L.map('map');
    var distance = map.distance(coord1 ,coord2);
    distance = Math.round(distance/1000);
    return distance;
}


// PUNTO 4 ===============================================================================
// AGREGAR ENVIO =========================================================================

// Funcionalidad del Boton para agregar un envio
// Calculos de Costos del Envio segun su peso y distancia
document.getElementById('btnAgregarEnvio').onclick = function(){
    let ciudadOrigenId = document.querySelector("#origenEnvio").value;
    let ciudadDestinoId = document.querySelector("#destinoEnvio").value;
    let catEnvioId = document.querySelector("#categoriaEnvio").value;
    let pesoEnvio = Number(document.querySelector("#inputPeso").value);
    let costoBase = 50;
    let costoPeso = pesoEnvio * 10;
    

    // hacemos validaciones de inputs
    try{
        if(ciudadOrigenId === -1 || isNaN(ciudadOrigenId)){
            throw "Error en el campo ciudad de origen."
        }
        if(ciudadDestinoId === -1|| isNaN(ciudadOrigenId)){
            throw "Error en el campo ciudad de destino."
        }
        if(ciudadOrigenId === ciudadDestinoId){
            throw "El origen y destino son el mismo."
        }
        if(catEnvioId === -1 || isNaN(catEnvioId)){
            throw "Error en el campo categoria."
        }
        if(!pesoEnvio || isNaN(pesoEnvio)){
            throw "Error en el campo peso de envio."
        }

        // Obtenemos las ciudades como objetos para calcular la distancia
        let ciudadOrigen = obtenerCiudad(ciudadOrigenId);
        let ciudadDestino = obtenerCiudad(ciudadDestinoId);
        var latlng1 = L.latLng(ciudadOrigen.latitud, ciudadOrigen.longitud);
        var latlng2 = L.latLng(ciudadDestino.latitud, ciudadDestino.longitud);

        if (map != undefined) {
        // si el mapa ya existe, lo borro para poder crear el nuevo
        map.remove();
        }

        let distancia = medirDistancia(latlng1, latlng2);
        let costoDist = 50 * Math.trunc(distancia/100);
        let costo = costoBase + costoPeso + costoDist;
        let mensaje = `<h2>El costo del envio es: $ ${costo} pesos.<h2>
                   <h2>La distancia entre ${ciudadOrigen.nombre} y ${ciudadDestino.nombre} es ${distancia} Km.<h2>`;
        document.getElementById('mensajeEnvio').innerHTML = mensaje;
    
        // obtenemos el id del usuario
        let userId = localStorage.getItem('id');

        crearAgregarEnvio(userId, ciudadOrigenId, ciudadDestinoId, pesoEnvio, distancia, costo, catEnvioId);
    } catch(error) {
        presentToast(error, 'Error en la consulta', 'danger');
    }
}

// Agregamos envio si todos los datos ingresados previamente son correctos
function crearAgregarEnvio(userId, ciudadOrigenId, ciudadDestinoId, pesoEnvio, distancia, costo, catEnvioId){
    // hacemos validaciones de inputs
    try{
        if(!userId){
            throw "Error de usuario."
        }
        if(!ciudadOrigenId){
            throw "Error con la ciudad de origen."
        }
        if(!ciudadDestinoId){
            throw "Error con la ciudad de destino."
        }
        if(pesoEnvio <= 0){
            throw "Ingrese un peso mayor a cero."
        }
        if(!costo){
            throw "Ha habido en error al calcular el costo del envio."
        }
        if(catEnvioId === -1){
            throw "Seleccione una categoria."
        }

        fetch("https://envios.develotion.com/envios.php",{
            method: 'POST',
            body: JSON.stringify({
                "idUsuario": userId,
                "idCiudadOrigen": ciudadOrigenId,
                "idCiudadDestino": ciudadDestinoId,
                "peso": pesoEnvio,
                "distancia": distancia,
                "precio": costo,
                "idCategoria": catEnvioId
            }),
            headers: {
                "apikey": localStorage.getItem("apiKey"),
                "Content-Type": "application/json"
            }
        })
        .then(respuesta => respuesta.json())
        .then(function (data){
            if(data.codigo === 200){
                let mensaje  = `<h3>El envio se realizó correctamente.</h3>`;
                document.getElementById('mensajeEnvio').innerHTML += mensaje;       
            } else {
                // mostrar mensaje de error usando un componente Toast de Ionic
                presentToast(data.error, 'Error en el ingreso, intente nuevamente con los datos correctos', 'danger');
            }
        })
    }
    catch(error) {
        presentToast(error, 'Falta ingresar información', 'danger');
    }
}



// Funcion para obtener Categorias de envios
function obtenerCategorias(){
    listaCategorias = [];
    fetch("https://envios.develotion.com/categorias.php",{
            method: 'GET',
            // body: new URLSearchParams(),
            headers: {
                "apikey": localStorage.getItem("apiKey"),
                "Content-Type": "application/json"
            }
        })
        .then(respuesta => respuesta.json())
        .then(function (data){
            if(data.codigo === 200){
                for (let i = 0; i < data.categorias.length; i++) {
                    let unaCategoria = data.categorias[i];
                    listaCategorias.push(unaCategoria);     
                }   
            } else {
                // mostrar mensaje de error usando un componente Toast de Ionic
                presentToast(data.error, 'Error', 'danger');
            }
        })
}

// Funcion para cargar los values de las categorias al select
function cargarCategoriasSelect(){
    let categorias = document.querySelector("#categoriaEnvio");
    for (let i = 0; i < listaCategorias.length; i++) {
        let unaCategoria = listaCategorias[i];
        categorias.innerHTML += `<ion-select-option value=${unaCategoria.id}>${unaCategoria.nombre}</ion-select-option>`; 
    }
}

// Obtenemos una categoria segun Id
function obtenerCategoria(id){
    let categoria;
    let encontreCategoria = false;
    let i = 0; 
    while (!encontreCategoria) {
        if(id == listaCategorias[i].id){          
            encontreCategoria = true;
            categoria = listaCategorias[i];
        }
        i++;
    }
    return categoria;   
}


// PARTE 5 ===========================================================================================
// HISTORIAL o LISTADO DE ENVIOS =====================================================================

// Funcion para listar los ENVIOS 
function obtenerHistorialEnvios() {
    listaEnvios = [];
    // asegurarnos de que haya un usuario logueado.
    // let apiKey = localStorage.getItem('apiKey'); 
    let userId = localStorage.getItem('id');
    let url = `https://envios.develotion.com/envios.php?idUsuario=${userId}`;
    
    if (localStorage.getItem('apiKey')) {
        fetch(url, {
            method: 'GET',
            headers: {
                "apikey": localStorage.getItem("apiKey"),
                "Content-Type": "application/json"
            }
        })
        .then(respuesta => respuesta.json())
        .then(function(data) {
            if (data.error) {
                // mostrar mensaje de error usando un componente Toast de Ionic
                presentToast(data.error, 'Error', 'danger');
            } else {
                let lista = document.getElementById("historialEnvios");
                lista.innerHTML = ""; // vacío la lista antes de mostrarla.
                let item  = '';

                for (let i = 0; i < data.envios.length; i++){
                    let unEnvio = data.envios[i];                    
                    let origen = unEnvio.ciudad_origen;
                    let destino = unEnvio.ciudad_destino;
                    listaEnvios.push(unEnvio);
                    origen = obtenerCiudad(origen);
                    destino = obtenerCiudad(destino);
                    var latlng1 = L.latLng(origen.latitud, origen.longitud);
                    var latlng2 = L.latLng(destino.latitud, destino.longitud);
                    if (map != undefined) {
                        // si el mapa ya existe, lo borro para poder crear el nuevo
                        map.remove();
                    }
                    var distancia = medirDistancia(latlng1, latlng2);
                    
                    item = `<ion-item href="/detalle-envio?id=${unEnvio.id}""> 
                                <ion-label>
                                    <h2>Origen: ${origen.nombre}</h2>
                                    <h2>Destino: ${destino.nombre}</h2>
                                    <h2>Distancia: ${distancia} Km.</h2>
                                    <h2>Precio: $ ${unEnvio.precio}</h2>
                                </ion-label>
                            </ion-item>`; 
                    lista.innerHTML += item;       
                }    
            }
        })
        .catch(function(error) {
            presentToast(error, 'No Autorizado', 'primary');
        });
    } else {
        // no existe usuario autenticado
        router.push('/login');
    }
}

// Funcion para listar los ENVIOS 
function obtenerEnvios() {
    listaEnvios = [];
    // asegurarnos de que haya un usuario logueado.
    // let apiKey = localStorage.getItem('apiKey'); 
    
        let userId = localStorage.getItem('id');  
        let url = `https://envios.develotion.com/envios.php?idUsuario=${userId}`;
    
    if (localStorage.getItem('apiKey')) {
        fetch(url, {
            method: 'GET',
            headers: {
                "apikey": localStorage.getItem("apiKey"),
                "Content-Type": "application/json"
            }
        })
        .then(respuesta => respuesta.json())  
        .then(function(data) {
            if (data.error) {
                // mostrar mensaje de error usando un componente Toast de Ionic
                presentToast(data.error, 'Error', 'danger');
            } else {
                for (let i = 0; i < data.envios.length; i++){
                    let unEnvio = data.envios[i];                    
                    listaEnvios.push(unEnvio);   
                }    
            }
        })
        .catch(function(error) {
            presentToast(error, 'No Autorizado', 'primary');
        });
    } else {
        // no existe usuario autenticado
        router.push('/login');
    }
}

// PARTE 6 ==================================================================================
// DETALLE DE ENVIO =========================================================================

// obtenemos un envio segun el id
function obtenerEnvio(idEnvio){
    let envio;
    let encontreEnvio = false;
    let i = 0; 
    while (!encontreEnvio) {
        if(idEnvio == listaEnvios[i].id){
            encontreEnvio = true;
            envio = listaEnvios[i];
        }
        i++;
    }
    return envio;
}

// Cargar Detalle de un Envio
function cargarDetalleEnvio(){
    let paramString = window.location.href.split('?')[1];
    let idEnvio = paramString.split('=')[1];
    let envio = obtenerEnvio(idEnvio);
    let ciudadOrigen = obtenerCiudad(envio.ciudad_origen);
    let ciudadDestino = obtenerCiudad(envio.ciudad_destino);
    let categoriaNombre = obtenerCategoria(envio.id_categoria).nombre;
    
    // asegurarnos de que haya un usuario logueado.
    //let apiKey = localStorage.getItem("apiKey"); 

    document.getElementById("detalleIdEnvio").innerHTML = `Id de Envio: ${idEnvio}` ;
    document.getElementById("detalleCiudadOrigen").innerHTML = `Ciudad de Origen: ${ciudadOrigen.nombre}`;
    document.getElementById("detalleCiudadDestino").innerHTML = `Ciudad de Destino: ${ciudadDestino.nombre}`;
    document.getElementById("detallePeso").innerHTML = `Peso del Paquete: ${envio.peso} Kg.`;
    document.getElementById("detalleDistancia").innerHTML = `Distancia entre Ciudades: ${envio.distancia} Km.`;
    document.getElementById("detallePrecio").innerHTML = `Precio: $ ${envio.precio}`;
    document.getElementById("detalleIdCategoria").innerHTML = `Categoria: ${categoriaNombre}`;
    document.getElementById("detalleIdUsuario").innerHTML = `Identificador de Usuario: ${envio.id_usuario}`;
    document.getElementById("detalleEliminarEnvio").innerHTML = `<ion-button color="primary" id="btnEliminarEnvio">ELIMINAR</ion-button>`;
    document.getElementById("detalleCompartirEnvio").innerHTML = `<ion-button color="primary" id="btnCompartirEnvio">Compartir</ion-button>`; 

    // ELIMINAR ENVIO, funcionalidad de boton
    document.getElementById('btnEliminarEnvio').onclick = function(){
        fetch("https://envios.develotion.com/envios.php",{
                method: 'DELETE',
                body: JSON.stringify({
                    "idEnvio": idEnvio    
                }),
                headers: {
                    "apikey": localStorage.getItem("apiKey"),
                    "Content-Type": "application/json"
                }
            })
            .then(respuesta => respuesta.json())
            .then(function (data){
                if(data.codigo === 200){
                    alert("El envio se elimino correctamente.");
    
                    for (let i = 0; i < listaEnvios.length; i++) {
                        if(listaEnvios[i].id === idEnvio){
                            listaEnvios.splice(i , 1); 
                        }   
                    }
                    router.push('/historial');
                } else {
                    // mostrar mensaje de error usando un componente Toast de Ionic
                    presentToast(data.error, 'Error', 'danger');
                }
            })
    }

    // COMPARTIR ENVIO, funcionalidad de boton
    document.getElementById("btnCompartirEnvio").addEventListener('click', async function compartirEnvio() {
        // Previamente, INSTALAMOS PLUG-IN SHARE en nuestra app
        // preguntamos si estamos en dispositivo android o en web
        if (Capacitor.isNativePlatform()) {
            await Capacitor.Plugins.Share.share({
                title: `Envio`,
                text: `Envio: ${idEnvio}, desde ${ciudadOrigen.nombre} hasta ${ciudadDestino.nombre}, peso del paquete: ${envio.peso}, distancia: ${envio.distancia}, Precio: ${envio.precio}, Categoria: ${categoriaNombre}, Identificador de Usuario: ${envio.id_usuario}`
              });
        } else {
            presentToast('Esta funcionalidad solo se puede ejecutar en un entorno nativo (no en web)', 'Plataforma', 'warning');
        }
    });

    // Mostrar Mapa
    mostrarMapaEnvio(ciudadOrigen, ciudadDestino);
}


// FUNCIONALIDADES PARA USO DE MAPAS EN NUESTRA APP ================================
// funcion para mostrar mapa y calcular distancia
function mostrarMapaEnvio(ciudad1, ciudad2) {
    divMapaEnvio.style.display = "block";
    const lat1 = ciudad1.latitud;
    const long1 = ciudad1.longitud;
    const lat2 = ciudad2.latitud;
    const long2 = ciudad2.longitud;

    var latlng1 = L.latLng(lat1, long1);
    var latlng2 = L.latLng(lat2, long2);

    if (map != undefined) {
        // si el mapa ya existe, lo borro para poder crear el nuevo
        map.remove();
    }
     
    map = L.map('mapaEnvio').setView([lat1, long1], 6);
 
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
 
    L.marker([lat1, long1]).addTo(map)
        .bindPopup(ciudad1.nombre)
        .openPopup();
        
    L.marker([lat2, long2]).addTo(map)
    .bindPopup(ciudad2.nombre)
    .openPopup();

    if (latlng1 && latlng2) {
        //Dibujamos una línea entre los dos puntos
        L.polyline([latlng1, latlng2], {
        color: 'red'
        }).addTo(map);
    }
}

// funcion para medir distancia entre ciudades
function medirDistanciaEnvio(coord1, coord2) {
    
    // if (map != undefined) {
    //     // si el mapa ya existe, lo borro para poder crear el nuevo
    //     map.remove();
    // }
    
    map = L.map('mapaEnvio');

    var distance = map.distance(coord1 ,coord2);
    distance = Math.round(distance/1000);
    return distance;
}


// PUNTO 8 ===========================================================================================
// GASTOS TOTALES ====================================================================================

// Funcion para obtener los gastos totales de los envios de un usuario
function obtenerGastosTotales() {

    let gastoTotal = 0;
    for (let i = 0; i < listaEnvios.length; i++) {
        gastoTotal += listaEnvios[i].precio;
    }
    if(gastoTotal > 0){
        document.getElementById('divGastosTotales').innerHTML = `<h1>La suma de todos sus envios es de $ ${gastoTotal} pesos.`;
    }
}


// PUNTO 9 ===========================================================================================
// TOP 5: Departamentos con mas envios ===============================================================
// listaDepartamentos[];
let listaDeptoConEnvios = [];
// let deptosSinRep = [];
let contadorDeptosRepetidos = [];
let contadorEnvios = 1;

function obtenerTop5(){
    // document.querySelector("#divTop5").innerHTML = "";
    contadorEnvios = 1;
    contadorDeptosRepetidos = [];
    listaDeptoConEnvios = [];
    for (let i = 0; i < listaEnvios.length; i++) {
        let ciudad = obtenerCiudad(listaEnvios[i].ciudad_destino);  
        listaDeptoConEnvios.push(ciudad.id_departamento);
    }
    listaDeptoConEnvios.sort();
    
    // contadorDeptosRepetidos = [];
    for (let i=0; i<listaDeptoConEnvios.length; i++){
        
        if (listaDeptoConEnvios[i+1]===listaDeptoConEnvios[i]){
            contadorEnvios++;
        }else {
            let unEnvio = {"id_departamento": listaDeptoConEnvios[i], 
            "cantidadEnvios": contadorEnvios}
            contadorDeptosRepetidos.push(unEnvio);
            contadorEnvios = 1;
        }   
    }
    contadorDeptosRepetidos.sort((a, b) => b.cantidadEnvios - a.cantidadEnvios);

    let iter = 0;
    while (iter < 5) {
        let elemento = contadorDeptosRepetidos[iter];
        let departamento = obtenerDepartamento(elemento.id_departamento);
        
            document.querySelector("#divTop5").innerHTML +=`
            <ion-item>
                <ion-label>${departamento.nombre} tiene ${elemento.cantidadEnvios} envios.</ion-label>
            </ion-item>`
             
        iter++;
    }   
}

// Obtener Departamento por Identificador
function obtenerDepartamento(idDepto){
    let departamento;
    let encontreDepartamento = false;
    let i = 0; 
    while (!encontreDepartamento) {
        if(idDepto == listaDepartamentos[i].id){
            encontreDepartamento = true;
            departamento = listaDepartamentos[i];  
        }
        i++;
    }
    return departamento;   
}

// Obtenemos los Departamentos y agregamos a una lista local de Departamentos
function obtenerDepartamentosAPI(){
    listaDepartamentos = [];

    fetch("https://envios.develotion.com/departamentos.php",{
            method: 'GET',
            headers: {
                "apikey": localStorage.getItem("apiKey"),
                "Content-Type": "application/json"
            }
        })
        .then(respuesta => respuesta.json())
        .then(function (data){
            if(data.codigo === 200){
                //departamentos.id
                //departamentos.nombre 
                for (let i = 0; i < data.departamentos.length; i++) {
                    let unDepto = data.departamentos[i];
                    listaDepartamentos.push(unDepto);
                }
            } else {
                // mostrar mensaje de error usando un componente Toast de Ionic
                presentToast(data.error, 'Error', 'danger');
            }
        }) 
}


// PUNTO 10 =====================================================================================
// Ubicar la CIUDAD MAS CERCANA =================================================================
document.getElementById("btnObtenerUbicacion").addEventListener('click', obtenerUbicacionActual);

async function obtenerUbicacionActual() {
    divMapaUbicacion.style.display = "block";
    // preguntamos si estamos en android o en web
    if (Capacitor.isNativePlatform()) { 
        Capacitor.Plugins.Geolocation.getCurrentPosition()
        .then(info => {
            console.log(info);
            let lat1 = info.coords.latitude;
            let long1 = info.coords.longitude;
            let ciudadCercana = encontrarCiudadMasCercana(lat1, long1);
            let lat2 = ciudadCercana.latitud;
            let long2 = ciudadCercana.longitud;
            
            if (map != undefined) {
                // si el mapa ya existe, lo borro para poder crear el nuevo
                map.remove();
            }
             
            map = L.map('mapaUbicacion').setView([lat1, long1], 10);

            let latlng1 = L.latLng(lat1, long1);
            let latlng2 = L.latLng(lat2, long2);
         
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(map);
        
            var distance = map.distance(latlng1 ,latlng2);
            distance = Math.round(distance/1000);
            // mensaje para mostrar distancia cercana
            document.getElementById("divDistanciaCercana").innerHTML = `<h2>La ciudad más cercana para realizar su envio está a ${distance} Km de distancia.</h2>`
         
            L.marker([lat1, long1]).addTo(map);    
            L.marker([lat2, long2]).addTo(map)
            .bindPopup(ciudadCercana.nombre)
            .openPopup();

            if (latlng1 && latlng2) {
                //Dibujamos una línea entre los dos puntos
                L.polyline([latlng1, latlng2], {
                color: 'red'
                })
                .addTo(map);
            }        
        })
    } else {
        presentToast('Esta funcionalidad solo se puede ejecutar en un entorno nativo (no en web)', 'Plataforma', 'warning');
    }
};


// encontrarCiudadMasCercana
function encontrarCiudadMasCercana(lat, long){
    
    let distanciaMinima = Number.POSITIVE_INFINITY;
    let ciudadMasCercana;

    if (map != undefined) {
        // si el mapa ya existe, lo borro para poder crear el nuevo
        map.remove();
    }
    
    map = L.map('mapaUbicacion');

    let latLngUbicacion = L.latLng(lat, long);

    
    for (let i = 0; i < listaCiudades.length; i++) {
        const ciudad = listaCiudades[i];
        var lat2 = ciudad.latitud;
        var long2 = ciudad.longitud;
        var latLngCercana = L.latLng(lat2, long2);
        var distanciaCercana = map.distance(latLngUbicacion ,latLngCercana);
        distanciaCercana = Math.round(distanciaCercana/1000);
        if (distanciaCercana<distanciaMinima) {
            distanciaMinima = distanciaCercana;
            ciudadMasCercana = ciudad;
        }  
    }
    return ciudadMasCercana;
}



// CERRAR SESION ======================================================
document.getElementById('btnCerrarSesion').addEventListener('click', cerrarSesion);

function cerrarSesion(){
    window.localStorage.clear();
    router.push('/login');
}


// LOGIN ==================================================================
document.getElementById("btnLogin").addEventListener('click', loginUsuario);

function loginUsuario() {
    let user = document.getElementById("inputUserLogin").value;
    let password = document.getElementById("inputPassLogin").value;
    nombreUsuario = user.toUpperCase();

    try{
        if(!user){
            throw "Ingrese un nombre de usuario."
        }
        if(!password){
            throw "Ingrese su password."
        }
        if(password.length < 4 && password.length > 8){
            throw "Su password debe tener 4 caracteres como mínimo y 8 como máximo."
        }
        fetch("https://envios.develotion.com/login.php",{
            method: 'POST',
            body: JSON.stringify({
                "usuario": user,
                "password": password
            }),
            headers: {
                "Content-Type": "application/json"
            }
        })
        .then(respuesta => respuesta.json())
        .then(function (data){
            if(data.codigo === 200){
                // Si el apiKey no esta guardada, se guarda en Local Storage
                localStorage.setItem('apiKey', data.apiKey);
                localStorage.setItem('id', data.id);  
                
                // enviamos al usuario al Home de la app
                router.push('/home');
            } else {
                // mostrar mensaje de error usando un componente Toast de Ionic
                presentToast(data.error, 'Error de ingreso, compruebe sus datos', 'danger');
            }
        })
        
    }
    catch(error) {
        presentToast(error, 'Falta ingresar información', 'primary');
    }
    
    
     
}


// REGISTRO ======================================================================
// Funcion Boton de Registro
document.getElementById("btnRegistrar").addEventListener('click', registroUsuario);

function registroUsuario(){
    let user = document.getElementById("inputUserReg").value;
    let pass1 = document.getElementById("inputPass1").value;
    let pass2 = document.getElementById("inputPass2").value;
    
    // hacemos validaciones de inputs
    try{
        if(!user){
            throw "Ingrese un nombre de usuario."
        }
        if(!pass1 || !pass2){
            throw "Ingrese su password en los dos campos."
        }
        if(pass1 != pass2){
            throw "Ingrese el mismo password en los campos."
        }
        if((pass1.length < 4 && pass1.length > 8) || (pass2.length < 4 && pass2.length > 8)){
            throw "Ingrese un password de 4 caracteres como mínimo y 8 como máximo."
        }

        fetch("https://envios.develotion.com/usuarios.php",{
            method: 'POST',
            body: JSON.stringify({
                "usuario": user,
                "password": pass1
            }),
            headers: {
                "Content-Type": "application/json"
            }
        })
        .then(respuesta => respuesta.json())
        .then(function (data){
            if(data.codigo === 200){
                // se guarda la API key en LocalStorage
                localStorage.setItem('apiKey', data.apiKey);
                localStorage.setItem('id', data.id);
                nombreUsuario = user.toUpperCase();
                // enviamos al usuario al Home de la app
                router.push('/home');
            } else {
                // mostrar mensaje de error usando un componente Toast de Ionic
                presentToast(data.error, 'El usuario ya existe', 'danger');
            }
        })
    }
    catch(error) {
        presentToast(error, 'Falta ingresar información', 'primary');
    }
}

// funcion para limpiar selects, inputs y divs al ir a home
function limpiarCampos(){
    
    divMapaCalculadora.style.display = "none";
    divMapaEnvio.style.display = "none";
    divMapaUbicacion.style.display = "none";
    document.getElementById('distancia').innerHTML ="";
    
    document.querySelector("#origen").value = -1;
    document.querySelector("#destino").value= -1;
    document.querySelector("#categoriaEnvio").innerHTML = "";
    document.getElementById('mensajeEnvio').innerHTML = "";
    document.querySelector("#inputPeso").value = "";
    
    document.querySelector("#origenEnvio").value = -1;
    document.querySelector("#destinoEnvio").value = -1;
    document.querySelector("#categoriaEnvio").value = -1;
    
    document.querySelector("#divTop5").innerHTML = "";   
}


// ==================================================
// Toast para mostrar mensajes de error de nuestr app
async function presentToast(mensaje, header, color) {
    const toast = document.createElement('ion-toast');
    toast.message = mensaje;
    toast.duration = 2000;
    toast.color = color;
    toast.header = header;
    toast.icon = 'information-circle-outline';
    document.body.appendChild(toast);
    return toast.present();
}
