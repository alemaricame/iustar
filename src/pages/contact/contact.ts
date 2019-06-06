import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { LogProvider } from '../../providers/log/log';
import { LoginPage } from '../../pages/login/login'
import { TabsPage } from '../tabs/tabs';
@Component({
  selector: 'page-contact',
  templateUrl: 'contact.html'
})
export class ContactPage {

  constructor(
    public navCtrl: NavController,
    public user: LogProvider,

  ) {

  }
  logout() {
    this.user.cerrarsesion();
    this.navCtrl.setRoot(LoginPage);
    this.navCtrl.popToRoot();
    this.oculta_tabs();
  }
  oculta_tabs() {
    let elements = document.querySelectorAll(".tabbar");

    if (elements != null) {
      Object.keys(elements).map((key) => {
        elements[key].style.display = 'none';
      });
    }
  }

}
