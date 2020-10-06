import { Component, OnInit, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
declare var $: any;
@Component({
  selector: 'app-ele004detail',
  templateUrl: './ele004detail.component.html',
  styleUrls: ['./ele004detail.component.css']
})
export class Ele004detailComponent implements OnInit, AfterViewInit {

  formSave: FormGroup = new FormGroup({});
  breadcrumb: any = [
    {
      label: 'หมวดไฟฟ้า',
      link: '/home/elec',
    }, {
      label: 'ขอใช้ไฟฟ้าของบ้านพักพนักงาน',
      link: '/electricity/ele004',
    }, {
      label: 'เพิ่มขอใช้ไฟฟ้าของบ้านพักพนักงาน',
      link: '/',
    },
  ];

  constructor(
    private formBuilder: FormBuilder,
  ) {
    this.formSave = this.formBuilder.group({
      employeeId: [Validators.maxLength(80)],
      employeeCode: [Validators.maxLength(13)],
      employeeName: [Validators.maxLength(80)],
      requestType: [],
      applyType: [],
      remark: [Validators.maxLength(8000)],
    });
  }

  ngOnInit() { }

  ngAfterViewInit(): void { }

  showModal() {
    $('#myModal').modal('show');
  }

  hideModal() {
    $('#myModal').modal('hide');
  }

}
