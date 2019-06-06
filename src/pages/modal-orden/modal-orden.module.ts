import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ModalOrdenPage } from './modal-orden';

@NgModule({
  declarations: [
    ModalOrdenPage,
  ],
  imports: [
    IonicPageModule.forChild(ModalOrdenPage),
  ],
})
export class ModalOrdenPageModule {}
