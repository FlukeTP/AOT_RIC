import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AjaxService } from 'src/app/_service/ajax.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonService } from 'src/app/_service/ common.service';
import { MessageService } from 'src/app/_service/message.service';
import { ResponseData } from 'src/app/common/models/response-data.model';
import { ModalConfirmComponent } from 'src/app/components/modal/modal-confirm/modalConfirm.component';
import { Utils } from 'src/app/common/helper/utils';
import { ValidateService } from 'src/app/_service/validate.service';
import { InputCalendarComponent } from 'src/app/components/input/input-calendar/input-calendar.component';
declare var $: any;

const URL = {
  SAVE: 'electric009/save',
  GET_BY_ID: 'electric009/get-by-id'
};

@Component({
  selector: 'app-ele009detail',
  templateUrl: './ele009detail.component.html',
  styleUrls: ['./ele009detail.component.css']
})
export class Ele009detailComponent implements OnInit {
  @ViewChild('calendar') calendar: InputCalendarComponent;
  @ViewChild('saveModal') modalSave: ModalConfirmComponent;

  // formSearch
  formDetail: FormGroup;
  id = '';


  breadcrumb: any = [
    {
      label: 'หมวดไฟฟ้า',
      link: '/home/elec',
    },
    {
      label: 'ปรับปรุงอัตราค่าภาระ ค่าบริการ FT',
      link: '/electricity/ele009',
    },
    {
      label: 'เพิ่มรายการปรับปรุงอัตราค่าภาระ ค่าบริการ FT',
      link: '#',
    }
  ];

  constructor(
    private formBuilder: FormBuilder,
    private ajax: AjaxService,
    private commonService: CommonService,
    private route: ActivatedRoute,
    private validate: ValidateService,
    private router: Router
  ) {
    this.formData();
  }

  ngOnInit() {
    this.id = this.route.snapshot.queryParams['id'] || '';
    if (Utils.isNotNull(this.id)) {
      this.getById(this.id);
    }
  }
  formData() {
    this.formDetail = this.formBuilder.group({
      calConfigId: [''],
      validDate: ['', Validators.required],
      value: ['', Validators.required],
      codeType: ['', Validators.required],
      notificationDate: ['', Validators.required],
      remark: ['']
    });
  }

  validDate(e) {
    this.formDetail.get('validDate').patchValue(e);
  }

  validator() {
    const validateData = [
      { format: "", header: "วันที่มีผล", value: this.formDetail.value.validDate },
      { format: "", header: "อัตราค่าภาระ", value: this.formDetail.value.value },
      // { format: "", header: "ประเภทบริการ", value: this.formDetail.value.codeType },
    ];
    if (!this.validate.checking(validateData)) {
      return;
    }
    if (this.formDetail.valid) {
      this.modalSave.openModal();
      return;
    }
  }

  onSave() {
    this.save();
  }

  onPages = () => {
    this.router.navigate(['/electricity/ele009'], {});
  }

  save() {
    this.commonService.loading();
    this.ajax.doPost(URL.SAVE, this.formDetail.value).subscribe((res: ResponseData<any>) => {
      console.log(res);
      if (MessageService.MSG.SUCCESS === res.status) {
        console.log(res.message);
        this.onPages();
      } else {
        console.log(res.message);
      }
      this.commonService.unLoading();
    });
  }

  getById(id: String) {
    if (id) {
      this.ajax.doGet(`${URL.GET_BY_ID}/${id}`).subscribe((res: ResponseData<any>) => {
        if (MessageService.MSG.SUCCESS === res.status) {
          console.log(res);
          this.formDetail.get('calConfigId').patchValue(res.data.calConfigId);
          this.formDetail.get('validDate').patchValue(res.data.validDate);
          this.formDetail.get('notificationDate').patchValue(res.data.notificationDate);
          this.calendar.setDate(res.data.validDate);
          this.formDetail.get('codeType').patchValue(res.data.codeType);
          this.formDetail.get('remark').patchValue(res.data.remark);
          this.formDetail.get('value').patchValue(res.data.value);
        } else {
          console.log(res.message);
        }
      });
    }
  }
}
