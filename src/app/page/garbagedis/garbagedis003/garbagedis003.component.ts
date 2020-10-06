import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-garbagedis003',
  templateUrl: './garbagedis003.component.html',
  styleUrls: ['./garbagedis003.component.css']
})
export class Garbagedis003Component implements OnInit {
  showMainContent: Boolean = true;
  tabIdx: number = 1;
  constructor() { }
  breadcrumb: any = [
    {
      label: "หมวดกำจัดขยะ",
      link: "/",
    },
    {
      label: "ปรับปรุงอัตราค่าภาระ ค่าบริการกำจัดขยะ",
      link: "#",
    },
   
  ];
  ngOnInit() {
   
  }
  public clickTap(idx){
    console.log(idx);
    this.tabIdx = idx;
  }

}

