import { Component,NgZone } from "@angular/core";
import {
NavController,
ModalController,
AlertController,
ViewController,
App,
ToastController
} from "ionic-angular";
import { Http } from "@angular/http";
import "rxjs/add/operator/map";
import "rxjs/add/operator/timeout";
import { LogProvider } from "../../providers/log/log";
import { LoginPage } from "../../pages/login/login";
import {
AngularFirestore,
AngularFirestoreDocument,
AngularFirestoreCollection
} from "angularfire2/firestore";
import { UniqueDeviceID} from '@ionic-native/unique-device-id/ngx'
import { Subscription } from "rxjs/Subscription";
import { BackgroundGeolocation, BackgroundGeolocationConfig, BackgroundGeolocationResponse } from '@ionic-native/background-geolocation';
import { Geolocation, Geoposition } from '@ionic-native/geolocation';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/take';
import { NativeGeocoder, NativeGeocoderReverseResult, NativeGeocoderForwardResult, NativeGeocoderOptions } from '@ionic-native/native-geocoder';
import { Network } from '@ionic-native/network';
@Component({
selector: 'page-home',
templateUrl: 'home.html'
})

export class HomePage {
  locations:any;
  stationary:any;
  onstationary:any;
  uidDevice:any;
  userDetails: any;
  responseData: any;
  public watch: any;
  
  userPostData = { user_id: "", token: "" };
  loginData = {};
  actuario: AngularFirestoreDocument<any>;
  public items: any = [];
  private doc: Subscription;
  num_expe: any;
  public lat: number = 0;
  public lng: number = 0;
  itemsCollection: AngularFirestoreCollection<any>; //Firestore collection
  items2: Observable<Items[]>;
  fecha: any;
  
  public carga : boolean = true;
  public error : boolean = false;
  
  constructor(
  public navCtrl: NavController,
  public http: Http,
  public viewCtrl: ViewController,
  public modalCtrl: ModalController,
  public alertCtrl: AlertController,
  public user: LogProvider,
  public modal: ModalController,
  public app: App,
  private db: AngularFirestore,
  public backgroundGeolocation: BackgroundGeolocation,
  public zone: NgZone,
  public geolocation: Geolocation,
  private nativeGeocoder: NativeGeocoder,
  private network: Network,
  private toast: ToastController,
  private uniqueDeviceID:UniqueDeviceID
  ) {}


  ionViewWillEnter() {
    this.load();
    console.log("Entra a checar la conección :v");
    this.network.onConnect().subscribe(data => {
    this.displayNetworkUpdate(data.type);
    }, error => console.log(error));
    
    this.network.onDisconnect().subscribe(data => {
    this.displayNetworkUpdate(data.type);
    }, error => console.log(error));
  }
  displayNetworkUpdate(connectionState: string){
    console.log("Displayin connection!!!");
    let networkType = this.network.type;
    this.toast.create({
    message: `Estás ${connectionState} por ${networkType} `,
    duration: 3000
    }).present();
    }
    
showAlert(){
  this.alertCtrl.create({
  title: "Error",
  subTitle: "Error inesperado, inténtelo más tarde.",
  buttons: ["Aceptar"]
  }).present();
  }
  
  TimeOut(){
  this.alertCtrl.create({
  title: "Error",
  subTitle: "No se han podido cargar las diligencias, por favor vuelva a intentarlo recargando la pantalla.",
  buttons: ["Aceptar"]
  });
  }
  help(){
    console.log("expediete");
  }
  doRefresh(refresher) {
    console.log('Begin async operation', refresher);
    this.load();
    setTimeout(() => {
      console.log('Async operation has ended');
      refresher.complete();
    }, 2000);
  }
  load() {
    
    if (this.user.activo) {
      let toke_user = this.user.token;
      let id_user = this.user.id_usuario;
      //cambiar cuando genere APK  187234.163.188.
      console.log(toke_user,id_user);
      let url = `http://www.iustartech.com/iustargen/index.php/expediente/obtener_expedientes/${toke_user}/${id_user}`;

      console.log("URL " + url);
      this.http.get(url).map(res => res.json()).subscribe(data => {
          this.items = data;
          console.log(this.user.nombre_actuario + " ");
          var data_array = [];
          for (var i = 0; i < data.length; i++) {
            data_array.push({
              id_expediente: data[i].id_expediente,
              demandado: data[i].demandado,
              direccion: data[i].direccion,
              anio:data[i].anio,
              status: data[i].status,
              tipo_juicio: data[i].tipo_juicio
            });
          }
          
          this.actuario = this.db.doc(`/usuarios/${this.user.nombre_actuario}`);
          this.itemsCollection = this.db.collection(`usuarios`); //ref()
          this.items2 = this.itemsCollection.valueChanges()
          console.log("datos--" + this.items2);
        //  this.registra_firebase(this.user.nombre_actuario, data_array);
          this.verifica_en_firebase(this.user.nombre_actuario,data_array);
         
        }); 
        

    }
   
  }
   //verifica existencia de expedientes
   registra_firebase(nombre_actuario, data_array) {

    console.log("data->ArrayHome" + JSON.stringify(data_array));
    this.db.collection("usuarios").doc(nombre_actuario).update({
        data_array
      }).then(function() {
        
      })
      .catch(function(error) {
        console.log("Error al subir datos! " + error);
      });
      //envio datos;
      this.user.actualiza_status(data_array);
}
verifica_en_firebase(nombre: string,data_array) {
let markes =[] ;
  return new Promise((resolve, reject) => {
      this.doc = this.db.doc(`/usuarios/${nombre}`)
          .valueChanges().take(1).subscribe(data => {
              
              if (data) {
                  //console.log("ok hay datos");
                //  this.start(markes,data_array);
                  console.log("datos--> " + JSON.stringify(data['markes']));
                  if(data['markes'] === undefined || data['data_array']  === undefined){
                    this.start(markes,data_array);
                    this.user.actualiza_status(data_array);
                  }else if (data['markes'] !== undefined || data['data_array']  !== undefined){ 
                    for (var i = 0; i < data['markes'].length; i++) {
                      console.log(`obj.` + i + " ->" + data['markes'][i].latitud);
                     markes.push({
                        latitud: data['markes'][i].latitud,
                        longitud: data['markes'][i].longitud,
                        date:data['markes'][i].date,
                        hours: data['markes'][i].hours,
                        direction:data['markes'][i].direction
                      });
                    }
                    this.start(markes,data_array);
                    this.user.actualiza_status(data_array);
                  }
                  
              } else {
                this.start(markes,data_array);
                this.user.actualiza_status(data_array);
              }
          });
  });
       
}

 //funcion para ocultar menu pie de pagina
 oculta_tabs() {
  let elements = document.querySelectorAll(".tabbar");

  if (elements != null) {
    Object.keys(elements).map(key => {
      elements[key].style.display = "none";
    });
  }
}
addEntry() {
  this.navCtrl.push("ModalDetalleSitioPage");
}
viewEntry(param) {
  this.navCtrl.push("ModalDetalleSitioPage", param);
  console.log(param);
  
}
verifica_firebase(nombre){

var docRef = this.db.collection("usuarios").doc(nombre).ref;

    docRef.get().then(function(doc) {
        if (doc.exists) {
            console.log("Document data:", doc.data());
        } else {
            // doc.data() will be undefined in this case
            console.log("No such document!");
        }
    }).catch(function(error) {
        console.log("Error getting document:", error);
    });
}
start(marker,data_array) {
console.log("datos--> 3 start " + JSON.stringify(marker));
let markes;
markes = marker;
this.db.collection("usuarios").doc(this.user.nombre_actuario).set({
data_array,
markes
},{merge:true})
.then(function() {})
.catch(function(error) {
console.log("Error al subir datos! " + error);
});
// Compruebo si esta habilidata la opcion de localizacion
this.backgroundGeolocation.isLocationEnabled()
.then((activado) =>{
//si esta activado
if(activado){
const config: BackgroundGeolocationConfig = {
desiredAccuracy: 0,
stationaryRadius: 50,
distanceFilter: 20,
locationProvider: this.backgroundGeolocation.LocationProvider.ANDROID_ACTIVITY_PROVIDER,
notificationIconColor: '#FEDD1E',
notificationIconLarge: 'mappointer_large',
notificationIconSmall: 'mappointer_small',
debug: true,
interval: 10000,
fastestInterval: 5000,
startForeground:true,
activitiesInterval: 10000,
startOnBoot:true,
url: 'http://178.128.14.234:3000/locations',
httpHeaders:{
iddevice:this.user.token
}
};
this.backgroundGeolocation.configure(config)
.subscribe((location: BackgroundGeolocationResponse) => {
this.zone.run(() => {
this.lat = location.latitude;
this.lng = location.longitude;
});
console.log(location);
this.locations = JSON.stringify(location);
// IMPORTANT: You must execute the finish method here to inform the native plugin that you're finished,
// and the background-task may be completed. You must do this regardless if your HTTP request is successful or not.
// IF YOU DON'T, ios will CRASH YOUR APP for spending too much time in the background.
//listerner que detecta cuando no hay movimiento.
this.backgroundGeolocation.onStationary().then( (data)=>{
this.onstationary = JSON.stringify(data);
});
// actualizar posicion utilizando firebasedb
this.actuario.update({
lat: this.lat,
lng: this.lng
});
this.backgroundGeolocation.finish(); // FOR IOS ONLY

});
this.backgroundGeolocation.start();
}else {
this.backgroundGeolocation.showLocationSettings();
}
})

}

}
interface Items {
description: string;
  itemid: number;
 }