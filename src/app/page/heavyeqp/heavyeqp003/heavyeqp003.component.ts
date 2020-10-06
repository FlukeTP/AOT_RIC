import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-heavyeqp003',
  templateUrl: './heavyeqp003.component.html',
  styleUrls: ['./heavyeqp003.component.css']
})
export class Heavyeqp003Component implements OnInit {

  constructor() { }
  breadcrumb: any = [
    {
      label: "หมวดเครื่องทุ่นแรง",
      link: "/home/heavyeqp",
    },
    {
      label: "ปรับปรุงอัตราค่าภาระ ค่าบริการเครื่องทุ่นแรง",
      link: "#",
    }
  ];
  ngOnInit() {
  }

}
