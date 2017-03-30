import { Component,NgZone } from '@angular/core';
import { NavController, Events, ToastController, LoadingController, Loading } from 'ionic-angular';
import { Preferences } from '../../providers/preferences';
import { BLE } from '@ionic-native/ble';
import { BTCOM } from '../../providers/bt-com';
import { BTEVENT } from "../../providers/bt-event";
@Component({
  selector: 'page-page1',
  templateUrl: 'page1.html'
})
export class Page1 {
  devices = [];
  loader:Loading;
  constructor(public navCtrl: NavController,
  public events:Events,
  public toast:ToastController,
  public pre:Preferences,
  public loading:LoadingController,
  public zone:NgZone,
  public bt:BTCOM,public btev:BTEVENT, public ble:BLE
  ) {}

  ionViewDidLoad(){

      this.events.subscribe("device:connected",(device)=>{

          this.events.subscribe("command:*",(response)=>{
              console.log(response);
          });
		  	this.loader.dismiss();
			this.bt.device = device;
          	this.sendQPV();
			this.stopScan();
      });

	  this.events.subscribe("device:errorConnection", (err)=>{
		  this.loader.dismiss();
		  this.toast.create({message:"error connection to syrus", duration:1400}).present();
		  this.stopScan();
	  })

  }

  scan(){
      this.devices = [];
	  console.log("scanning");
	  this.ble.stopScan().then((response)=>{}).catch((err)=>{console.warn("stop scan", err)});
      this.ble.startScan([]).subscribe(
        (device)=>{
            this.zone.run(()=>{
				console.log(device);
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
	this.ble.stopScan().then(
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
	  this.loader = this.loading.create({content:"Connecting..."})
	  this.loader.present()
      this.events.publish("device:connect",device);
  }

  disconnect(){
	  this.events.publish("device:disconnect",this.bt.device);
  }

  startEvents(){
	console.log("subscribe to events");
	this.btev.subscribe()
	this.events.subscribe("bt-event:data", (data)=>{
		console.log(data);
		this.toast.create({message: data.event_time,showCloseButton: true, duration:1000}).present();
	});
  }


  sendQPV(){
      this.bt.send("QPV");
  }

}
