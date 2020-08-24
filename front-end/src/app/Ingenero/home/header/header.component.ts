import { Component, OnInit, Input } from '@angular/core';
import { Observable } from 'rxjs';
import * as moment from 'moment-timezone';

@Component({
  selector: 'ig-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  @Input() viewTime;
  viewDate="";
  viewMinutes="";
  @Input() event: Observable<void>;
  constructor() {}

  ngOnInit(): void {
    this.event.subscribe(data =>{
      this.setTime();
    })
  }
  setTime(){
    if(this.viewTime.timestamp !== ''){
      let obj:any = moment(parseInt(this.viewTime.timestamp));
      this.viewDate = obj.tz('America/Denver').format('dddd, Do MMM, YYYY');
      let min:any = moment(parseInt(this.viewTime.timestamp))
      this.viewMinutes=min.tz('America/Denver').format('hh:mm A');
    }
    else{
      this.viewDate = "";
      this.viewMinutes =""
    }
  }

}
