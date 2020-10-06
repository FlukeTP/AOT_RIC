import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-pos002',
  templateUrl: './pos002.component.html',
  styleUrls: ['./pos002.component.css']
})
export class Pos002Component implements OnInit {

  constructor() { }
  breadcrumb: any = [
    {
      label: "หมวดข้อมูงยอดรายได้",
      link: "/pos",
    },
    {
      label: "ตรวจสอบสถานะผู้ประกอบการ",
      link: "#",
    },
   
  ];
  ngOnInit() {
  }

}
