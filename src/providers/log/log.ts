import { Injectable, NgZone } from '@angular/core';
import { Http, Headers, RequestOptions, URLSearchParams } from '@angular/http';
import 'rxjs/add/operator/map';
import { AlertController, NavController, Platform, ModalController } from "ionic-angular"
import { HomePage } from '../../pages/home/home';
import { LoginPage } from '../../pages/login/login'
import { Storage } from '@ionic/storage';
import { AngularFirestore, AngularFirestoreDocument } from 'angularfire2/firestore';
import { Subscription } from 'rxjs/Subscription'
//geo
import { Geolocation, Geoposition } from '@ionic-native/geolocation';
import { BackgroundGeolocation, BackgroundGeolocationConfig, BackgroundGeolocationResponse  } from '@ionic-native/background-geolocation';
import { NativeGeocoder, NativeGeocoderReverseResult, NativeGeocoderForwardResult } from '@ionic-native/native-geocoder';
import { BackgroundMode } from '@ionic-native/background-mode';
import { BackgroundFetch, BackgroundFetchConfig } from '@ionic-native/background-fetch';

declare var google;
@Injectable()
export class LogProvider {
    token: string;
    id_usuario: string;
    modal: any;
    nombre_actuario: string;
    expediente: string;
    private doc: Subscription;
    //segundo estatus
    token_user: string;
    id_user: string;
    id_exp: string;
    nombre_act: string;
    //este direccion es que se va convertir a latitud y longitud
    direccion_convert: string;
    actuario: AngularFirestoreDocument<any>;
    //mu ubicacion para googlemaps
    MyLocation: any;
    directionsService:any;
    directionsDisplay:any;
    map:any;
    public watch: any;
    public lat: number = 0;
    public lng: number = 0;
    //
    datos_actuario:any;
    //
    datos_array :any;
    //PARA ACTAS
    id_expediente:any;
    anio : any;
    juzgado : any;
    demandado : any;
    direccion : any;
    cant : any;
    items_lat_lng:any;
    latitud:any;

    longitud:any;
    ;
     markes : any[] = [];
    private _date: Date = new Date();
    constructor(
        public http: Http,
        private alertCtrl: AlertController,
        private platform: Platform,
        private storage: Storage,
        private modalCtr: ModalController,
        private db: AngularFirestore,
        public zone: NgZone,
        public geolocation: Geolocation,
        public backgroundFetch: BackgroundFetch,
        public backgroundGeolocation: BackgroundGeolocation,
        private nativeGeocoder: NativeGeocoder,
        public backgroundMode : BackgroundMode
    ) {
        console.log('Hello Log Provider');
        this.cargar_storage();
        //this.start();
       
        
    }
    activo(): boolean {
        // console.log("state Token: " + this.token);
        if (this.token) {

            return true;
        } else {

            return false;
        }

    }
    markers(){
        var docRef = this.db.collection("usuarios").doc(this.nombre_actuario).ref;

        docRef.get().then(function(doc) {
            if (doc.exists) {
                if(doc.data().markes){
                    console.log("si hay longitudes");
                    this.markes = doc.data().markes;
                }
            } else {
               
            }
        }).catch(function(error) {
            console.log("Error getting document:", error);
        });
    }

    ingresar(nombre: string, password: string) {
        let data = new URLSearchParams();
        data.append("NombreA", nombre);
        data.append("Pass_codeA", password);
        var headers = new Headers();
        headers.append('Content-Type', 'application/x-www-form-urlencoded');

        let options = new RequestOptions({ headers: headers });
        console.log("Provider" + nombre, password);
        //eHa123!!http://iustartech.com/Api-Rest/index.php/login
        //cuando se genere APK cambiar
        //http://187.163.188.234/Api-Rest/index.php/login
        //para prueba android local iustartech.com //iustartech.com
        console.log("login data" + data);
        return this.http.post('http://iustartech.com/iustargen/index.php/login', data)
            .map(resp => {
                let data_resp = resp.json();
                console.log("Token:  " + data_resp.token)
                let token_new = data_resp.token;
                //console.log(token_new.slice(0,-15));
                if (data_resp.error) {
                    console.log("Error !!! ");
                    this.alertCtrl.create({
                        title: 'Error al iniciar Sesion',
                        subTitle: data_resp.mensaje,
                        buttons: ["Ok"]
                    }).present();

                } else {
                    
                    //console.log("en OK !  " + data_resp.token)
                    this.token = token_new.slice(0, -15);
                    this.id_usuario = data_resp.id_usuario;
                    this.nombre_actuario = data_resp.nombre_actuario;

                    //Guardar en LocalStorage
                    console.log("Nombre completo:" + this.nombre_actuario);
                    this.guardar_storage();
                    //comprueba si existe si no la crea
                    this.verifica_en_firebase(this.nombre_actuario);

                    this.actuario = this.db.doc(`/usuarios/${this.nombre_actuario}`);
                    //inicia mapa
                    
                    this.start();
                }
            })

    }
    cerrarsesion() {
        this.token = null;
        this.id_usuario = null;

        //

        this.guardar_storage();
        console.log("logout!!"+ this.token + " " + this.id_usuario );
        //
    }
    verifica_en_firebase(nombre: string) {

        return new Promise((resolve, reject) => {
            this.doc = this.db.doc(`/usuarios/${nombre}`)
                .valueChanges().subscribe(data => {
                    this.actualiza_lat_lng(data['lat'],data['lng']);
                    if (data) {
                        console.log("ok hay datos->" + JSON.stringify(data) );
                        this.registra_firebase(nombre);
                        console.log()
                    } else {
                        this.registra_firebase(nombre);
                    }
                })
        })
    }
    actualiza_lat_lng(lat,lng) {
      this.latitud = lat;
      this.longitud = lng;

  }
    registra_firebase(nombre: string) {
     
        this.db.collection('usuarios').doc(nombre).update({
            nombre: nombre
        }).then(function () {
       }).catch(function (error) {
          console.log(error);
            })
    }
    //guardar los dats en LocalStorage del telefono.
    private guardar_storage() {

        if (this.platform.is("cordova")) {
            // dispositivo
            console.log("logout!!"+ this.token + " " + this.id_usuario );
            this.storage.set('token', this.token);
            this.storage.set('id_usuario', this.id_usuario);

        } else {
            // computadora
            if (this.token) {
                localStorage.setItem("token", this.token);
                localStorage.setItem("id_usuario", this.id_usuario);
            } else {
                localStorage.removeItem("token");
                localStorage.removeItem("id_usuario");
            }

        }


    }
    //busca los datos en Local Storage
    cargar_storage() {

        let promesa = new Promise((resolve, reject) => {

            if (this.platform.is("cordova")) {
                // dispositivo
                this.storage.ready()
                    .then(() => {
                        //obtiene token guardado en localStorage
                        this.storage.get("token")
                            .then(token => {
                                if (token) {
                                    this.token = token;
                                }
                            })

                        this.storage.get("id_usuario")
                            .then(id_usuario => {
                                if (id_usuario) {
                                    this.id_usuario = id_usuario;
                                }
                                resolve();
                            })

                    })


            } else {
                // computadora
                if (localStorage.getItem("token")) {
                    //Existe items en el localstorage
                    this.token = localStorage.getItem("token");
                    this.id_usuario = localStorage.getItem("id_usuario");
                }

                resolve();

            }

        });

        return promesa;

    }
    //verifico existencia de marcadores por actuario
    verifica_en_firebase_marker(){
        //let name_marker= this.db.doc(`/usuarios/${this.nombre_actuario}/markes`);
        return new Promise((resolve, reject) => {
            this.doc = this.db.doc(`/usuarios/${this.nombre_actuario}/markes`)
                .valueChanges().subscribe(data => {
                    this.actualiza_lat_lng(data['lat'],data['lng']);
                    if (data) {
                        console.log("existen marcadores");
                        console.log(JSON.stringify(data));
                        // this.registra_firebase(name_marker);
                    } else {
                       //  this.registra_firebase(name_marker);
                       console.log("No hay datos !");
                    }
                })
        })
    }
    //empieza geololaizacion
    start() { 
        

          let options = {
            frequency: 300000,
            enableHighAccuracy: true,
            timeout:300000
        };
            //cuando la aplicacion esta abierta y activada
          this.watch = this.geolocation.watchPosition(options).filter((p: any) => p.code === undefined)
          .subscribe((position: Geoposition) => {
            this.zone.run(() => {
                this.lat = position.coords.latitude;
                this.lng =  position.coords.longitude;
                });

          });
      
      
    }
    recibe_datos(datos_user,params) {
       this.token_user = datos_user.token;
       this.id_user = datos_user.id_user;
       this.id_exp = datos_user.id_expediente;
       this.nombre_act = datos_user.nombre_actuario;
        this.datos_array = params;
        
    }
    //convierte de direccion en letra a latitud y longitud en numeros
    addressToLatLng(direccion: string, latitude_inicial, longitude_inicial) {
        console.log("Direccion que llego->" + direccion);
        var geocoder = new google.maps.Geocoder();
        if(direccion!='')
        {
         // Llamamos a la función geodecode pasandole la dirección que hemos introducido en la caja de texto.
         console.log("Direccion que llego2 ->" + direccion);
        geocoder.geocode({ 'address': direccion}, function(results, status)
        {
          if (status == 'OK')
          {
            console.log("Direccion convertida->"+'latitude=>' + results[0].geometry.location.lat() + ' and longitude=>' + results[0].geometry.location.lng());
            console.log("empeze a calcular distancia");
            let rad = function (x) { return x * Math.PI / 180; }
            let R = 6378.137; //Radio de la tierra en km
            let dLat = rad(results[0].geometry.location.lat()  - latitude_inicial);
            let dLong = rad(results[0].geometry.location.lng() - longitude_inicial);
            let a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(rad(latitude_inicial)) * Math.cos(rad(results[0].geometry.location.lng())) * Math.sin(dLong / 2) * Math.sin(dLong / 2);
            let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            let d = R * c;
            console.log("distancia en KM" + d.toFixed(3));
          }else{
              console.log("Error al convertir"  + results+ "staus " + status);
          }
         });
        }
    }
    //calcula distancia en metros.
    calcula_distancia(latitude_inicial, longitude_inicial, latitude_final, longitude_final) {
        console.log("empeze a calcular distancia");
        let rad = function (x) { return x * Math.PI / 180; }
        let R = 6378.137; //Radio de la tierra en km
        let dLat = rad(latitude_final - latitude_inicial);
        let dLong = rad(longitude_final - longitude_inicial);
        let a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(rad(latitude_inicial)) * Math.cos(rad(longitude_final)) * Math.sin(dLong / 2) * Math.sin(dLong / 2);
        let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        let d = R * c;
        console.log("distancia en KM" + d);
        return d.toFixed(3);

    }
    //datos para embargo
    recibir(id_expediente:string,anio:string,juzgado:string,direccion:string,demandado:string,cant:string){
      this.id_expediente = id_expediente;
      this.anio = anio;
      this.juzgado=juzgado;
      this.direccion = direccion;
      this.demandado = demandado;
      this.cant=cant;
     console.log(juzgado);

 }
 guardar_pdf_embargo(expediente:string,anio:string,municipio:string,hora:string,fecha:string,juzgado:string,abogado:string,caracter:string,identificacion:string,direccion:string,demandado:string,nplantas:string,fachada_color:string,puerta_color:string,nom:string,id:string,exp:string,fecha_emision:string,cant:string,text:string,img){
  let data = new URLSearchParams();
  data.append("expediente", expediente);
  data.append("anio", anio);
  data.append("municipio", municipio);
  data.append("hora",hora);
  data.append("fecha",fecha);
  data.append("juzgado",juzgado);
  data.append("abogado",abogado);
  data.append("caracter",caracter);
  data.append("identificacion_abog",identificacion);
  data.append("direccion",direccion);
  data.append("demandado",demandado);
  data.append("nplantas",nplantas);
  data.append("fachada_color",fachada_color);
  data.append("puerta_color",puerta_color);
  data.append("nomb",nom);
  data.append("id_tipo",id);
  data.append("expedida",exp);
  data.append("fecha_emision",fecha_emision);
  data.append("cant",cant);
  data.append("manifiesto",text);
  data.append("img",img);
  console.log("verfificar que trae"+municipio);
  console.log("data embargo"+data);
  return this.http.post('http://iustartech.com/iustargen/index.php/expediente/save_pdf_embargo', data)
        .map(resp => {
             let data_resp = resp.json();
             if (data_resp.error) {
              console.log("Error !!! ");
              this.alertCtrl.create({
                  title: 'error al guardar',
                  buttons: ["Ok"]
              }).present();

          }else{
            this.alertCtrl.create({
              title: 'guardado Correctamente',
              buttons: ["Ok"]
          }).present();
          }


        });

}

guardar_pdf_emplazamiento(expediente:string,anio:string,municipio:string,hora:string,fecha:string,abogado:string,caracter:string,direccion:string,demandado:string,id:string,fecha_asig:string,desc_inmueble:string,contestacion:string,plazo:string,espacio:string,doc:string,firma:string,juzgado:string,text:string,img:any){
  
  let data = new URLSearchParams();
  data.append("expediente",expediente);
  data.append("anio",anio);
  data.append("municipio", municipio);
  data.append("hora",hora);
  data.append("fecha",fecha);
  data.append("abogado",abogado);
  data.append("caracter", caracter);
  data.append("direccion",direccion);
  data.append("demandado",demandado);
  data.append("id", id);
  data.append("fecha_asig", fecha_asig);
  data.append("desc_inmueble", desc_inmueble);
  data.append("contestacion", contestacion);
  data.append("plazo", plazo);
  data.append("espacio", espacio);
  data.append("doc", doc);
  data.append("firma", firma);
  data.append("juzgado", juzgado);
  data.append("text",text);
  data.append("img",img);
  console.log("verfificar que trae"+municipio);
  console.log("data embargo"+data);
  return this.http.post('http://iustartech.com/iustargen/index.php/expediente/save_pdf_emplazamiento', data)
        .map(resp => {
             let data_resp = resp.json();
             if (data_resp.error) {
              console.log("Error !!! ");
              this.alertCtrl.create({
                  title: 'error al guardar',
                  buttons: ["Ok"]
              }).present();

          }else{
            this.alertCtrl.create({
              title: 'guardado Correctamente',
              buttons: ["Ok"]
          }).present();
          }


        });

      }
      guardar_pdf_constancia(expediente:string,anio:string,juzgado:string,tipo:string,municipio:string,hora:string,fecha:string,abogado:string,direccion:string,demandado:string,text:string){
          let data = new URLSearchParams();
          data.append("expediente",expediente);
          data.append("fecha",fecha);
          data.append("anio",anio);
          data.append("juzgado", juzgado);
          data.append("tipo", tipo);
          data.append("municipio", municipio);
          data.append("hora",hora);
          data.append("dia",fecha);
          data.append("abogado",abogado);
          data.append("domicilio",direccion);
          data.append("demandado",demandado);
          data.append("constancia",text);

          console.log("data embargo"+data);
          return this.http.post('http://iustartech.com/iustargen/index.php/expediente/save_pdf_constancia', data)
                .map(resp => {
                     let data_resp = resp.json();
                     if (data_resp.error) {
                      console.log("Error !!! ");
                      this.alertCtrl.create({
                          title: 'error al guardar',
                          buttons: ["Ok"]
                      }).present();

                  }else{
                    this.alertCtrl.create({
                      title: 'guardado Correctamente',
                      buttons: ["Ok"]
                  }).present();
                  }


                });

      }

  save_comment(direccion,comentario){
    let data = new URLSearchParams();
      data.append("direccion", direccion);
      data.append("comentario",comentario );
      return this.http.post('http://iustartech.com/iustargen/index.php/expediente/comentarios_direccion', data)
      .map(resp => {
           let data_resp = resp.json();
           if (data_resp.error) {
            console.log("Error !!! ");
            this.alertCtrl.create({
                title: 'error al guardar',
                buttons: ["Ok"]
            }).present();

        }else{
          this.alertCtrl.create({
            title: 'guardado Correctamente',
            buttons: ["Ok"]
        }).present();
        }


      });
  }



    //actualiza status Firebase
    actualiza_status(datos){
      this.datos_actuario =  datos;
    }
}
