import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonService } from 'src/app/_service/ common.service';
import { AjaxService } from 'src/app/_service/ajax.service';
import { ResponseData } from 'src/app/common/models/response-data.model';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalConfirmComponent } from 'src/app/components/modal/modal-confirm/modalConfirm.component';
import { ModalSuccessComponent } from 'src/app/components/modal/modal-success/modalSuccess.component';
import { ModalErrorComponent } from 'src/app/components/modal/modal-error/modalError.component';
import { MessageService } from 'src/app/_service/message.service';
import { ValidateService } from 'src/app/_service/validate.service';
import { Utils } from 'src/app/common/helper/utils';
import { InputCalendarComponent } from 'src/app/components/input/input-calendar/input-calendar.component';
import { NumberUtils } from 'src/app/common/helper/number';

const URL = {
  SAVE: "electric005/save",
  FIND_ID: "electric005/find_id"
}

@Component({
  selector: 'app-ele005detail',
  templateUrl: './ele005detail.component.html',
  styleUrls: ['./ele005detail.component.css']
})
export class Ele005detailComponent implements OnInit {

  @ViewChild('saveModal') modalSave: ModalConfirmComponent;
  @ViewChild('successModal') modalSuccess: ModalSuccessComponent;
  @ViewChild('errorModal') modalError: ModalErrorComponent;
  @ViewChild('calendar') calendar: InputCalendarComponent;

  breadcrumb: any = [
    {
      label: "หมวดไฟฟ้า",
      link: "/home/elec",
    },
    {
      label: "ขอยกเลิกการใช้ไฟฟ้า",
      link: "/electricity/ele005",
    },
    {
      label: "เพิ่มรายการขอยกเลิกการใช้ไฟฟ้า",
      link: "/",
    }
  ]

  formGroup: FormGroup;

  constructor(
    private fb: FormBuilder,
    private ajax: AjaxService,
    private commonService: CommonService,
    private route: ActivatedRoute,
    private router: Router,
    private validate: ValidateService
  ) {
    this.setFormGroup();
  }

  // =============== Initial setting ======================
  ngOnInit() {
    this.formGroup.get('reqId').patchValue(this.route.snapshot.queryParams['id']);
    this.formGroup.get('reqCancelId').patchValue(this.route.snapshot.queryParams['reqCancelId']);
    if (Utils.isNotNull(this.formGroup.get('reqId').value)) {
      this.findById(this.formGroup.get('reqId').value);
    } else if (Utils.isNotNull(this.formGroup.get('reqCancelId').value)) {
      this.findById(this.formGroup.get('reqCancelId').value);
    } else {
      this.router.navigate(['/electricity/ele003']);
    }
  }

  setFormGroup() {
    this.formGroup = this.fb.group({
      reqCancelId: [""],
      reqId: [""],
      customerCode: [""],
      customerName: [""],
      customerBranch: [""],
      contractNo: [""],
      voltageType: [""],
      serialNo: [""],
      meterName: [""],
      meterType: [""],
      meterLocation: [""],
      functionalLocation: [""],
      chargeRates: [""],
      vat: [""],
      totalchargeRates: [""],
      dateCancel: ["", Validators.required],
      remark: [""],
      airport: [""],
      invoiceNoReqcash: [""],
      receiptNoReqcash: [""],
      invoiceNoReqlg: [""],
      receiptNoReqlg: [""],
      transactionNoLg: [""],
      invoiceNoLg: [""],
      receiptNoLg: [""],
      sapStatusLg: [""],
      sapErrorDescLg: [""],
      docno: [""],
      showButton: [""],
    });
  }


  // ================= Action =============================
  dateChange(event) {
    this.formGroup.get('dateCancel').patchValue(event);
  }

  onBack() {
    let pathBack = '';
    if (Utils.isNotNull(this.formGroup.get('reqCancelId').value)) {
      pathBack = '/electricity/ele005';
    } else {
      pathBack = '/electricity/ele003';
    }
    this.router.navigate([pathBack]);
  }

  onOpenModalSave() {
    let validateData = [
      { format: "", header: "วันที่สิ้นสุดการใช้งาน", value: this.formGroup.get("dateCancel").value }
    ];
    if (this.validate.checking(validateData)) {
      if (this.formGroup.invalid) {
        this.modalError.openModal("กรุณากรอกข้อมูลให้ครบ");
      } else {
        this.modalSave.openModal();
      }
    }
  }

  onClickSave() {
    if (this.formGroup.invalid) {
      this.modalError.openModal("กรุณากรอกข้อมูลให้ครบ");
    } else {
      this.callSave();
    }
  }

  // ===================== call back-end ===============
  callSave() {
    this.commonService.loading();
    let chargeRates = NumberUtils.decimalFormatToNumber(this.formGroup.get('chargeRates').value);
    let vat = NumberUtils.decimalFormatToNumber(this.formGroup.get('vat').value);
    let totalchargeRates = NumberUtils.decimalFormatToNumber(this.formGroup.get('totalchargeRates').value);
    this.formGroup.patchValue({
      chargeRates: chargeRates,
      vat: vat,
      totalchargeRates: totalchargeRates,
    })
    console.log("formGroup => ", this.formGroup.value);
    this.ajax.doPost(URL.SAVE, this.formGroup.value).subscribe((res: ResponseData<any>) => {
      if (MessageService.MSG.SUCCESS == res.status) {
        this.modalSuccess.openModal();
        this.router.navigate(['/electricity/ele005']);
      } else {
        this.modalError.openModal(res.message);
      }
      this.commonService.unLoading();
    });
  }

  findById(id) {
    this.commonService.loading();
    let data = {
      reqId: id,
      reqCancelId: ''
    }
    if (Utils.isNotNull(this.formGroup.get('reqCancelId').value)) {
      data['reqCancelId'] = this.formGroup.get('reqCancelId').value
    }
    this.ajax.doPost(URL.FIND_ID, data).subscribe((res: ResponseData<any>) => {
      if (MessageService.MSG.SUCCESS == res.status) {
        this.formGroup.get('customerCode').patchValue(res.data.customerCode);
        this.formGroup.get('customerName').patchValue(res.data.customerName);
        this.formGroup.get('customerBranch').patchValue(res.data.customerBranch);
        this.formGroup.get('contractNo').patchValue(res.data.contractNo);
        this.formGroup.get('voltageType').patchValue(res.data.voltageType);
        this.formGroup.get('serialNo').patchValue(res.data.serialNo);
        this.formGroup.get('meterName').patchValue(res.data.meterName);
        this.formGroup.get('meterType').patchValue(res.data.meterType);
        this.formGroup.get('meterLocation').patchValue(res.data.meterLocation);
        this.formGroup.get('functionalLocation').patchValue(res.data.functionalLocation);
        this.formGroup.get('chargeRates').patchValue(NumberUtils.numberToDecimalFormat(res.data.chargeRates));
        this.formGroup.get('vat').patchValue(NumberUtils.numberToDecimalFormat(res.data.vat));
        this.formGroup.get('totalchargeRates').patchValue(NumberUtils.numberToDecimalFormat(res.data.totalchargeRates));
        this.formGroup.get('airport').patchValue(res.data.airport);
        this.formGroup.get('invoiceNoReqcash').patchValue(res.data.invoiceNoReqcash);
        this.formGroup.get('receiptNoReqcash').patchValue(res.data.receiptNoReqcash);
        this.formGroup.get('invoiceNoReqlg').patchValue(res.data.invoiceNoReqlg);
        this.formGroup.get('receiptNoReqlg').patchValue(res.data.receiptNoReqlg);
        this.formGroup.get('transactionNoLg').patchValue(res.data.transactionNoLg);
        this.formGroup.get('invoiceNoLg').patchValue(res.data.invoiceNoLg);
        this.formGroup.get('receiptNoLg').patchValue(res.data.receiptNoLg);
        this.formGroup.get('sapStatusLg').patchValue(res.data.sapStatusLg);
        this.formGroup.get('sapErrorDescLg').patchValue(res.data.sapErrorDescLg);
        this.formGroup.get('docno').patchValue(res.data.docno);
        this.formGroup.get('showButton').patchValue(res.data.showButton);
        if (Utils.isNotNull(this.formGroup.get('reqCancelId').value)) {
          this.formGroup.get('dateCancel').patchValue(res.data.dateCancel);
          this.calendar.setDate(this.formGroup.get('dateCancel').value);
          this.formGroup.get('remark').patchValue(res.data.remark);
        }
      } else {
        this.modalError.openModal(res.message);
        this.router.navigate(['/electricity/ele003']);
      }
      this.commonService.unLoading();
    })
  }
}
