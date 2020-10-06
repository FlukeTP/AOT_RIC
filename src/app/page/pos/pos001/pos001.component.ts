import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-pos001',
  templateUrl: './pos001.component.html',
  styleUrls: ['./pos001.component.css']
})
export class Pos001Component implements OnInit {

  constructor() { }
  breadcrumb: any = [
    {
      label: "หมวดข้อมูงยอดรายได้",
      link: "/pos",
    },
    {
      label: "ข้อมูลยอดรายได้",
      link: "#",
    },
   
  ];
  ngOnInit() {
  }

}
