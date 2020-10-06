import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalCustomComponent } from 'src/app/components/modal/modal-custom/modalCustom.component';
import { ModalConfirmComponent } from 'src/app/components/modal/modal-confirm/modalConfirm.component';
import { ModalSuccessComponent } from 'src/app/components/modal/modal-success/modalSuccess.component';
import { ModalErrorComponent } from 'src/app/components/modal/modal-error/modalError.component';
import { InputCalendarComponent } from 'src/app/components/input/input-calendar/input-calendar.component';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AjaxService } from 'src/app/_service/ajax.service';
import { CommonService } from 'src/app/_service/ common.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ValidateService } from 'src/app/_service/validate.service';
import { MessageService } from 'src/app/_service/message.service';
import { ResponseData } from 'src/app/common/models/response-data.model';
import { Utils } from 'src/app/common/helper';
import { SAP_CONSTANT } from 'src/app/common/constant/SAP.constant';
import * as moment from 'moment';
import { DropdownOrListService } from 'src/app/_service/dropdown-list.service';
import { NumberUtils } from 'src/app/common/helper/number';

const URL = {
  SAVE: "communi003/save",
  GET_SAP_CUS: 'common/getSAPCustumer/',
  GET_SAP_CON_NO: 'common/getSAPContractNo/',
  GET_SERVICE_TYPE_LIST: 'communi0062/get_all',
  FIND_ID: "communi003/find-id",
  GET_RENTAL_AREA: 'common/getUtilityArea/',
  GET_PAY_MEN: 'lov/list-data-detail',

}
@Component({
  selector: 'app-communi003detail',
  templateUrl: './communi003detail.component.html',
  styleUrls: ['./communi003detail.component.css']
})
export class Communi003detailComponent implements OnInit {
  @ViewChild('selectCusModal') modalCustomer: ModalCustomComponent;
  @ViewChild('saveModal') modalSave: ModalConfirmComponent;
  @ViewChild('successModal') modalSuccess: ModalSuccessComponent;
  @ViewChild('errorModal') modalError: ModalErrorComponent;
  @ViewChild('calendarStart') calendarStart: InputCalendarComponent;
  @ViewChild('calendarEnd') calendarEnd: InputCalendarComponent;
  breadcrumb: any = [
    {
      label: "หมวดสื่อสาร",
      link: "/home/communi",
    },
    {
      label: "เพิ่มขอใช้บริการหมวดสื่อสารอื่น ๆ ",
      link: "#",
    },

  ];

  formSearchCus: FormGroup = new FormGroup({});
  formGroup: FormGroup;
  flagEdit: boolean = false;
  dataTableCustomer: any;
  dataListCustomer: any[] = [];
  contractNoList: any[] = [];
  endDateList: any[] = [];
  serviceTypeList: any[] = [];
  roList: any[] = [];

  //paymentType
  paymentTypeList: any[] = [];


  /* constant */
  paymentTypeConst = ['CASH', 'BANK_GUARANTEE'];
  flag: any;
  flagRead: boolean = false;

  constructor(
    private fb: FormBuilder,
    private ajax: AjaxService,
    private commonService: CommonService,
    private route: ActivatedRoute,
    private router: Router,
    private validate: ValidateService,
    private dropdown: DropdownOrListService
  ) {
    this.getPayment();
    this.formSearchCus = this.fb.group({
      type: [''],
      criteria: ['']
    });
    this.formGroup = this.fb.group({
      commuChangeLogoId: [""],
      customerCode: ["", Validators.required],
      customerName: [""],
      contractNo: [""],
      customerBranch: [""],
      rentalAreaName: [""],
      rentalAreaCode: [""],
      endDate: [""],
      startDate: ["", Validators.required],
      serviceType: ["", Validators.required],
      chargeRates: [""],
      totalAmount: [""],
      remark: [""],

      paymentType: [''], //วิธีชำระเงินประกัน
      bankName: [''], //ชื่อธนาคาร
      bankBranch: [''], //สาขา 
      bankExplanation: [''],//คำอธิบาย
      bankGuaranteeNo: [''],//Bank guarantee
      bankExpNo: [''], //วันหมดอายุ
    });
  }
  // =========================== initial setting ===================
  async ngOnInit() {
    await this.getServiceTypeList();
    this.formGroup.get('commuChangeLogoId').patchValue(this.route.snapshot.queryParams['commuChangeLogoId']);
    this.flag = this.route.snapshot.queryParams['flag'];
    if (Utils.isNotNull(this.formGroup.get('commuChangeLogoId').value) && this.flag === 'E') {
      this.flagEdit = true;
      this.findById(this.formGroup.get('commuChangeLogoId').value);
    }
    if (Utils.isNotNull(this.formGroup.get('commuChangeLogoId').value) && this.flag === 'R') {
      this.flagRead = true;
      this.formGroup.get('serviceType').disable();
      this.formGroup.get('paymentType').disable();
      this.findById(this.formGroup.get('commuChangeLogoId').value);
    }
  }

  // ============================ action =========================
  dateChange(event, v) {
    this.formGroup.get(v).patchValue(event);
  }

  onValidateBeforeSave() {
    let validateData = [
      { format: "", header: "รหัสผู้ประกอบการ", value: this.formGroup.get("customerCode").value },
      { format: "", header: "ชื่อผู้ประกอบการ", value: this.formGroup.get("customerName").value },
      { format: "", header: "เลขที่สัญญา", value: this.formGroup.get("contractNo").value },
      { format: "", header: "ประเภทการบริการ", value: this.formGroup.get("serviceType").value },
      { format: "", header: "วันที่ขอใช้บริการ", value: this.formGroup.get("startDate").value },
    ];
    if (this.validate.checking(validateData)) {
      if (this.formGroup.invalid) {
        this.modalError.openModal("กรุณากรอกข้อมูลให้ครบ");
      } else {
        this.modalSave.openModal();
      }
    }
  }

  onOpenModalCustomer() {
    this.formSearchCus.reset();
    this.getCustomer();
    this.modalCustomer.openModal(ModalCustomComponent.MODAL_SIZE.EXTRA_LARGE);
  }

  onSelectServiceType(event) {
    let serviceType = event.target.value;
    this.serviceTypeList.forEach((data) => {
      if (serviceType === data.serviceType) {
        this.formGroup.get('chargeRates').patchValue(Number(data.chargeRate).toFixed(2));
        this.onChargeRatesChange();
      }
    });
  }

  onChargeRatesChange() {
    let chargeRates = NumberUtils.decimalFormatToNumber(this.formGroup.get('chargeRates').value);
    let vat = chargeRates * 0.07;
    this.formGroup.get('chargeRates').patchValue(NumberUtils.numberToDecimalFormat(chargeRates));
    this.formGroup.get('totalAmount').patchValue(NumberUtils.numberToDecimalFormat(chargeRates + vat));
  }

  // ================================ call back-end ==================
  callSave() {
    this.ajax.doPost(URL.SAVE, this.formGroup.value).subscribe((res: ResponseData<any>) => {
      if (MessageService.MSG.SUCCESS == res.status) {
        this.modalSuccess.openModal();
        this.router.navigate(['/communi/communi003']);
      } else {
        this.modalError.openModal(res.message);
      }
    });
  }

  findById(id) {
    this.commonService.loading();
    let data = {
      commuChangeLogoId: id
    }
    this.ajax.doPost(URL.FIND_ID, data).subscribe((res: ResponseData<any>) => {
      if (MessageService.MSG.SUCCESS == res.status) {
        this.formGroup.get('customerCode').patchValue(res.data.customerCode);
        this.formGroup.get('customerName').patchValue(res.data.customerName);
        this.formGroup.get('rentalAreaName').patchValue(res.data.rentalAreaName);
        this.formGroup.get('customerBranch').patchValue(res.data.customerBranch);
        this.formGroup.get('contractNo').patchValue(res.data.contractNo);
        this.formGroup.get('startDate').patchValue(res.data.startDate);
        this.formGroup.get('endDate').patchValue(res.data.endDate);
        if (this.flagEdit) {
          this.calendarStart.setDate(this.formGroup.get('startDate').value);
          this.calendarEnd.setDate(this.formGroup.get('endDate').value);
          // this.formGroup.get('paymentType').patchValue(res.data.paymentType);
        } else if (this.flagRead) {
          // this.formGroup.get('paymentType').patchValue(res.data.paymentTypeTH);
        }
        this.formGroup.get('paymentType').patchValue(res.data.paymentType);
        this.formGroup.get('serviceType').patchValue(res.data.serviceType);
        this.formGroup.get('chargeRates').patchValue(res.data.chargeRatesDF);
        this.formGroup.get('totalAmount').patchValue(res.data.totalAmountDF);
        this.formGroup.get('remark').patchValue(res.data.remark);
      } else {
        this.modalError.openModal(res.message);
        this.router.navigate(['/communi/communi003']);
      }
    })
  }

  getPayment() {
    this.ajax.doPost(`${URL.GET_PAY_MEN}`, { lovKey: 'COMMUNICATE_PAYMENT_TYPE' }).subscribe(
      (res: any) => {
        this.paymentTypeList = res.data;
      });
  }


  getCustomer() {
    this.formSearchCus.patchValue({ type: 'null' })
    this.ajax.doPost(URL.GET_SAP_CUS, this.formSearchCus.value).subscribe((res: ResponseData<any>) => {
      if (MessageService.MSG.SUCCESS == res.status) {
        this.dataListCustomer = res.data;
        this.initDataTableCustomer();
        this.clickBtn();
      } else {
        this.modalError.openModal(res.message);
      }
    })
  }

  getContractNoList(partner: string, code: string) {
    this.ajax.doGet(URL.GET_SAP_CON_NO + partner + "/" + code).subscribe((res: ResponseData<any>) => {
      if (MessageService.MSG.SUCCESS == res.status) {
        this.contractNoList = res.data;
      } else {
        this.modalError.openModal(res.message);
      }
    })
  }

  getServiceTypeList() {
    this.commonService.loading();
    this.ajax.doPost(URL.GET_SERVICE_TYPE_LIST, {}).subscribe((res: ResponseData<any>) => {
      if (MessageService.MSG.SUCCESS == res.status) {
        this.serviceTypeList = res.data;
      } else {
        this.modalError.openModal(res.message);
      }
      this.commonService.unLoading();
    })
  }

  // ====================== datatable ======================
  initDataTableCustomer = () => {
    if (this.dataTableCustomer != null) {
      this.dataTableCustomer.destroy();
    }
    this.dataTableCustomer = $('#datatableCus').DataTable({
      // ...this.commonService.configDataTable(),
      processing: true,
      serverSide: false,
      searching: false,
      ordering: false,
      paging: true,
      scrollX: true,
      data: this.dataListCustomer,
      columns: [
        {
          data: 'customerCode', className: 'text-left'
        }, {
          data: 'customerName', className: 'text-left'
        }, {
          data: 'address', className: 'text-left'
        }, {
          className: 'text-center',
          render(data, type, row, meta) {
            return `<button class="btn btn-primary btn-sm" id="selectCus" type="button">เลือก</button>`;
          }
        }
      ],
    });
  }

  getRentalAreaList(contractNo: string) {
    /* _________ default value _________ */
    this.roList = [];
    this.formGroup.patchValue({
      rentalAreaCode: null,
      rentalAreaName: null,
      endDate: null
    });

    if (contractNo) {
      /* _________ set end date _________ */
      const filterRes = this.contractNoList.filter(data => data.contractNo == contractNo)[0];
      if (filterRes) {
        this.formGroup.get('endDate').patchValue(filterRes.bpValidTo);
        this.calendarEnd.setDate(this.formGroup.get('endDate').value);
      }

      /* _________ set rental area _________ */
      this.dropdown.getRentalArea(contractNo).subscribe((response: ResponseData<any>) => this.roList = response.data);
    }
  }

  roChange(roName: string) {
    if (roName) {
      const filterRes = this.roList.filter(data => data.roName == roName)[0];
      this.formGroup.get('rentalAreaCode').patchValue(filterRes.roNumber);
      this.formGroup.get('rentalAreaName').patchValue(filterRes.roName);
    }
  }

  setDate(e, control: string) {
    this.formGroup.get(control).patchValue(e);
  }

  // event Click button in dataTable
  clickBtn() {
    this.dataTableCustomer.on('click', 'button#selectCus', (event) => {
      this.roList = [];
      this.contractNoList = [];
      this.formGroup.patchValue({
        contractNo: null,
        rentalAreaCode: null,
        rentalAreaName: null,
        endDate: null
      });

      const data = this.dataTableCustomer.row($(event.currentTarget).closest('tr')).data();
      this.formGroup.patchValue({
        customerCode: data.customerCode,
        customerName: data.customerName,
        customerBranch: data.adrKind + " : " + data.address
      })
      this.getContractNoList(data.partner, data.adrKind);
      this.modalCustomer.onClick(ModalCustomComponent.MODAL_ACTION.CLOSE);
    });
  }
}
