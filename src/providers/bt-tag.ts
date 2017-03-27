import { Injectable,NgZone } from '@angular/core';
import { Events } from 'ionic-angular';
import { BLE } from 'ionic-native';
@Injectable()
export class BTTAG {
    tags =[];
    connected = undefined;
    constructor(public zone:NgZone, public events:Events){
    }

    scanforTags(){
        console.log("scanning");
        BLE.startScan([]).subscribe(
            (device)=>{
                if(device.name != undefined  && (device.name.indexOf("syrustag")!= -1))
                {
                    this.zone.run(()=>{
                            console.log("found:",device);
                            this.tags.push(device);
                            this.events.publish("tag:found",device);
                    });
                }
            },
            (err)=>{
                console.warn (err);
            }
        );

    }

    stopScan(){
        BLE.stopScan().then(()=>{
            this.events.publish("tag:stopScan",{});
            console.log("stop Scan");
        });
    }

    connectTag(tag){
        BLE.connect(tag.id).subscribe(
            (data)=>{
                this.zone.run(()=>{
                    this.events.publish("tag:connected",tag);
                    this.connected = tag
                    console.log("connected:", data);
                })
            },
            (err)=>{
                this.zone.run(()=>{
                    console.error("forced Disconnect",err);
                    this.connected = undefined
                    this.events.publish("tag:errorConnect",tag);
                })
            }
        );
    }

    disconnectTag(tag){
        BLE.disconnect(tag.id).then(()=>{
            this.zone.run(()=>{
                console.log(tag);
                this.connected = undefined
                this.events.publish("tag:disconnected",tag);
            })
        })
    }

    disconnectTags(){
        this.tags.forEach((tag)=>{
            this.connected = undefined;
            this.disconnectTag(tag);
        });
    }

    beepTag(tag){
        var data =new Uint8Array(1);
        data[0]= 0x04;
        BLE.write(tag.id, "00000000-dc70-0070-dc70-a07ba85ee4d6","00000000-dc70-3070-dc70-a07ba85ee4d6",
        data.buffer).then((data)=>{
            this.events.publish("tag:beeped",tag);
            console.log("beeptag:",data);
        }).catch((err)=>{
            console.error(err);
        });
    }

    readTag(tag){
        BLE.read(tag.id, "00000000-dc70-0070-dc70-a07ba85ee4d6","00000000-dc70-1070-dc70-a07ba85ee4d6").then(
            (data)=>{
                console.log("Read Data Crud",data);
                console.log("Read Data parse",this.parseData(data));
                this.events.publish("tag:read",this.bytesToString(data));
                this.events.publish("tag:read",this.parseData(data));
            }
        ).catch((err)=>{
            console.error("error reading",err);
        });
    }

    configurateTag(tag:any){
        var buffer_conf =     new Uint8Array([1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]);
        BLE.write(tag.id,"00000000-dc70-0070-dc70-a07ba85ee4d6","00000000-dc70-2070-dc70-a07ba85ee4d6", buffer_conf.buffer)
        .then((data)=>{
            console.log(data);
        });
    }

    parseData(buffer) {
        buffer = new Uint8Array(buffer);
        console.log(buffer);
        var array, aux, data, i, j, len, output, sum;
        array = this.connected.id.toUpperCase().split(":").slice(3);
        sum = parseInt("0x" + array[0]) + parseInt("0x" + array[1]) + parseInt("0x" + array[2]);
        output = [];
        data = {};
        for (i = j = 0, len = buffer.length; j < len; i = ++j) {
            aux = buffer[i];
            output[i] = parseInt(buffer[i]) ^ (sum % 256);
        }
        data.temperature = (175.72 * (output[0] + (output[8] * 256)) / 65536) - 46.85;
        data.button = output[2] & 0x01;
        data.motion = output[2] >> 1 & 0x01;
        data.impact = output[2] >> 2 & 0x01;
        data.freefall = output[2] >> 3 & 0x01;
        data.reedSwith = output[2] >> 5 & 0x01;
        data.acceleration_x = output[1] + output[7] * 256;
        data.acceleration_y = output[9] + output[3] * 256;
        data.acceleration_z = output[5] + output[10] * 256;
        data.acceleration = Math.sqrt(Math.pow(data.acceleration_x, 2) + Math.pow(data.acceleration_y, 2) + Math.pow(data.acceleration_z, 2));
        if (output[6] >= 101) {
            data.battery = 0;
        } else {
            data.battery = output[6];
        }
        if (output[11] >= 101) {
            data.light = 0;
        } else {
            data.light = output[11];
        }
        data.humidity = output[4];
        data.address = this.connected.id;
        if (this.connected.name != null) {
            data.version = this.connected.name.substring(13);
        }
        return data;
    }

	readRSSI(tag:any){
		var ble:any = BLE;
		ble.readRSSI(tag.id).then((val) => {
			return val;
		})
		.catch((err)=>{
			return err;
		});
	}


    /**
    * Convert string data to bytes to send the data from device to Bluetooth Low Energy
    * @param  {string} string data to be converted
    * @return {Array<Uint8Array>}  data to be send for Bluetooth
    */
    stringToBytes(string) {
        var array = new Uint8Array(string.length);
        for (var i = 0, l = string.length; i < l; i++) {
            array[i] = string.charCodeAt(i);
        }
        return array.buffer;
    }

    /**
    * convert data coming from Bluetooth Low energy to string
    * @param  {Array<Uint8Array>} buffer data to be converted
    * @return {string}        output string
    */
    bytesToString(buffer):ArrayBuffer {
        return String.fromCharCode.apply(null, new Uint8Array(buffer));
    }



}
