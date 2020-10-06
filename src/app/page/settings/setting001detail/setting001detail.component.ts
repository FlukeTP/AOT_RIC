import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-setting001detail',
  templateUrl: './setting001detail.component.html',
  styleUrls: ['./setting001detail.component.css']
})
export class Setting001detailComponent implements OnInit {

  constructor() { }
  breadcrumb: any = [
    {
      label: "การตั้งค่า",
      link: "/home/settings",
    },
    {
      label: "ปรับปรุงอัตราค่าภาระ ค่าบริการไฟฟ้า",
      link: "#",
    },
    {
      label: "กำหนดอัตราค่าภาษี",
      link: "#",
    }
  ];
  ngOnInit() {
  }

}
