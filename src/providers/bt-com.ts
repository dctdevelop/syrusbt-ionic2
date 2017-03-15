import { Injectable, NgZone } from '@angular/core';
import {Platform,Events} from 'ionic-angular';
import { BLE } from 'ionic-native';
import { Parser } from './parser';
import 'rxjs/add/operator/map';
@Injectable()
export class BTCOM {
    imei=undefined;
    version=undefined;
    ky:string="0";
    socket:any; // (Deprecated in favor to Bluetooth)
    msgs:Array<any> = []; // Messages Log
    device:any= undefined;
    socket_test = !(document.URL.indexOf('http://') == -1 && document.URL.indexOf('https://') == -1);
    buffer="";
    timeoutAlive;
    joblist = [];
    last_command = "";
    parameters_ecu_monitor = [
        { units:"km/h", descriptor:"S", command:"QXAOS", text: "Vehicle speed (km/h)" },
        { units:"psi", descriptor:"O", command:"QXAOO", text: "Engine's oil pressure (psi)" },
        { units:"psi", descriptor:null, command:null, text: "Coolant liquid pressure (psi)" },
        { units:"", descriptor:null, command:null, text: "Reserved" },
        { units:"km", descriptor:"T", command:"QXAOT", text: "Trip distance (km)" },
        { units:"km", descriptor:"D", command:"QXAOD", text: "Total traveled distance. Odometer (km)" },
        { units:"liters", descriptor:"F", command:"QXAOF", text: "Total fuel used (liters)" },
        { units:"%", descriptor:"A", command:"QXAOA", text: "Throttle pedal position (%)" },
        { units:"rpm", descriptor:"E", command:"QXAOE", text: "Engine revolutions per minute (rpm)" },
        { units:"liters/hour", descriptor:"Y", command:"QXAOY", text: "Instant fuel consumption (liters/hour)" },
        { units:"", descriptor:null, command:null, text: "DM1 diagnostic messages" },
        { units:"", descriptor:"Q", command:"QXAOQ", text: "Cruise control state" },
        { units:"", descriptor:null, command:null, text: "Parking break state" },
        { units:"V", descriptor:"B", command:"QXAOB", text: "Vehicle's battery level (V)" },
        { units:"liters", descriptor:"X", command:"QXAOX", text: "On board computer fuel level" },
        { units:"%", descriptor:"N", command:"QXAON", text: "Engine's oil level (%)" },
        { units:"%", descriptor:null, command:null, text: "Coolant liquid level (%)" },
        { units:"%", descriptor:"M", command:"QXAOM", text: "Transmission liquid level (%)" },
        { units:"ºC", descriptor:"K", command:"QXAOK", text: "Transmission oil temperature (ºC)" },
        { units:"ºC", descriptor:null, command:null, text: "Coolant liquid temperature (ºC)" },
        { units:"hours", descriptor:"H", command:"QXAOH", text: "Total engine usage (hours)" },
        { units:"km", descriptor:"W", command:"QXAOW", text: "Service distance (km)" },
        { units:"liters", descriptor:"I", command:"QXAOI", text: "Total fuel used while in idle (liters)" },
        { units:"hours", descriptor:"U", command:"QXAOU", text: "Total engine usage in idle (hours)" },
        { units:"", descriptor:null, command:null, text: "Reserved" },
        { units:"mV", descriptor:"L", command:"QXAOL", text: "ADC Vehicle's current fuel level (mV)" },
        { units:"", descriptor:null, command:null, text: "Axles' weight" },
        { units:"", descriptor:null, command:null, text: "Trailer's weight" },
        { units:"", descriptor:"Z", command:"QXAOZ", text: "Cargo's weight" },
        { units:"", descriptor:null, command:null, text: "Fan state" },
        { units:"", descriptor:null, command:null, text: "Intake manifold temperature" },
        { units:"", descriptor:null, command:null, text: "Reserved" },
        { units:"", descriptor:null, command:null, text: "MIL (Malfunction indicator lamp) status" },
        { units:"", descriptor:"YT", command:"QXAYT", text: "DTC. Diagnostic trouble codes" },
        { units:"", descriptor:null, command:null, text: "Number of DTC's" },
        { units:"", descriptor:"YO", command:"QXAYO", text: "Oxygen sensor" },
        { units:"", descriptor:"YD", command:"QXAYD", text: "Distance with MIL (Malfunction indicator lamp) on" },
        { units:"", descriptor:"YQ", command:"QXAYQ", text: "Distance since MIL (Malfunction indicator lamp) off" },
        { units:"ºC", descriptor:"G", command:"QXAOG", text: "Engine oil temperature" },
        { units:"%", descriptor:null, command:null, text: "Brake pedal position." },
        { units:"", descriptor:null, command:null, text: "Reserved" },
        { units:"", descriptor:null, command:null, text: "VIN. Vehicle id number. (Under development)" },
        { units:"", descriptor:"YE", command:"QXAYE", text: "Instant Efficiency" },
        { units:"", descriptor:"YN", command:"QXAYN", text: "Tires' temperature" },
        { units:"", descriptor:null, command:null, text: "Hydraulic oil level" },
        { units:"", descriptor:null, command:null, text: "Hydraulic oil temperature" },
        { units:"", descriptor:"V", command:"QXAOV", text: "Hydraulic oil pressure" },
        { units:"", descriptor:null, command:null, text: "Brake pedal position" },
        { units:"", descriptor:null, command:null, text: "ABS state" },
        { units:"", descriptor:null, command:null, text: "Engine percent torque" },
        { units:"", descriptor:null, command:null, text: "Seatbelt state" },
        { units:"", descriptor:null, command:null, text: "Dipped beam state" },
        { units:"", descriptor:null, command:null, text: "Reserved" },
        { units:"", descriptor:null, command:null, text: "Reserved" },
        { units:"", descriptor:null, command:null, text: "Reserved" },
        { units:"", descriptor:null, command:null, text: "Reserved" },
        { units:"", descriptor:null, command:null, text: "Reserved" },
        { units:"ºC", descriptor:null, command:null, text: "Ambient air temperature" },
        { units:"ºC", descriptor:"YK", command:"QXAYK", text: "Engine oil temperature" },
        { units:"", descriptor:null, command:null, text: "Drivers demand engine PT" },
        { units:"", descriptor:null, command:null, text: "Clutch switch" },
        { units:"", descriptor:null, command:null, text: "Engine load" },
        { units:"", descriptor:null, command:null, text: "Fuel pressure" },
    ];
    black_list_uppercase = [
        ">SID",
        ">SRF",
        ">SRT",
        ">STX",
        ">SXAAU",
        ">SXADP",
        ">SXAEM1",
        ">SAXAFS",
        ">SXADU",
        ">SXAFU",
        ">SXALL",
        ">SXAPW",
        ">SXASG",
        ">SXASG",
        ">SXASMF",
        ">SXATA",
        ">SXATM",
        ">SXAEC",
        ">SXAKY",
        ">SBIK",
        ">SBTF",
        ">SBIF",
    ]
    constructor(public zone: NgZone, public platform:Platform,public events:Events, public parser:Parser){

        // Socket Mode (only for test)
        if(this.socket_test){
            this.socket = io("localhost:4500/socket");

            this.socket.on('error', (error)=>{
                console.error(error);
            });

            this.socket.on('data', (msg)=>{
                this.zone.run(() => {
                    console.log(msg);
                    this.msgs.push({ type: 'response' , msg:msg});
                    this.events.publish("command:received",msg);
                });
            });

            this.device = {name: "Imaginary Device", connected: true};
            this.version = "1.0.0";
            this.imei = "101010101";
        }

        // Bluetooth Mode
        else{

            this.events.subscribe("device:disconnected",(device)=>{
                BLE.stopNotification(this.device.id,"00000000-dc70-0080-dc70-a07ba85ee4d6", "00000000-dc70-0180-dc70-a07ba85ee4d6");
                this.device = undefined;
                this.imei = undefined;
                this.version = undefined;
            });

            this.events.subscribe("device:connect",(device)=>{
                console.log("Connecting to " + device.name);
                BLE.connect(device.id).subscribe(
                    (response)=>{
                        console.log("Connected to "+ device.name);
                        this.device = device;
                        setTimeout(()=>{
                            this.sendBluetoothAuth();
                            this.listen();
                            this.events.publish("device:connected",device);
                        },600);
                    },
                    (err)=>{
                        console.error(err);
                        this.events.publish("device:errorConnection",err);
                    }
                )
            });

            this.events.subscribe("device:disconnect",(device)=>{
                BLE.disconnect(this.device.id).then(
                    (response)=>{
                        this.events.publish("device:disconnected",device);
                    })
                .catch(
                    (err)=>{
                        this.events.publish("device:errorDisconnection",err);
                    }
                )
            });

        }

    }

    /**
    * send Raw data to the connected device via Sockets or put the command on the joblist to be sended over bluetooth
    * @param  {string} msg data to send to device
    * @return {Promise}     Resolves when data is send
    */
    send(msg:string){

        if(msg == 'clear'){
            this.msgs = [];
            msg ="";
            return;
        }

        msg = this.msgProcesser(msg);

        if(msg.indexOf("KY=") == -1)
            this.msgs.push({type:'query', msg: msg});

        // only on develop
        if(this.socket_test){
            console.log(msg);
            this.socket.emit('msg', msg);
            this.events.publish("command:send",msg);
            this.sleep(55);
        }

        // Send Command to Parser
        else{
            this.joblist.push(msg);
            if(this.joblist.length == 1){
                this.commandProcceser();
            }
            this.events.publish("command:send",msg);
        }

    }

    /**
    * send a command over bluetooth to the syrus and delete that command from joblist
    * @return {null|String} null if no command is in the joblist, or the command once the command is sent
    */
    commandProcceser(){
        if(this.joblist.length == 0)
        {
            return;
        }
        var msg = this.joblist[0];

        // Send command larger than 50 on two partitions
        if(msg.length > 50){
            var msgs = this.stringSplit(msg);
            BLE.writeWithoutResponse(this.device.id,
                "00000000-dc70-0080-dc70-a07ba85ee4d6",
                "00000000-dc70-0180-dc70-a07ba85ee4d6",
                this.stringToBytes(msgs[0])).
                then((data)=>{
                    console.log("Sending Partition: " + msgs[0]);
                    this.sleep(1000);
                    BLE.writeWithoutResponse(this.device.id,
                        "00000000-dc70-0080-dc70-a07ba85ee4d6",
                        "00000000-dc70-0180-dc70-a07ba85ee4d6",
                        this.stringToBytes(msgs[1])).
                        then((data)=>{
                            console.log("Sending Partition: " + msgs[1]);
                            this.last_command = this.joblist.shift();
                            console.log("Joblist: " + this.joblist.length);
                            return data;
                        }).
                        catch((err)=>{
                            console.error(err);
                        });

                        return data;
                }).
                catch((err)=>{
                    console.error(err);
                });
        }

        //Send a simple command by bluetooth
        else if(this.device != undefined)
            BLE.writeWithoutResponse(this.device.id,
                "00000000-dc70-0080-dc70-a07ba85ee4d6",
                "00000000-dc70-0180-dc70-a07ba85ee4d6",
                this.stringToBytes(msg)).
                then((data)=>{
                    console.log("Sending " + msg);
                    this.last_command = this.joblist.shift();
                    console.log("Joblist: " + this.joblist.length);
                    return data;
                }).
                catch((err)=>{
                    console.error(err);
                });
                else{
                    console.warn("there is not a device connected");
                    this.destroyKeepAliveConnection();
        }
    }

    /**
    * Suscribtion to get data sended from the device
    * @return {Observable}  fire events when data comes from device
    */
    listen(){
        BLE.startNotification(this.device.id, "00000000-dc70-0080-dc70-a07ba85ee4d6", "00000000-dc70-0180-dc70-a07ba85ee4d6")
        .subscribe((data)=>{
            console.log("here with:"+ data);
            if(this.bytesToString(data).indexOf(">")!= -1){
                this.buffer = "";
            }
            this.buffer += this.bytesToString(data);
            if(this.buffer.indexOf("<")!= -1)
            {
                console.log("receiving --->", this.buffer);
                this.zone.run(() => {
                    if(this.buffer.indexOf("KY=") == -1)
                        this.msgs.push({type: 'response' , msg:this.buffer});

                    this.events.publish("command:received",this.buffer);
                    this.buffer = "";
                    this.commandProcceser();
                });
            }
        },(err)=>{
            console.error(err);
        });
    }

    /**
    * Prepare data to send to console
    * add prefix and sufix > <
    * @param  {msg} msg  messages send from the end user
    * @return {string}   parse message
    */
    msgProcesser(msg:string){
        msg = msg.trim();
        if(!msg.startsWith(">"))
        msg = ">" +msg;
        if(!msg.endsWith("<"))
        msg = msg + "<";

        if(!this.isNotUppercase(msg))
            return msg.trim().toUpperCase();
        else
            return msg.trim();
    }

    /**
    * Generate the Authentication Command to be send to the syrus.
    * This allow the communication between syrus and the applications and must be the first command to send after the communication is established
    * @return {null}
    */
    sendBluetoothAuth(){
        let challengeText = this.getChallengeText();
        let code = "IMEI";
        if(this.device.name != undefined)
        {
            code = this.device.name.substr(this.device.name.length -5);
        }
        code = challengeText + md5(md5(code)+":"+challengeText);
        this.send(">SBIK"+ code + "<");
    }

    /**
    * Generate a random text in Assci format to Bluetooth Authentication
    * @return {String} Random Text
    */
    getChallengeText(){
        var text = "";
        var possible = "abcdef0123456789";

        for( var i=0; i < 8; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

        return text;
    }


    /**
    * Initialize a keep alive connection with the BLE perihepal,   Syrus devices with Version 3.3.24 and up will be close the bLE conection when no commands are sended for more than 1 minute
    * @return {number} ID from Interval to clear the keep alive connection
    */
    initKeepAliveConnection(){
        this.timeoutAlive = setInterval(()=>{
            this.send(">QXABS<");
        }, 120000);
    }

    /**
    * destroy a keep alive connection with the BLE perihepal
    * @return {number} ID from Interval to clear the keep alive connection
    */
    destroyKeepAliveConnection(){
        clearInterval(this.timeoutAlive);
        this.joblist = [];
    }

    /**
    * Return a boolean indicate if the command must be convert to uppercase or not before send to the Syrus device
    * @param  {string} msg Message to be processed
    * @return {boolean}        True if command must not be convert to uppercase
    */
    isNotUppercase(msg){
        var flag = false;
        this.black_list_uppercase.forEach((command)=>{
            if (msg.toUpperCase().startsWith(command))
            flag = true;
        });
        return flag;
    }

    /**
    * Delays the program execution for the given number of miliseconds.
    * @param  {number} milliseconds number of miliseconds
    * @return {null}
    */
    sleep(milliseconds) {
        var start = new Date().getTime();
        for (var i = 0; i < 1e7; i++) {
            if ((new Date().getTime() - start) > milliseconds){
                break;
            }
        }
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
    bytesToString(buffer) {
        return String.fromCharCode.apply(null, new Uint8Array(buffer));
    }

    /**
    * Divide a string in array by a length
    * @param  {string}    str    String to be divided
    * @param  {number} length length of the strings in the array
    * @return {Array<string>}           Array with the string divided
    */
    stringSplit(str:string, length:number=50){
        var numChunks = Math.ceil(str.length / length),
        chunks = new Array(numChunks);
        for(var i = 0, o = 0; i < numChunks; ++i, o += length) {
            chunks[i] = str.substr(o, length);
        }
        return chunks;
    }

}
