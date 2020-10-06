import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-setting001',
  templateUrl: './setting001.component.html',
  styleUrls: ['./setting001.component.css']
})
export class Setting001Component implements OnInit {

  constructor() { }
  breadcrumb: any = [
    {
      label: "การตั้งค่า",
      link: "/home/settings",
    },
    {
      label: "ปรับปรุงอัตราค่าภาระ ค่าบริการไฟฟ้า",
      link: "#",
    }
  ];
  ngOnInit() {
  }

}
