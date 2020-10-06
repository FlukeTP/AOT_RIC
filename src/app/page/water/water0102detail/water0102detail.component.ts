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
  SAVE: "water0102/save",
  EDIT_ID: "water0102/listdata",
  GET_DROPDOWN: "lov/list-data-detail",
  EDIT: "water0102/edit"
}
@Component({
  selector: 'app-water0102detail',
  templateUrl: './water0102detail.component.html',
  styleUrls: ['./water0102detail.component.css']
})
export class Water0102detailComponent implements OnInit {
  formAddWaterMaintenance: FormGroup;
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
    this.formAddWaterMaintenance = this.formBuilder.group({
      waterMaintenanceConfigId: [""],
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
      label: "ปรับปรุงอัตราค่าภาระรายเดือน",
      link: "/water/water010",
    },
    {
      label: "เพิ่มรายการปรับปรุงอัตราค่าภาระบำรุงรักษามิเตอร์",
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

  onBack() {
    this.router.navigate(["/water/water010"], {
      queryParams: {
        tab: 2
      }
    })
  }

  save() {
    console.log("data : ", this.formAddWaterMaintenance.value);
    this.commonService.loading();
    this.ajax.doPost(URL.SAVE, this.formAddWaterMaintenance.value).subscribe((res: ResponseData<any>) => {
      console.log(res.data);
      if (MessageService.MSG.SUCCESS == res.status) {
        this.onBack();
      } else {
        console.log(res.message);
      }
      this.commonService.unLoading();
    });
  }

  editWaterList(id: any) {
    let waterMaintenanceConfigId = id
    console.log("waterMaintenanceConfigId : ", waterMaintenanceConfigId);
    this.commonService.loading();
    this.ajax.doPost(URL.EDIT_ID, { waterMaintenanceConfigId }).subscribe((res: ResponseData<any>) => {
      console.log(res.data);
      if (MessageService.MSG.SUCCESS == res.status) {
        console.log(res.message);
        this.dataEdit = res.data;
        this.formAddWaterMaintenance.patchValue({
          waterMaintenanceConfigId: this.dataEdit.waterMaintenanceConfigId,
          airport: this.dataEdit.airport,
          modifiedDate: this.dataEdit.modifiedDate,
          waterMeterSize: this.dataEdit.waterMeterSize,
          chargeRates: this.dataEdit.chargeRates,
          remark: this.dataEdit.remark
        })
      } else {
        console.log(res.message);
      }
      this.commonService.unLoading(); 25
    });
  }

  editWater() {
    this.commonService.loading();
    this.ajax.doPost(URL.EDIT, this.formAddWaterMaintenance.value).subscribe((res: ResponseData<any>) => {
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

}

