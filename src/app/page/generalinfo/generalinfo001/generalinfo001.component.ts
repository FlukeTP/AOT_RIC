import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-generalinfo001',
  templateUrl: './generalinfo001.component.html',
  styleUrls: ['./generalinfo001.component.css']
})
export class Generalinfo001Component implements OnInit {

  constructor() { }
  breadcrumb: any = [
    {
      label: "ข้อมูลทั่วไป",
      link: "/home/geninfo",
    },
    {
      label: "ตรวจสอบอัตราค่าภาระ",
      link: "#",
    }
  ];
  ngOnInit() {
  }

}
