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
import { ModalErrorComponent } from 'src/app/components/modal/modal-error/modalError.component';
import { ValidateService } from 'src/app/_service/validate.service';
declare var $: any;

const URL = {
  SAVE: "water0111/save",
  EDIT_ID: "water0111/listdata",
  GET_DROPDOWN: "lov/list-data-detail",
  EDIT: "water0111/edit"
}
@Component({
  selector: 'app-water0111detail',
  templateUrl: './water0111detail.component.html',
  styleUrls: ['./water0111detail.component.css']
})
export class Water0111detailComponent implements OnInit {
  @ViewChild('calendar1') calendar: InputCalendarComponent;
  @ViewChild('saveModal') modalSave: ModalConfirmComponent;
  @ViewChild('errorModal') modalError: ModalErrorComponent;
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
      label: "เพิ่มรายการปรับปรุงอัตราค่าภาระบริการน้ำประปา",
      link: "#",
    },

  ];

  formAddWaterMaintenance: FormGroup;
  airport: any;
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
    this.formAddWaterMaintenance = this.formBuilder.group({
      waterInsuranceConfigId: [""],
      airport: ["", Validators.required],
      modifiedDate: ["", Validators.required],
      waterMeterSize: ["", Validators.required],
      chargeRates: ["", Validators.required],
      remark: [""]
    })
  }

  ngOnInit() {
    this.getDropDawn();
    this.id = this.route.snapshot.queryParams['id'] || "";
    console.log("this.id : ", this.id);
    if (Utils.isNotNull(this.id)) {
      this.editWaterList(this.id);
      this.buttomedit = false;
    }
  }

  onPages = () => {
    this.router.navigate(["/water/water011"], {
      queryParams: {
        tab: 1
      }
    });
  }

  setDate(e) {
    this.formAddWaterMaintenance.get('modifiedDate').patchValue(e);
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

  onSave() {
    let validateData = [
      { format: "", header: "ท่าอากาศยาน", value: this.formAddWaterMaintenance.get("airport").value },
      { format: "", header: "วันที่มีผล", value: this.formAddWaterMaintenance.get("modifiedDate").value },
      { format: "", header: "ขนาดมิเตอร์", value: this.formAddWaterMaintenance.get("waterMeterSize").value },
      { format: "", header: "อัตราค่าภาระ", value: this.formAddWaterMaintenance.get("chargeRates").value }
    ];
    if (this.validate.checking(validateData)) {
      if (this.formAddWaterMaintenance.invalid) {
        this.modalError.openModal("กรุณากรอกข้อมูลให้ครบ");
      } else {
        this.modalSave.openModal();
      }
    }
  }

  save() {
    console.log("data : ", this.formAddWaterMaintenance.value);
    this.commonService.loading();
    this.ajax.doPost(URL.SAVE, this.formAddWaterMaintenance.value).subscribe((res: ResponseData<any>) => {
      console.log(res.data);
      if (MessageService.MSG.SUCCESS == res.status) {
        this.onPages();
      } else {
        this.modalError.openModal(res.message);
      }
      this.commonService.unLoading();
    });
  }

  editWaterList(id: any) {
    let waterInsuranceConfigId = id
    console.log("waterInsuranceConfigId : ", waterInsuranceConfigId);
    this.commonService.loading();
    this.ajax.doPost(URL.EDIT_ID, { waterInsuranceConfigId }).subscribe((res: ResponseData<any>) => {
      console.log(res.data);
      if (MessageService.MSG.SUCCESS == res.status) {
        console.log(res.message);
        this.dataEdit = res.data;
        this.formAddWaterMaintenance.patchValue({
          waterInsuranceConfigId: this.dataEdit.waterInsuranceConfigId,
          airport: this.dataEdit.airport,
          modifiedDate: this.dataEdit.modifiedDate,
          waterMeterSize: this.dataEdit.waterMeterSize,
          chargeRates: this.dataEdit.chargeRates,
          remark: this.dataEdit.remark
        });
        this.calendar.setDate(this.dataEdit.modifiedDate);
      } else {
        this.modalError.openModal(res.message);
      }
      this.commonService.unLoading(); 25
    });
  }

  editWater() {
    let validateData = [
      { format: "", header: "ท่าอากาศยาน", value: this.formAddWaterMaintenance.get("airport").value },
      { format: "", header: "วันที่มีผล", value: this.formAddWaterMaintenance.get("modifiedDate").value },
      { format: "", header: "ขนาดมิเตอร์", value: this.formAddWaterMaintenance.get("waterMeterSize").value },
      { format: "", header: "อัตราค่าภาระ", value: this.formAddWaterMaintenance.get("chargeRates").value }
    ];
    if (this.validate.checking(validateData)) {
      if (this.formAddWaterMaintenance.invalid) {
        this.modalError.openModal("กรุณากรอกข้อมูลให้ครบ");
      } else {
        this.commonService.loading();
        this.ajax.doPost(URL.EDIT, this.formAddWaterMaintenance.value).subscribe((res: ResponseData<any>) => {
          console.log(res.data);
          if (MessageService.MSG.SUCCESS == res.status) {
            console.log(res.message);
            this.onPages();
          } else {
            this.modalError.openModal(res.message);
          }
          this.commonService.unLoading();
        });
      }
    }
  }

}
