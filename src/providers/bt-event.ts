import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import { BTCOM } from './bt-com';
import { Events } from "ionic-angular";
import { BLE } from '@ionic-native/ble';
import { ParserEvents} from '../providers/parser-events';
@Injectable()
export class BTEVENT {

  constructor(public ble:BLE,public http: Http, public bt:BTCOM, public events:Events, public parser:ParserEvents) {
  }

  subscribe(){
	  if(!this.bt.device){
		  console.warn("You Cannot subscribe if not device is connected");
		  this.events.publish("bt-event:error",{type: "subscribe"});
		  return
	  }

	this.ble.startNotification(this.bt.device.id, "00000000-dc70-0080-dc70-a07ba85ee4d6", "00000000-dc70-0280-dc70-a07ba85ee4d6")
        .subscribe(
			(data)=>{
				var response = this.parser.parserDefault(this.bt.bytesToString(data))
				console.log(response);
				this.events.publish("bt-event:data",{data: response});
			},
			(err) =>{
				console.error("error receiving event", err);
				this.events.publish("bt-event:error",{type:"notification"})
			}
		)
  }

}
