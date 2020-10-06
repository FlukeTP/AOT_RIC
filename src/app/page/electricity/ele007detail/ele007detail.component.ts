import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AjaxService } from 'src/app/_service/ajax.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonService } from 'src/app/_service/ common.service';
import { MessageService } from 'src/app/_service/message.service';
import { ResponseData } from 'src/app/common/models/response-data.model';
import { ModalConfirmComponent } from 'src/app/components/modal/modal-confirm/modalConfirm.component';
import { Utils } from 'src/app/common/helper/utils';
import { utils } from 'protractor';
import { InputCalendarComponent } from 'src/app/components/input/input-calendar/input-calendar.component';
import { ValidateService } from 'src/app/_service/validate.service';
import { ModalSuccessComponent } from 'src/app/components/modal/modal-success/modalSuccess.component';
import { ModalErrorComponent } from 'src/app/components/modal/modal-error/modalError.component';
declare var $: any;

const URL = {
  SAVE: "electric007/save",
  GET_BY_ID: "electric007/get-by-id",
  UPDATE: "electric007/update"
}

@Component({
  selector: 'app-ele007detail',
  templateUrl: './ele007detail.component.html',
  styleUrls: ['./ele007detail.component.css']
})
export class Ele007detailComponent implements OnInit {

  @ViewChild('saveModal') modalSave: ModalConfirmComponent;
  @ViewChild('successModal') successModal: ModalSuccessComponent;
  @ViewChild('errorModal') modalError: ModalErrorComponent;
  @ViewChild('calendar1') calendar: InputCalendarComponent;
  //formSearch
  formDetail: FormGroup;
  id: string = '';
  constructor(
    private formBuilder: FormBuilder,
    private ajax: AjaxService,
    private commonService: CommonService,
    private route: ActivatedRoute,
    private router: Router,
    private validate: ValidateService
  ) {
    this.formData();
  }



  breadcrumb: any = [
    {
      label: "หมวดไฟฟ้า",
      link: "/home/elec",
    },
    {
      label: "ปรับปรุงอัตราค่าภาระ ค่าบริการไฟฟ้า",
      link: "/electricity/ele007",
    },
    {
      label: "เพิ่มรายการปรับปรุงอัตราค่าภาระ ค่าบริการไฟฟ้า",
      link: "#",
    }
  ]

  ngOnInit() {
    this.id = this.route.snapshot.queryParams['id'] || "";
    if (Utils.isNotNull(this.id)) {
      this.getById(this.id);
      this.formDetail.get('rateConfigId').patchValue(this.id);
    }

  }

  //======================= Form =======================
  formData() {
    this.formDetail = this.formBuilder.group({
      rateConfigId:[''],
      modifiedYear: ['', Validators.required],
      phase: ['', Validators.required],
      serviceType: ['', Validators.required],
      rangeAmpere: ['', Validators.required],
      chargeRates: ['', Validators.required],
      remark: ['']
    })
  }
  //======================= calendar ===============
  setDate(e) {
    this.formDetail.get('modifiedYear').patchValue(e);
    console.log(e);
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
    this.router.navigate(["/electricity/ele007"], {});
  }

  async onValidate() {
    const validateData = [
      { format: '', header: 'วันที่มีผล', value: this.formDetail.value.modifiedYear },
      { format: '', header: 'จำนวนเฟส', value: this.formDetail.value.phase },
      { format: '', header: 'ประเภทบริการ', value: this.formDetail.value.serviceType },
      { format: '', header: 'ขนาดการใช้ไฟฟ้า', value: this.formDetail.value.rangeAmpere },
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
        this.formDetail.get('modifiedYear').patchValue(res.data.modifiedYear);
        this.formDetail.get('phase').patchValue(res.data.phase);
        this.formDetail.get('serviceType').patchValue(res.data.serviceType);
        this.formDetail.get('rangeAmpere').patchValue(res.data.rangeAmpere);
        this.formDetail.get('chargeRates').patchValue(res.data.chargeRates);
        this.formDetail.get('remark').patchValue(res.data.remark);
        this.calendar.setDate(this.formDetail.get('modifiedYear').value);
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
