import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormArray, FormBuilder } from '@angular/forms';
import { Utils } from 'src/app/common/helper';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { AjaxService } from 'src/app/_service/ajax.service';
import { ValidateService } from 'src/app/_service/validate.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MessageService } from 'src/app/_service/message.service';
import { COMMUNI_CONSTANT } from 'src/app/common/constant/communicate.constant';
import { ModalConfirmComponent } from 'src/app/components/modal/modal-confirm/modalConfirm.component';
import { ModalErrorComponent } from 'src/app/components/modal/modal-error/modalError.component';
import { ResponseData } from 'src/app/common/models/response-data.model';
import { Location } from '@angular/common';

declare var $: any;

const URL = {
  SAVE: "communicate005/save",
  GET_BY_ID: "communicate004/get-by-id/",
};

@Component({
  selector: 'app-communi005detail',
  templateUrl: './communi005detail.component.html',
  styleUrls: ['./communi005detail.component.css']
})
export class Communi005detailComponent implements OnInit {
  @ViewChild('saveModal') modalSave: ModalConfirmComponent;
  @ViewChild('errorModal') modalError: ModalErrorComponent;
  @ViewChild('modalRemark') modalRemark: ModalConfirmComponent;

  breadcrumb: any = [
    {
      label: "หมวดสื่อสาร",
      link: "/home/communi",
    },
    {
      label: "รายการยกเลิกการใช้บริการข้อมูลตารางการบิน",
      link: "#",
    }
  ];

  //formSave
  formSave: FormGroup;

  //sum
  amountLg: any = 0;
  amountMonth: any = 0;

  // remarkStr
  remarkStr: string = '';

  // query params
  id: any;
  flag: string = '';

  constructor(
    private fb: FormBuilder,
    private modalService: BsModalService,
    private ajax: AjaxService,
    private validate: ValidateService,
    private router: Router,
    private route: ActivatedRoute,
    private location: Location
  ) {
  }

  ngOnInit() {
    this.formData();
    this.id = this.route.snapshot.queryParams['id'] || '';
    this.flag = this.route.snapshot.queryParams['flag'] || '';
    if (Utils.isNotNull(this.id)) {
      this.getData();
    }
  }

  backPage() {
    this.location.back();
  }

  //======================= Form DATA =======================
  formData() {
    this.formSave = this.fb.group({
      id: [''],
      entreprenuerCode: [''], //รหัสผู้ประกอบการ
      entreprenuerName: [''], //ชื่อผู้ประกอบการ
      contractNo: [''], // เลขที่สัญญา
      customerBranch: [''],// สาขา
      rentalAreaCode: [''],//รหัสพื้นที่เช่า
      rentalAreaName: [''],//พื้นที่เช่า
      requestDateStr: [''],// วันที่ขอใช้บริการ
      endDateStr: [''],// วันที่สิ้นสุดขอใช้บริการ
      cancelDateStr: [''],// วันที่ยกเลิกขอใช้บริการ
      remark: [''],//หมายเหตุ 
      airport: [''],//airport
      paymentType: [''], //วิธีชำระเงินประกัน
      paymentTypeShow: [''], //วิธีชำระเงินประกันไว้แสดงผล
      bankName: [''], //ชื่อธนาคาร
      bankBranch: [''], //สาขา 
      bankExplanation: [''],//คำอธิบาย
      bankGuaranteeNo: [''],//Bank guarantee
      bankExpNo: [''], //วันหมดอายุ

      amountLg: [''], //ผลรวมเงินประกัน
      amountMonth: [''], //ผลรวมค่าบริการรายเดือน
      transactionNo: ['']
    });

  }

  //======================= Form List =======================

  //======================= ACTION =========================

  async onValidate() {
    let validateData;
    validateData = [
      { format: '', header: 'วันที่ยกเลิกใช้บริการ', value: this.formSave.value.cancelDateStr }
    ];

    if (!this.validate.checking(validateData)) {
      return;
    }
    if (this.formSave.valid) {
      this.modalSave.openModal();
      return;
    }

  }


  onPages = () => {
    this.router.navigate(["/communi/communi005"], {});
  }

  onSave() {
    this.save();

  }


  setDate(e, control: string) {
    this.formSave.get(control).patchValue(e);
    switch (control) {
      case 'cancelDateStr':
        this.formSave.get('endDateStr').patchValue(e);
        break;
    }
  }

  //===================== call back-end ==================
  //get data by id
  async getData() {
    this.ajax.doGet(URL.GET_BY_ID + this.id).subscribe(res => {
      if (MessageService.MSG.SUCCESS === res.status) {
        this.formSave.get('id').patchValue(this.id);
        this.formSave.get('transactionNo').patchValue(res.data.transactionNo);
        this.formSave.get('entreprenuerCode').patchValue(res.data.entreprenuerCode);
        this.formSave.get('entreprenuerName').patchValue(res.data.entreprenuerName);
        this.formSave.get('customerBranch').patchValue(res.data.customerBranch);
        this.formSave.get('contractNo').patchValue(res.data.contractNo);
        this.formSave.get('rentalAreaName').patchValue(res.data.rentalAreaName);

        //patch paymentTypeShow
        if (COMMUNI_CONSTANT.PAYMENT_TYPE.CASH.DESC_EN === res.data.paymentType) {
          this.formSave.get('paymentTypeShow').patchValue(COMMUNI_CONSTANT.PAYMENT_TYPE.CASH.DESC_TH);
        } else {
          this.formSave.get('paymentTypeShow').patchValue(COMMUNI_CONSTANT.PAYMENT_TYPE.BANK_GUARANTEE.DESC_TH);
        }
        this.formSave.get('paymentType').patchValue(res.data.paymentType);
        this.formSave.get('requestDateStr').patchValue(res.data.requestDateStr);
        this.formSave.get('endDateStr').patchValue(res.data.endDateStr);
        this.formSave.get('remark').patchValue(res.data.remark);
        this.formSave.get('airport').patchValue(res.data.airport);
        this.formSave.get('bankName').patchValue(res.data.bankName);
        this.formSave.get('bankBranch').patchValue(res.data.bankBranch);
        this.formSave.get('bankExplanation').patchValue(res.data.bankExplanation);
        this.formSave.get('bankGuaranteeNo').patchValue(res.data.bankGuaranteeNo);
        this.formSave.get('bankExpNo').patchValue(res.data.bankExpNoStr);
        this.formSave.get('amountLg').patchValue(res.data.amountLgDF);
        this.formSave.get('amountMonth').patchValue(res.data.amountMonthDF);
        this.formSave.get('transactionNo').patchValue(res.data.transactionNo);

        switch (this.flag) {
          case 'R':
            this.formSave.disable();
            break;
          default:
            break;
        }
      } else {
        this.modalError.openModal(MessageService.MSG.FAILED_CALLBACK);
      }
    }, (err) => {
      this.modalError.openModal(err);
    });
  }

  save() {
    this.ajax.doPost(URL.SAVE, this.formSave.value).subscribe((res: ResponseData<any>) => {
      if (MessageService.MSG.SUCCESS === res.status) {
        this.onPages();
      } else {
      }
    });
  }

}
