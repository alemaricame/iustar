import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { EmbargoPage } from './embargo';

@NgModule({
  declarations: [
    EmbargoPage,
  ],
  imports: [
    IonicPageModule.forChild(EmbargoPage),
  ],
})
export class EmbargoPageModule {}
