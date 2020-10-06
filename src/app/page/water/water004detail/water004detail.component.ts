import { Component, OnInit, AfterViewInit } from '@angular/core';
declare var $: any;
@Component({
  selector: 'app-water004detail',
  templateUrl: './water004detail.component.html',
  styleUrls: ['./water004detail.component.css']
})
export class Water004detailComponent implements OnInit ,AfterViewInit{
  constructor() { }
  breadcrumb: any = [
    {
      label: "หมวดน้ำประปา",
      link: "/",
    }, {
      label: "ขอใช้น้ำประปาแบบเหมาจ่าย",
      link: "/water/water004",
    }, {
      label: "เพิ่มขอใช้น้ำประปาแบบเหมาจ่าย",
      link: "#",
    },
   
  ];

  ngAfterViewInit(): void {
    $('#date1').Zebra_DatePicker();
    $('#date2').Zebra_DatePicker();
  }
  ngOnInit() {
  }
}
