import { Component, ViewChild, ElementRef } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController, ViewController, AlertController, Platform } from 'ionic-angular';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { Http, Headers, RequestOptions } from '@angular/http';
import 'rxjs/add/operator/map';
import { InAppBrowser, InAppBrowserOptions } from '@ionic-native/in-app-browser';
import { LogProvider } from '../../providers/log/log';
import { AngularFirestore, AngularFirestoreDocument,AngularFirestoreCollection } from 'angularfire2/firestore';
import { Subscription } from 'rxjs/Subscription';
import { AboutPage } from '../about/about';
import { Geolocation } from '@ionic-native/geolocation';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import { LaunchNavigator, LaunchNavigatorOptions } from '@ionic-native/launch-navigator';
declare var google: any;
/**
 * Generated class for the ModalDetalleSitioPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-modal-detalle-sitio',
  templateUrl: 'modal-detalle-sitio.html',
})
export class ModalDetalleSitioPage {

  @ViewChild('map') mapElement: ElementRef;
  @ViewChild('directionsPanel') directionsPanel: ElementRef;
  map: any;
  markers = [];
  mylocation:any;
  address:any;
  directionsService = new google.maps.DirectionsService;
  directionsDisplay = new google.maps.DirectionsRenderer({
    polylineOptions: {
      strokeColor: "black"
    }
  });

  lat:any;
  lng:any;
  updatelocation:any;
  public inicio: any;
  public suerte_principal:any;
  public dir: any;
  public form: FormGroup;
  public id_expediente: any;
  public anio: any;
  public fecha_asig: any;
  public demandado: any;
  public tipo_juicio: any;
  public direccion: any;
  public id_actuario: any;
  public nombre_actuario: any;
  public isEdited: boolean = false;
  public hideForm: boolean = false;
  public pageTitle: string;
  public recordID: any = null;
  //data para por enviar
  datos = {};
  //lat y lng convertidos
  lat_c:any;
  lng_c:any;
  //firebase
  actuario: AngularFirestoreDocument<any>;
  //direccion con comenterios
  juzgado:any;
  msg_comentarios:string;

  private doc: Subscription;
  options: InAppBrowserOptions = {
    location: 'yes',//Or 'no'
    hidden: 'no', //Or  'yes'
    clearcache: 'yes',
    clearsessioncache: 'yes',
    zoom: 'yes',//Android only ,shows browser zoom controls
    hardwareback: 'yes',
    mediaPlaybackRequiresUserAction: 'no',
    shouldPauseOnSuspend: 'no', //Android only
    closebuttoncaption: 'Close', //iOS only
    disallowoverscroll: 'no', //iOS only
    toolbar: 'yes', //iOS only
    enableViewportScale: 'no', //iOS only
    allowInlineMediaPlayback: 'no',//iOS only
    presentationstyle: 'pagesheet',//iOS only
    fullscreen: 'yes',//Windows only
  };
  constructor(
    public navCtrl: NavController,
    public NP: NavParams,
    public http: Http,
    public fb: FormBuilder,
    public toastCtrl: ToastController,
    public viewCtrl: ViewController,
    private InAppBrowserOptions: InAppBrowser,
    public user: LogProvider,
    private alertCtrl: AlertController,
    private db: AngularFirestore,
    public platform: Platform,
    private geolocation: Geolocation,
    public launchNavigator: LaunchNavigator

  ) {
    this.form = fb.group({
      "id_expediente": ["", Validators.required],
      "anio": ["", Validators.required],
      "fecha_asig": ["", Validators.required],
      "tipo_juicio": ["", Validators.required],
      "demandado": ["", Validators.required],
      "direccion": ["", Validators.required],
      "id_actuario": ["", Validators.required],
      "nombre_actuario": ["", Validators.required],
      "suerte_principal": ["", Validators.required],
      "juzgado": ["", Validators.required],
    });
    console.log("GRUPO" + this.form);
    console.log("EX" + fb.group({
      "id_expediente": ["", Validators.required],
      "anio": ["", Validators.required],
      "fecha_asig": ["", Validators.required],
      "demandado": ["", Validators.required],
      "tipo_juicio": ["", Validators.required],
      "direccion": ["", Validators.required],
      "id_actuario": ["", Validators.required],
      "nombre_actuario": ["", Validators.required],
      "suerte_principal": ["", Validators.required]
    }));

  }
  help(){
    console.log("help");
  }
  google(){
    this.launchNavigator.APP
    this.launchNavigator.navigate(this.direccion, { start: [this.user.lat ,this.user.lng]})
   .then(
     success => console.log('Launched navigator'),
     error => console.log('Error launching navigator', error)
   );
  } 

  enviar(){
  
    this.user.recibir(

        this.id_expediente,
        this.anio,
        this.juzgado,
        this.direccion,
        this.demandado,
        this.suerte_principal)
    console.log("DETALLE SITIO AÑO"+this.anio);
    }

  ionViewWillEnter() {

    if (this.NP.get("record")) {
      console.log(this.NP.get("record"));
      this.isEdited = true;
      this.selectEntry(this.NP.get("record"));
      console.log("REcord" + this.selectEntry(this.NP.get("record")));
    }
    else {
      this.isEdited = false;
      this.pageTitle = 'Create entry';
    }
    //Buscamos si hay direccion con comentario
      if (this.user.activo) {
        let toke_user = this.user.token;
        let id_user = this.user.id_usuario;
        //cambiar cuando genere APK  187234.163.188.
        let url = `http://iustartech.com/iustargen/index.php/expediente/compara_direcciones/${toke_user}/${id_user}`;
        console.log("URL " + url);
        this.http.get(url).map(res => res.json()).subscribe(data => {

          for (var i = 0; i < data.length; i++) {
            if(data[i].direccion === this.direccion ){
             // console.log("Hay comentarios" + data[i].comentario  );
              this.msg_comentarios =  data[i].comentario ;
            }

        }
          });
      }
  }
  selectEntry(item) {
    this.id_expediente = item.id_expediente;
    this.anio = item.anio;
    this.fecha_asig = item.fecha_asig;
    this.demandado = item.demandado;
    this.tipo_juicio = item.tipo_juicio;
    this.direccion = item.direccion;
    this.id_actuario = item.id_actuario;
    this.nombre_actuario = item.nombre_actuario;
    this.suerte_principal = item.suerte_principal;
    this.juzgado = item.juzgado;

  }

  direc(d) {
    this.dir = this.direccion;
    console.log("esta" + this.dir);
  }
  cerrarModal() {
    this.viewCtrl.dismiss();
  }
  openMap(url: string) {
    let target = "_blank";

    let new_url = `${url}` + this.direccion;
    console.log("url " + new_url);
    this.InAppBrowserOptions.create(new_url, target, this.options);
    //inicia proceso de diligencia.

    if (this.user.activo) {
      let toke_user = this.user.token;
      let id_user = this.user.id_usuario;
      let id_expediente = this.id_expediente;
      let status = 1;
      this.datos = { 'token': toke_user, 'id_user': id_user, 'id_expediente': id_expediente, 'nombre_actuario': this.nombre_actuario, "direccion": this.direccion };

      //cambiar cuando genere APK  187.163.188.234
      let url = `http://iustartech.com/iustargen/index.php/expediente/update_status/${toke_user}/${id_user}/${id_expediente}/${status}`;
      this.http.get(url)
        .map(res => res.json())
        .subscribe(data => {
          //hay error al actualizar estatus expediente

          if (data.error) {

            this.alertCtrl.create({
              title: 'Aviso',
              subTitle: 'Ha ocurrido un error al intentar atender expediente',
              buttons: ["Ok"]
            }).present();
          } else {//se actualiza front web con estos datos.
            let estatus_fire = 'Inicio';
            this.registra_firebase(estatus_fire.toString());
            this.actuario = this.db.doc(`/usuarios/${this.nombre_actuario}`);
            //lleva a otra pantalla
            this.switchTabs();
          }
        });

    }
  }
  //envia los datos a firebase . Para su visualizacion en tiempo real en usuario WEB
  registra_firebase(estatus: string) {
    console.log("Hasta por aqui");
    var usersUpdate = {};
    var key = 0;
  }
  switchTabs() {
    this.navCtrl.parent.select(1);
  }
  addEntry() {
    this.navCtrl.push(AboutPage);
  }

  calculateAndDisplayRoute() {
    if (this.user.activo) {
      let toke_user = this.user.token;
      let id_user = this.user.id_usuario;
      let id_expediente = this.id_expediente;
        let     anio = this.anio; 
      let status = 1;
      //cambiar cuando genere APK  187.163.188.23
      let url = `http://iustartech.com/iustargen/index.php/expediente/update_status/${toke_user}/${id_user}/${id_expediente}/${status}`;
      this.http.get(url)
        .map(res => res.json())
        .subscribe(data => {
          //hay error al actualizar estatus expediente
          if (data.error) {
            this.alertCtrl.create({
              title: 'Aviso',
              subTitle: 'Ha ocurrido un error al intentar atender expediente',
              buttons: ["Ok"]
            }).present();
          } else {//se actualiza front web con estos datos.
            this.actuario = this.db.doc(`/usuarios/${this.nombre_actuario}`);
            this.registra_firebase_v2(this.user.datos_actuario);
           // this.initMap();
          }
        });
    }
  }
  //No se ocupa, pero es para los parametros a  ala siguiente ventana
  viewEntry() {
    if (this.user.activo) {
      let toke_user = this.user.token;
      let id_user = this.user.id_usuario;
      let id_expediente = this.id_expediente;
      let status = 1;
      //cambiar cuando genere APK  187.163.188.234
      let url = `http://iustartech.com/iustargen/index.php/expediente/update_status/${toke_user}/${id_user}/${id_expediente}/${status}`;
      this.http.get(url)
        .map(res => res.json())
        .subscribe(data => {
          //hay error al actualizar estatus expediente
          if (data.error) {
            this.alertCtrl.create({
              title: 'Aviso',
              subTitle: 'Ha ocurrido un error al intentar atender expediente',
              buttons: ["Ok"]
            }).present();
          } else {//se actualiza front web con estos datos.
            this.actuario = this.db.doc(`/usuarios/${this.nombre_actuario}`);
            this.registra_firebase_v2(this.user.datos_actuario);
           // this.initMap();
          }
        });
        
    }
    let toke_user = this.user.token;
    let id_user = this.user.id_usuario;
    let id_expediente = this.id_expediente;
    let status = 1;
    var nombre_actuario =  this.nombre_actuario;
    this.datos = {
      'token': toke_user,
      'id_user': id_user,
      'id_expediente': id_expediente,
      'nombre_actuario': this.nombre_actuario,
      "direccion": this.direccion
      /*  'directionsService':directionsService,
        'directionsDisplay':directionsDisplay,
        'map':*/
    };
    this.enviar();
    this.user.recibe_datos(this.datos,this.user.datos_actuario);

    this.switchTabs();
  }

  registra_firebase_v2(data_array){
    console.log("datos recibidos->" + JSON.stringify(data_array));
     this.user.id_usuario;
    for (var i = 0; i < data_array.length; i++) {
        if(data_array[i].id_expediente === this.id_expediente ){
          data_array.splice(i, 1, {id_expediente:
            data_array[i].id_expediente,
            'demandado': data_array[i].demandado,
            'direccion': data_array[i].direccion,
            'tipo_juicio': data_array[i].tipo_juicio,
            'anio' : data_array[i].anio,
            'status': "Inicio"
          });
        }
    }
    console.log("data++->" + JSON.stringify(data_array));
    console.log("actuario++->" + this.nombre_actuario);
    this.actuario.update({
      data_array
          })
            .then(function() {})
            .catch(function(error) {
              console.log("Error al subir datos! " + error);
            });
  }
  initMap() {

    this.geolocation.getCurrentPosition({ maximumAge: 3000, timeout: 5000, enableHighAccuracy: true }).then((resp) => {
      this.mylocation = new google.maps.LatLng(resp.coords.latitude, resp.coords.longitude);

      this.map = new google.maps.Map(this.mapElement.nativeElement, {
        zoom: 15,
        center: this.mylocation
      });
      this.directionsDisplay.setMap(this.map);

    });

    let watch = this.geolocation.watchPosition();
    watch.subscribe((data) => {
      this.deleteMarkers();
      //
      console.log("id_Exp->" + this.id_expediente);
      this.actuario.update({
          lat:data.coords.latitude,
          lng:data.coords.longitude
      })
      .then(function() {})
      .catch(function(error) {
        console.log(error);
      });
      this.lat = data.coords.latitude;
      this.lng = data.coords.longitude;
      //this.updatelocation = new google.maps.LatLng(data.coords.latitude, data.coords.longitude);
      //this.calculateAndDisplay_Route(data.coords.latitude,data.coords.longitude);
      let image = 'assets/imgs/blue-bike.png';
      this.addMarker(this.updatelocation, image);
      this.addMarkerB();
      this.setMapOnAll(this.map);
    });

  }
  addMarker(location, image) {
    let marker = new google.maps.Marker({
      position: location,
      map: this.map,
      icon: image
    });
    this.markers.push(marker);
  }

  setMapOnAll(map) {
    for (var i = 0; i < this.markers.length; i++) {
      this.markers[i].setMap(map);
    }
  }

  clearMarkers() {
    this.setMapOnAll(null);
  }

  deleteMarkers() {
    this.clearMarkers();
    this.markers = [];
  }
  addMarkerB(){


  }
calculateAndDisplay_Route(){
  console.log("qqqq" + this.user.latitud);
  console.log("pppp" + this.user.longitud);
  this.map = new google.maps.Map(this.mapElement.nativeElement, {
    zoom: 15,
    center: {lat:this.user.lat ,lng:this.user.lng},
    styles:[
      {
          "featureType": "water",
          "elementType": "geometry.fill",
          "stylers": [
              {
                  "color": "#d3d3d3"
              }
          ]
      },
      {
          "featureType": "transit",
          "stylers": [
              {
                  "color": "#808080"
              },
              {
                  "visibility": "off"
              }
          ]
      },
      {
          "featureType": "road.highway",
          "elementType": "geometry.stroke",
          "stylers": [
              {
                  "visibility": "on"
              },
              {
                  "color": "#b3b3b3"
              }
          ]
      },
      {
          "featureType": "road.highway",
          "elementType": "geometry.fill",
          "stylers": [
              {
                  "color": "#ffffff"
              }
          ]
      },
      {
          "featureType": "road.local",
          "elementType": "geometry.fill",
          "stylers": [
              {
                  "visibility": "on"
              },
              {
                  "color": "#ffffff"
              },
              {
                  "weight": 1.8
              }
          ]
      },
      {
          "featureType": "road.local",
          "elementType": "geometry.stroke",
          "stylers": [
              {
                  "color": "#d7d7d7"
              }
          ]
      },
      {
          "featureType": "poi",
          "elementType": "geometry.fill",
          "stylers": [
              {
                  "visibility": "on"
              },
              {
                  "color": "#ebebeb"
              }
          ]
      },
      {
          "featureType": "administrative",
          "elementType": "geometry",
          "stylers": [
              {
                  "color": "#a7a7a7"
              }
          ]
      },
      {
          "featureType": "road.arterial",
          "elementType": "geometry.fill",
          "stylers": [
              {
                  "color": "#ffffff"
              }
          ]
      },
      {
          "featureType": "road.arterial",
          "elementType": "geometry.fill",
          "stylers": [
              {
                  "color": "#ffffff"
              }
          ]
      },
      {
          "featureType": "landscape",
          "elementType": "geometry.fill",
          "stylers": [
              {
                  "visibility": "on"
              },
              {
                  "color": "#efefef"
              }
          ]
      },
      {
          "featureType": "road",
          "elementType": "labels.text.fill",
          "stylers": [
              {
                  "color": "#696969"
              }
          ]
      },
      {
          "featureType": "administrative",
          "elementType": "labels.text.fill",
          "stylers": [
              {
                  "visibility": "on"
              },
              {
                  "color": "#737373"
              }
          ]
      },
      {
          "featureType": "poi",
          "elementType": "labels.icon",
          "stylers": [
              {
                  "visibility": "off"
              }
          ]
      },
      {
          "featureType": "poi",
          "elementType": "labels",
          "stylers": [
              {
                  "visibility": "off"
              }
          ]
      },
      {
          "featureType": "road.arterial",
          "elementType": "geometry.stroke",
          "stylers": [
              {
                  "color": "#d6d6d6"
              }
          ]
      },
      {
          "featureType": "road",
          "elementType": "labels.icon",
          "stylers": [
              {
                  "visibility": "off"
              }
          ]
      },
      {},
      {
          "featureType": "poi",
          "elementType": "geometry.fill",
          "stylers": [
              {
                  "color": "#dadada"
              }
          ]
      }
  ]
  });
  this.directionsDisplay.setMap(this.map);
  this.directionsDisplay.setPanel(this.directionsPanel.nativeElement);
  this.directionsService.route({
    origin:{lat:this.user.lat ,lng:this.user.lng},
    destination: this.direccion,
    travelMode: 'DRIVING'
  }, (response, status) => {
    if (status === 'OK') {
      this.directionsDisplay.setDirections(response);
    } else {
      window.alert('Directions request failed due to ' + status);
    }
  });
  }
 /* addressToLatLng(direccion: string) {
    var geocoder = new google.maps.Geocoder();
    if(direccion!='')
    {
    geocoder.geocode({ 'address': direccion}, function(results, status)
    {
      if (status == 'OK')
      {
       // console.log("Direccion convertida->"+'latitude=>' + results[0].geometry.location.lat() + ' and longitude=>' + results[0].geometry.location.lng());
       var resultados = results[0].geometry.location;
       this.lat_c = resultados.lat();
       this.lng_c = resultados.lng();

       var marker = new google.maps.Marker({
        map: this.map,
        position: results[0].geometry.location
      });

      }else{

      }
     });
     console.log("q->" + this.lat_c  + this.lng_c );
    }
}*/

}
