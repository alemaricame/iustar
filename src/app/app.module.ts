import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';
import { HttpModule } from '@angular/http';

import { AboutPage } from '../pages/about/about';
import { ContactPage } from '../pages/contact/contact';
import { HomePage } from '../pages/home/home';
import { TabsPage } from '../pages/tabs/tabs';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { LogProvider } from '../providers/log/log';
import { IonicStorageModule } from '@ionic/storage';
//firebase
import { AngularFireModule } from 'angularfire2';
import { AngularFirestoreModule } from 'angularfire2/firestore';
import {firebaseConfig} from '../../config/firebase.config'
import { AngularFireDatabaseModule } from 'angularfire2/database';
//geo
import { Geolocation } from '@ionic-native/geolocation';

import { BackgroundFetch, BackgroundFetchConfig } from '@ionic-native/background-fetch';
import { BackgroundGeolocation } from '@ionic-native/background-geolocation';
import { NativeGeocoder } from '@ionic-native/native-geocoder';

import { InAppBrowser } from '@ionic-native/in-app-browser';
import { Camera } from '@ionic-native/camera'
import { OneSignal } from '@ionic-native/onesignal';
import { LaunchNavigator } from '@ionic-native/launch-navigator';
import { BackgroundMode } from '@ionic-native/background-mode';
import { UniqueDeviceID} from '@ionic-native/unique-device-id/ngx'
//Network
import { Network } from '@ionic-native/network';
@NgModule({
  declarations: [
    MyApp,
    AboutPage,
    ContactPage,
    HomePage,
    TabsPage
  ],
  imports: [
    BrowserModule,
    HttpModule,
    IonicModule.forRoot(MyApp),
    IonicStorageModule.forRoot(),
    AngularFireModule.initializeApp(firebaseConfig),
    AngularFirestoreModule,
    AngularFireDatabaseModule
  
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    AboutPage,
    ContactPage,
    HomePage,
    TabsPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    LogProvider,
    BackgroundFetch,
    OneSignal,
    Geolocation,
    LogProvider,
    BackgroundGeolocation,
    NativeGeocoder,
    InAppBrowser,
    Camera,
    LaunchNavigator,
    BackgroundMode,
    Network,
    UniqueDeviceID
  ]
})
export class AppModule {}
