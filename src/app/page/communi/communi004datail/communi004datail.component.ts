import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { AjaxService } from 'src/app/_service/ajax.service';
import { CommonService } from 'src/app/_service/ common.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ValidateService } from 'src/app/_service/validate.service';

import { ModalConfirmComponent } from 'src/app/components/modal/modal-confirm/modalConfirm.component';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { Utils } from 'src/app/common/helper';
import { ResponseData } from 'src/app/common/models/response-data.model';
import { MessageService } from 'src/app/_service/message.service';
import { ModalErrorComponent } from 'src/app/components/modal/modal-error/modalError.component';
import { ModalSuccessComponent } from 'src/app/components/modal/modal-success/modalSuccess.component';
import { DropdownOrListService } from 'src/app/_service/dropdown-list.service';
import { COMMUNI_CONSTANT } from 'src/app/common/constant/communicate.constant';
import { InputCalendarComponent } from 'src/app/components/input/input-calendar/input-calendar.component';
import { NumberUtils } from 'src/app/common/helper/number';

declare var $: any;

const URL = {
  SAVE: "communicate004/save",
  GET_BY_ID: "communicate004/get-by-id/",
  GET_BY_T: "communicate004/get-by-transaction-no/",
  GET_BY_R_D: "communi0063/get-effective-date/",
  // UPDATE: "water009/update",
  // DELETE: "water009/delete-dtl",
  SERVICE_TYPE: 'communi0063/get_all',
  GET_SAP_CUT: 'common/getSAPCustumer/',
  GET_SAP_CON_NO: 'common/getSAPContractNo/',
  GET_RENTAL_AREA: 'common/getUtilityArea/',
  GET_PAY_MEN: 'lov/list-data-detail',
};

@Component({
  selector: 'app-communi004datail',
  templateUrl: './communi004datail.component.html',
  styleUrls: ['./communi004datail.component.css']
})
export class Communi004datailComponent implements OnInit {
  @ViewChild('calendarStart') calendarStart: InputCalendarComponent;
  @ViewChild('calendarEnd') calendarEnd: InputCalendarComponent;
  @ViewChild('saveModal') modalSave: ModalConfirmComponent;
  @ViewChild('errorModal') modalError: ModalErrorComponent;
  @ViewChild('modalRemark') modalRemark: ModalConfirmComponent;

  //formSave
  formSave: FormGroup;
  serviceCharge: FormArray = new FormArray([]);
  //formSearchCus
  formSearchCus: FormGroup = new FormGroup({});
  tableCus: any;
  cusList: any[] = [];
  contractNoList: any[] = [];
  endDateList: any[] = [];
  modalRef: BsModalRef;

  //modalForm
  modalForm: FormGroup;
  //serviceTypeList
  serviceTypeList: any[] = [];
  //paymentType
  paymentTypeList: any[] = [];
  //roList
  roList: any[] = [];

  /* constant */
  paymentTypeConst = ['CASH', 'BANK_GUARANTEE'];

  //flagEdit
  flagEdit = false;

  //sum
  amountLg: any = 0;
  amountMonth: any = 0;

  // remarkStr
  remarkStr: string = '';

  //id
  id: any;
  flag: any;

  constructor(
    private fb: FormBuilder,
    private modalService: BsModalService,
    private ajax: AjaxService,
    private validate: ValidateService,
    private router: Router,
    private route: ActivatedRoute,
    private commonService: CommonService,
    private dropdown: DropdownOrListService

  ) {
    this.formData();

    this.formModal();
    this.getPayment();
    this.getServiceType();
    this.formDataCus();


  }

  breadcrumb: any = [
    {
      label: "หมวดสื่อสาร",
      link: "/home/communi",
    },
    {
      label: "ขอใช้บริการข้อมูลตารางการบิน",
      link: "#",
    },

  ];
  ngOnInit() {
    this.id = this.route.snapshot.queryParams['id'] || '';
    let transReq = this.route.snapshot.queryParams['transReq'] || '';
    this.flag = this.route.snapshot.queryParams['flag'] || '';
    if (Utils.isNotNull(this.id) && this.flag === 'R') {
      this.flagEdit = true;
      this.getData();
    }
    if (Utils.isNotNull(transReq) && this.flag === 'C') {
      this.flagEdit = true;
      this.getData();
    }
    if (this.flag === 'E') {
      this.getData();
    }
  }

  //======================= Form DATA CUS =======================
  formDataCus() {
    this.formSearchCus = this.fb.group({
      type: [''],
      criteria: ['']
    });
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
      remark: [''],//หมายเหตุ 

      paymentType: [''], //วิธีชำระเงินประกัน
      paymentTypeShow: [''], //วิธีชำระเงินประกันไว้แสดงผล
      bankName: [''], //ชื่อธนาคาร
      bankBranch: [''], //สาขา 
      bankExplanation: [''],//คำอธิบาย
      bankGuaranteeNo: [''],//Bank guarantee
      bankExpNo: [''], //วันหมดอายุ

      amountLg: [''], //ผลรวมเงินประกัน
      amountMonth: [''], //ผลรวมค่าบริการรายเดือน

      serviceCharge: this.fb.array([])
    });
    this.serviceCharge = this.formSave.get('serviceCharge') as FormArray;
  }

  //======================= Form List =======================
  formDataList(): FormGroup {
    return this.fb.group({
      id: [''],
      connectSignal: [''], //เชื่อมต่อสัญญาณภาพ
      location: [''], //สถานที่เชื่อมต่อสัญญาณภาพ
      amountLg: [''],//เงินประกันใช้สัญญาณภาพ
      amountMonth: [''],//ค่าบริการรายเดือน(บาท)
      remark: [''],//หมายเหตุ 
    });
  }

  //======================= Form Modal =======================
  formModal() {
    this.modalForm = this.fb.group({
      connectSignal: [''], //เชื่อมต่อสัญญาณภาพ
      location: [''], //สถานที่เชื่อมต่อสัญญาณภาพ
      amountL: [''],
      amountM: [''],
      remark: ['']
    });
  }

  //=================== modal ===============
  openModalEntrepreneur(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, { class: 'modal-xl' });
    this.formSearchCus.reset();
    this.getCus();
  }


  showAddModal() {
    $('#addModal').modal('show');
    $('#serviceT').val('');
    this.modalForm.patchValue({
      connectSignal: '',
      location: '',
      remark: ''
    })
  }

  hideAddModal() {
    $('#addModal').modal('hide')
  }

  //======================== ACTION ===================

  onPages = () => {
    if (this.flag === 'R' || this.flag === 'E' || this.flag === '') {
      this.router.navigate(["/communi/communi004"], {});
    } else if (this.flag === 'C') {
      this.router.navigate(["/communi/communi008"], {});
    } else {
      this.router.navigate(["/communi/communi005"], {});
    }

  }

  async getCus() {
    this.formSearchCus.patchValue({ type: 'null' })
    this.cusList = await this.getSapCus(this.formSearchCus.value);
    this.datatableCus();
  }

  async getContractNoList(partner: any, branch: any) {
    //clear contractNo
    this.formSave.get('contractNo').patchValue('');
    this.contractNoList = await this.getSapContractNo(partner, branch);
  }

  onCloseModal() {
    this.modalRef.hide();
  }

  async setDate(e, control: string) {
    this.formSave.get(control).patchValue(e);
    this.getEffectiveDate(this.formSave.get('requestDateStr').value);
  }

  getBpValidTo(contractNo: any) {
    this.endDateList = this.contractNoList.filter((data) => {
      return data.contractNo == contractNo
    })
    if (this.endDateList.length != 0) {
      this.formSave.patchValue({
        endDateStr: this.endDateList[0].bpValidTo
      })
      this.calendarEnd.setDate(this.formSave.get('endDateStr').value);
    } else {
      this.formSave.patchValue({
        endDateStr: ''
      })
    }
  }

  async onValidate() {
    let validateData;
    validateData = [
      { format: '', header: 'รหัสผู้ประกอบการ', value: this.formSave.value.entreprenuerCode },
      { format: '', header: 'ชื่อผู้ประกอบการ', value: this.formSave.value.entreprenuerName },
      { format: '', header: 'สาขา', value: this.formSave.value.customerBranch },
      { format: '', header: 'เลขที่สัญญา', value: this.formSave.value.contractNo },
      { format: '', header: 'พื้นที่เช่า (rental object)', value: this.formSave.value.rentalAreaName },
      { format: '', header: 'วิธีชำระเงิน', value: this.formSave.value.paymentType },
      { format: '', header: 'วันที่ขอใช้บริการ', value: this.formSave.value.requestDateStr },
      { format: '', header: 'วันที่สิ้นสุดขอใช้บริการ', value: this.formSave.value.endDateStr },
      { format: '', header: 'ค่าภาระ', value: this.formSave.value.amountMonth }
    ];

    if (this.formSave.value.paymentType === this.paymentTypeConst[1]) {
      validateData = [
        { format: '', header: 'ชื่อธนาคาร', value: this.formSave.value.bankName },
        { format: '', header: 'ชื่อสาขา', value: this.formSave.value.bankBranch },
        { format: '', header: 'คำอธิบาย', value: this.formSave.value.bankExplanation },
        { format: '', header: 'หมายเลข  แบงค์การันตี', value: this.formSave.value.bankGuaranteeNo },
        { format: '', header: 'วันหมดอายุ', value: this.formSave.value.bankExpNo },
      ]
    }

    if (!this.validate.checking(validateData)) {
      return;
    }
    if (this.formSave.valid) {
      this.modalSave.openModal();
      return;
    }

  }

  onSave() {
    this.save();
  }


  async onValidateDtl() {
    let validateData;
    validateData = [
      { format: '', header: 'ค่าบริการรายเดือน', value: this.modalForm.value.amountL },
      { format: '', header: 'เงินประกันใช้สัญญาณภาพ', value: this.modalForm.value.amountM }
    ];

    if (!this.validate.checking(validateData)) {
      return;
    }
    if (this.modalForm.valid) {
      this.addDtl();
      return;
    }
  }



  async addDtl() {
    this.serviceCharge = this.formSave.get('serviceCharge') as FormArray;
    this.serviceCharge.push(this.formDataList());
    let idx = this.serviceCharge.length - 1;
    this.serviceCharge.at(idx).get('connectSignal').patchValue(this.modalForm.get('connectSignal').value);
    this.serviceCharge.at(idx).get('location').patchValue(this.modalForm.get('location').value);
    this.serviceCharge.at(idx).get('amountLg').patchValue(NumberUtils.decimalFormatToNumber(this.modalForm.get('amountL').value));
    this.serviceCharge.at(idx).get('amountMonth').patchValue(NumberUtils.decimalFormatToNumber(this.modalForm.get('amountM').value));
    this.serviceCharge.at(idx).get('remark').patchValue(this.modalForm.get('remark').value);

    this.calAmount();
    this.hideAddModal();
  }

  async removeDtl(idx: any) {
    this.serviceCharge.removeAt(idx);

    if (this.serviceCharge.length > 0) {
      this.calAmount();
    } else {
      this.clearAmount();
    }
  }

  async calAmount() {
    let sum1 = 0;
    let sum2 = 0;
    this.formSave.value.serviceCharge.forEach((item) => {
      sum1 += Number(item.amountLg);
      sum2 += Number(item.amountMonth);
    });
    this.amountLg = sum1;
    this.amountMonth = sum2;

    this.onPathDataSum();
  }

  async clearAmount() {
    this.amountLg = 0;
    this.amountMonth = 0;

    this.onPathDataSum();
  }

  onPathDataSum() {
    this.formSave.patchValue({
      amountLg: this.amountLg,
      amountMonth: this.amountMonth
    })
  }

  // onChangeServiceType(event) {
  //   console.log('onChangeServiceType');
  //   if (Utils.isNotNull(event.target.value)) {
  //     var data = this.serviceTypeList.find(res => res.commuFlightInfoConfigId == event.target.value);
  //     this.modalForm.patchValue({
  //       serviceT: data.chargeRateName,
  //       amountL: Utils.isNotNull(data.insuranceFee) && data.insuranceFee != '-' ? data.insuranceFee : '',
  //       amountM: Utils.isNotNull(data.chargeRate) && data.chargeRate != '-' ? data.chargeRate : ''
  //     })
  //     console.log(this.modalForm.value);
  //   } else {
  //     this.modalForm.reset();
  //   }
  // }

  onRemark(remark: any) {
    this.remarkStr = remark;
    this.modalRemark.openModal();
  }

  roChange(roName: string) {
    if (roName) {
      const filterRes = this.roList.filter(data => data.roName == roName)[0];
      this.formSave.patchValue({
        rentalAreaCode: filterRes.roNumber,
        rentalAreaName: filterRes.roName
      })
    }
  }

  //====================== TABLE ====================
  datatableCus() {
    if (this.tableCus != null) {
      this.tableCus.destroy();
    }
    this.tableCus = $('#datatableCus').DataTable({
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

    this.tableCus.on('click', 'td > button.btn-primary', (event) => {
      const data = this.tableCus.row($(event.currentTarget).closest('tr')).data();
      this.formSave.patchValue({
        entreprenuerCode: data.customerCode,
        entreprenuerName: data.customerName,
        customerBranch: data.adrKind + " : " + data.address
      });

      this.getContractNoList(data.partner, data.adrKind);
      this.onCloseModal();
    });
  }

  //================== CALL BACK-END ================

  //List รหัสผู้ประกอบการ
  getSapCus(data: any) {
    const promise = new Promise((resolve, reject) => {
      this.ajax.doPost(URL.GET_SAP_CUT, data).subscribe(
        (res: any) => {
          resolve(res);
        },
        (err) => {
          console.error(err);
          reject(err);
        });
    });

    return promise.then((data: any) => {
      return data.data;
    });
  }

  //List ContractNo
  getSapContractNo(partner: string, branch: string) {
    const promise = new Promise((resolve, reject) => {
      this.ajax.doGet(`${URL.GET_SAP_CON_NO}${partner}/${branch}`).subscribe(
        (res: any) => {
          resolve(res);
        },
        (err) => {
          console.error(err);
          reject(err);
        });
    });

    return promise.then((data: any) => {
      return data.data;
    });
  }



  //getRentalArea
  async getRentalAreaList(event) {
    this.formSave.patchValue({
      endDateStr: '',
      rentalAreaCode: '',
      rentalAreaName: ''
    })

    let contractNo = '0';
    if (Utils.isNotNull(event.target.value)) {
      contractNo = event.target.value;
      this.getBpValidTo(contractNo);
    } else {
      this.formSave.patchValue({
        endDateStr: '',
        rentalAreaCode: '',
        rentalAreaName: ''
      })
    }
    this.ajax.doGet(`${URL.GET_RENTAL_AREA}${contractNo}`).subscribe(
      (res: ResponseData<any>) => {
        this.roList = res.data
        //console.log(res.data.length);
        // if (res.data.length != 0) {
        //   this.formSave.patchValue({
        //     rentalAreaCode: res.data[0].roNumber,
        //     rentalAreaName: res.data[0].roName
        //   })
        // } else {
        //   this.formSave.patchValue({
        //     rentalAreaCode: '',
        //     rentalAreaName: ''
        //   })
        // }

      });

  }

  //getPayment
  getPayment() {
    this.ajax.doPost(`${URL.GET_PAY_MEN}`, { lovKey: 'PAYMENT_TYPE' }).subscribe(
      (res: any) => {
        this.paymentTypeList = res.data;
      });
  }

  //getServiceType
  getServiceType() {
    this.ajax.doPost(URL.SERVICE_TYPE, {}).subscribe((res: ResponseData<any>) => {
      if (res.data.length > 0) {
        this.serviceTypeList = res.data;
      } else {
        this.serviceTypeList = [];
      }
    });
  }

  //getServiceType
  getEffectiveDate(data: any) {
    let effectiveDate = data;
    this.commonService.loading();
    this.ajax.doPost(URL.GET_BY_R_D, { effectiveDate }).subscribe((res: ResponseData<any>) => {
      if (MessageService.MSG.SUCCESS === res.status && res.data != null) {
        this.modalForm.patchValue({
          amountM: NumberUtils.numberToDecimalFormat(res.data.chargeRate),
          amountL: NumberUtils.numberToDecimalFormat(res.data.insuranceFee)
        })
      } else {
        this.modalForm.patchValue({
          amountL: '',
          amountM: ''
        })
      }
      this.commonService.unLoading();
    });
  }

  //save
  save() {
    this.ajax.doPost(URL.SAVE, this.formSave.value).subscribe((res: ResponseData<any>) => {
      if (MessageService.MSG.SUCCESS === res.status) {
        this.onPages();
      } else {
      }
    });
  }

  //get data by id
  async getData() {
    let url = '';
    if (this.flag === 'R' || this.flag === 'E') {
      url = URL.GET_BY_ID;
    } else if (this.flag === 'C') {
      this.id = this.route.snapshot.queryParams['transReq'] || '';
      url = URL.GET_BY_T;
    }
    this.ajax.doGet(url + this.id).subscribe(res => {
      if (MessageService.MSG.SUCCESS === res.status) {

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
        if (this.flag === 'E') {
          this.calendarStart.setDate(this.formSave.get('requestDateStr').value);
          this.calendarEnd.setDate(this.formSave.get('endDateStr').value);
        }
        this.formSave.get('remark').patchValue(res.data.remark);
        this.formSave.get('bankName').patchValue(res.data.bankName);
        this.formSave.get('bankBranch').patchValue(res.data.bankBranch);
        this.formSave.get('bankExplanation').patchValue(res.data.bankExplanation);
        this.formSave.get('bankGuaranteeNo').patchValue(res.data.bankGuaranteeNo);
        this.formSave.get('bankExpNo').patchValue(res.data.bankExpNoStr);

        if (res.data.serviceCharge.length > 0) {
          this.serviceCharge.controls.splice(0, this.serviceCharge.controls.length);
          this.serviceCharge.patchValue([]);
          res.data.serviceCharge.forEach((e, index) => {
            this.serviceCharge.push(this.formDataList());
            this.serviceCharge.at(index).get('connectSignal').patchValue(e.connectSignal);
            this.serviceCharge.at(index).get('location').patchValue(e.location);
            this.serviceCharge.at(index).get('amountLg').patchValue(e.amountLg);
            this.serviceCharge.at(index).get('amountMonth').patchValue(e.amountMonth);
            this.serviceCharge.at(index).get('remark').patchValue(e.remark);
          });
          this.calAmount();
        } else {
          this.serviceCharge.controls.splice(0, this.serviceCharge.controls.length);
          this.serviceCharge.patchValue([]);
        }

      } else {
        this.modalError.openModal(MessageService.MSG.FAILED_CALLBACK);
      }
      this.commonService.unLoading();
    }, (err) => {
      console.error(err);
      this.modalError.openModal(err);
    });
  }

}
