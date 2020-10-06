import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { ValidateService } from 'src/app/_service/validate.service';
import { AjaxService } from 'src/app/_service/ajax.service';
import { MessageService } from 'src/app/_service/message.service';
import { ResponseData } from 'src/app/common/models/response-data.model';
import { ModalConfirmComponent } from 'src/app/components/modal/modal-confirm/modalConfirm.component';
import { BsModalService } from 'ngx-bootstrap/modal/public_api';
import { Router, ActivatedRoute } from '@angular/router';
import { ModalSuccessComponent } from 'src/app/components/modal/modal-success/modalSuccess.component';
import { ModalErrorComponent } from 'src/app/components/modal/modal-error/modalError.component';
import { Utils } from 'src/app/common/helper';
import { InputCalendarComponent } from 'src/app/components/input/input-calendar/input-calendar.component';
import { DatePipe } from '@angular/common';
import { BreadcrumbComponent } from 'src/app/components/breadcrumb/breadcrumb.component';

const URL = {
  SAVE: "phone004/save",
  GET_PHONE_TYPE: "master/list",
  LIST: "phone004/get",
  DETAIL: "phone004/detail"
}

@Component({
  selector: 'app-phone004detail',
  templateUrl: './phone004detail.component.html',
  styleUrls: ['./phone004detail.component.css']
})


export class Phone004detailComponent implements OnInit {
  @ViewChild('saveModal') modalSave: ModalConfirmComponent;
  @ViewChild('successModal') modalSuccess: ModalSuccessComponent;
  @ViewChild('errorModal') modalError: ModalErrorComponent;
  @ViewChild('calendar') calendar: InputCalendarComponent;

  breadcrumb: any = [
    {
      label: "หมวดโทรศัพท์",
      link: "/phone",
    },
    {
      label: "ปรับปรุงอัตราค่าภาระ ค่าบริการโทรศัพท์",
      link: "/phone/phone004",
    },
    {
      label: "เพิ่มรายการปรับปรุงอัตราค่าภาระ ค่าบริการโทรศัพท์",
      link: "#",
    }
  ];
  formDetail: FormGroup = new FormGroup({});
  id:string;
  public phoneType:any ;
  constructor(private formBuilder: FormBuilder,
              private validate : ValidateService,
              private ajax: AjaxService,
              private router: Router,
              private route: ActivatedRoute) { 
    this.id = this.route.snapshot.queryParams['id'] || '';
    
    this.formData();
  }
  ngOnInit() {
    this.getMasterData();
    if (Utils.isNotNull(this.id)) {
      this.getById();
      this.breadcrumb[2].label =  "แก้ไขรายการปรับปรุงอัตราค่าภาระ ค่าบริการโทรศัพท์";
    }
  }

  getMasterData(){
    this.ajax.doPost(URL.GET_PHONE_TYPE, {keyword : 'PHONE_CAL_TYPE'}).subscribe((res: ResponseData<any>) => {
      console.log("res", res);
      if (MessageService.MSG.SUCCESS === res.status) {
        this.phoneType = res.data;

        console.log(res.message);
      } else {
        console.log(res.message);
      }
    });
  }

  formData(){
    this.formDetail = this.formBuilder.group({
      validDate: [''],
      phoneType: [''],
      serviceType: [''],
      rateCharge: [''],
      remark: [''],
      id: ['']
    });
  }

  onSave(){
    let validateData = [
      { format: "", header: "วันที่มีผล", value: this.formDetail.get("validDate").value },
      { format: "", header: "ประเภท", value: this.formDetail.get("phoneType").value },
      { format: "", header: "ประเภทบริการ", value: this.formDetail.get("serviceType").value },
      { format: "decimal", header: "อัตราค่าภาระ", value: this.formDetail.get("rateCharge").value }
    ];
    if(this.validate.checking(validateData)){
      this.ajax.doPost(URL.LIST, {}).subscribe((res: ResponseData<any>) => {
        console.log("res", res);
        if (MessageService.MSG.SUCCESS === res.status) {
          this.modalSave.openModal();
          console.log(res.message);
        } else {
          console.log(res.message);
        }
      });
    }
  }

  onSubmitSave(){
    this.ajax.doPost(URL.SAVE, this.formDetail.value).subscribe((res: ResponseData<any>) => {
      if (MessageService.MSG.SUCCESS == res.status) {
        this.modalSuccess.openModal();
        this.router.navigate(['/phone/phone004']);
      } else {
        this.modalError.openModal(res.message);
      }
    });
  }

  dateChange(event){
    this.formDetail.get('validDate').patchValue(event);
  }

  getById(){
    this.ajax.doGet(`${URL.DETAIL}/${this.id}`).subscribe((res: ResponseData<any>) => {
      if (MessageService.MSG.SUCCESS === res.status) {
        console.log("res.data",res.data);
        this.formDetail.get('id').patchValue(res.data.id);
        this.formDetail.get('validDate').patchValue(res.data.validDate);
        this.formDetail.get('phoneType').patchValue(res.data.phoneType);
        this.formDetail.get('remark').patchValue(res.data.remark);
        this.formDetail.get('serviceType').patchValue(res.data.serviceType);
        this.formDetail.get('rateCharge').patchValue(res.data.chargeRate);

        this.calendar.setDate(this.formDetail.get('validDate').value);
      } else {
        console.log(res.message);
      }
    });

  }
}
