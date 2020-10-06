import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { CommonService } from 'src/app/_service/ common.service';
import { AjaxService } from 'src/app/_service/ajax.service';
import { Router, ActivatedRoute } from '@angular/router';
import { ResponseData } from 'src/app/common/models/response-data.model';
import { MessageService } from 'src/app/_service/message.service';
import { Utils } from 'src/app/common/helper/utils';
import { ModalErrorComponent } from 'src/app/components/modal/modal-error/modalError.component';
import { ValidateService } from 'src/app/_service/validate.service';
import { ModalConfirmComponent } from 'src/app/components/modal/modal-confirm/modalConfirm.component';

const URL = {
  SAVE: 'water002/save',
  EDIT_ID: "water002/listEditId",
  EDIT: "water002/edit",
  GET_DROPDOWN: "lov/list-data-detail"
};


@Component({
  selector: 'app-water002detail',
  templateUrl: './water002detail.component.html',
  styleUrls: ['./water002detail.component.css']
})
export class Water002detailComponent implements OnInit {

  @ViewChild('saveModal') modalSave: ModalConfirmComponent;
  @ViewChild('errorModal') modalError: ModalErrorComponent;

  formAddWaterMeter: FormGroup;
  dataMetId: any;
  id: any;
  buttomedit: boolean = true;
  airport: any;
  waterCalType: any;
  waterStatus: any;

  constructor(
    private formBuilder: FormBuilder,
    private commonService: CommonService,
    private router: Router,
    private ajax: AjaxService,
    private route: ActivatedRoute,
    private validate: ValidateService
  ) {
    this.formAddWaterMeter = this.formBuilder.group({
      meterId: [''],
      meterType: ['', Validators.required],
      meterName: ['', Validators.required],
      meterLocation: ['', Validators.required],
      meterStatus: ['', Validators.required],
      remark: [''],
      serialNo: ['', Validators.required],
      airport: ['', Validators.required]
    });
  }

  breadcrumb: any = [
    {
      label: 'หมวดน้ำประปา',
      link: '/',
    }, {
      label: 'จัดการมิเตอร์น้ำประปา',
      link: '/water/water002',
    }, {
      label: 'เพิ่มข้อมูลจัดการมิเตอร์น้ำประปา',
      link: '#',
    },

  ];

  ngOnInit() {
    this.getDropDawn();
    this.id = this.route.snapshot.queryParams['id'] || "";
    console.log("this.id : ", this.id);
    if (Utils.isNotNull(this.id)) {
      this.editMetId(this.id);
      this.buttomedit = false;
    }

  }

  getDropDawn() {
    this.ajax.doPost(`${URL.GET_DROPDOWN}`, { lovKey: "AIRPORT" }).subscribe((res: ResponseData<any>) => {
      console.log("meter", res.data);
      this.airport = res.data;
      this.commonService.unLoading();
    });
    this.ajax.doPost(`${URL.GET_DROPDOWN}`, { lovKey: "WATER_STATUS" }).subscribe((res: ResponseData<any>) => {
      console.log("meter", res.data);
      this.waterStatus = res.data;
      this.commonService.unLoading();
    });
  }

  saveFormAddWaterMeter() {
    console.log('saveFormAddWaterMeter : ', this.formAddWaterMeter.value);
    this.commonService.loading();
    this.ajax.doPost(URL.SAVE, this.formAddWaterMeter.value).subscribe(res => {
      console.log(res.json);
      if ('SUCCESS' === res.status) {
        console.log(res.message);
      } else {
        console.log(res.message);
      }
      this.commonService.unLoading();
      this.router.navigate(['/water/water002']);
    });
  }

  editMetId(id: any) {
    let meterId = id
    console.log("editFormAddLov : ", meterId);
    this.commonService.loading();
    this.ajax.doPost(URL.EDIT_ID, {
      'meterId': parseInt(meterId)
    }).subscribe((res: ResponseData<any>) => {
      console.log(res.data);
      if (MessageService.MSG.SUCCESS == res.status) {
        this.dataMetId = res.data;
        this.formAddWaterMeter.patchValue({
          meterId: this.dataMetId.meterId,
          remark: this.dataMetId.remark,
          meterStatus: this.dataMetId.meterStatus,
          serviceNumber: this.dataMetId.serviceNumber,
          meterLocation: this.dataMetId.meterLocation,
          meterName: this.dataMetId.meterName,
          serialNo: this.dataMetId.serialNo,
          meterType: this.dataMetId.meterType,
          airport: this.dataMetId.airport
        })
      } else {
        console.log(res.message);
      }
      this.commonService.unLoading();
    });
  }


  editFormAdd() {
    console.log("editFormAddElectricity : ", this.formAddWaterMeter.value);
    this.commonService.loading();
    this.ajax.doPost(URL.EDIT, this.formAddWaterMeter.value).subscribe((res: ResponseData<any>) => {
      console.log(res.data);
      if (MessageService.MSG.SUCCESS == res.status) {
        console.log(res.message);
        this.router.navigate(['/water/water002']);
      } else {
        console.log(res.message);
      }
      this.commonService.unLoading();
    });
  }

  //===========================  Action =====================
  onSave() {
    if (Utils.isNotNull(this.id)) {
      console.log('update');
      this.editFormAdd();
    } else {
      console.log('save');
      this.saveFormAddWaterMeter();
    }
  }

  async onValidate() {
    console.log("dfdfdfdfdf");
    console.log('validator', this.formAddWaterMeter.value);
    const validateData = [
      { format: '', header: 'ขนาดมิเตอร์', value: this.formAddWaterMeter.value.meterType },
      { format: '', header: 'ชื่อมิเตอร์', value: this.formAddWaterMeter.value.meterName },
      { format: '', header: 'สถานที่ตั้งมิเตอร์', value: this.formAddWaterMeter.value.meterLocation },
      { format: '', header: 'สถานะ ', value: this.formAddWaterMeter.value.meterStatus },
      { format: '', header: 'ท่าอากาศยาน ', value: this.formAddWaterMeter.value.airport },
      { format: '', header: 'Serial No. มิเตอร์', value: this.formAddWaterMeter.value.serialNo }
    ];
    if (!this.validate.checking(validateData)) {
      console.log("aaaaaaaaaa");
      return;
    }
    if (this.formAddWaterMeter.valid) {
      console.log("vvvvvvvvvvv");
      console.log('validator', this.formAddWaterMeter.value);
      this.modalSave.openModal();
      return;
    }
  }

  //========================= validateControlSave ===============================
  validateControlSave(control: string) {
    return false;
  }


}

