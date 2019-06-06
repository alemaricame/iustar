import { Component } from '@angular/core';
import { NavController, AlertController,ToastController, ViewController,NavParams } from 'ionic-angular';
import {  FormBuilder } from '@angular/forms';
import { AngularFirestore, AngularFirestoreDocument } from 'angularfire2/firestore';
import { Subscription } from 'rxjs/Subscription';
import { Http} from '@angular/http';
import { LogProvider } from '../../providers/log/log';
@Component({
  selector: 'page-about',
  templateUrl: 'about.html'
})
export class AboutPage {
 private token:string;
 private id_user:string;
 private  id_expediente:string;
  public isEdited: boolean = false;
  public pageTitle: string;
  variable_uno:string;
  //firebase
  actuario: AngularFirestoreDocument<any>;
  private doc: Subscription;
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public http: Http,
    public fb: FormBuilder,
    public toastCtrl: ToastController,
    public viewCtrl: ViewController,
    public user: LogProvider,
    private alertCtrl: AlertController,
    private db: AngularFirestore,
  ) {


  }
  help(){
    console.log("help");
  }
  no(){
    this.actualiza_status();

    let alert = this.alertCtrl.create({
      title: 'AVISO',
      message: '¿FUISTE ATENDIDO?',
      buttons: [
        {
          text: 'SI',
          role: 'SI',
          handler: () => {
            this.noatendido();
          }
        },
        {
          text: 'NO',
          handler: () => {
            //console.log('Buy clicked');
            this.navCtrl.setRoot("ModalConstanciaPage");
            this.navCtrl.popToRoot();
            this.actualiza_status();
          }
        }
      ]
    });
    alert.present();
  }

  noatendido(){
      let alert = this.alertCtrl.create({
        title: 'AVISO',
        message: '¿FUISTE ATENDIDO POR ALGUIEN QUE RECONOCE AL BUSCADO Y ACIERTA EN QUE ES EL DOMICILIO?',
        buttons: [
          {
            text: 'SI',
            role: 'SI',
            handler: () => {
               //console.log('Buy clicked');
               this.citatorio();
               this.navCtrl.setRoot("CitatorioPage");
               this.navCtrl.popToRoot();
               console.log("Citatorio page");
    
            }
          },
          {
            text: 'NO',
            handler: () => {
              this.navCtrl.setRoot("ModalConstanciaPage");
            this.navCtrl.popToRoot();
            this.actualiza_status();
            }
          }
        ]
      });
      alert.present();
  }



  si(){
    this.actualiza_status();
    console.log("Orden");
    this.navCtrl.setRoot("ModalOrdenPage");
    this.navCtrl.popToRoot();
  }

  citatorio(){
    this.actualiza_status2();
  
  }
  actualiza_status(){
   // console.log('si Existen  ? '+this.user.token_user + " " + this.user.id_user + " " + this.user.id_exp);
    if (this.user.activo) {

      let status = 2;

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
          'status': "Proceso"
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

       let status = 3;

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
          'status': "Citatorio"
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
