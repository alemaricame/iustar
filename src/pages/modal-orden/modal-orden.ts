import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController, AlertController } from 'ionic-angular';

@IonicPage()
@Component({
  selector: 'page-modal-orden',
  templateUrl: 'modal-orden.html',
})
export class ModalOrdenPage {
  fechaCorta: string = new Date().toISOString();
  fecha: string = this.fechaCorta;
  minFecha: string = (new Date().getFullYear()-5).toString();
  maxFecha: string = (new Date().getFullYear()+5).toString();
  constructor(
    public viewCtrl: ViewController,
    public navCtrl: NavController, 
    public navParams: NavParams,
    public alertCtrl : AlertController
  ) {

}


  ionViewDidLoad() {
    console.log('ionViewDidLoad ModalOrdenPage');
  }
  help(){
    console.log("help");
  }
  callType(value){
    console.log(value);
  }
  cerrarModal(){
    this.viewCtrl.dismiss();
  }
  embargo(){

           
            this.navCtrl.setRoot("EmbargoPage");
            this.navCtrl.popToRoot();

  }
  emplazamiento(){
    console.log("EMPLAZAMIENTO");
    this.navCtrl.setRoot("EmplazamientoPage");
    this.navCtrl.popToRoot();
  }

}
