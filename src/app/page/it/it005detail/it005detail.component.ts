import { Component, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
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
import { ColorPickerService, Cmyk } from 'ngx-color-picker';

const URL = {
  GET_LIST_BY_ROOM: 'it005/getListByRoom',
  SAVE: "it005/save",
  GET_SAP_CUS: 'common/getSAPCustumer/',
  GET_SAP_CON_NO: 'common/getSAPContractNo/',
  GET_ROOM_TYPE_LIST: 'it0103/get_all',
  FIND_ID: "it005/find_id",
  GET_RENTAL_AREA: 'common/getUtilityArea/',
  GET_PAY_MEN: 'lov/list-data-detail',

}
@Component({
  selector: 'app-it005detail',
  templateUrl: './it005detail.component.html',
  styleUrls: ['./it005detail.component.css']
})
export class It005detailComponent implements OnInit {
  @ViewChild('selectCusModal') modalCustomer: ModalCustomComponent;
  @ViewChild('saveModal') modalSave: ModalConfirmComponent;
  @ViewChild('successModal') modalSuccess: ModalSuccessComponent;
  @ViewChild('errorModal') modalError: ModalErrorComponent;
  @ViewChild('calendar') calendar: InputCalendarComponent;
  breadcrumb: any = [
    {
      label: "หมวด IT",
      link: "/home/it",
    },
    {
      label: "เพิ่มรายการขอใช้บริการจองห้องฝึกอบรม CUTE ",
      link: "#",
    },

  ];

  formSearchCus: FormGroup = new FormGroup({});
  formTimeperiod: FormGroup = new FormGroup({});
  formGroup: FormGroup;
  flagEdit: boolean = false;
  dataTableCustomer: any;
  checkbox1: boolean = true;
  checkbox2: any;
  checkbox3: any;
  dataListCustomer: any[] = [];
  contractNoList: any[] = [];
  endDateList: any[] = [];
  roomTypeList: any[] = [];
  //paymentType
  paymentTypeList: any[] = [];


  /* constant */
  paymentTypeConst = ['CASH', 'BILLING'];
  count: number = 0;
  result: any[];
  tempTime: any[] = [];
  public color: string = '#ffffff';
  constructor(
    private fb: FormBuilder,
    private ajax: AjaxService,
    private commonService: CommonService,
    private route: ActivatedRoute,
    private router: Router,
    private validate: ValidateService,
    public vcRef: ViewContainerRef,
    private cpService: ColorPickerService
  ) {
    this.getPayment();
    this.formTimeperiod = this.fb.group({
      time1: false,
      time2: false,
      time3: false,
    });
    this.formSearchCus = this.fb.group({
      type: [''],
      criteria: ['']
    });
    this.formGroup = this.fb.group({
      itTrainingRoomUsageId: [""],
      entreprenuerName: ["", Validators.required],
      entreprenuerCode: [""],
      entreprenuerBranch: [""],
      contractNo: [""],
      rentalAreaName: [""],
      totalChargeRates: [null],
      roomType: ["", Validators.required],
      reqStartDate: ["", Validators.required],
      timeperiod: [""],
      remark: [""],

      invoiceNo: [""],
      invoiceAddress: [""],
      receiptNo: [""],

      paymentType: [''], //วิธีชำระเงินประกัน
      bankName: [''], //ชื่อธนาคาร
      bankBranch: [''], //สาขา 
      bankExplanation: [''],//คำอธิบาย
      bankGuaranteeNo: [''],//Bank guarantee
      bankExpNo: [''], //วันหมดอายุ
      // colorTime: ['']
    });
  }
  // =========================== initial setting ===================
  async ngOnInit() {
    await this.getRoomTypeList();
    this.formGroup.get('itTrainingRoomUsageId').patchValue(this.route.snapshot.queryParams['itTrainingRoomUsageId']);
    if (Utils.isNotNull(this.formGroup.get('itTrainingRoomUsageId').value)) {
      this.findById(this.formGroup.get('itTrainingRoomUsageId').value);
    }

  }
  // ============================ action =========================

  onValidateBeforeSave() {
    let validateData = [
      { format: "", header: "ชื่อผู้ประกอบการ", value: this.formGroup.get("entreprenuerName").value },
      { format: "", header: "ห้องฝึกอบรม", value: this.formGroup.get("roomType").value },
      { format: "", header: "วันที่ใช้งาน", value: this.formGroup.get("reqStartDate").value },
    ];
    if (this.validate.checking(validateData)) {
      if (this.formGroup.invalid) {
        this.modalError.openModal("กรุณากรอกข้อมูลให้ครบ");
      } else {
        this.modalSave.openModal();
      }
    }
  }

  disableCheckbox(i) {
    document.getElementById("checkbox" + i).setAttribute('disabled', 'disabled');
  }

  enableCheckbox() {
    for (let i = 1; i <= 3; i++)
      document.getElementById("checkbox" + i).removeAttribute('disabled');
  }

  onCheckBoxChange(e, idx) {
    for (let i = 1; i <= 3; i++) {
      this.formTimeperiod.get('time' + i).patchValue(false);
      this.formTimeperiod.get('time' + idx).patchValue(true);
    }
    if (this.tempTime.length !== 0) {
      this.onLoopCheck(this.tempTime);
    }
    this.formGroup.get('timeperiod').patchValue(e.target.value);
    console.log(this.formGroup.value.timeperiod);
  }

  onOpenModalCustomer() {
    this.formSearchCus.reset();
    this.count = this.count + 1;
    this.getCustomer();
    this.modalCustomer.openModal(ModalCustomComponent.MODAL_SIZE.EXTRA_LARGE);

  }

  onSelectRoomType(event) {
    let roomType = event.target.value;
    this.roomTypeList.forEach((data) => {
      if (roomType === data.serviceType) {
        this.formGroup.get('roomType').patchValue(data.serviceType);
        this.formGroup.get('totalChargeRates').patchValue(data.chargeRate);
        return;
      }
    });
    this.getFindList(this.formGroup.get('reqStartDate').value, this.formGroup.get('roomType').value);
  }

  onLoopCheck(data) {
    for (let i = 0; i < data.length; i++) {
      if (data[i].timeperiod === "08.00-16.00") {
        this.formTimeperiod.get("time1").patchValue(true);
        this.disableCheckbox(1);
      }
      if (data[i].timeperiod === "16.00-00.00") {
        this.formTimeperiod.get("time2").patchValue(true);
        this.disableCheckbox(2);
      }
      if (data[i].timeperiod === "00.00-08.00") {
        this.formTimeperiod.get("time3").patchValue(true);
        this.disableCheckbox(3);
      }
    }
  }

  // ================================ call back-end ==================
  callSave() {
    console.log("this.formGroup.value : ", this.formGroup.value);

    this.commonService.loading();
    this.ajax.doPost(URL.SAVE, this.formGroup.value).subscribe((res: ResponseData<any>) => {
      if (MessageService.MSG.SUCCESS == res.status) {
        this.modalSuccess.openModal();
        this.router.navigate(['/it/it005']);
      } else {
        this.modalError.openModal(res.message);
      }
      this.commonService.unLoading();
    });
  }

  getFindList(dateData, roomData) {
    this.commonService.loading();
    this.ajax.doPost(URL.GET_LIST_BY_ROOM, { reqStartDate: dateData, roomType: roomData }).subscribe(
      (res: ResponseData<any>) => {
        if (res.data.length !== 0) {
          this.formTimeperiod.reset();
          this.tempTime = res.data;
          this.onLoopCheck(res.data);
        } else {
          this.formTimeperiod.reset();
          this.enableCheckbox();
        }

        this.commonService.unLoading();
      },
      (err) => {
        this.commonService.unLoading();
      }
    );
  }


  findById(id) {
    this.commonService.loading();
    let data = {
      itTrainingRoomUsageId: id
    }
    this.ajax.doPost(URL.FIND_ID, data).subscribe((res: ResponseData<any>) => {
      if (MessageService.MSG.SUCCESS == res.status) {
        console.log("DATA FIND_ID LIST : ", res.data);
        this.formGroup.get('entreprenuerName').patchValue(res.data.entreprenuerName);
        this.formGroup.get('entreprenuerCode').patchValue(res.data.entreprenuerCode);
        this.formGroup.get('entreprenuerBranch').patchValue(res.data.entreprenuerBranch);
        this.formGroup.get('rentalAreaName').patchValue(res.data.rentalAreaName);
        this.formGroup.get('contractNo').patchValue(res.data.contractNo);
        this.formGroup.get('reqStartDate').patchValue(res.data.reqStartDate);
        this.calendar.setDate(this.formGroup.get('reqStartDate').value);
        for (let i = 0; i < this.paymentTypeList.length; i++) {
          if (res.data.paymentType === this.paymentTypeList[i].descEn1) {
            console.log(res.data.paymentType);
            this.formGroup.get('paymentType').patchValue(this.paymentTypeList[i].descTh1);
            break;
          }
        }
        this.formGroup.get('roomType').patchValue(res.data.roomType);
        this.formGroup.get('totalChargeRates').patchValue(res.data.totalChargeRates);
        this.formGroup.get('timeperiod').patchValue(res.data.timeperiod);
        this.formGroup.get('remark').patchValue(res.data.remark);
        this.formGroup.get('invoiceAddress').patchValue(res.data.invoiceAddress);
        // this.formGroup.get('colorTime').patchValue(res.data.colorTime);
        // this.color = res.data.colorTime
        this.flagEdit = !this.flagEdit;

        this.setCheckboxTimeperiod();

        // if (Utils.isNotNull(this.formGroup.get('reqStartDate').value) && Utils.isNotNull(this.formGroup.get('roomType').value)) {
        //   this.getFindList(this.formGroup.get('reqStartDate').value, this.formGroup.get('roomType').value);
        // }

        if (this.flagEdit) {
          for (let i = 1; i <= 3; i++)
            this.disableCheckbox(i);
        }
      } else {
        this.modalError.openModal(res.message);
        this.router.navigate(['/it/it005']);
      }
      this.commonService.unLoading();
    })
  }

  setCheckboxTimeperiod() {
    if (this.formGroup.value.timeperiod === "08.00-16.00") {
      this.formTimeperiod.get("time1").patchValue(true);
    }
    if (this.formGroup.value.timeperiod === "16.00-00.00") {
      this.formTimeperiod.get("time2").patchValue(true);
    }
    if (this.formGroup.value.timeperiod === "00.00-08.00") {
      this.formTimeperiod.get("time3").patchValue(true);
    }
  }

  //getRentalArea
  async getRentalAreaList(event) {
    let contractNo = '0';
    if (Utils.isNotNull(event.target.value)) {
      contractNo = event.target.value;
    }
    this.ajax.doGet(`${URL.GET_RENTAL_AREA}${contractNo}`).subscribe(
      (res: any) => {
        if (res.data.length != 0) {
          this.formGroup.patchValue({
            rentalAreaName: res.data[0].roName
          })
        } else {
          this.formGroup.patchValue({
            rentalAreaName: ''
          })
        }

      });

  }

  getPayment() {
    this.ajax.doPost(`${URL.GET_PAY_MEN}`, { lovKey: 'PAYMENT_TYPE_IT' }).subscribe(
      (res: any) => {
        this.paymentTypeList = res.data;
        for (let i = 0; i < this.paymentTypeList.length; i++) {
          if (this.paymentTypeList[i].descEn1 == 'BANK_GUARANTEE')
            this.paymentTypeList.splice(1, i);
        }

      });
  }


  getCustomer() {
    this.commonService.loading();
    this.formSearchCus.patchValue({ type: 'null' })
    this.ajax.doPost(URL.GET_SAP_CUS, this.formSearchCus.value).subscribe(async (res: ResponseData<any>) => {
      if (MessageService.MSG.SUCCESS == res.status) {
        this.dataListCustomer = res.data;
        await this.initDataTableCustomer();
      } else {
        this.modalError.openModal(res.message);
      }
      this.commonService.unLoading();
    })
  }

  getContractNoList(partner: string, code: string) {
    this.commonService.loading();
    this.ajax.doGet(URL.GET_SAP_CON_NO + partner + "/" + code).subscribe((res: ResponseData<any>) => {
      if (MessageService.MSG.SUCCESS == res.status) {
        this.contractNoList = res.data;
      } else {
        this.modalError.openModal(res.message);
      }
      this.commonService.unLoading();
    })
  }

  getRoomTypeList() {
    this.commonService.loading();
    this.ajax.doPost(URL.GET_ROOM_TYPE_LIST, {}).subscribe((res: ResponseData<any>) => {
      if (MessageService.MSG.SUCCESS == res.status) {
        this.roomTypeList = res.data;
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
          data: "adrKind", className: "text-left"
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
    if (this.count === 1) {
      this.clickBtn();
    }

  }

  setDate(e, control: string) {
    this.formGroup.get(control).patchValue(e);
    this.getFindList(this.formGroup.get('reqStartDate').value, this.formGroup.get('roomType').value);
  }

  // event Click button in dataTable
  clickBtn() {
    this.dataTableCustomer.on('click', 'button#selectCus', (event) => {
      const data = this.dataTableCustomer.row($(event.currentTarget).closest('tr')).data();
      this.formGroup.patchValue({
        entreprenuerName: data.customerName,
        entreprenuerCode: data.customerCode,
        entreprenuerBranch: data.adrKind + " : " + data.address,
      })
      this.getContractNoList(data.partner, data.adrKind);
      this.modalCustomer.onClick(ModalCustomComponent.MODAL_ACTION.CLOSE);
    });
  }


  // public onChangeColor(color: string): Cmyk {
  //   const hsva = this.cpService.stringToHsva(color);
  //   const rgba = this.cpService.hsvaToRgba(hsva);
  //   console.log(color);
  //   console.log(rgba);
  //   this.formGroup.patchValue({
  //     colorTime: color
  //   })
  //   return this.cpService.rgbaToCmyk(rgba);
  // }

}
