import { Component, OnInit, AfterViewInit } from '@angular/core';
declare var $: any;
@Component({
  selector: 'app-water001detail',
  templateUrl: './water001detail.component.html',
  styleUrls: ['./water001detail.component.css']
})
export class Water001detailComponent implements OnInit,AfterViewInit {
  constructor() { }
  breadcrumb: any = [
    {
      label: "หมวดน้ำประปา",
      link: "/",
    }, {
      label: "บันทึกข้อมูลน้ำประปา",
      link: "/water/water001",
    }, {
      label: "เพิ่มข้อมูลน้ำประปา",
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
