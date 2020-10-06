import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-it003',
  templateUrl: './it003.component.html',
  styleUrls: ['./it003.component.css']
})
export class It003Component implements OnInit {

  constructor() { }

  ngOnInit() {
  }
  breadcrumb: any = [
    {
      label: "หมวด IT",
      link: "/home/it",
    },
    {
      label: "ขอใช้บริการเช่าใช้สายสัญญาณใยแก้วนำแสง",
      link: "#",
    }
  ];
}
