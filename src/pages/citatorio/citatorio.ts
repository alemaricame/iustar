import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';
import { FormBuilder, FormGroup, Validators } from '../../../node_modules/@angular/forms';
import { getLocaleDateFormat } from '../../../node_modules/@angular/common';
import { LogProvider } from '../../providers/log/log';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { AngularFirestore, AngularFirestoreDocument,AngularFirestoreCollection } from 'angularfire2/firestore';
import { Http, Headers, RequestOptions, URLSearchParams } from '@angular/http';

/**
 * Generated class for the CitatorioPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */
let now = new Date();

@IonicPage()
@Component({
  selector: 'page-citatorio',
  templateUrl: 'citatorio.html',
})
export class CitatorioPage {

  formularioCitatorio:FormGroup;

  //HORA Y FECHA
  time: Date = now;
  hora : any;
  dia : any;
  mes : any;
  anio : any;
  fecha : any;
//DATOS PARA CITATORIO
domicilio : any;
idexpediente :any;
anioexp:any;
demandado:any;
//FOTOS INE/IFE/INMUEBLE
  
  base64Image: string;
  img: any = '';
  fotoinm: any = '';
  actuario: AngularFirestoreDocument<any>;

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    private alertCtrl: AlertController,
    private fb: FormBuilder,
    private user: LogProvider,
    private camera: Camera,
    public http: Http,
    private db: AngularFirestore

  ) {
    this.buildForm();
    
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad CitatorioPage');
    this.time;
    console.log(this.time);
    this.hora = this.time.getHours()+":"+this.time.getMinutes()+":"+this.time.getSeconds();
    console.log(this.hora);
    this.dia = this.time.getDate();
    this.mes = this.time.getMonth()+1; //January is 0!
    if(this.mes=="1"){
      this.mes="ENERO";
    }else{
      if(this.mes=="2"){
        this.mes="FEBRERO";
      }else{
        if(this.mes=="3"){
          this.mes="MARZO";
        }else{
          if(this.mes=="4"){
            this.mes="ABRIL";
          }else{
            if(this.mes=="5"){
              this.mes="MAYO";
            }else{
              if(this.mes=="6"){
                this.mes="JUNIO";
              }else{
                if(this.mes=="7"){
                  this.mes=="JULIO";
                }else{
                  if(this.mes=="8"){
                    this.mes="AGOSTO"
                  }else{
                    if(this.mes=="9"){
                      this.mes="SEPTIEMBRE";
                    }else{
                      if(this.mes=="10"){
                        this.mes="OCTUBRE";
                      }else{
                        if(this.mes=="11"){
                          this.mes="NOVIEMBRE";
                        }else{
                          if(this.mes=="12"){
                            this.mes="DICIEMBRE";
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
    this.anio = this.time.getFullYear();
    
    this.fecha = this.dia+"-"+this.mes+"-"+this.anio;
    console.log("FECHA"+this.dia+this.mes+this.anio);
    //DATOS ALMACENADOS EN LOG PARA ACTAS
    this.domicilio = this.user.direccion;
    this.idexpediente =  this.user.id_expediente;
    this.anioexp = this.user.anio;
   this.demandado = this.user.demandado;
    console.log("DOMICILIO CITATORIO"+this.domicilio);
  }

  guardar(){
    console.log(this.formularioCitatorio.value);
    const alert = this.alertCtrl.create({
      title: "Datos enviados!",
      subTitle: "Información",
      message: "Los registros fueron enviados correctamente",
      buttons: ['Ok']
    });
    alert.present()
    this.buildForm();
  }

  buildForm(){
    this.formularioCitatorio = this.fb.group({
      c:['',[Validators.required]],
      domicilio:['',[Validators.required]],
      hora:['',[Validators.required]],
      fecha:['',[Validators.required]],
      valor1:['',[Validators.required]],
      valor2:['',[Validators.required]],
      valor3:['',[Validators.required]],
      valor4:['',[Validators.required]],
      horacita:['',[Validators.required]],
      fechacita:['',[Validators.required]],
    });
  }

  //GUARDAR FOTOS
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

  registra_firebase_v2(data_array,estatus){
    console.log("datos recibidos->" + JSON.stringify(data_array));
     this.user.id_usuario;
    for (var i = 0; i < data_array.length; i++) {
        if(data_array[i].id_expediente === this.idexpediente ){
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
          value:this.domicilio
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
      let id_expediente = this.idexpediente;
      let status = 5;
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
            this.actuario = this.db.doc(`/usuarios/${this.user.nombre_act}`);
            let estatus = "Emergencia"
            this.registra_firebase_v2(this.user.datos_actuario,estatus);
           // this.initMap();
          }
        });
    }
  }
}
