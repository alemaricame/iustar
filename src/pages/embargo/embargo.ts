import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Platform,AlertController } from 'ionic-angular';

import { AngularFirestore, AngularFirestoreDocument,AngularFirestoreCollection } from 'angularfire2/firestore';
import { Http, Headers, RequestOptions, URLSearchParams } from '@angular/http';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { LogProvider } from '../../providers/log/log';
import { InAppBrowser, InAppBrowserOptions } from '@ionic-native/in-app-browser';
/**
 * Generated class for the EmbargoPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-embargo',
  templateUrl: 'embargo.html',
})
export class EmbargoPage {
  //Camara
  base64Image: string;
  img: any = '';
  fotoinm: any = '';


//DATOS DILIGENCIA
municipio: string = '';
hora: string = '';
fecha: string = '';
juzgado: string = '';
abogado: string = '';
caracter: string = '';
identificacion: string = '';
direccion: string = '';
demandado: string = '';
nplantas: string = '';
fachada_color: string = '';
puerta_color: string = '';
nom: string ='';
id: string ='';
exp: string ='';
fecha_emision: string ='';
cant: string ='';
text: string ='';

  //DATOS DE MODAL DETALLE SITIO
  id_expediente : string='';
  anio : string = '';
//Abrir en el navegador
options: InAppBrowserOptions = {
  location: 'yes',//Or 'no'
  hidden: 'no', //Or 'yes'
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
  actuario: AngularFirestoreDocument<any>;
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private plt: Platform,
    private camera: Camera,
    public user: LogProvider,
    public http: Http,
    private alertCtrl: AlertController,
    private InAppBrowserOptions: InAppBrowser,
    private db: AngularFirestore

  ) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad EmbargoPage');
    this.id_expediente =  this.user.id_expediente;
    this.anio = this.user.anio;
    this.juzgado = this.user.juzgado;
    this.cant = this.user.cant;
    this.direccion = this.user.direccion;
    console.log("AÑO"+this.anio);
  }
  sacarFoto(){
console.log("TOMAR FOTO")
    let cameraOptions : CameraOptions = {
        quality: 50,
        encodingType: this.camera.EncodingType.PNG,
        targetWidth: 800,
        targetHeight: 600,
        destinationType: this.camera.DestinationType.DATA_URL,
        sourceType: this.camera.PictureSourceType.CAMERA,
        correctOrientation: true,
        saveToPhotoAlbum : true

    }


    this.camera.getPicture(cameraOptions).then((imageData) => {
      // imageData is a base64 encoded string
        this.img = "data:image/png;base64," + imageData;
    }, (err) => {
        console.log(err);
    });
  }
  sacarFoto2(){

    let cameraOptions : CameraOptions = {
        quality: 50,
        encodingType: this.camera.EncodingType.JPEG,
        targetWidth: 800,
        targetHeight: 600,
        destinationType: this.camera.DestinationType.DATA_URL,
        sourceType: this.camera.PictureSourceType.CAMERA,
        correctOrientation: true,
        saveToPhotoAlbum : true

    }

    this.camera.getPicture(cameraOptions).then((imageData) => {
      // imageData is a base64 encoded string
        this.fotoinm = "data:image/jpeg;base64," + imageData;
    }, (err) => {
        console.log(err);
    });
  }
  guardarSitio(){

    this.user.guardar_pdf_embargo(
      this.id_expediente,
    this.anio,
      this.municipio,
      this.hora,
      this.fecha,
      this.juzgado,
      this.abogado,
      this.caracter,
      this.identificacion,
      this.direccion,
      this.demandado,
      this.nplantas,
      this.fachada_color,
      this.puerta_color,
      this.nom,
      this.id,
      this.exp,
      this.fecha_emision,
      this.cant,
      this.text,
      this.img
  
    ).subscribe(()=>{
  });
  
  }
  imprimir(){
    let url = `http://iustartech.com/iustargen/ACTAS_PDF/embargo.php?id=${this.id_expediente}`;
  
    this.InAppBrowserOptions.create(url, '_system');
  
    console.log("URL " + url)
  }
  registra_firebase_v2(data_array,estatus){
    console.log("datos recibidos->" + JSON.stringify(data_array));
     this.user.id_usuario;
    for (var i = 0; i < data_array.length; i++) {
        if(data_array[i].id_expediente === this.id_expediente ){
          data_array.splice(i, 1, {id_expediente:
            data_array[i].id_expediente,
            'demandado': data_array[i].demandado,
            'direccion': data_array[i].direccion,
            'tipo_juicio': data_array[i].tipo_juicio,
            'anio':data_array[i].anio,
            'status': estatus
          });
        }
    }
    console.log("data++->" + JSON.stringify(data_array));
    this.actuario.update({
      data_array
          })
            .then(function() {})
            .catch(function(error) {
              console.log("Error al subir datos! " + error);
            });
  }
  comment(){
  
    const prompt = this.alertCtrl.create({
      title: 'Comentarios',
      message: "Ingrese comentarios para la ubicacion",
      inputs: [
        {
          name: 'direccion',
          placeholder: 'direccion',
          value:this.direccion
        },
        {
          name: 'comentario',
          placeholder: 'comentario'
        },
      ],
      buttons: [
        {
          text: 'Cancelar',
          handler: data => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Enviar',
          handler: data => {
            this.save_comment(data.direccion, data.comentario);
            //console.log('Saved clicked');
          }
        }
      ]
    });
    prompt.present();
  }
  save_comment(direccion,comentario){
    console.log("guardar comentarios ! ");
    this.user.save_comment(direccion,comentario).subscribe(()=>{
    });
  }
  emergencia_status(){
    if (this.user.activo) {
      let toke_user = this.user.token;
      let id_user = this.user.id_usuario;
      let id_expediente = this.id_expediente;
      let status = 5;
      //cambiar cuando genere APK  187.163.188.234
      let url = `hhttp://iustartech.com/iustargen/index.php/expediente/update_status/${toke_user}/${id_user}/${id_expediente}/${status}`;
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
            this.actuario = this.db.doc(`/usuarios/${this.user.nombre_act}`);
            let estatus = "Emergencia"
            this.registra_firebase_v2(this.user.datos_actuario,estatus);
           // this.initMap();
          }
        });
    }
  }

  /* ACTUALIZA STATUS Y 
  ENVÍA DATOS A FIREBASE MODO REASIGNAR */

  reasignar(){

    let alert = this.alertCtrl.create({
      title: 'AVISO',
      message: '¿LA DILIGENCIA CONCLUYO EN SU TOTALIDAD?',
      buttons: [
        {
          text: 'SI',
          role: 'SI',
          handler: () => {
             //console.log('Buy clicked');
             this.actualiza_status();
             this.navCtrl.popToRoot();
  
          }
        },
        {
          text: 'NO',
          handler: () => {
           this.no();
          }
        }
      ]
    });
    alert.present();
  }


  no(){
    let alert = this.alertCtrl.create({
      title: 'AVISO',
      message: '¿DESEA REASIGNAR?',
      buttons: [
        {
          text: 'SI',
          role: 'SI',
          handler: () => {
             //console.log('Buy clicked');
             this.actualiza_status2();
             this.navCtrl.popToRoot();
  
          }
        },
        {
          text: 'NO',
          handler: () => {
            this.actualiza_status();
            this.navCtrl.popToRoot();
          }
        }
      ]
    });
    alert.present();
  }

  actualiza_status(){
    // console.log('si Existen  ? '+this.user.token_user + " " + this.user.id_user + " " + this.user.id_exp);
     if (this.user.activo) {
 
       let status = 4;
 
       //cambiar cuando genere APK  187.163.188.234
       console.log(this.user.token_user + " " + this.user.id_user + " " +   this.user.id_exp + " "   +status );
       let url = `http://iustartech.com/iustargen/index.php/expediente/update_status/${this.user.token_user}/${this.user.id_user}/${this.user.id_exp}/${status}`;
 
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
             this.actuario = this.db.doc(`/usuarios/${this.user.nombre_act}`);
             this.registra_firebase(this.user.datos_array);
 
           }
         });
     }
   }
   registra_firebase(data_array) {
     for (var i = 0; i < data_array.length; i++) {
       if(data_array[i].id_expediente === this.user.id_exp ){
         data_array.splice(i, 1, {
           'id_expediente':data_array[i].id_expediente,
           'demandado': data_array[i].demandado,
           'direccion': data_array[i].direccion,
           'tipo_juicio': data_array[i].tipo_juicio,
           'anio' : data_array[i].anio,
           'status': "Finalizado"
         });
       }
 
   }
   console.log("data++->" + JSON.stringify(data_array));
   console.log("actuario++->" + this.user.nombre_act);
   this.actuario.update({
     data_array
         })
           .then(function() {})
           .catch(function(error) {
             console.log("Error al subir datos! " + error);
           });
   }
   actualiza_status2(){
     // console.log('si Existen  ? '+this.user.token_user + " " + this.user.id_user + " " + this.user.id_exp);
      if (this.user.activo) {
 
        let status = 6;
 
        //cambiar cuando genere APK  187.163.188.234
        let url = `http://iustartech.com/iustargen/index.php/expediente/update_status/${this.user.token_user}/${this.user.id_user}/${this.user.id_exp}/${status}`;
 
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
             this.actuario = this.db.doc(`/usuarios/${this.user.nombre_act}`);
             this.registra_firebase2(this.user.datos_array);
 
            }
          });
      }
    }
    registra_firebase2(data_array) {
     for (var i = 0; i < data_array.length; i++) {
       if(data_array[i].id_expediente === this.user.id_exp ){
         data_array.splice(i, 1, {
           'id_expediente':data_array[i].id_expediente,
           'demandado': data_array[i].demandado,
           'direccion': data_array[i].direccion,
           'tipo_juicio': data_array[i].tipo_juicio,
           'anio': data_array[i].anio,
           'status': "Reasignado"
         });
       }
 
   }
   console.log("data++->" + JSON.stringify(data_array));
   console.log("actuario++->" + this.user.nombre_act);
   this.actuario.update({
     data_array
         })
           .then(function() {})
           .catch(function(error) {
             console.log("Error al subir datos! " + error);
           });
   }
}

  