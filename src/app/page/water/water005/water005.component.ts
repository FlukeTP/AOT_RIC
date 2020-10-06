import { Component, OnInit } from '@angular/core';
declare var $: any;
@Component({
  selector: 'app-water005',
  templateUrl: './water005.component.html',
  styleUrls: ['./water005.component.css']
})
export class Water005Component implements OnInit {

  showMainContent: Boolean = true;
  constructor() { }
  breadcrumb: any = [
    {
      label: "หมวดน้ำประปา",
      link: "/",
    },
    {
      label: "ขอใช้น้ำประปาของบ้านพักพนักงาน",
      link: "#",
    },
   
  ];

  ShowHideButton() {
    this.showMainContent = this.showMainContent ? false : true;
 }
  ngOnInit() {
 

   
  }

}
