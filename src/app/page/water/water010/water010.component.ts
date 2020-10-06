import { Component, OnInit } from '@angular/core';
import { Utils } from 'src/app/common/helper';
import { ActivatedRoute } from '@angular/router';

declare var $: any;
@Component({
  selector: 'app-water010',
  templateUrl: './water010.component.html',
  styleUrls: ['./water010.component.css']
})
export class Water010Component implements OnInit {
  showMainContent: Boolean = true;
  tabIdx: number = 1;
  constructor(
    private route: ActivatedRoute
  ) { }
  breadcrumb: any = [
    {
      label: "หมวดน้ำประปา",
      link: "/",
    },
    {
      label: "ปรับปรุงอัตราค่าภาระรายเดือน",
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
