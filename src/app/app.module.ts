import { NgModule, ErrorHandler } from '@angular/core';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import  {Http} from '@angular/http';
import { MyApp } from './app.component';
import { Page1 } from '../pages/page1/page1';
import { Page2 } from '../pages/page2/page2';

import {Parser} from '../providers/parser';
import {BTCOM} from '../providers/bt-com';
import {BTEVENT} from '../providers/bt-event';
import {ParserEvents} from '../providers/parser-events';
import {Preferences} from '../providers/preferences';

import {Storage} from '@ionic/storage';
import { TranslateModule, TranslateStaticLoader,TranslateLoader } from 'ng2-translate/ng2-translate';

export function createTranslateLoader(http: Http) {
    return new TranslateStaticLoader(http, 'assets/i18n', '.json');
}
@NgModule({
  declarations: [
    MyApp,
    Page1,
    Page2
  ],

  imports: [
    IonicModule.forRoot(MyApp),
    TranslateModule.forRoot({
      provide: TranslateLoader,
      useFactory: (createTranslateLoader),
      deps: [Http]
    })
  ],

  bootstrap: [IonicApp],

  entryComponents: [
    MyApp,
    Page1,
    Page2
  ],

  providers: [{provide: ErrorHandler, useClass: IonicErrorHandler},
  Parser, Preferences,BTCOM,BTEVENT,ParserEvents, Storage]
})
export class AppModule {}
