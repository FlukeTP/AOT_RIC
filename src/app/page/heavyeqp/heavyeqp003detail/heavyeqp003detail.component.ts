import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-heavyeqp003detail',
  templateUrl: './heavyeqp003detail.component.html',
  styleUrls: ['./heavyeqp003detail.component.css']
})
export class Heavyeqp003detailComponent implements OnInit {

  constructor() { }
  breadcrumb: any = [
    {
      label: "หมวดเครื่องทุ่นแรง",
      link: "/home/heavyeqp",
    },
    {
      label: "ปรับปรุงอัตราค่าภาระ ค่าบริการเครื่องทุ่นแรง",
      link: "#",
    },
    {
      label: "กำหนดอัตราค่าภาระ เครื่องทุ่นแรง",
      link: "#",
    }
  ];
  ngOnInit() {
  }

}
