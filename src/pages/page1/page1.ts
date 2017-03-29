import { Component,NgZone } from '@angular/core';
import { NavController, Events, ToastController } from 'ionic-angular';
import { BTCOM } from '../../providers/bt-com';
import { Preferences } from '../../providers/preferences';
import { BLE } from 'ionic-native';
import { BTEVENT } from "../../providers/bt-event";
@Component({
  selector: 'page-page1',
  templateUrl: 'page1.html'
})
export class Page1 {
  devices = [];
  constructor(public navCtrl: NavController,public bt:BTCOM,
  public events:Events,public toast:ToastController, public pre:Preferences, public zone:NgZone,
  public  btev:BTEVENT
  ) {}

  ionViewDidLoad(){

      this.events.subscribe("device:connected",(device)=>{
          this.events.subscribe("command:*",(response)=>{
              console.log(response);
          });
		//   this.zone.run(()=>{
		  	this.bt.device = device;
		//   })
          this.sendQPV();
      });

  }

  scan(){
      this.devices = [];
	  console.log("scanning");
      BLE.startScan([]).subscribe(
        (device)=>{
            this.zone.run(()=>{
                if(device.name!= undefined && device.name.indexOf("Syrus 3GBT") != -1)
                    this.devices.push(device);
            })
        },
        (err)=>{
            console.error(err);
        }
      );
  }

  stopScan(){
	BLE.stopScan().then(
        (data)=>{
			console.log(data);
        })
		.catch(
        (err)=>{
            console.error(err);
        }
      );
  }

  connect(device){
      this.events.publish("device:connect",device);
  }

  startEvents(){
	this.btev.subscribe()
	this.events.subscribe("bt-event:data", (data)=>{
		this.toast.create({message: JSON.stringify(data.response),showCloseButton: true}).present();
	});
  }


  sendQPV(){
      this.bt.send("QPV");
  }

}
