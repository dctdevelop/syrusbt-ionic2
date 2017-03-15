import { Injectable } from '@angular/core';
import { Events } from 'ionic-angular';
import 'rxjs/add/operator/map';

@Injectable()
export class Parser {

    constructor(public events:Events) {
        this.events.subscribe("command:received",(rawData)=>{
            this.autoListener(rawData);
        });
    }

    /**
     * This method receive a command TAIP and parse the data from the list of commands parseables, after that the send the data trought Events:Publish the event key will be a identifier of the command like "command:PV" for RPV response, and return the parsed data
     * @param  {string} rawData Taip Command
     * @return {Object} Response of parse data
     */
    autoListener(rawData:string){
        var response:any={};
        if(rawData.indexOf(">") == -1){
            response.error = "Command not parseable";
            console.log(rawData);
            return response;
        }
        rawData = rawData.substring(rawData.indexOf(">"));

        if(rawData.startsWith(">RPV")){
            response.data = this.parse_PV_info(rawData);
            response.command = "PV";
            this.events.publish("command:PV",response);
            return response;
        }

        if(rawData.startsWith(">RXANS")){
            response.data = this.parse_XANS_info(rawData);
            response.command = "XANS";
            this.events.publish("command:XANS",response);
            return response;
        }

    }

    /**
    * parse data from command: TM
    * Command Documentation: https://sw.pegasusgateway.com/syrdocs/syr_doc_3_1_23_rev1/syrus_doc.htm
    * @param  {string} rawData Raw data sended by device
    * @return {Object:any}       Parse Data
    */
    parse_RTM_info = function(rawData) {
        var ct;
        ct = '';
        rawData = rawData.replace('>RTM', '');
        rawData = rawData.replace('<', '');
        ct = ct + rawData.substring(0, 2) + ':';
        ct = ct + rawData.substring(2, 4) + ':';
        ct = ct + rawData.substring(4, 6) + ' - ';
        ct = ct + rawData.substring(9, 11) + '/';
        ct = ct + rawData.substring(11, 13) + '/';
        ct = ct + rawData.substring(13, 17) + ' GMT';
        return ct;
    };

    /**
    * parse data from command: XACC
    * Command Documentation: https://sw.pegasusgateway.com/syrdocs/syr_doc_3_3_19_rev2/files/XACCCommunicationCounters.html
    * @param  {string} rawData Raw data sended by device
    * @return {Object:any}       Parse Data
    */
    parse_XACCM_info = function(rawData) {
        var XACCMresults:any, e, i, len, onesource, onesourcelist, rawDatalist;
        XACCMresults = {};
        rawData = rawData.replace('>RXACCM', '');
        rawData = rawData.replace('<', '');
        rawDatalist = rawData.split(";");
        XACCMresults.tx_count = 0;
        XACCMresults.rx_count = 0;
        for (i = 0, len = rawDatalist.length; i < len; i++) {
            onesource = rawDatalist[i];
            onesourcelist = onesource.split(",");
            try {
                if (!isNaN(parseInt(onesourcelist[2]))) {
                    XACCMresults.tx_count = XACCMresults.tx_count + parseInt(onesourcelist[2]);
                }
            } catch (error) {
                e = error;
            }
            try {
                if (!isNaN(parseInt(onesourcelist[3]))) {
                    XACCMresults.rx_count = XACCMresults.rx_count + parseInt(onesourcelist[3]);
                }
            } catch (error) {
                e = error;
            }
        }
        return XACCMresults;
    };

    /**
    * parse data from command: XANS  - Network status
    * Command Documentation: https://sw.pegasusgateway.com/syrdocs/syr_doc_3_3_19_rev2/files/XANSNetworkStatusGPRS.html
    * @param  {string} rawData raw data from the device
    * @return {Object:any}  Parse object with data
    */
    parse_XANS_info = function(rawData) {
        var e={}, first={}, fourth={}, info, majorGroups={}, rssival={}, second={}, third={};
        var XANSresults ={};
        info = rawData;
        if (info === null) {
            console.log("no info to parse");
            return;
        }
        majorGroups = info.split(';');
        first = majorGroups[0].split(',');
        if (first[0].indexOf('1')) {
            XANSresults["rf"] = {
                'text': "UP",
                'color': "green"
            };
        } else {
            XANSresults["rf"] = {
                'text': "DOWN",
                'color': "red"
            };
        }
        XANSresults["apn"] = first[1];
        if (first[2] !== '') {
            XANSresults["pin"] = first[2];
        }
        if (first[3] !== '') {
            XANSresults["login"] = first[3];
        }
        if (first[4] !== '') {
            XANSresults["password"] = first[4];
        }
        second = majorGroups[1].split(',');
        switch (second[0]) {
            case '0':
            XANSresults['sim_insert'] = {
                'text': "Out",
                'color': "red"
            };
            break;
            case '1':
            XANSresults['sim_insert'] = {
                'text': "In",
                'color': "green"
            };
            break;
            case '2':
            XANSresults['sim_insert'] = {
                'text': "HW Error",
                'color': "red"
            };
        }
        switch (second[1]) {
            case '1':
            XANSresults['sim_state'] = {
                'text': "Ready",
                'color': "green"
            };
            break;
            case '2':
            XANSresults['sim_state'] = {
                'text': "HW Off",
                'color': "red"
            };
            break;
            case '3':
            XANSresults['sim_state'] = {
                'text': "Inserted",
                'color': "orange"
            };
            break;
            case '4':
            XANSresults['sim_state'] = {
                'text': "Removed",
                'color': "orange"
            };
            break;
            case '5':
            XANSresults['sim_state'] = {
                'text': "PIN Error",
                'color': "red"
            };
            break;
            case '6':
            XANSresults['sim_state'] = {
                'text': "Waiting PIN",
                'color': "red"
            };
            break;
            case '7':
            XANSresults['sim_state'] = {
                'text': "SIM Lock",
                'color': "red"
            };
            break;
            case '8':
            XANSresults['sim_state'] = {
                'text': "SIM Error",
                'color': "red"
            };
        }
        if (second[2] !== 'null') {
            XANSresults['sim_lock_reason'] = second[2];
        }
        switch (second[3]) {
            case '0':
            XANSresults['gsm_register'] = {
                'text': "Not Registered",
                'color': "red"
            };
            break;
            case '1':
            XANSresults['gsm_register'] = {
                'text': "Registered",
                'color': "green"
            };
            break;
            case '2':
            XANSresults['gsm_register'] = {
                'text': "Searching",
                'color': "orange"
            };
            break;
            case '3':
            XANSresults['gsm_register'] = {
                'text': "Rejected",
                'color': "red"
            };
            break;
            case '4':
            XANSresults['gsm_register'] = {
                'text': "Error",
                'color': "red"
            };
            break;
            case '5':
            XANSresults['gsm_register'] = {
                'text': "Registered - Roaming",
                'color': "green"
            };
            break;
            default:
            XANSresults['gsm_register'] = {
                'text': "Unknown",
                'color': "red"
            };
        }
        rssival = second[4];
        if (rssival > 23) {
            XANSresults['rssi'] = {
                'text': rssival,
                'color': "green"
            };
        } else if (rssival > 15 && rssival <= 23) {
            XANSresults['rssi'] = {
                'text': rssival,
                'color': "orange"
            };
        } else {
            XANSresults['rssi'] = {
                'text': rssival,
                'color': "red"
            };
        }
        switch (second[5]) {
            case '0':
            XANSresults['gprs_attached'] = {
                'text': "Deattached",
                'color': "red"
            };
            break;
            case '1':
            XANSresults['gprs_attached'] = {
                'text': "Attached",
                'color': "green"
            };
            break;
            default:
            XANSresults['gprs_attached'] = {
                'text': "Unknown",
                'color': "black"
            };
        }
        switch (second[6]) {
            case '0':
            XANSresults['gprs_register'] = {
                'text': "Not Registered",
                'color': "red"
            };
            break;
            case '1':
            XANSresults['gprs_register'] = {
                'text': "Registered",
                'color': "green"
            };
            break;
            case '2':
            XANSresults['gprs_register'] = {
                'text': "Searching",
                'color': "orange"
            };
            break;
            case '3':
            XANSresults['gprs_register'] = {
                'text': "Rejected",
                'color': "red"
            };
            break;
            case '4':
            XANSresults['gprs_register'] = {
                'text': "Error",
                'color': "red"
            };
            break;
            case '5':
            XANSresults['gprs_register'] = {
                'text': "Registered - Roaming",
                'color': "green"
            };
            break;
            default:
            XANSresults['gprs_register'] = {
                'text': "Unknown",
                'color': "black"
            };
        }
        XANSresults['ip'] = second[7];
        switch (second[8]) {
            case '1':
            XANSresults['gprs_bearer'] = {
                'text': "UP",
                'color': "green"
            };
            break;
            default:
            XANSresults['gprs_bearer'] = {
                'text': "DOWN",
                'color': "red"
            };
        }
        switch (second[9]) {
            case '-1':
            case '-3':
            XANSresults['the_jammin'] = {
                'text': "Jamming Detected",
                'color': "red"
            };
            break;
            default:
            if (second[9] >= 0) {
                XANSresults['the_jammin'] = {
                    'text': "Jamming Detection In Progress",
                    'color': "orange"
                };
            }
        }
        XANSresults['peers'] = this.peersParse(majorGroups[2].split('\\'));

        third = majorGroups[3].split(',');
        XANSresults['gprs_tx_count'] = third[0];
        XANSresults['gprs_rx_count'] = third[1];
        XANSresults['sms_tx_count'] = third[2];
        XANSresults['sms_rx_count'] = third[3];
        fourth = majorGroups[4].split(',');
        try {
            XANSresults['ttask'] = fourth[0];
        } catch (error) {
            e = error;
            XANSresults['ttask'] = null;
            console.error("Failed getting ttask -- XANS parser");
        }
        try {
            XANSresults['gttask'] = fourth[7];
        } catch (error) {
            e = error;
            XANSresults['gttask'] = null;
            console.error("Failed getting gttask -- XANS parser");
        }
        return XANSresults;
    };

    /**
    * parse data from command: XAWA - 1-Wire Accessories Management
    * Command Documentation: https://sw.pegasusgateway.com/syrdocs/syr_doc_3_3_19_rev2/files/XAWA1WireManagement.html
    * @param  {string} rawData raw data from the device
    * @return {Object:any}  Parse object with data
    */
    parse_XAWA_info = function(rawData) {
        var d = rawData.replace(">RXAWA","").split(";")[0];
        var data;
        data = {};
        data.i_button_state = d.substring(0, 1) === "1";
        data.io_expander_state = d.substring(1, 2) === "1";
        data.ecu_monitor_state = d.substring(2, 3) === "1";
        data.analog_state = d.substring(3, 4) === "1";
        return data;
    };

    /**
    * parse data from command: XEM1 - ECU Monitor Status
    * Command Documentation: https://sw.pegasusgateway.com/syrdocs/syr_doc_3_3_19_rev2/files/XAEMECUMonitorManagement.html
    * @param  {string} rawData raw data from the device
    * @return {Object:any}  Parse object with data
    */
    parse_XAEM1_info = function(rawData) {
        var status:any;
        status = {};
        status.ecu_update_status_code = rawData.substring(7, 8);
    };

    /**
    * parse data from command: PVGM - Position Google Maps
    * Command Documentation:
    * @param  {string} rawData raw data from the device
    * @return {Object:any}  Parse object with data
    */
    parse_PVGM_info  = function(rawData){
        var status:any;
        status = {};
        status.maps_link = rawData.substring(rawData.indexOf("http"), rawData.indexOf(";ID="));
        return status;
    }

    /** parse data from command: PV
    * Command Documentation: https://sw.pegasusgateway.com/syrdocs/syr_doc_3_3_19_rev2/files/PVGMGooglePosition.html
    * @param  {string} rawData raw data from the device
    * @return {Object:any}  Parse object with data
    */
    parse_PV_info = function(rawData){
        var data:any;
        data = {};
        data.time_of_day = rawData.substring(4,9);
        data.latitude = parseInt(rawData.substring(9,17))/100000;
        data.longitude = parseInt(rawData.substring(17,26))/100000;
        data.velocity_mph = parseInt(rawData.substring(26,29));
        data.velocity_kph = data.velocity_mph* 1.609344;
        data.orientation = rawData.substring(29,32);
        data.position_fix_mode = rawData.substring(32,33);
        data.age = rawData.substring(33,34);
        switch (data.position_fix_mode) {
            case '0':
            data.position_fix_mode = {
                'text': "2D GPS",
                'color': "green"
            };
            break;
            case '1':
            data.position_fix_mode = {
                'text': "3D GPS",
                'color': "green"
            };
            break;
            case '2':
            data.position_fix_mode = {
                'text': "2D DGPS",
                'color': "green"
            };
            break;
            case '3':
            data.position_fix_mode = {
                'text': "3D DGPS",
                'color': "green"
            };
            break;
            case '9':
            data.position_fix_mode = {
                'text': "Unknown",
                'color': "red"
            };
            break;
        }
        switch (data.age) {
            case '0':
            data.age = {
                'text': "Not Available",
                'color': "red"
            };
            break;
            case '1':
            data.age = {
                'text': "Old, (more than 10 seconds)",
                'color': "orange"
            };
            break;
            case '2':
            data.age = {
                'text': "Fresh, (less than 10 seconds)",
                'color': "green"
            };
            break;
            case '9':
            data.age = {
                'text': "GPS fail",
                'color': "red"
            };
            break;
        }

        return data;
    }

    /** parse data from command: ST;+1 - Status
    * Command Documentation: https://sw.pegasusgateway.com/syrdocs/syr_doc_3_3_19_rev2/files/STStatus.html
    * @param  {string} rawData raw data from the device
    * @return {Object:any}  Parse object with data
    */
    parse_QSTplus_info = function(rawData){
        var d = rawData.split(";")[0].replace(">RST","").split(",");
        var data:any;
        data = {};
        data.gps_version =  d[1];
        data.comm_speed =  d[2];
        data.sat_used =  d[4];
        data.motion =  d[5];
        data.hdop =  parseInt(d[6]);
        data.speed =  d[7];
        data.speed_avg =  d[8];
        data.checksum_err_count =  d[9];
        data.lock_counter =  d[10];
        data.lock_counter_1 =  d[11];

        switch (d[3]) {
            case '0':
            data.gps_status = {'text': 'No GPS fix' , 'color': 'red'}
            break;
            case '1':
            data.gps_status = {'text': 'Fix with HDOP greater than HDOP Limit configured' , 'color': 'orange'}
            break;
            case '2':
            data.gps_status = {'text': 'Fix with HDOP less than HDOP Limit configured' , 'color': 'green'}
            break;
            case '3':
            data.gps_status = {'text': 'GPS OFF' , 'color': 'red'}
            break;
            case '4':
            data.gps_status = {'text': 'Error state: Searching GPS' , 'color': 'red'}
            break;
            case '5':
            data.gps_status = {'text': 'Error state: GPS Rx fail' , 'color': 'red'}
            break;
            case '6':
            data.gps_status = {'text': 'Error state: Many checksum errors' , 'color': 'red'}
            break;
            case '7':
            data.gps_status = {'text': 'Error state: Unexpected communications lock' , 'color': 'red'}
            break;
            case '8':
            data.gps_status = {'text': 'Error state: Bad GPS conditions' , 'color': 'red'}
            break;
            case '9':
            data.gps_status = {'text': 'Full GPS reset (Cold start)' , 'color': 'orange'}
            break;
            case '10':
            data.gps_status = {'text': 'Full GPS reset (Full Cold start)' , 'color': 'orange'}
            break;
        };

        return data;
    }

    /**
    * parse data from command: ST1 - Status
    * Command Documentation: https://sw.pegasusgateway.com/syrdocs/syr_doc_3_3_19_rev2/files/STStatus.html
    * @param  {string} rawData raw data from the device
    * @return {Object:any}  Parse object with data
    */
    parse_QST1_info = function(rawData){
        var d = rawData.split(";");
        var data:any;
        data = {};
        data.gps_filter_state =  d[1];
        data.hdop_treshold =  d[2].split(",")[0];
        data.current_hdop =  d[2].split(",")[1];
        data.motion_criteria =  d[3].split(",")[0];
        data.current_motion =  d[3].split(",")[1];
        data.speed_treshold =  d[4].split(",")[0];
        data.current_speed =  d[4].split(",")[1];
        switch (d[1]) {
            case '0':
            data.gps_filter_state = {'text': 'Filter allows all GPS information' , 'color': 'green'}
            break;
            case '1':
            data.gps_filter_state = {'text': 'Filter blocks all GPS information' , 'color': 'red'}
            break;
            case '2':
            data.gps_filter_state = {'text': 'Filter not working, because GPS information is not changing' , 'color': 'orange'}
            break;
            case '3':
            data.gps_filter_state = {'text': 'Filter not working, because GPS information is not valid' , 'color': 'orange'}
            break;
            case '4':
            data.gps_filter_state = {'text': 'Filter is off' , 'color': 'red'}
            break;
            case '5':
            data.gps_filter_state = {'text': 'Temporary state while the GPS is restarting' , 'color': 'orange'}
            break;
        };
        return data;
    }

    /**
    * parse data from command: ST2 - Status
    * Command Documentation: https://sw.pegasusgateway.com/syrdocs/syr_doc_3_3_19_rev2/files/STStatus.html
    * @param  {string} rawData raw data from the device
    * @return {Object:any}  Parse object with data
    */
    parse_QST2_info = function(rawData){
        var d = rawData.replace("<","").replace(">","").split(";")[0].split(",");
        var data:any;
        data = {};
        data.time_without_gps =  d[1];
        // data.gps_status =  d[2]; // received from QST;+
        data.satellites_on_view =  d[3];
        switch (d[4]) {
            case 'A':
            data.gps_NMEA_status = {'text': 'Valid' , 'color': 'green'}
            break;
            case 'V':
            data.gps_NMEA_status = {'text': 'Navigation receiver warning.' , 'color': 'red'}
            break;
        };
        return data;
    }

    /**
    * parse data from command: EM0 - ECU General Diagnostic
    * Command Documentation: https://sw.pegasusgateway.com/syrdocs/syr_doc_3_3_19_rev2/files/XAEM0ECUExtendedDiagnostic.html
    * @param  {string} rawData raw data from the device
    * @return {Object:any}  Parse object with data
    */
    parse_XQEM0_info = function(rawData){
        var d = rawData.split(";")[0].replace(">RXAEM0","").replace("<","").split(",");
        var data:any;
        data= {};

        switch(d[0]){
            case "B":
            data.ecu_status_tag = {"color": "orange" , "text":" doing an upgrade procedure"};
            break;
            case "D":
            data.ecu_status_tag = {"color": "red" , "text":"Monitor accessory not detected"};
            break;
            case "F":
            data.ecu_status_tag = {"color": "orange" , "text":"Monitor accessory detected and vehicle's engine turned off"};
            break;
            case "T":
            data.ecu_status_tag = {"color": "green" , "text":"Monitor accessory detected and vehicle's engine turned on"};
            break;
        }
        if (data.ecu_status_tag.color == "red") {
            return data;
        }
        data.firmware_version = d[5] ? d[5] : d[1];

        switch(d[2]){
            case "0":
            data.protocol = {"color": "red" , "text":" None"};
            break;
            case "2":
            data.protocol = {"color": "black" , "text":"J1939/FMS"};
            break;
            case "4":
            data.protocol = {"color": "black" , "text":"J1708"};
            break;
            case "6":
            data.protocol = {"color": "black" , "text":"J1939/J1708"};
            break;
            case "8":
            data.protocol = {"color": "black" , "text":"ISO14230/KWP2000/ISO9141"};
            break;
            case "16":
            data.protocol = {"color": "black" , "text":"Mobileye"};
            break;
            case "20":
            data.protocol = {"color": "black" , "text":"Mobileye/J1708"};
            break;
            case "128":
            data.protocol = {"color": "black" , "text":"ISO15765"};
            break;
        }
        Decimal.set({ precision:  120 })
        data.first_parameters = (new Decimal(d[3])).toBinary();
        data.parameters = [];
        for(var i=0; i < data.first_parameters.length;i++)
        {
            data.parameters[i] = {
                text : this.parameters_ecu_monitor[i].text,
                active: ( data.first_parameters[data.first_parameters.length -(i+1)] == "1" ? true : false),
                command:  this.parameters_ecu_monitor[i].command,
                descriptor: this.parameters_ecu_monitor[i].descriptor
            };
        }
        data.second_parameters = parseInt(d[4],2);
        return data;
    }

    /**
    * parse data from command: ARS - Register Status
    * Command Documentation: https://sw.pegasusgateway.com/syrdocs/syr_doc_3_3_19_rev2/files/XARSRegisterStatus.html
    * @param  {string} rawData raw data from the device
    * @return {Object:any}  Parse object with data
    */
    parse_XARS_info = function(rawData){
        var d = rawData.split(";");
        var data;
        data= {};
        data["IMSI"] = d[1];
        data["name_service"] = d[2];
        data["sim_card_id"] = d[3];
        return data;
    }

    /** parse data from command: ASEM - Safe Engine Cut Off Status
    * Command Documentation: https://sw.pegasusgateway.com/syrdocs/syr_doc_3_3_19_rev2/files/XASESafeEngineCutOff.html
    * @param  {string} rawData raw data from the device
    * @return {Object:any}  Parse object with data
    */
    parse_XASEM_info = function(rawData){
        var d = rawData.split(";")[0].replace(">RXASEM","").split(",")[0];
        console.log(d);
        var data;
        data= {};
        return  d.trim().startsWith("1") ? { 'text': 'Enabled', 'color' : 'green'} : {'text':'Disabled','color': 'red'};
    }

    /**
    * parse data from command: XASF - Store & Forward Buffer
    * Command Documentation: https://sw.pegasusgateway.com/syrdocs/syr_doc_3_1_23_rev1/files/XASFStoreForwardBuffer.html
    * @param  {string} rawData raw data from the device
    * @return {Object:any}  Parse object with data
    */
    parse_XASF_info = function(rawData){
        var d = rawData.split(";")[0].replace(">RXASF", "");
        var data:any;
        data= {};
        data.destination_point = parseInt(d.substring(0,2));
        if(d.length < 3)
        {
            return data;
        }
        data.quantity_of_message = parseInt( d.substring(2, d.indexOf("+")));
        data.quantity_of_files = parseInt( d.substring(d.indexOf("[")+1 , d.indexOf("F")));
        data.bytes = parseInt( d.substring(d.indexOf("M")+2, d.indexOf("B")));
        data.total_space_used = parseInt( d.substring(d.indexOf("B")+2, d.indexOf("%")));
        return data;
    }


    /**
    * parse data from command: XADP - Destination Points
    * Command Documentation: https://sw.pegasusgateway.com/syrdocs/syr_doc_3_1_23_rev1/files/XADPDestinationPoints.html
    * @param  {string} rawData raw data from the device
    * @return {Object:any}  Parse object with data
    */
    parse_XADP_info = function(rawData){
        var d = rawData.replace(">RXADP", "");
        var data:any;
        data= {};
        data.destination_point = parseInt(d.substring(0,2));
        data.destination_point_raw = d.substring(0,2);
        if(d[2] == "U"){
            data.active = false;
            return data;
        }
        data.active = true;
        data.host = d.substring(4, d.indexOf(";ID")).replace(";",":");
        return data;
    }

    /**
    * parse data from command: XACI
    * Command Documentation:
    * @param  {string} rawData raw data from the device
    * @return {Object:any}  Parse object with data
    */
    parse_XACI_info = function(rawData){
        var d = rawData.replace(">RXACI","").split(";");
        var data:any;
        data= {};
        data.active_service = d[0].substring(0,2);
        if(data.active_service == "2G")
        {
            data.cells = this.Active2gParseData(d[0]);
        }
        if(data.active_service == "3G")
        {
            data.cells = this.Active3gParseData(d[0]);
        }
        return data;
    }

    /**
    * parse data from command: XAICAA - XAICAA
    * Command Documentation: https://sw.pegasusgateway.com/syrdocs/syr_doc_3_3_19_rev2/files/XAICAAAutomaticAnglesConfigura.html
    * @param  {string} rawData [data to be parsed]
    * @return {Objetct<any>}   [Parsed data with the angles]
    */
    parse_XAICAA_info = function(rawData){
        var d = rawData.replace(">RXAICAA","").split(";")[0];
        var data:any;
        data= {};
        data.angle_x = d.split(",")[0];
        data.angle_y = d.split(",")[1];
        data.angle_z = d.split(",")[2];
        return data;
    }

    /**
    * parse data from command: Command to get the Active KY
    * @param  {string} rawData raw data from the device
    * @return {Object:any}  Parse object with data
    */
    parse_X00_ky_info = function(rawData){
        //>RER00:X00;KY=0;KY=P692;ID=357042062909792<
        return  rawData.replace(">RER00:X00;KY=0;KY=","").split(";")[0];
    }



    parse_RBTC_info = function(rawData){
        var d = rawData.replace(">RBTC","").split(";")[0].split("$");
        if(d[0][0] == "U"){
            return {};
        }
        var data:any;
        data= {};
        data.mac= d[0].substring(0,d[0].length - 1);
        data.status= d[0].substring(d[0].length - 1) == "1"? "Added" : "Removed" ;
        data.rawConfiguration = d[1];
        data.wake_up = parseInt(data.rawConfiguration.substring(0,6));
        data.humidity_sensor = data.rawConfiguration[11] == "1";
        data.light_sensor = data.rawConfiguration[12] == "1";
        data.move_sensor = data.rawConfiguration[13] == "1";
        data.freeFall_sensor = data.rawConfiguration[14] == "1";
        data.impact_sensor = data.rawConfiguration[15] == "1";
        data.temperature_sensor = data.rawConfiguration[16] == "1";
        data.button_sensor = data.rawConfiguration[17] == "1";
        data.switch_sensor = data.rawConfiguration[18] == "1";
        data.buzzer_sensor = data.rawConfiguration[19] == "1";
        data.led_sensor = data.rawConfiguration[20] == "1";

        data.threshold ={};
        var umbral =  d[2].split(",");

        data.threshold.move = parseInt(data.rawConfiguration.substring(6,9)) == 0 ? 4 : parseInt(data.rawConfiguration.substring(6,9));

        data.threshold.light = parseInt(data.rawConfiguration.substring(9,11)) == 0 ? 20 : parseInt(data.rawConfiguration.substring(9,11));

        data.threshold.temperature_1 = umbral[0]/10;
        data.threshold.temperature_2 = umbral[1]/10;
        data.threshold.battery_1 = umbral[2];
        data.threshold.battery_2 = umbral[3];
        data.threshold.humidity_1 = umbral[4];
        data.threshold.humidity_2 = umbral[5];
        return data;
    }

    parse_RBTP_info = function(rawData){
        var d = rawData.replace(">RBTP","").split(";")[0];
        var data:any={};
        var values = d.split(",");
        data.mac= values[0];
        data.temperature = parseInt(values[1]) /10;
        data.humidity = parseInt(values[2]);
        data.light = parseInt(values[3]);
        data.battery = parseInt(values[4]);
        data.move = values[5] == "1"? true : false;
        data.freeFall = parseInt(values[6]) /10;
        data.impact = parseInt(values[7]) /10;
        data.button =  values[8] == "1"? true : false;
        data.switch =  values[9] == "1"? true : false;
        return data;
    }

    parse_RBTF_info = function(rawData){
        var d = rawData.replace(">RBTF","").split(";")[0];
        return d;
    }



    /***    Auxiliar functions  from parse functions ***/


    /**
     * Parse data from peers receive in Network status Command
     * @param  {Array<any>} peers Rar Array data from peer
     * @return {Array<any>}      Parsed Array data of  peers
     */
    peersParse(peers:Array<any>){
        let data:any= [], i=0;
        peers.forEach(function(peer_raw:string){
            if(peer_raw !="")
            {
                let peer = peer_raw.split(",");
                data[i] = [];
                data[i]['ip'] = peer[0];
                data[i]['socket_connection'] = peer[1];

                switch(data[i]['socket_connection']){
                    case "0":
                        data[i]['socket_state'] = {text:"Connection Closed"  ,color:"red" }
                        break;
                    case "1":
                        data[i]['socket_state'] = {text:"Connection Connecting"  ,color:"orange" }
                        break;
                    case "2":
                        data[i]['socket_state'] = {text:"Connection Closing"  ,color:"orange" }
                        break;
                    case "3":
                        data[i]['socket_state'] = {text:"Connection Open"  ,color:"green" }
                        break;
                    case "4":
                        data[i]['socket_state'] = {text:"Connection Open Limited"  ,color:"orange" }
                        break;
                    case "5":
                        data[i]['socket_state'] = {text:"Connection Closing Hold"  ,color:"orange" }
                        break;
                    case "6":
                        data[i]['socket_state'] = {text:"SMS Ready"  ,color:"green" }
                        break;
                    case "7":
                        data[i]['socket_state'] = {text:"SMS Sending"  ,color:"green" }
                        break;
                    case "8":
                        data[i]['socket_state'] = {text:"Sms Unready"  ,color:"red" }
                        break;
                    default:
                        data[i]['socket_state'] = {text:"Unkonw State"  ,color:"red" }
                }

                data[i]['local_port'] = peer[2];
                data[i]['remote_ip'] = peer[3];
                data[i]['remote_port'] = peer[4];
                data[i]['socket_up_time'] = peer[5];
                data[i]['socket_down_time'] = peer[6];
                data[i]['socket_down_timer'] = peer[7];
                data[i]['state'] = peer[8];
                data[i]['tx_count'] = peer[9];
                data[i]['rx_count'] = peer[10];
                data[i]['tx_timer'] = peer[11];
                data[i]['rx_timer'] = peer[12];
                data[i]['data_tx_timer'] = peer[13];
                data[i]['has_message'] = peer[14];
                data[i]['message_status'] = peer[15];
                data[i]['current_message_status'] = peer[16];
                data[i]['cicled_timer'] = peer[17];
                data[i]['existence_time'] = peer[18];
                i++;
            }
        });
        return data;
    }

    /**
    * Parse data from 2G Active peer
    * @param  {String} data Raw String from active peer in XANS command
    * @return {Object<any>} Peer data
    */
    Active2gParseData(data){
        var cellsdata = data.split("$");
        var cells:any = [];

        for(var i=0; i< cellsdata.length; i++){
            var celldata = cellsdata[i].split(",")
            cells[i] = {};
            cells[i].channel_number =celldata[0].substring(3);
            cells[i].absolute_rf =celldata[1];
            cells[i].RSSI =celldata[2];
            cells[i].mobile_country_code = celldata[3];
            cells[i].mobile_network_code = celldata[4];
            cells[i].network_colour_code = celldata[5];
            cells[i].base_station_colour_code = celldata[6];
            cells[i].cell_selection_criteria_1 = celldata[7];
            cells[i].cell_selection_criteria_2 = celldata[8];
            cells[i].location_area_code = celldata[9];
            cells[i].cell_id = celldata[10];
        }

        return cells;
    }

    /**
    * Parse data from 3G Active peer
    * @param  {String} data Raw String from active peer in XANS command
    * @return {Object<any>} Peer data
    */
    Active3gParseData(data){
        var cellsdata = data.split("$");
        var cells:any = [];

        for(var i=0; i< cellsdata.length; i++){
            var celldata = cellsdata[i].split(",")
            cells[i] = {};
            cells[i].channel_number =celldata[0].substring(3);
            cells[i].primary_scrambling_code = celldata[1];
            cells[i].EC_n0 = celldata[2];
            cells[i].received_signal_code_power = celldata[3];
            cells[i].quality_value = celldata[4];
            cells[i].rx_level_value = celldata[5];
        }

        return cells;
    }



}
