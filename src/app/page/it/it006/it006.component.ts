import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalCustomComponent } from 'src/app/components/modal/modal-custom/modalCustom.component';
import { ModalErrorComponent } from 'src/app/components/modal/modal-error/modalError.component';
import { AjaxService } from 'src/app/_service/ajax.service';
import { CommonService } from 'src/app/_service/ common.service';
import { Router } from '@angular/router';
import { CheckNumber, Utils, EnDateToThDate } from 'src/app/common/helper';
import { MessageService } from 'src/app/_service/message.service';
import { ResponseData } from 'src/app/common/models/response-data.model';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';

import { DateFormatePipe } from 'src/app/common/pipes/date-formate.pipe';


import * as moment from 'moment';


const URL = {
  EXPORT: "download-template-info",
  GET_ALL: "it0103/get_all",
  GET_ALL_DAY: "it005/getList",
}

@Component({
  selector: 'app-it006',
  templateUrl: './it006.component.html',
  styleUrls: ['./it006.component.css']
})
export class It006Component implements OnInit {
  public calendarPlugins = [dayGridPlugin, timeGridPlugin]; // important!
  @ViewChild('errorModal') modalError: ModalErrorComponent;
  breadcrumb: any = [
    {
      label: "หมวด IT",
      link: "/home/it",
    },
    {
      label: " ปฏิทินการจองห้องฝึกอบรม CUTE",
      link: "#",
    }
  ];
  listRoom: any[] = [];
  roomEvent : any[] = [];
  dataList: any[] = [];
  listRoomCalendar: any[] = [];
  dataListDay: any[] = [];
  dataListDayFilter: any;
  constructor(
    private ajax: AjaxService,
    private commonService: CommonService,
    private router: Router
    
  ) { }

  ngOnInit() {
    // this.roomEvent = [
    //   { title: 'ห้อง1', date: '2019-09-25', color: '#f783ac' },
    //   { title: 'ห้อง2', date: '2019-09-25', color: '#4485ff' },
    //   { title: 'ห้อง3', date: '2019-09-25', color: '#a7fd8c' },
    //   { title: 'ห้อง2', date: '2019-09-20', color: '#4485ff' },
    //   { title: 'ห้อง2', date: '2019-09-10', color: '#4485ff' },
    //   { title: 'ห้อง3', date: '2019-09-30', color: '#a7fd8c' },
    //   { title: 'ห้อง3', date: '2019-09-05', color: '#a7fd8c' },
    // ];
    this.getListDay();
    this.getList();
   
  }

  getList() {
    this.commonService.loading();
    this.ajax.doPost(URL.GET_ALL, {}).subscribe((res: ResponseData<any>) => {
      if (MessageService.MSG.SUCCESS == res.status) {
        this.dataList = res.data;
        console.log(this.dataList);
        if( null != this.dataList[0].serviceType ){
          this.calendarRoom(this.dataList[0].serviceType)
        }
        for (let i = 0; i < this.dataList.length; i++) {
          this.listRoom.push(
            {
              'color': this.dataList[i].colorRoom,
              'roomName': this.dataList[i].serviceType
            }
          )
        }
      } else {
        this.modalError.openModal(res.message);
      }
      this.commonService.unLoading();
    })
  }

  getListDay() {
    this.commonService.loading();
    this.ajax.doPost(URL.GET_ALL_DAY, {}).subscribe((res: ResponseData<any>) => {
      if (MessageService.MSG.SUCCESS == res.status) {
        this.dataListDay = res.data;
        console.log("this.dataListDay :",this.dataListDay);

      } else {
        this.modalError.openModal(res.message);
      }
      this.commonService.unLoading();
    })
  }

  calendarRoom(serviceType : string){ 
    this.roomEvent = [];
    console.log("serviceType: " ,serviceType);
    this.listRoomCalendar= [];
    this.listRoomCalendar.push(
      {
        'roomName': serviceType
      }
    )
    this.dataListDayFilter = this.dataListDay.filter(data => {
      return data.roomType == serviceType;
    });
    
    console.log("this.dataListDayFilter :",this.dataListDayFilter);
    for (let i = 0; i < this.dataListDayFilter.length; i++) {
      let datere = this.dataListDayFilter[i].reqStartDate;
      let dateReFomate = moment(datere, "DD/MM/YYYY").format("YYYY-MM-DD").toString();
      console.log("dfdffdfd : ",dateReFomate);
      console.log("datere : " ,datere);

      let datacolor
      if(this.dataListDayFilter[i].invoiceNo == null &&  this.dataListDayFilter[i].receiptNo == null){
        datacolor = '#dedede'
      }else if(this.dataListDayFilter[i].invoiceNo != null &&  this.dataListDayFilter[i].receiptNo == null){
        datacolor = '#8fd2ff'
      }else if (this.dataListDayFilter[i].receiptNo != null){
        datacolor = '#89db6e'
      }
      this.roomEvent.push(
        {
          'title': this.dataListDayFilter[i].timeperiod,
          'date': dateReFomate,
          'color' : datacolor,
        }
      )
    }
    console.log("this.roomEvent :",this.roomEvent);

    
    // this.roomEvent = [
    //   { title: 'ห้อง1', date: '2019-09-25', color: '#f783ac' },
    //   { title: 'ห้อง2', date: '2019-09-25', color: '#4485ff' },
    //   { title: 'ห้อง3', date: '2019-09-25', color: '#a7fd8c' },
    //   { title: 'ห้อง2', date: '2019-09-20', color: '#4485ff' },
    //   { title: 'ห้อง2', date: '2019-09-10', color: '#4485ff' },
    //   { title: 'ห้อง3', date: '2019-09-30', color: '#a7fd8c' },
    //   { title: 'ห้อง3', date: '2019-09-05', color: '#a7fd8c' },
    // ];

  }
   
    
  

}
