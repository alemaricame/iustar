import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { EmplazamientoPage } from './emplazamiento';

@NgModule({
  declarations: [
    EmplazamientoPage,
  ],
  imports: [
    IonicPageModule.forChild(EmplazamientoPage),
  ],
})
export class EmplazamientoPageModule {}
