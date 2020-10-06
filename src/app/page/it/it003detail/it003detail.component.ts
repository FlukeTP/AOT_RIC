import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-it003detail',
  templateUrl: './it003detail.component.html',
  styleUrls: ['./it003detail.component.css']
})
export class It003detailComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }
  breadcrumb: any = [
    {
      label: "หมวด IT",
      link: "/home/it",
    },
    {
      label: "เพิ่มขอใช้บริการเช่าใช้สายสัญญาณใยแก้วนำแสง",
      link: "#",
    }
  ];
}
