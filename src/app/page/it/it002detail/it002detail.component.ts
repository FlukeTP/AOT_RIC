import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-it002detail',
  templateUrl: './it002detail.component.html',
  styleUrls: ['./it002detail.component.css']
})
export class It002detailComponent implements OnInit {

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
