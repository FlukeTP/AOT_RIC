import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Utils } from 'src/app/common/helper';
declare var $: any;
@Component({
  selector: 'app-it010',
  templateUrl: './it010.component.html',
  styleUrls: ['./it010.component.css']
})
export class It010Component implements OnInit {
  showMainContent: Boolean = true;
  tabIdx: number = 1;
  constructor(
    private route: ActivatedRoute
  ) { }
  breadcrumb: any = [
    {
      label: "หมวด IT",
      link: "/home/it",
    },
    {
      label: "ปรับปรุงอัตราค่าภาระการใช้บริการ IT",
      link: "#",
    }
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
