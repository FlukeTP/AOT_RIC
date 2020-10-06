import { Component, OnInit, ViewChild } from '@angular/core';
import { CnDnService } from 'src/app/_service/cn-dn.serviec';
import { CnDnRequest } from 'src/app/common/models/cn-dn.model';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NumberUtils } from 'src/app/common/helper/number';
import { ModalConfirmComponent } from 'src/app/components/modal/modal-confirm/modalConfirm.component';
import { ModalSuccessComponent } from 'src/app/components/modal/modal-success/modalSuccess.component';
import { ModalErrorComponent } from 'src/app/components/modal/modal-error/modalError.component';
import { CommonService } from 'src/app/_service/ common.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AjaxService } from 'src/app/_service/ajax.service';
import { ValidateService } from 'src/app/_service/validate.service';
import { MessageService } from 'src/app/_service/message.service';
import { ResponseData } from 'src/app/common/models/response-data.model';
import { Utils } from 'src/app/common/helper';

const URL = {
  SAVE: "cndn001/sendToSAP",
  FIND_ID: "cndn001/find_id",
}
@Component({
  selector: 'app-cndn001detail',
  templateUrl: './cndn001detail.component.html',
  styleUrls: ['./cndn001detail.component.css']
})
export class Cndn001detailComponent implements OnInit {
  @ViewChild('saveModal') modalSave: ModalConfirmComponent;
  @ViewChild('successModal') modalSuccess: ModalSuccessComponent;
  @ViewChild('errorModal') modalError: ModalErrorComponent;

  breadcrumb: any = [
    {
      label: "ลด/เพิ่มหนี้",
      link: "/home/cndn",
    },
    {
      label: "รายการลด/เพิ่มหนี้",
      link: "#",
    },
    {
      label: "เพิ่มรายการลด/เพิ่มหนี้",
      link: "#",
    }
  ]

  formGroup: FormGroup;

  cndnData: CnDnRequest;
  // response from save
  sapStatus: any;
  sapError: any;
  path: string;

  constructor(
    private cndn: CnDnService,
    private fb: FormBuilder,
    private ajax: AjaxService,
    private commonService: CommonService,
    private route: ActivatedRoute,
    private router: Router,
    private validate: ValidateService
  ) {
    this.formGroup = this.fb.group({
      cnDnId: [""],
      id: [""],
      customerCode: [""],
      customerName: [""],
      customerBranch: [""],
      contractNo: [""],
      requestType: [""],
      docType: [""],
      sapType: [""],
      glAccount: [""],
      oldInvoiceNo: [""],
      oldReceiptNo: [""],
      oldTotalAmount: [""],
      cnDn: ["", Validators.required],
      amount: ["", Validators.required],
      remark: [""],
      totalAmount: [""],
      transactionNo: [""],
      oldTransactionNo: [""],
      totalAfter: [""],
    })
  }

  // =============== Initial setting ======================
  ngOnInit() {
    this.path = this.route.snapshot.queryParams['path'];
    this.formGroup.get('cnDnId').patchValue(this.route.snapshot.queryParams['cnDnId']);
    if (Utils.isNotNull(this.formGroup.get('cnDnId').value)) {
      this.findById();
    } else {
      this.cndnData = this.cndn.getData();
      console.log("cndnData => ", this.cndnData);
      this.formGroup.patchValue({
        id: this.cndnData.id,
        customerCode: this.cndnData.customerCode,
        customerName: this.cndnData.customerName,
        customerBranch: this.cndnData.customerBranch,
        contractNo: this.cndnData.contractNo,
        requestType: this.cndnData.requestType,
        docType: this.cndnData.docType,
        sapType: this.cndnData.sapType,
        glAccount: this.cndnData.glAccount,
        oldInvoiceNo: this.cndnData.oldInvoiceNo,
        oldReceiptNo: this.cndnData.oldReceiptNo,
        oldTotalAmount: NumberUtils.numberToDecimalFormat(this.cndnData.oldTotalAmount),
        oldTransactionNo: this.cndnData.oldTransactionNo,
      })
      if (Utils.isNull(this.formGroup.value.id) || Utils.isNull(this.formGroup.value.customerCode)) {
        this.onBack();
      }
    }
  }

  ngAfterViewInit(): void {
  }

  // ================= Action =============================
  onChangeCnDn(event) {
    this.formGroup.get("cnDn").patchValue(event.target.value);
  }

  callulateMoney() {
    let oldTotalAmount = NumberUtils.decimalFormatToNumber(this.formGroup.get('oldTotalAmount').value);
    let totalAmount = NumberUtils.decimalFormatToNumber(this.formGroup.get('amount').value) * 1.07;
    this.formGroup.patchValue({
      totalAmount: NumberUtils.numberToDecimalFormat(totalAmount)
    });
    if (this.formGroup.value.cnDn === 'DN') {
      this.formGroup.patchValue({
        totalAfter: NumberUtils.numberToDecimalFormat(oldTotalAmount + totalAmount)
      });
    } else {
      this.formGroup.patchValue({
        totalAfter: NumberUtils.numberToDecimalFormat(oldTotalAmount - totalAmount)
      });
    }
  }

  onOpenModalSave() {
    let validateData = [
      { format: "", header: "ลด/เพิ่มหนี้", value: this.formGroup.get("cnDn").value },
      { format: "", header: "จำนวนเงิน", value: this.formGroup.get("amount").value },
    ];
    if (this.validate.checking(validateData)) {
      if (this.formGroup.invalid) {
        this.modalError.openModal("กรุณากรอกข้อมูลให้ครบ");
      } else {
        this.modalSave.openModal();
      }
    }
  }

  onBack() {
    if (Utils.isNotNull(this.path)) {
      this.router.navigate([this.path]);
    } else {
      this.router.navigate(["/cndn/cndn001"]);
    }
  }

  // ===================== call back-end ===============
  callSave() {
    let oldTotalAmount = NumberUtils.decimalFormatToNumber(this.formGroup.get('oldTotalAmount').value);
    let totalAmount = NumberUtils.decimalFormatToNumber(this.formGroup.get('totalAmount').value);
    this.formGroup.patchValue({
      oldTotalAmount: oldTotalAmount,
      totalAmount: totalAmount
    })
    this.ajax.doPost(URL.SAVE, this.formGroup.value).subscribe((res: ResponseData<any>) => {
      if (MessageService.MSG.SUCCESS == res.status) {
        this.modalSuccess.openModal();
        this.sapStatus = res.data.status;
        this.sapError = JSON.stringify(res.data.sapARResponseFail);
        this.path = "/cndn/cndn001"
        this.onBack();
      } else {
        this.modalError.openModal(res.message);
      }
    });
  }

  onClickSapErr() {
    this.modalError.openModal(MessageService.SAP.getMsgErr(this.sapError));
  }

  findById() {
    this.ajax.doPost(URL.FIND_ID, this.formGroup.value).subscribe((res: ResponseData<any>) => {
      if (MessageService.MSG.SUCCESS == res.status) {
        this.formGroup.patchValue({
          cnDnId: res.data.cnDnId,
          customerCode: res.data.customerCode,
          customerName: res.data.customerName,
          customerBranch: res.data.customerBranch,
          contractNo: res.data.contractNo,
          requestType: res.data.requestType,
          docType: res.data.docType,
          sapType: res.data.sapType,
          glAccount: res.data.glAccount,
          oldInvoiceNo: res.data.oldInvoiceNo,
          oldReceiptNo: res.data.oldReceiptNo,
          oldTotalAmount: NumberUtils.numberToDecimalFormat(res.data.oldTotalAmount),
          cnDn: res.data.cnDn,
          amount: res.data.amount,
          remark: res.data.remark,
          totalAmount: NumberUtils.numberToDecimalFormat(res.data.totalAmount),
          transactionNo: res.data.transactionNo,
          oldTransactionNo: res.data.oldTransactionNo,
        })
        //calculate total after update
        let oldTotalAmount = NumberUtils.decimalFormatToNumber(this.formGroup.value.oldTotalAmount);
        let totalAmount = NumberUtils.decimalFormatToNumber(this.formGroup.value.totalAmount);
        if (this.formGroup.value.cnDn === 'DN') {
          this.formGroup.patchValue({
            totalAfter: NumberUtils.numberToDecimalFormat(oldTotalAmount + totalAmount)
          });
        } else {
          this.formGroup.patchValue({
            totalAfter: NumberUtils.numberToDecimalFormat(oldTotalAmount - totalAmount)
          });
        }
        //checked radio
        $("input[name='inlineRadioOptions']").prop("checked", this.formGroup.value.cnDn);
        //set status error from sap
        this.sapStatus = res.data.sapStatus;
        this.sapError = res.data.sapError;
      } else {
        this.modalError.openModal(res.message);
        this.onBack();
      }
    });
  }

}
