import { Component, OnInit } from '@angular/core';
import { Utils } from 'src/app/common/helper';
import { ActivatedRoute } from '@angular/router';
declare var $: any;
@Component({
  selector: 'app-communi006',
  templateUrl: './communi006.component.html',
  styleUrls: ['./communi006.component.css']
})
export class Communi006Component implements OnInit {

  showMainContent: Boolean = true;
  tabIdx: number = 1;
  constructor(
    private route: ActivatedRoute
  ) { }
  breadcrumb: any = [
    {
      label: "หมวดสื่อสาร",
      link: "/home/communi",
    },
    {
      label: "ปรับปรุงอัตราค่าภาระการใช้บริการสื่อสาร",
      link: "#",
    },

  ];
  ngOnInit() {
    if (Utils.isNotNull(this.route.snapshot.queryParams['tab'])) {
      this.clickTap(this.route.snapshot.queryParams['tab']);
    }
  }
  public clickTap(idx) {
    console.log(idx);
    this.tabIdx = idx;
  }
}
