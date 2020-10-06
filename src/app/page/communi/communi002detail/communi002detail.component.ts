import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonService } from 'src/app/_service/ common.service';
import { FormBuilder, FormGroup, FormArray } from '@angular/forms';
import { BsModalService } from 'ngx-bootstrap/modal';
import { ValidateService } from 'src/app/_service/validate.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Communi002detailService } from './communi002detail.service';
import { MessageService } from 'src/app/_service/message.service';
import { ResponseData } from 'src/app/common/models/response-data.model';
import { ModalConfirmComponent } from 'src/app/components/modal/modal-confirm/modalConfirm.component';
import { ModalSuccessComponent } from 'src/app/components/modal/modal-success/modalSuccess.component';
import { ModalErrorComponent } from 'src/app/components/modal/modal-error/modalError.component';
import { COMMUNI_CONSTANT } from 'src/app/common/constant/communicate.constant';
import { Location } from '@angular/common';

@Component({
  selector: 'app-communi002detail',
  templateUrl: './communi002detail.component.html',
  styleUrls: ['./communi002detail.component.css'],
  providers: [Communi002detailService]
})
export class Communi002detailComponent implements OnInit {
  breadcrumb: any = [
    {
      label: "หมวดสื่อสาร",
      link: "/home/communi",
    },
    {
      label: "รายการยกเลิกการใช้วิทยุมือถือ",
      link: "#"
    },
  ];
  @ViewChild('saveModal') saveModal: ModalConfirmComponent;
  @ViewChild('successModal') modalSuccess: ModalSuccessComponent;
  @ViewChild('errorModal') modalError: ModalErrorComponent;

  /* form */
  formCancel = new FormGroup({});
  mobileSerialNoList: FormArray = new FormArray([]);

  /* constant */
  paymentTypeConst = ['CASH', 'BANK_GUARANTEE'];

  /* flag */
  flag: string = '';

  constructor(
    private commonService: CommonService,
    private fb: FormBuilder,
    private selfService: Communi002detailService,
    private modalService: BsModalService,
    private validate: ValidateService,
    private router: Router,
    private route: ActivatedRoute,
    private location: Location
  ) {
    this.initialVariable();
  }

  ngOnInit() {
    const id = this.route.snapshot.queryParams["param1"] || null;
    this.flag = this.route.snapshot.queryParams["param2"] || null;
    if (id) {
      this.selfService.findById(id).subscribe((response: ResponseData<any>) => {
        if (MessageService.MSG.SUCCESS === response.status) {
          this.patchData(response.data);
        } else {
          this.modalError.openModal(response.message);
        }
      });
    }
  }

  ngAfterViewInit(): void {
    // $('select').selectpicker();
  }

  update() {
    const validateData = this.validator();
    if (!this.validate.checking(validateData)) {
      return;
    }
    this.selfService.update(this.setFormSave()).subscribe((response: ResponseData<any>) => {
      if (MessageService.MSG.SUCCESS === response.status) {
        this.modalSuccess.openModal();
        this.routeTo('communi/communi002');
      } else {
        this.modalError.openModal(response.message);
      }
    });
  }

  validator() {
    const validateData = [
      { format: '', header: 'เงินประกันค่าเช่าวิทยุมือถือ', value: this.control('insuranceRates').value },
      { format: '', header: 'วันที่ยกเลิกใช้บริการ', value: this.control('cancelDateStr').value },
    ];
    return validateData;
  }

  setFormSave(): FormGroup {
    return this.fb.group({
      id: [this.control('id').value],
      // mobileSerialNo: [this.control('mobileSerialNo').value || null, { disabled: true }],
      cancelDateStr: [this.control('cancelDateStr').value || null],
      remark: [this.control('remark').value || null, { disabled: true }],
      insuranceRates: [this.control('insuranceRates').value || null],
    });
  }

  setDate(e, control: string) {
    this.formCancel.get(control).patchValue(e);
    switch (control) {
      case 'cancelDateStr':
        this.formCancel.get('endDateStr').patchValue(e);
        break;
    }
  }

  confirm(CASE: string) {
    switch (CASE) {
      case 'UPDATE':
        this.saveModal.openModal(); break;
    }
  }

  routeTo(path: string, param?) {
    this.router.navigate([path]);
  }

  patchData(data: any) {
    this.control('id').patchValue(data.id);
    this.control('entreprenuerCode').patchValue(data.entreprenuerCode);
    this.control('entreprenuerName').patchValue(data.entreprenuerName);
    this.control('phoneAmount').patchValue(data.phoneAmount);
    this.control('contractNo').patchValue(data.contractNo);
    // this.control('mobileSerialNo').patchValue(data.mobileSerialNo);
    this.control('chargeRates').patchValue(data.chargeRates);
    this.control('insuranceRates').patchValue(data.insuranceRates);
    this.control('totalChargeRates').patchValue(data.totalChargeRates);
    this.control('remark').patchValue(data.remark);
    this.control('airport').patchValue(data.airport);
    this.control('customerBranch').patchValue(data.customerBranch);
    this.control('serviceType').patchValue(data.serviceType);
    // this.mobileSerialNoList = this.control('mobileSerialNoList') as FormArray;
    // data.details.forEach(element => {
    //   this.mobileSerialNoList.push(
    //     this.fb.group({
    //       mobileSerialNo: [element.mobileSerialNo]
    //     })
    //   );
    // });
    this.control('requestDateStr').patchValue(data.requestDateStr);
    this.control('endDateStr').patchValue(data.endDateStr);
    this.control('paymentTypeConst').patchValue(data.paymentType);
    switch (data.paymentType) {
      case COMMUNI_CONSTANT.PAYMENT_TYPE.CASH.DESC_EN:
        this.control('paymentType').patchValue(COMMUNI_CONSTANT.PAYMENT_TYPE.CASH.DESC_TH);
        break;
      case COMMUNI_CONSTANT.PAYMENT_TYPE.BANK_GUARANTEE.DESC_EN:
        this.control('paymentType').patchValue(COMMUNI_CONSTANT.PAYMENT_TYPE.BANK_GUARANTEE.DESC_TH);
        break;
    }
    this.control('bankName').patchValue(data.bankName);
    this.control('bankBranch').patchValue(data.bankBranch);
    this.control('bankExplanation').patchValue(data.bankExplanation);
    this.control('bankGuaranteeNo').patchValue(data.bankGuaranteeNo);
    this.control('bankExpNoStr').patchValue(data.bankExpNoStr);
    switch (this.flag) {
      case 'R':
        this.formCancel.get('cancelDateStr').patchValue(data.cancelDateStr);
        this.formCancel.disable();
        // this.formCancel.get('insuranceRates').disable();
        break;
      default:
        break;
    }
  }

  backPage() {
    this.location.back();
  }

  control(control: string) {
    return this.formCancel.get(control);
  }

  initialVariable() {
    this.formCancel = this.fb.group({
      id: [{ value: '', disabled: true }],
      entreprenuerCode: [{ value: '', disabled: true }],
      entreprenuerName: [{ value: '', disabled: true }],
      phoneAmount: [{ value: '', disabled: true }],
      contractNo: [{ value: '', disabled: true }],
      // mobileSerialNoList: this.fb.array([]),
      // mobileSerialNo: [0, {disabled: true}],
      chargeRates: [{ value: '', disabled: true }],
      insuranceRates: [''],
      totalChargeRates: [{ value: '', disabled: true }],
      remark: [{ value: '', disabled: true }],
      airport: [{ value: '', disabled: true }],
      customerBranch: [{ value: '', disabled: true }],
      // requestDate: ['', {disabled: true}],
      requestDateStr: [{ value: '', disabled: true }],
      cancelDateStr: [''],
      endDateStr: [{ value: '', disabled: true }],
      paymentType: [{ value: '', disabled: true }],
      paymentTypeConst: [{ value: '', disabled: true }],
      bankName: [{ value: '', disabled: true }],
      bankBranch: [{ value: '', disabled: true }],
      bankExplanation: [{ value: '', disabled: true }],
      bankGuaranteeNo: [{ value: '', disabled: true }],
      bankExpNoStr: [{ value: '', disabled: true }],
      serviceType: [{ value: '', disabled: true }],
    });
  }
}
