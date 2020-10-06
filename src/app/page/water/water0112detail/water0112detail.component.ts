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
declare var $: any;
const URL = {
  SAVE: "water0112/save",
  EDIT_ID: "water0112/listdata",
  GET_DROPDOWN: "lov/list-data-detail",
  EDIT: "water0112/edit"
}
@Component({
  selector: 'app-water0112detail',
  templateUrl: './water0112detail.component.html',
  styleUrls: ['./water0112detail.component.css']
})
export class Water0112detailComponent implements OnInit {
  formAddWaterInstallation: FormGroup;
  airport: any;
  @ViewChild('calendar1') calendar: InputCalendarComponent;
  @ViewChild('saveModal') modalSave: ModalConfirmComponent;
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
  ) {
    this.formAddWaterInstallation = this.formBuilder.group({
      waterInstallationId: [""],
      airport: ["", Validators.required],
      modifiedDate: ["", Validators.required],
      waterMeterSize: ["", Validators.required],
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
      label: "ปรับปรุงอัตราค่าภาระรายครั้ง",
      link: "/water/water011",
    },
    {
      label: "เพิ่มรายการปรับปรุงอัตราค่าภาระค่าติดตั้งมิเตอร์",
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

  onPages = () => {
    this.router.navigate(["/water/water011"], {
      queryParams: {
        tab: 2
      }
    });
  }

  setDate(e) {
    this.formAddWaterInstallation.get('modifiedDate').patchValue(e);
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
    console.log("data : ", this.formAddWaterInstallation.value);
    this.commonService.loading();
    this.ajax.doPost(URL.SAVE, this.formAddWaterInstallation.value).subscribe((res: ResponseData<any>) => {
      console.log(res.data);
      if (MessageService.MSG.SUCCESS == res.status) {
        this.onPages();
      } else {
        console.log(res.message);
      }
      this.commonService.unLoading();
    });
  }

  editWaterList(id: any) {
    let waterInstallationId = id
    console.log("waterInstallationId : ", waterInstallationId);
    this.commonService.loading();
    this.ajax.doPost(URL.EDIT_ID, { waterInstallationId }).subscribe((res: ResponseData<any>) => {
      console.log(res.data);
      if (MessageService.MSG.SUCCESS == res.status) {
        console.log(res.message);
        this.dataEdit = res.data;
        this.formAddWaterInstallation.patchValue({
          waterInstallationId: this.dataEdit.waterInstallationId,
          airport: this.dataEdit.airport,
          modifiedDate: this.dataEdit.modifiedDate,
          waterMeterSize: this.dataEdit.waterMeterSize,
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
    this.ajax.doPost(URL.EDIT, this.formAddWaterInstallation.value).subscribe((res: ResponseData<any>) => {
      console.log(res.data);
      if (MessageService.MSG.SUCCESS == res.status) {
        console.log(res.message);
        this.onPages();
      } else {
        console.log(res.message);
      }
      this.commonService.unLoading();
    });
  }

}

