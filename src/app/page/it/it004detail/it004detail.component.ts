import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { It004DetailSrevice } from './it004detail.service';
import { ResponseData } from 'src/app/common/models/response-data.model';
import { MessageService } from 'src/app/_service/message.service';
import { ModalConfirmComponent } from 'src/app/components/modal/modal-confirm/modalConfirm.component';
import { ModalSuccessComponent } from 'src/app/components/modal/modal-success/modalSuccess.component';
import { ModalErrorComponent } from 'src/app/components/modal/modal-error/modalError.component';
import { Utils } from 'src/app/common/helper';
import { CommonService } from 'src/app/_service/ common.service';
import { AjaxService } from 'src/app/_service/ajax.service';
import { InputCalendarComponent } from 'src/app/components/input/input-calendar/input-calendar.component';
import { ValidateService } from 'src/app/_service/validate.service';
import { NumberUtils } from 'src/app/common/helper/number';


declare var $: any;
@Component({
  selector: 'app-it004detail',
  templateUrl: './it004detail.component.html',
  styleUrls: ['./it004detail.component.css'],
  providers: [It004DetailSrevice]
})
export class It004detailComponent implements OnInit {
  @ViewChild('saveModal') saveModal: ModalConfirmComponent;
  @ViewChild('successModal') modalSuccess: ModalSuccessComponent;
  @ViewChild('errorModal') modalError: ModalErrorComponent;
  @ViewChild('calendar') calendar: InputCalendarComponent;
  breadcrumb: any = [
    { label: "หมวด IT", link: "/home/it" },
    { label: "ขอใช้บริการ IT อื่นๆ", link: "#", },
  ];
  modalRef: BsModalRef;
  cusList: any[] = [];
  contractNoList: any[] = [];
  roList: any[] = [];
  dataTable: any;

  /* dropdown */
  otherTypeList: any[] = [];
  paymentTypeList: any[] = [];

  /* form */
  formSave = new FormGroup({});
  mobileSerialNoList: FormArray = new FormArray([]);
  formSearchCus: FormGroup = new FormGroup({});

  /* constant */
  paymentTypeConst = ['CASH', 'BANK_GUARANTEE', 'BILLING'];
  wordingPayment: boolean = false;
  flagEdit: boolean = false;

  constructor(
    private fb: FormBuilder,
    private selfService: It004DetailSrevice,
    private route: ActivatedRoute,
    private ajax: AjaxService,
    private commonService: CommonService,
    private modalService: BsModalService,
    private router: Router,
    private validate: ValidateService
  ) {
    this.formSearchCus = this.fb.group({
      type: [''],
      criteria: ['']
    });
  }

  async ngOnInit() {

    await this.initialVariable();
    this.formSave.get('itOtherCreateInvoiceId').patchValue(this.route.snapshot.queryParams['itOtherCreateInvoiceId']);
    if (Utils.isNotNull(this.formSave.get('itOtherCreateInvoiceId').value)) {
      this.findById(this.formSave.get('itOtherCreateInvoiceId').value);
      this.flagEdit = true;
    }
    this.getDropdown();
  }

  openModalCustom(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, { class: 'modal-xl' });
    this.formSearchCus.reset();
    this.getCustomerList();
  }

  getCustomerList() {
    this.formSearchCus.patchValue({ type: 'null' })
    this.selfService.getSapCustomerList(this.formSearchCus.value).subscribe((response: ResponseData<any>) => {
      if (MessageService.MSG.SUCCESS === response.status) {
        this.cusList = response.data;
        this.datatable();
        this.clickTdBtn();
      }
    });
  }

  onValidateBeforeSave() {
    let validateData = [
      { format: "", header: "รหัสผู้ประกอบการ", value: this.formSave.get("entreprenuerCode").value },
      { format: "", header: "ชื่อผู้ประกอบการ", value: this.formSave.get("entreprenuerName").value },
      { format: "", header: "เลขที่สัญญา", value: this.formSave.get("contractNo").value },
      { format: "", header: "วันที่ขอใช้บริการ", value: this.formSave.get("requestStartDate").value },
      { format: "", header: "ประเภทบริการ", value: this.formSave.get("otherType").value },
    ];
    if (this.validate.checking(validateData)) {
      if (this.formSave.invalid) {
        this.modalError.openModal("กรุณากรอกข้อมูลให้ครบ");
      } else {
        this.saveModal.openModal();
      }
    }
  }

  numberFormat(num) {
    return NumberUtils.numberToDecimalFormat(num);
  }

  findById(id) {
    this.commonService.loading();
    let data = {
      itOtherCreateInvoiceId: id
    }
    this.ajax.doPost("it004/find_id", data).subscribe((res: ResponseData<any>) => {
      if (MessageService.MSG.SUCCESS == res.status) {
        this.formSave.get('entreprenuerCode').patchValue(res.data.entreprenuerCode);
        this.formSave.get('entreprenuerName').patchValue(res.data.entreprenuerName);
        this.formSave.get('entreprenuerBranch').patchValue(res.data.entreprenuerBranch);
        this.formSave.get('contractNo').patchValue(res.data.contractNo);
        this.formSave.get('otherType').patchValue(res.data.otherType);
        this.formSave.get('chargeRatesType').patchValue(res.data.chargeRatesType);
        this.formSave.get('chargeRates').patchValue(this.numberFormat(res.data.chargeRates));
        this.formSave.get('totalAmount').patchValue(res.data.totalAmount);
        this.formSave.get('totalChargeRates').patchValue(this.numberFormat(res.data.totalChargeRates));
        this.formSave.get('rentalObject').patchValue(res.data.rentalObject);
        this.formSave.get('airport').patchValue(res.data.airport);
        this.formSave.get('requestStartDate').patchValue(res.data.requestStartDate);
        this.formSave.get('requestEndDate').patchValue(res.data.requestEndDate);
        // this.calendar.setDate(this.formSave.get('requestStartDate').value);
        this.formSave.get('remark').patchValue(res.data.remark);
        this.formSave.get('paymentType').patchValue(res.data.paymentType);
        this.formSave.get('bankName').patchValue(res.data.bankName);
        this.formSave.get('bankBranch').patchValue(res.data.bankBranch);
        this.formSave.get('bankExplanation').patchValue(res.data.bankExplanation);
        this.formSave.get('bankGuaranteeNo').patchValue(res.data.bankGuaranteeNo);
        this.formSave.get('bankExpNo').patchValue(res.data.bankExpNo);
      } else {
        this.modalError.openModal(res.message);
        this.router.navigate(['/it/it004']);
      }
      this.commonService.unLoading();
    })
  }

  getSapContractNo(partner: string, adrKind: string) {
    this.selfService.getSapContractNo(partner + "/" + adrKind).subscribe((response: ResponseData<any>) => {
      if (MessageService.MSG.SUCCESS === response.status) {
        this.contractNoList = response.data;
      }
    });
  }

  onContractNoChange(event) {
    let contractNo = event.target.value;
    this.contractNoList.forEach(element => {
      if (contractNo === element.contractNo) {
        this.ajax.doGet(`common/getUtilityArea/${contractNo}`).subscribe((response: ResponseData<any>) => this.roList = response.data);
        return;
      }
    });
  }

  save() {
    let chargeRates = NumberUtils.decimalFormatToNumber(this.formSave.get('chargeRates').value);
    let totalChargeRates = NumberUtils.decimalFormatToNumber(this.formSave.get('totalChargeRates').value);
    this.formSave.patchValue({
      chargeRates: chargeRates,
      totalChargeRates: totalChargeRates,
    })
    this.selfService.save(this.formSave).subscribe((response: ResponseData<any>) => {
      if (MessageService.MSG.SUCCESS === response.status) {
        this.modalSuccess.openModal();
        this.routeTo('it/it004');
      } else {
        this.modalError.openModal(response.message);
      }
    });
  }

  routeTo(path: string, param?) {
    this.router.navigate([path]);
  }

  setDate(e, control: string) {
    this.formSave.get(control).patchValue(e);
  }

  getDropdown() {
    this.selfService.getParams('PAYMENT_TYPE_IT').subscribe((response: ResponseData<any>) => { this.paymentTypeList = response.data });
    this.selfService.getOtherType().subscribe((response: ResponseData<any>) => { this.otherTypeList = response.data });

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
            return `<button class="btn btn-primary btn-sm" type="button">เลือก</button>`;
          }
        },
      ],
    });
  }

  clickTdBtn = () => {
    this.dataTable.on('click', 'td > button.btn-primary', (event) => {
      const data = this.dataTable.row($(event.currentTarget).closest('tr')).data();
      this.formSave.patchValue({
        entreprenuerCode: data.customerCode,
        entreprenuerName: data.customerName,
        entreprenuerBranch: data.adrKind + " : " + data.address,
      });
      this.getSapContractNo(data.partner, data.adrKind)
      this.onCloseModal();
    });
  }

  onCloseModal() {
    this.modalRef.hide();
  }

  control(control: string) {
    return this.formSave.get(control);
  }

  calculateTotal() {
    let amount = (this.formSave.get("chargeRates").value * this.formSave.get("totalAmount").value);
    let vat = amount * 0.07;
    this.formSave.patchValue({
      totalChargeRates: this.numberFormat(amount + vat)
    });

  }

  setDataForOtherType(e) {
    this.selfService.getParams('PAYMENT_TYPE_IT').subscribe((response: ResponseData<any>) => {
      this.paymentTypeList = response.data;
      if (this.otherTypeList[e.target.selectedIndex - 1].chargeRateType === 'รายครั้ง') {
        this.paymentTypeList.splice(1, 1);
        this.wordingPayment = true;
      } if (this.otherTypeList[e.target.selectedIndex - 1].chargeRateType === 'ค่าประกัน') {
        this.paymentTypeList.splice(2, 1);
        this.wordingPayment = true;
      } else {
        this.paymentTypeList = response.data;
        this.wordingPayment = false;
      }
    });
    this.formSave.patchValue({
      paymentType: "",
      chargeRatesType: this.otherTypeList[e.target.selectedIndex - 1].chargeRateType,
      chargeRates: this.otherTypeList[e.target.selectedIndex - 1].chargeRate.toFixed(2),
    });
    this.calculateTotal();

  }

  initialVariable() {
    this.formSave = this.fb.group({
      itOtherCreateInvoiceId: [],
      entreprenuerCode: ['', Validators.required],
      entreprenuerName: ['', Validators.required],
      entreprenuerBranch: [''],
      contractNo: ['', Validators.required],
      otherType: ['', Validators.required],
      chargeRatesType: [''],
      chargeRates: [],
      totalAmount: [],
      rentalObject: [''],
      totalChargeRates: [],
      remark: [''],
      airport: [''],
      requestStartDate: [''],
      requestEndDate: [''],


      paymentType: [''],
      bankName: [''],
      bankBranch: [''],
      bankExplanation: [''],
      bankGuaranteeNo: [''],
      bankExpNo: [''],
      serviceType: [''],
    });
  }

}
