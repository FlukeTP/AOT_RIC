import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-generalinfo003',
  templateUrl: './generalinfo003.component.html',
  styleUrls: ['./generalinfo003.component.css']
})
export class Generalinfo003Component implements OnInit {

  constructor() { }
  breadcrumb: any = [
    {
      label: "ข้อมูลทั่วไป",
      link: "/home/geninfo",
    },
    {
      label: "รายงานการให้บริการแยกตามผู้ประกอบการ",
      link: "#",
    }
  ];
  ngOnInit() {
  }

}
