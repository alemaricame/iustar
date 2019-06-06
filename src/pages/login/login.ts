import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController,ViewController,ModalController,LoadingController } from 'ionic-angular';
import {Http} from '@angular/http';
import 'rxjs/add/operator/map';
import {LogProvider} from '../../providers/log/log';
import { HomePage } from '../home/home';
import { TabsPage } from '../tabs/tabs';
/**
 * Generated class for the LoginPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {
  loginData = {};
nombre:string = "";
password:string = "";
  token:string;
  id_usuario:string;

  responseData : any;
  userData = {"NombreC": "","Pass_code": ""};
segundapage = "HomePage";
  constructor(
    public navCtrl: NavController,
    public viewCtrl:ViewController,
    public navParams: NavParams,
    public alertCtrl : AlertController,
    public http : Http,
    private log : LogProvider,
    private modal:ModalController,
    private loadingCtrl:LoadingController
  ) {

  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad LoginPage');
    
  }

  ingresar(){

    console.log("desde Html: "+this.nombre+""+this.password);
    let loading = this.loadingCtrl.create({
        content:'Verificando'
    });
    loading.present();
    this.log.ingresar(this.nombre,this.password)
            .subscribe(()=>{
                loading.dismiss();
                if(this.id_usuario == null && this.log.token == null ){
                  console.log("no hay datos en LocalStorage");
                 
                }else {
                  this.navCtrl.setRoot(TabsPage);
                }
           
              
            });
            
}

 login(){
  this.navCtrl.setRoot(HomePage);
this.navCtrl.popToRoot();


 }
 /*login(){
 
 let head = new Headers();
 head.append('Content-Type', 'application/json');
 let data=JSON.stringify({username: this.nombre, password:this.password});
 console.log(this.nombre+""+this.password);
 this.http.post('http://192.168.15.8/Api-Rest/index.php/login',data)
 .map(res => res.json())
 .subscribe(res => {
 alert("success: Userid "+res.userid+" Access Token "+res.token);
 }, (err) => {
 alert("failed");
 });
 
 }
 signup(){

}*/
}