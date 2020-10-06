import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { CommonService } from 'src/app/_service/ common.service';
import { AjaxService } from 'src/app/_service/ajax.service';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { ValidateService } from 'src/app/_service/validate.service';
import { Router, ActivatedRoute } from '@angular/router';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { Communi001DetailSrevice } from './communi001detail.service';
import { ResponseData } from 'src/app/common/models/response-data.model';
import { MessageService } from 'src/app/_service/message.service';
import { ModalConfirmComponent } from 'src/app/components/modal/modal-confirm/modalConfirm.component';
import { ModalSuccessComponent } from 'src/app/components/modal/modal-success/modalSuccess.component';
import { ModalErrorComponent } from 'src/app/components/modal/modal-error/modalError.component';
import { NumberUtils } from 'src/app/common/helper/number';
import { ToastrService } from 'ngx-toastr';
import { COMMUNI_CONSTANT } from 'src/app/common/constant/communicate.constant';
import { DropdownOrListService } from 'src/app/_service/dropdown-list.service';
import { InputCalendarComponent } from 'src/app/components/input/input-calendar/input-calendar.component';
import { Location } from '@angular/common';

declare var $: any;
@Component({
  selector: 'app-communi001detail',
  templateUrl: './communi001detail.component.html',
  styleUrls: ['./communi001detail.component.css'],
  providers: [Communi001DetailSrevice]
})
export class Communi001detailComponent implements OnInit {
  @ViewChild('saveModal') saveModal: ModalConfirmComponent;
  @ViewChild('successModal') modalSuccess: ModalSuccessComponent;
  @ViewChild('errorModal') modalError: ModalErrorComponent;
  @ViewChild('calendarEnd') calendarEnd: InputCalendarComponent;
  breadcrumb: any = [
    { label: "หมวดสื่อสาร", link: "/home/communi" },
    { label: "ขอใช้วิทยุมือถือ", link: "#", },
  ];
  modalRef: BsModalRef;
  cusList: any[] = [];
  contractNoList: any[] = [];
  dataTable: any;

  /* dropdown */
  paymentTypeList: any[] = [];
  roList: any = [];

  /* form */
  formSave = new FormGroup({});
  mobileSerialNoList: FormArray = new FormArray([]);
  formSearchCus: FormGroup = new FormGroup({});
  // serviceTypeList: any[] = [];

  /* constant */
  paymentTypeConst = ['CASH', 'BANK_GUARANTEE'];
  chargeRateConst: number = 0;
  read: boolean = false;

  constructor(
    private fb: FormBuilder,
    private selfService: Communi001DetailSrevice,
    private modalService: BsModalService,
    private validate: ValidateService,
    private router: Router,
    private route: ActivatedRoute,
    private dropdown: DropdownOrListService,
    private location: Location
  ) { }

  ngOnInit() {
    this.initialVariable();
    this.getDropdown();
    const id = this.route.snapshot.queryParams['id'] || null;
    const transReq = this.route.snapshot.queryParams['transReq'] || null;
    this.route.snapshot.queryParams['read'] ? this.read = true : this.read = false;
    if (id) {
      this.selfService.findById(id).subscribe((response: ResponseData<any>) => {
        if (MessageService.MSG.SUCCESS === response.status) {
          this.patchData(response.data);
        } else {
          this.modalError.openModal(response.message);
        }
      });
    } else if (transReq) {
      this.selfService.findByTransNo(transReq).subscribe((response: ResponseData<any>) => {
        if (MessageService.MSG.SUCCESS === response.status) {
          this.patchData(response.data);
        } else {
          this.modalError.openModal(response.message);
        }
      });
    }
  }

  openModalCustom(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, { class: 'modal-xl' });
    this.formSearchCus.reset();
    this.getCustomerList();
  }

  getCustomerList() {
    this.dropdown.getCustomerList(this.formSearchCus.value).subscribe((response: ResponseData<any>) => {
      if (MessageService.MSG.SUCCESS === response.status) {
        this.cusList = response.data;
        this.datatable();
        this.clickTdBtn();
      }
    });
  }

  getContractNo(partner: string, branchCode: string) {
    this.dropdown.getContractNo(partner, branchCode).subscribe((response: ResponseData<any>) => {
      if (MessageService.MSG.SUCCESS === response.status) {
        this.contractNoList = response.data;
      }
    });
  }

  backPage() {
    this.location.back();
  }

  getDropdown() {
    this.dropdown.getParamsLov('PAYMENT_TYPE').subscribe((response: ResponseData<any>) => { this.paymentTypeList = response.data });
  }

  addMobileSerialNo(loop: boolean = false) {
    /* */
    // this.onBlur();
    if (!loop) {
      this.formSave.get('phoneAmount').patchValue(Number(this.formSave.get('phoneAmount').value) + 1);
      this.calculateFollowPhoneAmount();
    }
    this.mobileSerialNoList = this.formSave.get('mobileSerialNoList') as FormArray;
    // const index = this.mobileSerialNoList.controls.length;
    this.mobileSerialNoList.push(this.fb.group({
      mobileSerialNo: ['']
    }));
  }

  removeMobileSerialNo(loop: boolean = false, index?: number) {
    if (!loop) {
      this.formSave.get('phoneAmount').patchValue(Number(this.formSave.get('phoneAmount').value) - 1);
      this.calculateFollowPhoneAmount();
    }
    this.mobileSerialNoList = this.formSave.get('mobileSerialNoList') as FormArray;
    this.mobileSerialNoList.removeAt(index);
  }

  onBlur() {
    /* ____________ input dynamic  ____________*/
    let sum: number = this.control('phoneAmount').value - this.control('mobileSerialNoList').value.length;
    for (let i = 0; i < Math.abs(sum); i++) {
      if (sum >= 0) {
        this.addMobileSerialNo(true);
      } else {
        this.removeMobileSerialNo(true, this.control('mobileSerialNoList').value.length - 1);
      }
    }

    /* ____________ calculate  ____________*/
    this.calculateFollowPhoneAmount();
  }

  calculateFollowPhoneAmount() {
    /* ____________ ค่าเช่าวิทยุมือถือ = จำนวนวิทยุมือถือ*อัตรค่าภาระ(from query)  ____________*/
    this.control('chargeRates').patchValue(NumberUtils.numberToDecimalFormat(this.control('phoneAmount').value * this.chargeRateConst));

    /* ____________ รวมเงินประกัน = จำนวนวิทยุมือถือ*เงินประกันค่าเช่าวิทยุมือถือ  ____________*/
    let insuranceRates: number = NumberUtils.decimalFormatToNumber(this.control('insuranceRates').value);
    this.control('totalChargeRates').patchValue(NumberUtils.numberToDecimalFormat(this.control('phoneAmount').value * insuranceRates));
  }

  getRentalAreaList(contractNo: string) {
    /* _________ default value _________ */
    this.roList = [];
    this.formSave.patchValue({
      roNumber: null,
      roName: null,
      endDateStr: null
    });

    if (contractNo) {
      /* _________ set end date _________ */
      const filterRes = this.contractNoList.filter(data => data.contractNo == contractNo)[0];
      if (filterRes) {
        this.control('endDateStr').patchValue(filterRes.bpValidTo);
        this.calendarEnd.setDate(this.formSave.get('endDateStr').value);
      }

      /* _________ set rental area _________ */
      this.dropdown.getRentalArea(contractNo).subscribe((response: ResponseData<any>) => this.roList = response.data);
    }
  }

  roChange(roName: string) {
    if (roName) {
      const filterRes = this.roList.filter(data => data.roName == roName)[0];
      this.control('roNumber').patchValue(filterRes.roNumber);
      this.control('roName').patchValue(filterRes.roName);
    }
  }

  setEndDate(e, control: string) {
    this.formSave.get(control).patchValue(e);
  }

  datatable() {
    if (this.dataTable != null) {
      this.dataTable.destroy();
    }
    this.dataTable = $('#datatable').DataTable({
      processing: true,
      serverSide: false,
      searching: false,
      ordering: false,
      paging: true,
      scrollX: true,
      data: this.cusList,
      columns: [
        {
          data: 'customerCode', className: 'text-left'
        },
        {
          data: 'customerName', className: 'text-left'
        },
        {
          data: 'adrKind', className: 'text-left'
        },
        {
          data: 'customerName', className: 'text-left'
        },
        {
          className: 'text-center',
          render(data, type, row, meta) {
            return `<button class="btn btn-primary btn-sm" type="button" id="customer">เลือก</button>`;
          }
        },
      ],
    });
  }

  clickTdBtn = () => {
    this.dataTable.on('click', 'td > #customer', (event) => {
      /* _________ default value _________ */
      this.roList = [];
      this.contractNoList = [];
      this.formSave.patchValue({
        contractNo: null,
        roNumber: null,
        roName: null,
        endDateStr: null
      });

      /* _________ update value _________ */
      const data = this.dataTable.row($(event.currentTarget).closest('tr')).data();
      this.formSave.patchValue({
        entreprenuerCode: data.customerCode,
        entreprenuerName: data.customerName,
        customerBranch: `${data.adrKind} : ${data.address}`
      });
      this.getContractNo(data.partner, data.adrKind);
      this.onCloseModal();
    });
  }

  onCloseModal() {
    this.modalRef.hide();
  }

  save() {
    const validateData = this.validator();
    if (!this.validate.checking(validateData)) {
      return;
    }

    this.selfService.save(this.formSave).subscribe((response: ResponseData<any>) => {
      if (MessageService.MSG.SUCCESS === response.status) {
        this.modalSuccess.openModal();
        this.routeTo('communi/communi001');
      } else {
        this.modalError.openModal(response.message);
      }
    });
  }

  validator() {
    const validateData = [
      { format: '', header: 'รหัสผู้ประกอบการ', value: this.control('entreprenuerCode').value },
      { format: '', header: 'ชื่อผู้ประกอบการ', value: this.control('entreprenuerName').value },
      // { format: '', header: 'ประเภทบริการ', value: this.control('serviceType').value },
      { format: '', header: 'จำนวนวิทยุมือถือ', value: this.control('phoneAmount').value },
      { format: '', header: 'วันที่ขอใช้บริการ', value: this.control('requestDateStr').value },
      { format: '', header: 'วิธีชำระเงินประกัน', value: this.control('paymentType').value }
    ];

    // this.mobileSerialNoList = this.control('mobileSerialNoList') as FormArray;
    /* check details */
    for (let i = 0; i < this.mobileSerialNoList.value.length; i++) {
      validateData.push(
        { format: '', header: `รหัสเครื่องที่ ${i + 1}`, value: this.mobileSerialNoList.at(i).get('mobileSerialNo').value }
      );
    }

    if (COMMUNI_CONSTANT.PAYMENT_TYPE.BANK_GUARANTEE.DESC_EN === this.control('paymentType').value) {
      validateData.push(
        { format: '', header: 'ชื่อธนาคาร', value: this.control('bankName').value },
        { format: '', header: 'สาขา', value: this.control('bankBranch').value },
        { format: '', header: 'คำอธิบาย', value: this.control('bankExplanation').value },
        { format: '', header: 'Bank guarantee', value: this.control('bankGuaranteeNo').value },
        { format: '', header: 'วันหมดอายุ', value: this.control('bankExpNoStr').value },
      )
    }
    return validateData;
  }

  routeTo(path: string, param?) {
    this.router.navigate([path]);
  }

  calendarChange(dateStr, control: string) {
    this.formSave.get(control).patchValue(dateStr);
    switch (control) {
      case 'requestDateStr':
        this.selfService.getChargeRatesConfig(dateStr).subscribe((response: ResponseData<any>) => {
          if (MessageService.MSG.SUCCESS === response.status) {
            let configCharge = response.data;
            this.chargeRateConst = configCharge ? configCharge.chargeRate : 0;
            // this.control('chargeRates').patchValue();
            this.control('insuranceRates').patchValue(configCharge ? configCharge.insuranceFee : 0);
            this.calculateFollowPhoneAmount();
          }
        });
        break;
    }
  }

  confirm(CASE: string) {
    switch (CASE) {
      case 'SAVE':
        this.saveModal.openModal();
        break;
    }
  }

  control(control: string) {
    return this.formSave.get(control);
  }

  initialVariable() {
    this.formSave = this.fb.group({
      id: [null],
      entreprenuerCode: [''],
      entreprenuerName: [''],
      phoneAmount: [0],
      contractNo: [''],
      mobileSerialNoList: this.fb.array([]),
      mobileSerialNo: [''],
      chargeRates: [{ value: 0, disabled: true }],
      insuranceRates: [0],
      totalChargeRates: [0],
      remark: [''],
      customerBranch: [''],
      requestDateStr: [''],
      endDateStr: [''],
      // paymentTypeConst: [{ value: '', disabled: true }],
      paymentType: [''],
      bankName: [''],
      bankBranch: [''],
      bankExplanation: [''],
      bankGuaranteeNo: [''],
      bankExpNo: [''],
      bankExpNoStr: [''],
      serviceType: [''],
      roName: [''],
      roNumber: [''],
    });

    this.formSearchCus = this.fb.group({
      type: [null],
      criteria: [null]
    });
  }

  patchData(data: any) {
    this.control('id').patchValue(data.id);
    this.control('entreprenuerCode').patchValue(data.entreprenuerCode);
    this.control('entreprenuerName').patchValue(data.entreprenuerName);
    this.control('phoneAmount').patchValue(data.phoneAmount);
    for (let i = 0; i < data.details.length; i++) {
      this.setListDetail(data.details[i]);
    };
    this.control('contractNo').patchValue(data.contractNo);
    this.control('chargeRates').patchValue(data.chargeRatesDF);
    this.control('insuranceRates').patchValue(data.insuranceRatesDF);
    this.control('totalChargeRates').patchValue(data.totalChargeRatesDF);
    this.control('remark').patchValue(data.remark);
    this.control('roName').patchValue(data.roName);
    this.control('customerBranch').patchValue(data.customerBranch);
    this.control('serviceType').patchValue(data.serviceType);
    this.control('paymentType').patchValue(data.paymentType);
    this.control('bankName').patchValue(data.bankName);
    this.control('bankBranch').patchValue(data.bankBranch);
    this.control('bankExplanation').patchValue(data.bankExplanation);
    this.control('bankGuaranteeNo').patchValue(data.bankGuaranteeNo);
    this.control('bankExpNo').patchValue(data.bankExpNoStr);
    if (this.read) {
      this.control('requestDateStr').patchValue(data.requestDateStr);
      this.control('endDateStr').patchValue(data.endDateStr);
      // console.log(" this.formSave.get('paymentType'): ", this.formSave.get('paymentType').value);

      // setTimeout(() => {
      //   this.formSave.get('paymentType').disable();
      //   setTimeout(() => {
      //     console.log(" this.formSave.get('paymentType'): ", this.formSave.get('paymentType').value);
      //   }, 1000);

      // }, 2000);
    } else {
      this.calendarEnd.setDate(this.formSave.get('endDateStr').value);
    }
  }

  setListDetail(value) {
    this.mobileSerialNoList = this.formSave.get('mobileSerialNoList') as FormArray;
    let pathData = this.fb.group({
      id: [''],
      mobileSerialNo: [''],
      idHdr: ['']
    });
    pathData.patchValue(value);
    this.mobileSerialNoList.push(pathData);
  }

}
