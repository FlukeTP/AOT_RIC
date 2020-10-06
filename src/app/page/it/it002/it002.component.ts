import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-it002',
  templateUrl: './it002.component.html',
  styleUrls: ['./it002.component.css']
})
export class It002Component implements OnInit {

  constructor() { }

  ngOnInit() {
  }
  breadcrumb: any = [
    {
      label: "หมวด IT",
      link: "/home/it",
    },
    {
      label: "ขอใช้บริการเช่าท่อร้อยสายสัญญาณ",
      link: "#",
    }
  ];
}
