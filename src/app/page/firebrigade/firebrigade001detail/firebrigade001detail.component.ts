import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalCustomComponent } from 'src/app/components/modal/modal-custom/modalCustom.component';
import { AjaxService } from 'src/app/_service/ajax.service';
import { CommonService } from 'src/app/_service/ common.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BsModalService } from 'ngx-bootstrap/modal';
import { Router, ActivatedRoute } from '@angular/router';
import { MessageService } from 'src/app/_service/message.service';
import { ResponseData } from 'src/app/common/models/response-data.model';
import { ModalConfirmComponent } from 'src/app/components/modal/modal-confirm/modalConfirm.component';
import { ModalSuccessComponent } from 'src/app/components/modal/modal-success/modalSuccess.component';
import { ModalErrorComponent } from 'src/app/components/modal/modal-error/modalError.component';
import { InputCalendarComponent } from 'src/app/components/input/input-calendar/input-calendar.component';
import { SAP_CONSTANT } from 'src/app/common/constant/SAP.constant';
import { Utils } from 'src/app/common/helper';
import { ValidateService } from 'src/app/_service/validate.service';
import { DecimalFormatPipe } from 'src/app/common/pipes';
import { NumberUtils } from 'src/app/common/helper/number';

const URL = {
  SAVE: "firebrigade001/save",
  FIND_ID: "firebrigade001/find_id",
  GET_SAP_CUS: 'common/getSAPCustumer/',
  GET_SAP_CON_NO: 'common/getSAPContractNo/',
  GET_CHARGE_RATE_CONF: "firebrigade002/get_all",
  GET_DROPDOWN_LOV: "lov/list-data-detail"
}
@Component({
  selector: 'app-firebrigade001detail',
  templateUrl: './firebrigade001detail.component.html',
  styleUrls: ['./firebrigade001detail.component.css']
})
export class Firebrigade001detailComponent implements OnInit {
  @ViewChild('selectCusModal') modalCustomer: ModalCustomComponent;
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
      label: "บริหารจัดการรายได้ค่าจัดฝึกอบรมการดับเพลิงและกู้ภัย",
      link: "#",
    },
    {
      label: "เพิ่มข้อมูลบริหารจัดการรายได้ค่าจัดฝึกอบรมการดับเพลิงและกู้ภัย",
      link: "#",
    }
  ];

  formGroup: FormGroup;
  formSearchCus: FormGroup;
  dataTableCustomer: any;
  dataListCustomer: any[] = [];
  contractNoList: any[] = [];
  courseList: any[] = [];
  paymentType: any[] = [];
  roList: any[] = [];
  chargeRates: any;
  unitIsTime: boolean = false;
  vat: number;
  constructor(
    private ajax: AjaxService,
    private commonService: CommonService,
    private fb: FormBuilder,
    private modalService: BsModalService,
    private router: Router,
    private route: ActivatedRoute,
    private validate: ValidateService
  ) {
    this.formGroup = this.fb.group({
      fireManageId: [""],
      customerCode: ["", Validators.required],
      customerName: ["", Validators.required],
      customerBranch: ["", Validators.required],
      contractNo: ["", Validators.required],
      address: [""],
      courseName: ["", Validators.required],
      startDate: ["", Validators.required],
      personAmount: [""],
      chargeRates: [""],
      vat: [""],
      totalAmount: [""],
      paymentType: ["", Validators.required],
      remark: [""],
      unit: [""],
    })

    this.formSearchCus = this.fb.group({
      type: [''],
      criteria: ['']
    });
  }
  // ======================== setting initial ==============
  ngOnInit() {
    this.formGroup.get('fireManageId').patchValue(this.route.snapshot.queryParams['fireManageId']);
    if (Utils.isNotNull(this.formGroup.get('fireManageId').value)) {
      this.findById(this.formGroup.get('fireManageId').value);
    }
    this.getChargeRateConfigList();
    this.getTrashPaymentType();
  }

  ngAfterViewInit(): void {
  }

  getTrashPaymentType() {
    this.ajax
      .doPost(`${URL.GET_DROPDOWN_LOV}`, { lovKey: "TRASH_PAYMENT_TYPE" })
      .subscribe((res: ResponseData<any>) => {
        console.log("meter", res.data);
        this.paymentType = res.data;
      });
  }

  // ================= Action ======================
  dateChange(event) {
    this.formGroup.get('startDate').patchValue(event);
  }

  onOpenModalCustomer() {
    this.getCustomer();
    this.modalCustomer.openModal(ModalCustomComponent.MODAL_SIZE.EXTRA_LARGE);
  }

  onSelectCourse(event) {
    let courseName = event.target.value;
    this.courseList.filter(data => {
      if (data.courseName === courseName) {
        this.chargeRates = data.chargeRates;
        this.formGroup.patchValue({
          personAmount: 0,
          totalAmount: 0
        })
        if (data.unit === 'ครั้ง') {
          this.vat = this.chargeRates * 0.07;
          this.formGroup.patchValue({
            totalAmount: NumberUtils.numberToDecimalFormat(this.chargeRates + this.vat)
          })
        } else {
          this.vat = this.chargeRates * 0.07 * Number(this.formGroup.get('personAmount').value);
        }
        this.checkUnitIsTime(data.unit);
        // let totalAmount = this.chargeRates + this.vat;
        this.formGroup.patchValue({
          chargeRates: NumberUtils.numberToDecimalFormat(this.chargeRates),
          vat: NumberUtils.numberToDecimalFormat(this.vat),
          unit: data.unit
        })
        this.formGroup.get('courseName').patchValue(data.courseName);
        return;
      }
    })
  }

  callulatePerson() {
    if (!this.unitIsTime) {
      let vat = (NumberUtils.decimalFormatToNumber(this.formGroup.value.chargeRates) * NumberUtils.decimalFormatToNumber(this.formGroup.value.personAmount)) * 0.07;
      let totalAmountMoney = (NumberUtils.decimalFormatToNumber(this.formGroup.value.chargeRates) * NumberUtils.decimalFormatToNumber(this.formGroup.value.personAmount)) + vat;
      this.formGroup.patchValue({
        vat: NumberUtils.numberToDecimalFormat(vat),
        totalAmount: NumberUtils.numberToDecimalFormat(totalAmountMoney)
      });
    }
  }

  checkUnitIsTime(data: string) {
    if (data === 'ครั้ง') {
      this.unitIsTime = true;
    } else {
      this.unitIsTime = false;
    }
  }

  onClickSave() {
    this.callSave();
  }

  onValidBeforeSave() {
    let validateData = [
      { format: "", header: "รหัสผู้ประกอบการ", value: this.formGroup.get("customerCode").value },
      { format: "", header: "หน่วยงาน/ผู้ประกอบการ", value: this.formGroup.get("customerName").value },
      { format: "", header: "เลขที่สัญญา", value: this.formGroup.get("contractNo").value },
      { format: "", header: "หลักสูตรที่ขอใช้จัดฝึกอบรม", value: this.formGroup.get("courseName").value },
      { format: "", header: "วันที่จัดฝึกอบรม", value: this.formGroup.get("startDate").value },
      { format: "", header: "ประเภทการชำระเงิน", value: this.formGroup.get("paymentType").value },
    ];
    if (this.formGroup.value.unit === 'คน') {
      validateData.push(
        { format: "", header: "จำนวนผู้เข้ารับการฝึกอบรม", value: this.formGroup.get("personAmount").value }
      )
      this.formGroup.get("personAmount").setValidators(Validators.required);
    } else {
      this.formGroup.get("personAmount").setValidators(null);
    }
    if (this.validate.checking(validateData)) {
      if (this.formGroup.invalid) {
        this.modalError.openModal(MessageService.MSG.REQUIRE_FIELD);
      } else {
        this.modalSave.openModal();
      }
    }
  }

  // ================ call back-end ================
  callSave() {
    this.commonService.loading();
    // console.log("formGroup => ", this.formGroup.value);
    let data = this.formGroup.value;
    this.formGroup.patchValue({
      personAmount: Utils.isNotNull(data.personAmount) ? NumberUtils.decimalFormatToNumber(data.personAmount) : 0,
      chargeRates: NumberUtils.decimalFormatToNumber(data.chargeRates),
      vat: NumberUtils.decimalFormatToNumber(data.vat),
      totalAmount: NumberUtils.decimalFormatToNumber(data.totalAmount),
    })
    this.ajax.doPost(URL.SAVE, this.formGroup.value).subscribe((res: ResponseData<any>) => {
      if (MessageService.MSG.SUCCESS == res.status) {
        this.modalSuccess.openModal();
        this.router.navigate(['/firebrigade/firebrigade001']);
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
        this.formGroup.get('customerCode').patchValue(res.data.customerCode);
        this.formGroup.get('customerName').patchValue(res.data.customerName);
        this.formGroup.get('customerBranch').patchValue(res.data.customerBranch);
        this.formGroup.get('contractNo').patchValue(res.data.contractNo);
        this.formGroup.get('address').patchValue(res.data.address);
        this.formGroup.get('courseName').patchValue(res.data.courseName);
        $('select#selectCourse').val(res.data.courseName);
        this.formGroup.get('startDate').patchValue(res.data.startDate);
        this.calendar.setDate(this.formGroup.get('startDate').value);
        this.formGroup.get('personAmount').patchValue(res.data.personAmount);
        this.formGroup.get('chargeRates').patchValue(NumberUtils.numberToDecimalFormat(res.data.chargeRates));
        this.formGroup.get('vat').patchValue(NumberUtils.numberToDecimalFormat(res.data.vat));
        this.formGroup.get('totalAmount').patchValue(NumberUtils.numberToDecimalFormat(res.data.totalAmount));
        this.formGroup.get('paymentType').patchValue(res.data.paymentType);
        this.formGroup.get('remark').patchValue(res.data.remark);
        this.formGroup.get('unit').patchValue(res.data.unit);
        this.checkUnitIsTime(res.data.unit);
      } else {
        this.modalError.openModal(res.message);
        this.router.navigate(['/firebrigade/firebrigade001']);
      }
      this.commonService.unLoading();
    })
  }

  getCustomer() {
    this.commonService.loading();
    this.formSearchCus.patchValue({ type: 'null' })
    this.ajax.doPost(URL.GET_SAP_CUS, this.formSearchCus.value).subscribe((res: ResponseData<any>) => {
      if (MessageService.MSG.SUCCESS == res.status) {
        this.dataListCustomer = res.data;
        this.initDataTableCustomer();
      } else {
        this.modalError.openModal(res.message);
      }
      this.commonService.unLoading();
    })
  }

  getContractNoList(partner: string, branchCode: string) {
    this.commonService.loading();
    this.ajax.doGet(`${URL.GET_SAP_CON_NO}${partner}/${branchCode}`).subscribe((res: ResponseData<any>) => {
      if (MessageService.MSG.SUCCESS == res.status) {
        this.contractNoList = res.data;
      } else {
        this.modalError.openModal(res.message);
      }
      this.commonService.unLoading();
    })
  }

  getRentalAreaList(contractNo: string) {
    /* _________ default value _________ */
    this.roList = [];

    if (contractNo) {
      /* _________ set end date _________ */
      const filterRes = this.contractNoList.filter(data => data.contractNo == contractNo)[0];
      if (filterRes) {
        this.formGroup.get('endDateStr').patchValue(filterRes.bpValidTo);
      }

      /* _________ set rental area _________ */
      this.ajax.doGet(`common/getUtilityArea/${contractNo}`).subscribe((response: ResponseData<any>) => this.roList = response.data);
    }
  }

  getChargeRateConfigList() {
    this.commonService.loading();
    this.ajax.doPost(URL.GET_CHARGE_RATE_CONF, {}).subscribe((res: ResponseData<any>) => {
      if (MessageService.MSG.SUCCESS == res.status) {
        this.courseList = res.data;
      } else {
        this.modalError.openModal(res.message);
      }
      this.commonService.unLoading();
    })
  }

  // =================== data table =========================
  initDataTableCustomer = () => {
    if (this.dataTableCustomer != null) {
      this.dataTableCustomer.destroy();
    }
    this.dataTableCustomer = $('#datatableCus').DataTable({
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
          data: 'adrKind', className: 'text-left'
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
    // call Function event Click button in dataTable
    this.clickBtn();
  }

  // event Click button in dataTable
  clickBtn() {
    this.dataTableCustomer.on('click', 'button#selectCus', (event) => {
      const data = this.dataTableCustomer.row($(event.currentTarget).closest('tr')).data();
      this.formGroup.patchValue({
        customerCode: data.customerCode,
        customerName: data.customerName,
        customerBranch: `${data.adrKind} : ${data.address}`,
        address: data.address
      })
      this.getContractNoList(data.partner, data.adrKind);
      this.modalCustomer.onClick(ModalCustomComponent.MODAL_ACTION.CLOSE);
    });
  }
}
