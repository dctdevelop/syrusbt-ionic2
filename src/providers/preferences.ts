import * as moment from 'moment';
import { Injectable } from '@angular/core';
import {Storage} from '@ionic/storage';
import {TranslateService} from 'ng2-translate/ng2-translate';
import {Globalization} from '@ionic-native/globalization';
import 'rxjs/add/operator/map';

@Injectable()
export class Preferences {

    color="primary";
    language= 'en';
    colors = [
        {name: 'Blue', value: 'primary'},
        {name: 'Green', value: 'secondary'},
        {name: 'Yellow', value: 'warning'},
        {name: 'Red', value: 'danger'},
        {name: 'Teal', value: 'teal'},
        {name: 'Light Blue', value: 'light-blue'},
        {name: 'Orange', value: 'orange'},
        {name: 'Indigo', value: 'indigo'},
        {name: 'Pink', value: 'pink'},
        {name: 'Blue Grey', value: 'blue-grey'},
    ];
    languages;
    phrases;
    
    constructor(public storage:Storage, public trans:TranslateService, public globalization:Globalization) {
        this.storage.get('color').then((data)=>{
            if(data != undefined)
            {
                this.color = data;
            }
        });

        this.storage.get('language').then((data)=>{
            if(data != undefined)
            {
                this.language = data;
                this.trans.use(data);
                if(data == "en")
                    moment.locale('en-us');
                if(data == "es")
                    moment.locale('es-es');
            }
        });

        this.globalization.getLocaleName().then(
            (lang)=>{
             this.language = lang.value.substring(0,lang.value.indexOf("-"));
             this.trans.use(this.language);
             //    console.log(this.language);
            })
            .catch(
           (err)=>{
               console.warn(err);
              this.language = "en";
           }
        );

        this.languages =  {
            en: "en-US",
            es: "es-CO"
        }

        this.phrases = {
            en: {
                speedLimit: "You are exceding the speed limit",
                vehicleOn:  "The Engine Vehicle is on",
                vehicleOff:  "The Engine Vehicle is off",
            },
            es: {
                speedLimit: "Esta excediendo el límite de velocidad",
                vehicleOn:  "Se ha encendido el vehículo",
                vehicleOff:  "Se ha apagado el vehículo",
            }
        }

    }


    updateLanguage(language:string){
        this.language = language;
        this.trans.use(language);
        if(language == "en")
            moment.locale('en-us');
        if(language == "es")
            moment.locale('es-es');
        this.storage.set('language', language);
    }

    saveColor(){
        this.storage.set('color', this.color);
    }


}
