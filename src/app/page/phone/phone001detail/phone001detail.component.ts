import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-phone001detail',
  templateUrl: './phone001detail.component.html',
  styleUrls: ['./phone001detail.component.css']
})
export class Phone001detailComponent implements OnInit {
  constructor() { }
  breadcrumb: any = [
    {
      label: "หมวดโทรศัพท์",
      link: "/phone",
    },
    {
      label: "บันทึกข้อมูลโทรศัพท์",
      link: "/phone/phone001",
    },
    {
      label: "เพิ่มข้อมูลโทรศัพท์",
      link: "#",
    },
   
  ];
  ngOnInit() {
  }
}
