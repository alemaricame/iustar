import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ModalDetalleSitioPage } from './modal-detalle-sitio';

@NgModule({
  declarations: [
    ModalDetalleSitioPage,
  ],
  imports: [
    IonicPageModule.forChild(ModalDetalleSitioPage),
  ],
})
export class ModalDetalleSitioPageModule {}
