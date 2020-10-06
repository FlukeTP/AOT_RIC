import { Component, OnInit, AfterViewInit, TemplateRef, ViewChild } from '@angular/core';
import { Water003detailService } from './water003detail.service';
import { FormBuilder, FormGroup, FormArray } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonService } from 'src/app/_service/ common.service';
import { AjaxService } from 'src/app/_service/ajax.service';
import { ValidateService } from 'src/app/_service/validate.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { MessageService } from 'src/app/_service/message.service';
import { ResponseData } from 'src/app/common/models/response-data.model';
import { ModalErrorComponent } from 'src/app/components/modal/modal-error/modalError.component';
import { ModalSuccessComponent } from 'src/app/components/modal/modal-success/modalSuccess.component';
import { ModalConfirmComponent } from 'src/app/components/modal/modal-confirm/modalConfirm.component';
import { ModalAlertComponent } from 'src/app/components/modal/modal-alert/modalAlert.component';
import { Utils } from 'src/app/common/helper';
import { DropdownOrListService } from 'src/app/_service/dropdown-list.service';
import { InputCalendarComponent } from 'src/app/components/input/input-calendar/input-calendar.component';

declare var $: any;

const URLS = {
  GET_ALLMETER: 'water003/get_meter',
  GET_PAYMENT: 'constant/get-constant',
  GET_DETAIL: 'water003/get-detail/'
}
@Component({
  selector: 'app-water003detail',
  templateUrl: './water003detail.component.html',
  styleUrls: ['./water003detail.component.css'],
  providers: [Water003detailService]
})
export class Water003detailComponent implements OnInit, AfterViewInit {
  @ViewChild('errorModal') modalError: ModalErrorComponent;
  @ViewChild('saveModal') modalSave: ModalConfirmComponent;
  @ViewChild('successModal') successModal: ModalSuccessComponent;
  @ViewChild('alertModal') alertModal: ModalAlertComponent;
  @ViewChild('calendarEnd') calendarEnd: InputCalendarComponent;

  // Const
  id: any;
  customerTypeDetail = ['C', 'E'];
  paymentType = ['เงินสด', 'Bank guarantee'];
  requestType = ['ขอใช้เหมาจ่าย', 'อื่น ๆ'];
  applyType = ['ผู้ประกอบการนำมาเอง'];
  // adhocType ประเภทเหมาจ่าย adhocType1=เหมาจ่ายจำนวนหน่วย adhocType2=เหมาจ่ายจำนวนเงิน
  adhocType = ['adhocType1', 'adhocType2'];

  formCustomer: FormGroup = new FormGroup({});
  formStaff: FormGroup = new FormGroup({});
  formServiceCharge: FormGroup = new FormGroup({});
  serviceCharge: FormArray = new FormArray([]);
  formSearchMeter: FormGroup = new FormGroup({});
  formSearchCus: FormGroup = new FormGroup({});
  typeCustomer = 0;

  sumChargeRate = 0;
  chargeVat = 0;
  totalChargeRate = 0;

  cusList: any[] = [];
  contractNoList: any[] = [];
  modalRef: BsModalRef;

  dataTable: any;
  datas: any[] = [];
  meterList: any[] = [];
  configList: any[] = [];
  vat = 7;

  waterSizeList: any[] = [];
  otherList: any[] = [];
  selectOther: any[];
  // List DropDown
  electricRateTypeList: any[] = [];
  paymentTypeList: any[] = [];
  requestTypeList: any[] = [];
  meterTypeList: any[] = [];
  applyTypeList: any[] = [];
  electricVoltageTypeList: any[] = [];
  electricAmpereRangeList: any[] = [];
  electricPhaseList: any[] = [];
  electricCalTypeList: any[] = [];
  isUploadFile = false;
  endDateList: any[] = [];
  roList: any = [];

  breadcrumb: any = [
    {
      label: 'หมวดน้ำประปา',
      link: '/water',
    }, {
      label: 'ขอใช้น้ำประปาและบริการอื่นๆ',
      link: '/water/water003',
    }, {
      label: 'เพิ่มขอใช้น้ำประปาและบริการอื่นๆ',
      link: '#',
    },
  ];


  constructor(
    private selfService: Water003detailService,
    private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private commonService: CommonService,
    private ajax: AjaxService,
    private validate: ValidateService,
    private modalService: BsModalService,
    private dropdown: DropdownOrListService
  ) {
    // set form save
    this.formCustomer = this.formBuilder.group(this.selfService.getformCustomer());
    this.formStaff = this.formBuilder.group(this.selfService.getformStaff());
    this.getDropDown();
    this.getAllMeter();
    this.formServiceCharge = this.formBuilder.group({
      waterPhase: [],
      chargeType: [],
      waterAmpere: [],
      chargeRate: [],
      chargeVat: [],
      totalChargeRate: [],
    });

    //formSearchMeter
    this.formSearchMeter = this.formBuilder.group({
      criteria: ['']
    });

    this.formSearchCus = this.formBuilder.group({
      type: [''],
      criteria: ['']
    });

    this.getWaterSize();

  }

  ngOnInit() {
    this.id = this.route.snapshot.queryParams['id'] || '';
    if (Utils.isNotNull(this.id)) {
      this.isUploadFile = true;
      this.getDetail();
    }
  }

  ngAfterViewInit(): void {
    $('#date1').Zebra_DatePicker();
    $('#date2').Zebra_DatePicker();
  }

  getWaterSize() {
    this.selfService.getWaterSize().subscribe((res: ResponseData<any>) => {
      this.waterSizeList = res.data;
    });
  }

  // getDropDown FUNCTION
  async getDropDown() {
    // get ELECTRIC_RATE_TYPE List
    this.electricRateTypeList = await this.selfService.getParams('ELECTRIC_RATE_TYPE');
    // get PAYMENT_TYPE List
    this.paymentTypeList = await this.selfService.getParams('PAYMENT_TYPE');
    // get REQUEST_TYPE List
    this.requestTypeList = await this.selfService.getParams('REQUEST_TYPE_WATER');
    // get METER_TYPE List
    this.meterTypeList = await this.selfService.getParams('METER_TYPE');
    // get APPLY_TYPE List
    this.applyTypeList = await this.selfService.getParams('APPLY_TYPE');
    // get ELECTRIC_VOLTAGE_TYPE List
    this.electricVoltageTypeList = await this.selfService.getParams('ELECTRIC_VOLTAGE_TYPE');
    // get ELECTRIC_AMPERE_RANGE List
    this.electricAmpereRangeList = await this.selfService.getParams('ELECTRIC_AMPERE_RANGE');
    // get ELECTRIC_PHASE List
    this.electricPhaseList = await this.selfService.getParams('ELECTRIC_PHASE');
    // get ELECTRIC_CAL_TYPE List
    this.electricCalTypeList = await this.selfService.getParams('ELECTRIC_CAL_TYPE');
  }

  setDate(control, e) {
    if (this.typeCustomer === 0) {
      this.formCustomer.get(control).patchValue(e);
    } else if (this.typeCustomer === 1) {
      this.formStaff.get(control).patchValue(e);
    }
    console.log(e);
  }

  openModalCustom2(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, { class: 'modal-xl' });
    this.formSearchCus.reset();
    this.getCus();
  }


  async getCus() {
    if (this.typeCustomer === 0) {
      this.formSearchCus.patchValue({ type: 'null' });
    } else if (this.typeCustomer === 1) {
      this.formSearchCus.patchValue({ type: 'B3' });
    }
    this.dropdown.getCustomerList(this.formSearchCus.value).subscribe(response => {
      this.cusList = response.data;
    }, err => {
    }, () => {
      this.datatableCus();
    });
  }

  getContractNo(partner: string, branchCode: string) {
    this.dropdown.getContractNo(partner, branchCode).subscribe((response: ResponseData<any>) => {
      if (MessageService.MSG.SUCCESS === response.status) {
        this.contractNoList = response.data;
      }
    });
  }

  getRentalAreaList(contractNo: string) {
    this.roList = [];
    this.formCustomer.patchValue({
      requestEndDate: null,
      rentalAreaCode: null,
      rentalAreaName: null
    });

    if (contractNo) {
      /* set end date */
      const filterRes = this.contractNoList.filter(data => data.contractNo == contractNo)[0];
      if (filterRes) {
        this.calendarEnd.setDate(filterRes.bpValidTo);
        // this.formCustomer.get('requestEndDate').patchValue(filterRes.bpValidTo);
      }

      /* set rental area */
      this.dropdown.getRentalArea(contractNo).subscribe((response: ResponseData<any>) => this.roList = response.data);
    }
  }

  roChange(rentalAreaName: string) {
    if (rentalAreaName) {
      const filterRes = this.roList.filter(data => data.roName == rentalAreaName)[0];
      this.formCustomer.get('rentalAreaCode').patchValue(filterRes.roNumber);
      this.formCustomer.get('rentalAreaName').patchValue(filterRes.roName);
    }
  }

  datatableCus() {
    if (this.dataTable != null) {
      this.dataTable.destroy();
    }
    if (this.typeCustomer === 0) {
      this.dataTable = $('#datatableCus').DataTable({
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
          }, {
            data: 'customerName', className: 'text-left'
          }, {
            data: 'adrKind', className: 'text-center'
          }, {
            data: 'address', className: 'text-left'
          }, {
            className: 'text-center',
            render(data, type, row, meta) {
              return `<button class="btn btn-primary btn-sm" type="button">เลือก</button>`;
            }
          },
        ],
      });


    } else if (this.typeCustomer === 1) {
      this.dataTable = $('#datatableCus').DataTable({
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
          }, {
            data: 'customerName', className: 'text-left'
          }, {
            className: 'text-center',
            render(data, type, row, meta) {
              return `<button class="btn btn-primary btn-sm" type="button">เลือก</button>`;
            }
          },
        ],
      });
    }

    this.dataTable.on('click', 'td > button.btn-primary', (event) => {
      const data = this.dataTable.row($(event.currentTarget).closest('tr')).data();
      this.setCustumerData(data);
      this.getContractNo(data.partner, data.adrKind);
    });
  }

  setCustumerData(data) {
    /* _________ default value _________ */
    this.roList = [];
    this.contractNoList = [];
    this.formCustomer.patchValue({
      contractNo: null,
      requestEndDate: null,
      rentalAreaCode: null,
      rentalAreaName: null
    });
    if (this.typeCustomer === 0) {
      this.formCustomer.patchValue({
        customerCode: data.customerCode,
        customerName: data.customerName,
        customerBranch: data.adrKind + " : " + data.address
      });

    } else if (this.typeCustomer === 1) {
      this.formStaff.patchValue({
        customerCode: data.customerCode,
        customerName: data.customerName,
      });
    }
    this.onCloseModal();
  }

  async openModalCustom(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, { class: 'modal-lg' });
    this.datas = this.meterList.filter(v => {
      // return v.serialNo != this.formGroup.get('oldSerialNo').value;
      return v.serialNo;
    });
    await this.getAllMeter();
  }

  getAllMeter() {
    this.commonService.loading();
    this.meterList = [];
    this.ajax.doPost(URLS.GET_ALLMETER, this.formSearchMeter.value).subscribe((res: ResponseData<any>) => {
      if (MessageService.MSG.SUCCESS === res.status) {
        this.meterList = res.data;
        this.datas = res.data;
        this.initDataTable();
      } else {
        this.modalError.openModal(res.message);
      }
      this.commonService.unLoading();
    });
  }

  initDataTable = () => {
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
      data: this.datas,
      columns: [
        {
          data: 'serialNo', className: 'text-left'
        }, {
          data: 'meterName', className: 'text-left'
        }, {
          data: 'meterType', className: 'text-left'
        }, {
          data: 'meterLocation', className: 'text-left'
        }, {
          data: 'functionalLocation', className: 'text-left'
        }, {
          className: 'text-center',
          render() {
            return `<button class="btn btn-primary btn-sm" type="button">เลือก</button>`;
          }
        },
      ],
    });

    this.dataTable.on('click', 'td > button.btn-primary', (event) => {
      const data = this.dataTable.row($(event.currentTarget).closest('tr')).data();
      this.selectMeter(data);
    });
  }

  selectOtherFunc(select: string) {
    console.log(select);
    const selectData = this.otherList.filter((data: any) => {
      return data.waterType === select;
    });
    this.formServiceCharge.patchValue({
      chargeType: selectData[0].waterType,
      chargeRate: Number(selectData[0].chargeRates).toFixed(2),
      chargeVat: (Number(selectData[0].chargeRates) * this.vat / 100).toFixed(2),
      totalChargeRate: (Number(selectData[0].chargeRates) * (this.vat + 100) / 100).toFixed(2),
    });
  }

  selectMeter(res) {
    if (this.typeCustomer === 0) {
      this.formCustomer.patchValue({
        meterSerialNo: res.serialNo,
        meterType: res.meterType,
        meterName: res.meterName,
        installPosition: res.meterLocation,
      });
    } else if (this.typeCustomer === 1) {
      this.formStaff.patchValue({
        meterSerialNo: res.serialNo,
        meterType: res.meterType,
        meterName: res.meterName,
        installPosition: res.meterLocation,
      });
    }
    this.onCloseModal();
  }

  onCloseModal() {
    this.modalRef.hide();
  }

  showModal() {
    this.formServiceCharge.reset();
    this.commonService.loading();
    this.selfService.getOtherList().subscribe((res: any) => {
      this.otherList = res.data;
      $('#myModal').modal('show');
      this.commonService.unLoading();
    });
  }

  hideModal() {
    $('#myModal').modal('hide');
  }

  async searchConfig() {
    this.commonService.loading();
    if (this.formServiceCharge.value.waterAmpere && this.formServiceCharge.value.waterPhase) {
      this.configList = await this.selfService.getConfig(
        this.formServiceCharge.value.waterAmpere, this.formServiceCharge.value.waterPhase
      );
    } this.commonService.unLoading();
  }

  addServiceCharge() {
    this.hideModal();
    const check = this.formCustomer.value.serviceCharge.filter((item) => {
      return item.chargeType === this.formServiceCharge.value.chargeType;
    });
    console.log(check);
    if (check.length !== 0 || !this.formServiceCharge.value.chargeType) {
      return;
    }
    this.serviceCharge = this.formCustomer.get('serviceCharge') as FormArray;
    this.serviceCharge.push(this.createCharge(this.formServiceCharge.value));
    let sum1 = 0;
    let sum2 = 0;
    let sum3 = 0;

    this.formCustomer.value.serviceCharge.forEach((item) => {
      sum1 += Number(item.chargeRate);
      sum2 += Number(item.chargeVat);
      sum3 += Number(item.totalChargeRate);
    });
    this.sumChargeRate = sum1;
    this.chargeVat = sum2;
    this.totalChargeRate = sum3;

    this.formCustomer.patchValue({
      sumChargeRatesOther: this.sumChargeRate,
      sumVatChargeRatesOther: this.chargeVat,
      totalChargeRateOther: this.totalChargeRate
    });

  }

  searchRate() {
    const data = this.waterSizeList.filter((dataFil) => {
      return dataFil.waterMaintenanceConfigId === this.formCustomer.value.meterSize;
    });
    console.log(data[0].waterMeterSize);
    this.ajax.doPost('water003/getRateConfig', data[0].waterMeterSize).subscribe((res: ResponseData<any>) => {
      this.formCustomer.patchValue({
        insuranceRates: (Number(res.data.insuranceRates)).toFixed(2),
        vatInsurance: (Number(res.data.insuranceRates) * this.vat / 100).toFixed(2),
        totalInsuranceChargeRates: (Number(res.data.insuranceRates) * (100 + this.vat) / 100).toFixed(2),
        installRates: (Number(res.data.installRates)).toFixed(2),
        vatInstall: (Number(res.data.installRates) * this.vat / 100).toFixed(2),
        totalInstallChargeRates: (Number(res.data.installRates) * (100 + this.vat) / 100).toFixed(2),
      });
      this.formCustomer.get('totalChargeRates').patchValue(
        (Number(this.formCustomer.value.totalInsuranceChargeRates) + Number(this.formCustomer.value.totalInstallChargeRates)).toFixed(2)
      );
    });
  }

  createCharge(obj?): FormGroup {
    const data = obj || {
      id: [],
      electricPhase: [],
      chargeType: [],
      electricAmpere: [],
      chargeRate: [],
      chargeVat: [],
      totalChargeRate: []
    };
    return this.formBuilder.group(data);
  }

  // Remove Form from FormArray
  delDetail(index: number): void {
    this.serviceCharge = this.formCustomer.get('serviceCharge') as FormArray;
    this.serviceCharge.removeAt(index);
    let sum1 = 0;
    let sum2 = 0;
    let sum3 = 0;

    this.serviceCharge.value.forEach(item => {
      sum1 += Number(item.chargeRate);
      sum2 += Number(item.chargeVat);
      sum3 += Number(item.totalChargeRate);
    });

    this.sumChargeRate = sum1;
    this.chargeVat = sum2;
    this.totalChargeRate = sum3;

    this.formCustomer.patchValue({
      sumChargeRatesOther: this.sumChargeRate,
      sumVatChargeRatesOther: this.chargeVat,
      totalChargeRateOther: this.totalChargeRate
    });


  }

  validateCheck() {
    this.formCustomer.patchValue({ typeCustomer: this.customerTypeDetail[this.typeCustomer] });
    let validateData;
    if (this.typeCustomer === 0) {
      validateData = [
        { format: '', header: 'รหัสผู้ประกอบการ', value: this.formCustomer.value.customerCode },
        { format: '', header: 'ชื่อผู้ประกอบการ', value: this.formCustomer.value.customerName },
        { format: '', header: 'สาขา', value: this.formCustomer.value.customerBranch },
        { format: '', header: 'เลขที่สัญญา', value: this.formCustomer.value.contractNo },
        { format: '', header: 'ประเภทที่ขอใช้', value: this.formCustomer.value.requestType },
        { format: '', header: 'ประเภทค่าน้ำ', value: this.formCustomer.value.waterType1 || this.formCustomer.value.waterType2 || this.formCustomer.value.waterType3 },
        { format: '', header: 'สถานที่ให้บริการ', value: this.formCustomer.value.installPositionService },
        { format: '', header: 'วันที่ขอใช้บริการ', value: this.formCustomer.value.requestStartDate },
        { format: '', header: 'วันที่สิ้นสุดการใช้บริการ', value: this.formCustomer.value.requestEndDate },
        // { format: '', header: 'หมายเหตุ ', value: this.formCustomer.value.remark },
      ];

      if (this.formCustomer.value.requestType === 'ขอใช้เหมาจ่าย') {
        validateData = [
          { format: '', header: 'ที่อยู่จัดส่งเอกสาร', value: this.formCustomer.value.addressDocument },
          { format: '', header: 'ประเภทเหมาจ่าย', value: this.formCustomer.value.adhocType },
          { format: '', header: 'จำนวนหน่วย', value: this.formCustomer.value.adhocUnit },
          { format: '', header: 'อัตราค่าภาระ', value: this.formCustomer.value.sumChargeRate },
        ];
        if (this.formCustomer.value.adhocType == '0') {
          validateData = [
            { format: '', header: 'จำนวนคน', value: this.formCustomer.value.personUnit },
          ];
        } else {
          validateData = [
            { format: '', header: 'จำนวนหน่วย', value: this.formCustomer.value.adhocUnit },
          ];
        }
      } else if (this.formCustomer.value.requestType !== 'อื่น ๆ') {
        validateData = [
          { format: '', header: 'เจ้าของมิเตอร์', value: this.formCustomer.value.applyType },
          { format: '', header: 'Serial No. มิเตอร์', value: this.formCustomer.value.meterSerialNo },
          { format: '', header: 'เลขที่มิเตอร์เริ่มต้น', value: this.formCustomer.value.defaultMeterNo === 0 || Utils.isNotNull(this.formCustomer.value.defaultMeterNo) ? 'success' : '' },
          { format: '', header: 'ชื่อมิเตอร์', value: this.formCustomer.value.meterName },
          { format: '', header: 'ขนาดมิเตอร์', value: this.formCustomer.value.meterSize },
          { format: '', header: 'วิธีชำระเงินประกัน', value: this.formCustomer.value.paymentType },
        ];
      }
    } else if (this.typeCustomer === 1) {
      validateData = [

        { format: '', header: 'รหัสพนักงาน', value: this.formStaff.value.customerCode },
        { format: '', header: 'รหัสพนักงาน', value: this.formStaff.value.customerName },
        { format: '', header: 'หมายเลขประจำตัวประชาชน', value: this.formStaff.value.idCard },

        { format: '', header: 'Serial No. มิเตอร์', value: this.formStaff.value.meterSerialNo },
        { format: '', header: 'เลขที่มิเตอร์เริ่มต้น', value: this.formStaff.value.defaultMeterNo === 0 || Utils.isNotNull(this.formStaff.value.defaultMeterNo) ? 'success' : '' },
        { format: '', header: 'วันที่เริ่มใช้บริการ', value: this.formStaff.value.requestStartDate },
        { format: '', header: 'วันที่สิ้นสุดการใช้บริการ', value: this.formStaff.value.requestEndDate }
      ];
    }

    if (!this.validate.checking(validateData)) {
      return;
    }
    this.modalSave.openModal();
  }

  onSave() {
    if (this.typeCustomer === 0) {
      this.formCustomer.patchValue({ customerType: this.customerTypeDetail[this.typeCustomer] });
      this.selfService.saveService(this.formCustomer.value)
        .subscribe((data: ResponseData<any>) => {
          if (MessageService.MSG.SUCCESS === data.status) {
            this.successModal.openModal();
            this.goLocation(data.data.reqId);
          } else {
            this.alertModal.openModal();

          }
        });
    } else if (this.typeCustomer === 1) {
      this.formStaff.patchValue({ customerType: this.customerTypeDetail[this.typeCustomer] });
      this.selfService.saveService(this.formStaff.value)
        .subscribe((data: ResponseData<any>) => {
          if (MessageService.MSG.SUCCESS === data.status) {
            this.successModal.openModal();
            this.goLocation(data.data.reqId);
          } else {
            this.alertModal.openModal();

          }
        });
    }
  }

  goLocation(reqId: any) {
    this.router.navigate(['/water/water003'], {
      queryParams: {
        id: reqId
      }
    });
  }

  requestTypeCk(even) {
    console.log(even.target.value);
    this.formCustomer.patchValue({
      adhocType: '',

      paymentType: '',
      meterSize: '',
      insuranceRates: '',
      vatInsurance: '',
      totalInsuranceChargeRates: '',
      installRates: '',
      vatInstall: '',
      totalInstallChargeRates: '',
      totalChargeRates: '',

      personUnit: '',
      adhocUnit: ''
    })
  }

  clearRedio() {
    this.formCustomer.patchValue({
      personUnit: '',
      adhocUnit: '',
      sumChargeRate: ''
    })
  }

  addTypeMeter(event) {
    if (event.target.value === this.applyType[0]) {
      this.formCustomer.patchValue({
        meterSerialNo: '',
        meterType: 'Analog',
        meterName: '',
        installPosition: ''
      });
    } else {
      this.formCustomer.patchValue({
        meterSerialNo: '',
        meterType: '',
        meterName: '',
        installPosition: ''
      });
    }
  }



  setDataBank(even) {
    console.log(even.target.value);
    if (even.target.value === this.paymentType[1]) {
      this.formCustomer.patchValue({
        remark: ''
      })
    }
  }

  checkWaterType(name: any, event) {

    if (name == 'waterType1') {
      if (event.target.checked === true) {
        this.formCustomer.patchValue({
          waterType1: 'X'
        })
      } else {
        this.formCustomer.patchValue({
          waterType1: ''
        })
      }
    } else if (name == 'waterType2') {
      if (event.target.checked === true) {
        this.formCustomer.patchValue({
          waterType2: 'X'
        })
      } else {
        this.formCustomer.patchValue({
          waterType2: ''
        })
      }
    } else if (name == 'waterType3') {
      if (event.target.checked === true) {
        this.formCustomer.patchValue({
          waterType3: 'X'
        })
      } else {
        this.formCustomer.patchValue({
          waterType3: ''
        })
      }
    }


  }


  setUnitOrMoney(flag, val) {
    val = Number(val);
    if (flag === 'fromUnit') { // change from adhocUnit
      if (val || val > 0) {
        $('#personUnit').attr('readonly', '');
        this.calMoneyFromUnit(flag, 'UNIT_PAYMENT_WATER');
      } else if (!val || val === 0) {
        $('#sumChargeRate').attr('readonly', null);
        this.formCustomer.patchValue({ sumChargeRate: 0.00 });
      }
    } else if (flag === 'fromPerson') { // change from adhocChargeRate
      if (val || val > 0) {
        $('#adhocUnit').attr('readonly', '');
        this.calMoneyFromUnit(flag, 'PERSON_PAYMENT_WATER');
      } else if (!val || val === 0) {
        $('#sumChargeRate').attr('readonly', null);
        this.formCustomer.patchValue({ sumChargeRate: 0.00 });
      }
    }
  }

  calMoneyFromUnit(flag: any, key: string) {
    this.commonService.loading();
    this.ajax.doGet(`${URLS.GET_PAYMENT}/${key}`).subscribe((res: ResponseData<any>) => {
      if (MessageService.MSG.SUCCESS == res.status) {
        console.log('PAYMENT constantValue : ', res.data.constantValue);
        if (flag === 'fromUnit') {
          let cal = res.data.constantValue * this.formCustomer.get('adhocUnit').value
          this.formCustomer.patchValue({
            sumChargeRate: (Number(cal)).toFixed(2)
          });
        } else {
          let cal = res.data.constantValue * this.formCustomer.get('personUnit').value
          this.formCustomer.patchValue({
            sumChargeRate: (Number(cal)).toFixed(2)
          });
        }

      } else {
        this.modalError.openModal(res.message);
      }
      this.commonService.unLoading();
    });
  }


  getDetail() {
    this.ajax.doGet(URLS.GET_DETAIL + this.id).subscribe(res => {
      if (MessageService.MSG.SUCCESS === res.status) {
        console.log(res.data);
        if (res.data.customerType === this.customerTypeDetail[0]) {
          console.log('ผู้ประกอบการ');
          this.typeCustomer = 0;
          this.formCustomer.patchValue(this.selfService.setformCustomer(res.data));
          // this.calendarEnd.setDate(this.formCustomer.value.requestEndDate);
          $("#waterType1").attr("disabled", true);
          $("#waterType2").attr("disabled", true);
          $("#waterType3").attr("disabled", true);

          // $("#adhocType").attr("disabled",true);
          // $("#adhocType").prop("disabled", true);

          let sum1 = 0;
          let sum2 = 0;
          let sum3 = 0;

          res.data.rateCharge.forEach(config => {
            const dataSave = {
              chargeType: config.chargeType,
              chargeRate: (Number(config.chargeRate)).toFixed(2),
              chargeVat: (Number(config.chargeVat)).toFixed(2),
              totalChargeRate: (Number(config.totalChargeRate)).toFixed(2),
            };

            this.serviceCharge = this.formCustomer.get('serviceCharge') as FormArray;
            this.serviceCharge.push(this.createCharge(dataSave));


            sum1 += Number(dataSave.chargeRate);
            sum2 += Number(dataSave.chargeVat);
            sum3 += Number(dataSave.totalChargeRate);
          });

          this.sumChargeRate = sum1;
          this.chargeVat = sum2;
          this.totalChargeRate = sum3;

        } else if (res.data.customerType === this.customerTypeDetail[1]) {
          console.log('พนักงาน');
          this.typeCustomer = 1;
          this.formStaff.patchValue(this.selfService.setformStaff(res.data));
        }
      } else {
        this.modalError.openModal(MessageService.MSG.FAILED_CALLBACK);
      }
    }
    );
  }


}
