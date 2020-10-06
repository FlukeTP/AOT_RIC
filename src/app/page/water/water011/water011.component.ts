import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Utils } from 'src/app/common/helper/utils';
declare var $: any;
@Component({
  selector: 'app-water011',
  templateUrl: './water011.component.html',
  styleUrls: ['./water011.component.css']
})
export class Water011Component implements OnInit {
  showMainContent: Boolean = true;
  tabIdx: number = 1;
  tab: string = '';
  constructor(
    private route: ActivatedRoute
  ) { }

  breadcrumb: any = [
    {
      label: "หมวดน้ำประปา",
      link: "/",
    },
    {
      label: "ปรับปรุงอัตราค่าภาระรายครั้ง",
      link: "#",
    },

  ];
  ngOnInit() {
    this.tab = this.route.snapshot.queryParams['tab'] || "";
    if (Utils.isNotNull(this.tab)) {
      this.clickTap(this.tab);
    }
  }

  public clickTap(idx) {
    console.log(idx);
    this.tabIdx = idx;
  }

}
