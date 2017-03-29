import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import * as moment from 'moment';
@Injectable()
export class ParserEvents {

  constructor(public http: Http) {
    console.log('Hello ParserEvents Provider');
  }

  parserDefault(rawData:string){
		var data:any = {};
        rawData = rawData.replace('>REV', '');
        rawData = rawData.replace('<', '');
		var sections = rawData.split(";");
		data.code = sections[0].substring(0,2);
		var since = moment("1980-01-06");
		var number_of_week = parseInt(sections[0].substring(2,6));
		var day_of_week = parseInt(sections[0][6]);
		var number_of_seconds = parseInt(sections[0].substring(7,12));

		data.event_time= since.add(number_of_week,"w").add(day_of_week,"d").add(number_of_seconds,"s").toDate();

		data.latitude =   parseInt(sections[0].substring(13,15)) + parseInt(sections[0].substring(15,20)) / 100000;
		if(sections[0][12] == "-")
			data.latitude *= -1;

		data.longitude =   parseInt(sections[0].substring(21,24)) + parseInt(sections[0].substring(24,29)) / 100000;
		if(sections[0][20] ==  "-")
			data.longitude *= -1;

		data.velocity_mph = parseInt(sections[0].substring(29,32));
		data.velocity_kph = data.velocity_mph*1.60934
		data.heading = parseInt(sections[0].substring(32,35));
		switch (sections[0][35]) {
			case "0":
				data.position_fix = {
					text: "2D GPS",
					color: "green"
				}
				break;
			case "1":
				data.position_fix = {
					text: "3D GPS",
					color: "green"
				}
			case "2":
				data.position_fix = {
					text: "2D DGPS",
					color: "orange"
				}
			case "3":
				data.position_fix = {
					text: "3D DGPS",
					color: "orange"
				}
			case "9":
				data.position_fix = {
					text: "unkown",
					color: "red"
				}
				break;
			
		}

		switch (sections[0][36]) {
			case "0":
				data.age_of_data = {
					text: "not available",
					color: "red"
				}
				break;
			case "1":
				data.age_of_data = {
					text: "older than 10 seconds",
					color: "orange"
				}
			case "2":
				data.age_of_data = {
					text: "fresh, less than 10 seconds",
					color: "green"
				}
			case "9":
				data.age_of_data = {
					text: "GPS failure",
					color: "red"
				}
		}
		return data;
  }

}
