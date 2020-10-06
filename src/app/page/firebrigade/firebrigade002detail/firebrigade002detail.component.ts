import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalConfirmComponent } from 'src/app/components/modal/modal-confirm/modalConfirm.component';
import { ModalSuccessComponent } from 'src/app/components/modal/modal-success/modalSuccess.component';
import { ModalErrorComponent } from 'src/app/components/modal/modal-error/modalError.component';
import { InputCalendarComponent } from 'src/app/components/input/input-calendar/input-calendar.component';
import { AjaxService } from 'src/app/_service/ajax.service';
import { CommonService } from 'src/app/_service/ common.service';
import { ActivatedRoute, Router } from '@angular/router';
import { BsModalService } from 'ngx-bootstrap/modal';
import { ValidateService } from 'src/app/_service/validate.service';
import { MessageService } from 'src/app/_service/message.service';
import { ResponseData } from 'src/app/common/models/response-data.model';
import { Utils } from 'src/app/common/helper';
import { NumberUtils } from 'src/app/common/helper/number';

const URL = {
  SAVE: "firebrigade002/save",
  FIND_ID: "firebrigade002/find_id",
}
@Component({
  selector: 'app-firebrigade002detail',
  templateUrl: './firebrigade002detail.component.html',
  styleUrls: ['./firebrigade002detail.component.css']
})
export class Firebrigade002detailComponent implements OnInit {
  @ViewChild('saveModal') modalSave: ModalConfirmComponent;
  @ViewChild('successModal') modalSuccess: ModalSuccessComponent;
  @ViewChild('errorModal') modalError: ModalErrorComponent;
  @ViewChild('calendar') calendar: InputCalendarComponent;
  breadcrumb: any = [
    {
      label: "หมวดดับเพลิง",
      link: "/home/firebrigade",
    },
    {
      label: "ปรับปรุงอัตราค่าภาระจัดฝึกอบรมการดับเพลิงและกู้ภัย",
      link: "#",
    },
    {
      label: "กำหนดอัตราค่าภาระจัดฝึกอบรมการดับเพลิงและกู้ภัย",
      link: "#",
    }
  ];

  formGroup: FormGroup;
  constructor(
    private fb: FormBuilder,
    private ajax: AjaxService,
    private commonService: CommonService,
    private route: ActivatedRoute,
    private modalService: BsModalService,
    private router: Router,
    private validate: ValidateService
  ) {
    this.formGroup = this.fb.group({
      rateConfigId: [""],
      courseName: ["", Validators.required],
      chargeRates: ["", Validators.required],
      effectiveDate: ["", Validators.required],
      unit: ["", Validators.required],
      remark: [""]
    })
  }
  // ================== initial setting =====================

  ngOnInit() {
    this.formGroup.get('rateConfigId').patchValue(this.route.snapshot.queryParams['rateConfigId']);
    if (Utils.isNotNull(this.formGroup.get('rateConfigId').value)) {
      this.findById(this.formGroup.get('rateConfigId').value);
    }
  }

  // ============== Action ==================
  dateChange(event) {
    this.formGroup.get('effectiveDate').patchValue(event);
  }

  callulatePerson() {
    let chargeRates = this.formGroup.get('chargeRates').value;
    this.formGroup.patchValue({
      totalAmount: NumberUtils.numberToDecimalFormat(chargeRates.toString())
    });
  }

  onClickSave() {
    this.callSave();
  }

  onValidBeforeSave() {
    let validateData = [
      { format: "", header: "หลักสูตร", value: this.formGroup.get("courseName").value },
      { format: "", header: "อัตราภ่าระ", value: this.formGroup.get("chargeRates").value },
      { format: "", header: "วันที่มีผล", value: this.formGroup.get("effectiveDate").value },
      { format: "", header: "หน่วย", value: this.formGroup.get("unit").value },
    ];
    if (this.validate.checking(validateData)) {
      if (this.formGroup.invalid) {
        this.modalError.openModal(MessageService.MSG.REQUIRE_FIELD);
      } else {
        this.modalSave.openModal();
      }
    }
  }

  // ================ call back-end ==============
  callSave() {
    this.commonService.loading();
    let chargeRates = this.formGroup.get('chargeRates').value;
    this.formGroup.patchValue({
      chargeRates: NumberUtils.decimalFormatToNumber(chargeRates.toString())
    });
    // console.log("formGroup => ", this.formGroup.value);
    this.ajax.doPost(URL.SAVE, this.formGroup.value).subscribe((res: ResponseData<any>) => {
      if (MessageService.MSG.SUCCESS == res.status) {
        this.modalSuccess.openModal();
        this.router.navigate(['/firebrigade/firebrigade002']);
      } else {
        this.modalError.openModal(res.message);
      }
      this.commonService.unLoading();
    });
  }

  findById(id) {
    this.commonService.loading();
    this.ajax.doPost(URL.FIND_ID, this.formGroup.value).subscribe((res: ResponseData<any>) => {
      if (MessageService.MSG.SUCCESS == res.status) {
        this.formGroup.get('rateConfigId').patchValue(res.data.rateConfigId);
        this.formGroup.get('courseName').patchValue(res.data.courseName);
        this.formGroup.get('chargeRates').patchValue(NumberUtils.numberToDecimalFormat(res.data.chargeRates));
        this.formGroup.get('effectiveDate').patchValue(res.data.effectiveDate);
        this.calendar.setDate(this.formGroup.get('effectiveDate').value);
        this.formGroup.get('remark').patchValue(res.data.remark);
        this.formGroup.get('unit').patchValue(res.data.unit);
      } else {
        this.modalError.openModal(res.message);
        this.router.navigate(['/firebrigade/firebrigade002']);
      }
      this.commonService.unLoading();
    })
  }
}
