import { Component, OnInit, AfterViewInit } from '@angular/core';
declare var $: any;
@Component({
  selector: 'app-water006detail',
  templateUrl: './water006detail.component.html',
  styleUrls: ['./water006detail.component.css']
})
export class Water006detailComponent implements OnInit,AfterViewInit {
  constructor() { }
  breadcrumb: any = [
    {
      label: "หมวดน้ำประปา",
      link: "/",
    }, {
      label: "ขอใช้บริการน้ำประปาอื่นๆ",
      link: "/water/water006",
    }, {
      label: "เพิ่มรายการขอใช้บริการน้ำประปาอื่นๆ",
      link: "#",
    },
   
  ];
  ngOnInit() {
  }
  ngAfterViewInit(): void {
    $('#date1').Zebra_DatePicker();
    $('#date2').Zebra_DatePicker();
  }
  ShowModae(){
    $('#myModal').modal('show')
  }
  HideModal(){
    $('#myModal').modal('hide')
  }
}
