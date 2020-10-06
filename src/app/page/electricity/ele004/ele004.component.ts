import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-ele004',
  templateUrl: './ele004.component.html',
  styleUrls: ['./ele004.component.css']
})
export class Ele004Component implements OnInit {

  breadcrumb: any = [
    {
      label: 'หมวดไฟฟ้า',
      link: '/home/elec',
    }, {
      label: 'ขอใช้ไฟฟ้าของบ้านพักพนักงาน',
      link: '#',
    },
  ];

  constructor() { }

  ngOnInit() { }

}
