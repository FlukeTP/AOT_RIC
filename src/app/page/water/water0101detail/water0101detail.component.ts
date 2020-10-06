import { Component, OnInit, ViewChild } from '@angular/core';
import { AjaxService } from 'src/app/_service/ajax.service';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { CommonService } from 'src/app/_service/ common.service';
import { ResponseData } from 'src/app/common/models/response-data.model';
import { MessageService } from 'src/app/_service/message.service';
import { Router, ActivatedRoute } from '@angular/router';
import { ModalConfirmComponent } from 'src/app/components/modal/modal-confirm/modalConfirm.component';
import { Utils } from 'src/app/common/helper/utils';
import { InputCalendarComponent } from 'src/app/components/input/input-calendar/input-calendar.component';

import { ValidateService } from 'src/app/_service/validate.service';
import { ModalErrorComponent } from 'src/app/components/modal/modal-error/modalError.component';

declare var $: any;
const URL = {
  SAVE: "water010/save",
  EDIT_ID: "water010/listdata",
  GET_DROPDOWN: "lov/list-data-detail",
  EDIT: "water010/edit"
}
@Component({
  selector: 'app-water0101detail',
  templateUrl: './water0101detail.component.html',
  styleUrls: ['./water0101detail.component.css']
})
export class Water0101detailComponent implements OnInit {
  formAddWaterService: FormGroup;
  airport: any;
  @ViewChild('calendar1') calendar: InputCalendarComponent;
  @ViewChild('saveModal') modalSave: ModalConfirmComponent;
  @ViewChild('errorModal') modalError: ModalErrorComponent;

  id: any;
  buttomedit: boolean = true;
  dataEdit: any;
  waterCalType: any;
  constructor(
    private ajax: AjaxService,
    private commonService: CommonService,
    private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private validate: ValidateService
  ) {
    this.formAddWaterService = this.formBuilder.group({
      waterServiceConfigId: [""],
      airport: ["", Validators.required],
      modifiedDate: ["", Validators.required],
      waterType: ["", Validators.required],
      chargeRates: ["", Validators.required],
      remark: ["", Validators.required]
    })
  }
  breadcrumb: any = [
    {
      label: "หมวดน้ำประปา",
      link: "/",
    },
    {
      label: "ปรับปรุงอัตราค่าภาระรายเดือน",
      link: "/water/water010",
    },
    {
      label: "เพิ่มรายการปรับปรุงอัตราค่าภาระบริการน้ำประปา",
      link: "#",
    },

  ];
  ngOnInit() {
    this.getDropDawn();
    this.id = this.route.snapshot.queryParams['id'] || "";
    console.log("this.id : ", this.id);
    if (Utils.isNotNull(this.id)) {
      this.editWaterList(this.id);
      this.buttomedit = false;
    }
  }

  setDate(e) {
    this.formAddWaterService.get('modifiedDate').patchValue(e);
    console.log(e);
  }

  getDropDawn() {
    this.ajax.doPost(`${URL.GET_DROPDOWN}`, { lovKey: "AIRPORT" }).subscribe((res: ResponseData<any>) => {
      console.log("meter", res.data);
      this.airport = res.data;
      this.commonService.unLoading();
    });
    this.ajax.doPost(`${URL.GET_DROPDOWN}`, { lovKey: "WATER_CAL_TYPE" }).subscribe((res: ResponseData<any>) => {
      console.log("meter", res.data);
      this.waterCalType = res.data;
      this.commonService.unLoading();
    });
  }

  save() {
    console.log("data : ", this.formAddWaterService.value);
    this.commonService.loading();
    this.ajax.doPost(URL.SAVE, this.formAddWaterService.value).subscribe((res: ResponseData<any>) => {
      console.log(res.data);
      if (MessageService.MSG.SUCCESS == res.status) {
        this.onBack();
      } else {
        console.log(res.message);
      }
      this.commonService.unLoading();
    });
  }

  onBack() {
    this.router.navigate(["/water/water010"], {
      queryParams: {
        tab: 1
      }
    })
  }

  editWaterList(id: any) {
    let waterServiceConfigId = id
    console.log("editFormAddLov : ", waterServiceConfigId);
    this.commonService.loading();
    this.ajax.doPost(URL.EDIT_ID, { waterServiceConfigId }).subscribe((res: ResponseData<any>) => {
      console.log(res.data);
      if (MessageService.MSG.SUCCESS == res.status) {
        console.log(res.message);
        this.dataEdit = res.data;
        this.formAddWaterService.patchValue({
          waterServiceConfigId: this.dataEdit.waterServiceConfigId,
          airport: this.dataEdit.airport,
          modifiedDate: this.dataEdit.modifiedDate,
          waterType: this.dataEdit.waterType,
          chargeRates: this.dataEdit.chargeRates,
          remark: this.dataEdit.remark
        })
      } else {
        console.log(res.message);
      }
      this.commonService.unLoading();
    });
  }

  editWater() {
    this.commonService.loading();
    this.ajax.doPost(URL.EDIT, this.formAddWaterService.value).subscribe((res: ResponseData<any>) => {
      console.log(res.data);
      if (MessageService.MSG.SUCCESS == res.status) {
        console.log(res.message);
        this.onBack();
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
      this.editWater();
    } else {
      console.log('save');
      this.save();
    }
  }

  async onValidate() {
    const validateData = [
      { format: '', header: 'ท่าอากาศยาน', value: this.formAddWaterService.value.airport },
      { format: '', header: 'วันที่มีผล', value: this.formAddWaterService.value.modifiedDate },
      { format: '', header: 'ประเภท', value: this.formAddWaterService.value.waterType },
      { format: '', header: 'อัตราค่าภาระ', value: this.formAddWaterService.value.chargeRates }
    ];

    if (!this.validate.checking(validateData)) {
      return;
    }
    if (this.formAddWaterService.valid) {
      // console.log('validator', this.formData);
      this.modalSave.openModal();
      return;
    }
  }

  //========================= validateControlSave ===============================
  validateControlSave(control: string) {
    return false;
  }

}

