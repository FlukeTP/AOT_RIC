import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalConfirmComponent } from 'src/app/components/modal/modal-confirm/modalConfirm.component';
import { InputCalendarComponent } from 'src/app/components/input/input-calendar/input-calendar.component';
import { FormGroup, FormBuilder } from '@angular/forms';
import { AjaxService } from 'src/app/_service/ajax.service';
import { CommonService } from 'src/app/_service/ common.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Utils } from 'src/app/common/helper';
import { MessageService } from 'src/app/_service/message.service';
import { ResponseData } from 'src/app/common/models/response-data.model';
import { ValidateService } from 'src/app/_service/validate.service';
import { ModalErrorComponent } from 'src/app/components/modal/modal-error/modalError.component';
import { ModalSuccessComponent } from 'src/app/components/modal/modal-success/modalSuccess.component';

declare var $: any;

const URL = {
  SAVE: "water0114/save",
  GET_BY_ID: "water0114/get-by-id",
  UPDATE: "water0114/update",
  GET_DROPDOWN: "lov/list-data-detail",
}
@Component({
  selector: 'app-water0114detail',
  templateUrl: './water0114detail.component.html',
  styleUrls: ['./water0114detail.component.css']
})
export class Water0114detailComponent implements OnInit {
  @ViewChild('saveModal') modalSave: ModalConfirmComponent;
  @ViewChild('successModal') successModal: ModalSuccessComponent;
  @ViewChild('errorModal') modalError: ModalErrorComponent;
  @ViewChild('calendar1') calendar: InputCalendarComponent;


  //formSearch
  formDetail: FormGroup;
  id: string = '';
  airport: any[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private ajax: AjaxService,
    private commonService: CommonService,
    private route: ActivatedRoute,
    private router: Router,
    private validate: ValidateService,

  ) {
    this.formData();
    this.getDropDawn();
  }
  breadcrumb: any = [
    {
      label: "หมวดน้ำประปา",
      link: "/",
    },
    {
      label: "ปรับปรุงอัตราค่าภาระรายครั้ง",
      link: "/water/water011",
    },
    {
      label: "เพิ่มรายการปรับปรุงอัตราค่าภาระค่าปรับน้ำเสีย",
      link: "#",
    },

  ];
  ngOnInit() {
    this.id = this.route.snapshot.queryParams['id'] || "";
    if (Utils.isNotNull(this.id)) {
      this.getById(this.id);
      this.formDetail.get('wasteConfigId').patchValue(this.id);
    }
  }


  //======================= Form =======================
  formData() {
    this.formDetail = this.formBuilder.group({
      wasteConfigId: [''],
      airport: [''],
      modifiedDate: [''],
      serviceType: [''],
      chargeRates: [''],
      remark: ['']
    })
  }
  //======================= calendar ===============
  setDate(e) {
    this.formDetail.get('modifiedDate').patchValue(e);
    console.log(e);
  }
  //======================= getDropDawn ===============
  getDropDawn() {
    this.ajax.doPost(`${URL.GET_DROPDOWN}`, { lovKey: "AIRPORT" }).subscribe((res: ResponseData<any>) => {
      this.airport = res.data;
    });
  }

  //===========================  Action =====================
  onSave() {
    if (Utils.isNotNull(this.id)) {
      console.log('update');
      this.update();
    } else {
      console.log('save');
      this.save();
    }

  }

  onPages = () => {
    this.router.navigate(["/water/water011"], {
      queryParams: {
        tab: 4
      }
    });
  }

  async onValidate() {
    const validateData = [
      { format: '', header: 'ท่าอากาศยาน', value: this.formDetail.value.airport },
      { format: '', header: 'วันที่มีผล', value: this.formDetail.value.modifiedDate },
      { format: '', header: 'ประเภท', value: this.formDetail.value.serviceType },
      { format: '', header: 'อัตราค่าภาระ', value: this.formDetail.value.chargeRates },
    ];

    if (!this.validate.checking(validateData)) {
      return;
    }
    if (this.formDetail.valid) {
      console.log('validator', this.formData);
      this.modalSave.openModal();
      return;
    }
  }

  //=========================== Back - end ======================
  save() {
    this.commonService.loading();
    this.ajax.doPost(URL.SAVE, this.formDetail.value).subscribe((res: ResponseData<any>) => {
      console.log(res);
      if (MessageService.MSG.SUCCESS == res.status) {
        this.successModal.openModal();
        this.onPages();
      } else {
        this.modalError.openModal(res.message);
      }
      this.commonService.unLoading();
    });
  }

  getById(id: String) {
    this.commonService.loading();
    this.ajax.doGet(`${URL.GET_BY_ID}/${id}`).subscribe((res: ResponseData<any>) => {
      if (MessageService.MSG.SUCCESS == res.status) {
        this.formDetail.get('airport').patchValue(res.data.airport);
        this.formDetail.get('modifiedDate').patchValue(res.data.modifiedDate);
        this.formDetail.get('serviceType').patchValue(res.data.serviceType);
        this.formDetail.get('chargeRates').patchValue(res.data.chargeRates);
        this.formDetail.get('remark').patchValue(res.data.remark);
        this.calendar.setDate(this.formDetail.get('modifiedDate').value);
      } else {
        this.modalError.openModal(res.message);
      }
      this.commonService.unLoading();
    });
  }

  update() {
    this.commonService.loading();
    // this.ajax.doPut(`${URL.UPDATE}/${this.id}`, this.formDetail.value).subscribe((res: ResponseData<any>) => {
    //   if (MessageService.MSG.SUCCESS == res.status) {
    //     this.successModal.openModal();
    //     this.onPages();
    //   } else {
    //     this.modalError.openModal(res.message);
    //   }
    //   this.commonService.unLoading();
    // });
    this.ajax.doPost(URL.UPDATE, this.formDetail.value).subscribe((res: ResponseData<any>) => {
      console.log(res);
      if (MessageService.MSG.SUCCESS == res.status) {
        this.successModal.openModal();
        this.onPages();
      } else {
        this.modalError.openModal(res.message);
      }
      this.commonService.unLoading();
    });
  }


  //========================= validateControlSave ===============================
  validateControlSave(control: string) {
    return false;
  }

}
