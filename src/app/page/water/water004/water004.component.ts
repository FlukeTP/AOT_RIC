import { Component, OnInit } from '@angular/core';
declare var $: any;
@Component({
  selector: 'app-water004',
  templateUrl: './water004.component.html',
  styleUrls: ['./water004.component.css']
})
export class Water004Component implements OnInit {

  showMainContent: Boolean = true;
  constructor() { }
  breadcrumb: any = [
    {
      label: "หมวดน้ำประปา",
      link: "/",
    },
    {
      label: "ขอใช้น้ำประปาแบบเหมาจ่าย",
      link: "#",
    },
   
  ];

  ShowHideButton() {
    this.showMainContent = this.showMainContent ? false : true;
 }
  ngOnInit() {
 

   
  }

}
