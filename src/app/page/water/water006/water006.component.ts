import { Component, OnInit, AfterViewInit } from '@angular/core';
declare var $: any;
@Component({
  selector: 'app-water006',
  templateUrl: './water006.component.html',
  styleUrls: ['./water006.component.css']
})
export class Water006Component implements OnInit,AfterViewInit {

  showMainContent: Boolean = true;
  constructor() { }
  breadcrumb: any = [
    {
      label: "หมวดน้ำประปา",
      link: "/",
    },
    {
      label: "ขอใช้บริการน้ำประปาอื่นๆ",
      link: "#",
    },
   
  ];

  ShowHideButton() {
    this.showMainContent = this.showMainContent ? false : true;
 }
  ngOnInit() {
 

   
  }
  ngAfterViewInit(): void {
    $('#date1').Zebra_DatePicker();
    $('#date2').Zebra_DatePicker();
  }
}
