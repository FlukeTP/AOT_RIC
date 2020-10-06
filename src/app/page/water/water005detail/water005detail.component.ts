import { Component, OnInit, AfterViewInit } from '@angular/core';
declare var $: any;
@Component({
  selector: 'app-water005detail',
  templateUrl: './water005detail.component.html',
  styleUrls: ['./water005detail.component.css']
})
export class Water005detailComponent implements OnInit,AfterViewInit {
  constructor() { }
  breadcrumb: any = [
    {
      label: "หมวดน้ำประปา",
      link: "/",
    }, {
      label: "ขอใช้น้ำประปาของบ้านพักพนักงาน",
      link: "/water/water005",
    }, {
      label: "เพิ่มขอใช้น้ำประปาของบ้านพักพนักงาน",
      link: "#",
    },
   
  ];
  ngOnInit() {
    
  }
  ngAfterViewInit(): void {
    $('#date1').Zebra_DatePicker();
    $('#date2').Zebra_DatePicker();
  }
}
