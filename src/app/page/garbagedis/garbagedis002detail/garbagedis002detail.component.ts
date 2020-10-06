import {
  Component,
  OnInit,
  ViewChild,
  TemplateRef
} from "@angular/core";
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormArray
} from "@angular/forms";
import { CommonService } from "src/app/_service/ common.service";
import { AjaxService } from "src/app/_service/ajax.service";
import { ResponseData } from "src/app/common/models/response-data.model";
import { MessageService } from "src/app/_service/message.service";
import { Router, ActivatedRoute } from "@angular/router";
import { Utils } from "src/app/common/helper";
import { ValidateService } from "src/app/_service/validate.service";
import { ModalConfirmComponent } from "src/app/components/modal/modal-confirm/modalConfirm.component";
import { ModalErrorComponent } from "src/app/components/modal/modal-error/modalError.component";
import { ModalSuccessComponent } from "src/app/components/modal/modal-success/modalSuccess.component";
import { BsModalRef, BsModalService } from "ngx-bootstrap/modal/";
import { InputCalendarComponent } from 'src/app/components/input/input-calendar/input-calendar.component';
import { ModalCustomComponent } from 'src/app/components/modal/modal-custom/modalCustom.component';
import { DecimalFormatPipe } from 'src/app/common/pipes';
import { NumberUtils } from 'src/app/common/helper/number';

const URL = {
  SAVE: "garbagedis002/save",
  UPDATE_INFO: "garbagedis001/update",
  FIND_INFO_ID: "garbagedis001/find_id",
  FIND_ID: "garbagedis002/find_id",
  GET_DROPDOWN_EQP: "heavyeqp002/list",
  GET_SAP_CUT: "common/getSAPCustumer/",
  GET_SAP_CON_NO: "common/getSAPContractNo/",
  GET_DROPDOWN_LOV: "lov/list-data-detail",
  GET_DROPDOWN_TRASH: "garbagedis003/list-trash-fee",
  GET_DROPDOWN_SIZE: "garbagedis003/list-trash-size"
};

@Component({
  selector: 'app-garbagedis002detail',
  templateUrl: './garbagedis002detail.component.html',
  styleUrls: ['./garbagedis002detail.component.css']
})
export class Garbagedis002detailComponent implements OnInit {
  @ViewChild('chargeRateModal') modalChargeRate: ModalCustomComponent;
  @ViewChild("saveModal") modalSave: ModalConfirmComponent;
  @ViewChild("errorModal") modalError: ModalErrorComponent;
  @ViewChild("successModal") modalSuccess: ModalSuccessComponent;
  @ViewChild('calendarStart') calendarStart: InputCalendarComponent;
  @ViewChild('calendarEnd') calendarEnd: InputCalendarComponent;

  breadcrumb: any = [
    {
      label: "หมวดกำจัดขยะ",
      link: "/home/firebrigade",
    },
    {
      label: "ขอใช้บริการกำจัดขยะ",
      link: "#",
    },
    {
      label: "เพิ่มขอใช้บริการกำจัดขยะ",
      link: "#",
    }
  ];
  formAddGarbage: FormGroup;
  formSearchCus: FormGroup;
  formChargeRate: FormGroup;
  chargeRateDtl: FormArray;

  // custummer table
  modalCustomer: BsModalRef;
  tableCustomer: any;
  customerList: any[] = [];
  contractNoList: any[] = [];
  id: any;
  paymentType: any;
  eqplist: any;
  dataeqplistFilter: any[] = [];
  trashList: any[] = [];
  roList: any[] = [];
  total2: any;
  total: any;
  sumall: any;
  datepipe: any;
  datepipe1: string;
  datepipe2: string;
  garbageType: any;
  sizeList: any;
  // update 
  isInfoUpdate: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private commonService: CommonService,
    private modalService: BsModalService,
    private ajax: AjaxService,
    private route: ActivatedRoute,
    private validate: ValidateService,
    private router: Router
  ) {
    this.formAddGarbage = this.formBuilder.group({
      garInfoId: [""],
      garReqId: [""],
      customerCode: ["", Validators.required],
      customerName: ["", Validators.required],
      customerBranch: ["", Validators.required],
      contractNo: ["", Validators.required],
      rentalObject: ["", Validators.required],
      serviceType: ["", Validators.required],
      trashLocation: ["", Validators.required],
      startDate: ["", Validators.required],
      endDate: ["", Validators.required],
      totalChargeRates: [""],
      address: ["", Validators.required],
      remark: [""],
      chargeRateDtl: this.formBuilder.array([]),
      totalTrashWeight: [0],
      totalMoneyAmount: [0],
      showButton: [""],
    });

    this.formSearchCus = this.formBuilder.group({
      type: [''],
      criteria: ['']
    });

    this.setFormChargeRate();
  }

  ngOnInit() {
    this.formAddGarbage.get('garReqId').patchValue(this.route.snapshot.queryParams['garReqId']);
    this.formAddGarbage.get('garInfoId').patchValue(this.route.snapshot.queryParams['garInfoId']);
    if (Utils.isNotNull(this.formAddGarbage.get('garReqId').value)) {
      this.findById(this.formAddGarbage.get('garReqId').value);
    } else if (Utils.isNotNull(this.formAddGarbage.get('garInfoId').value)) {
      this.findByGarInfoId();
      this.isInfoUpdate = true;
    } else {
      this.getDropDawn();
    }
  }

  setFormChargeRate() {
    this.formChargeRate = this.formBuilder.group({
      garReqDtlId: [""],
      trashType: ["", Validators.required],
      trashWeight: ["0", Validators.required],
      trashSize: [null],
      chargeRates: [null],
      moneyAmount: ["0"],
    })
  }

  getDropDawn() {
    this.commonService.loading();
    this.ajax
      .doPost(`${URL.GET_DROPDOWN_LOV}`, { lovKey: "PAYMENT_TYPE" })
      .subscribe((res: ResponseData<any>) => {
        console.log("meter", res.data);
        this.paymentType = res.data;
      });
    this.ajax
      .doPost(`${URL.GET_DROPDOWN_LOV}`, { lovKey: "GARBAGE_TYPE" })
      .subscribe((res: ResponseData<any>) => {
        console.log("garbageType", res.data);
        this.garbageType = res.data;
      });
    this.ajax
      .doPost(URL.GET_DROPDOWN_SIZE, {})
      .subscribe((res: ResponseData<any>) => {
        this.sizeList = res.data;
        console.log("res", this.sizeList);
      });
    this.ajax
      .doPost(URL.GET_DROPDOWN_EQP, {})
      .subscribe((res: ResponseData<any>) => {
        this.eqplist = res.data;
        console.log("res", this.eqplist);
      });
    if (Utils.isNull(this.formAddGarbage.get('garReqId').value)) {
      this.ajax.doPost(URL.GET_DROPDOWN_TRASH, {}).subscribe((res: ResponseData<any>) => {
        console.log(res.data);
        this.trashList = res.data;
        this.createChargeRateDtl();
        // console.log("this.dataList : ", this.dataList);
        this.commonService.unLoading();
      });
    }
  }

  //=================== modal ============================
  async openModalCustomer(template: TemplateRef<any>) {
    this.modalCustomer = this.modalService.show(template, {
      class: "modal-xl"
    });
    this.customerList = await this.getSapCus();
    this.datatableCustomer();
  }

  async onSearchModal() {
    this.formSearchCus.patchValue({ type: 'null' });
    this.customerList = await this.getSapCus();
    this.datatableCustomer();
  }

  //=================== Action ============================
  async getContractNoList(partner: string, branchCode: string) {
    //clear data
    this.formAddGarbage.get("contractNo").patchValue("");
    this.contractNoList = await this.getSapContractNo(partner, branchCode);
  }

  onCloseModalCustomer() {
    this.modalCustomer.hide();
  }

  dateChange(formControlName: string, event) {
    this.formAddGarbage.get(formControlName).patchValue(event);
  }

  onContractNoChange(event) {
    let contractNo = event.target.value;
    this.contractNoList.forEach(element => {
      if (contractNo === element.contractNo) {
        if (Utils.isNotNull(element.contractEndDate)) {
          console.log("element: ", element);
          // this.formAddGarbage.get('endDate').patchValue(element.contractEndDate);
          this.calendarEnd.setDate(element.bpValidTo);
          this.ajax.doGet(`common/getUtilityArea/${contractNo}`).subscribe((response: ResponseData<any>) => this.roList = response.data);
        }
        return;
      }
    });
  }

  createChargeRateDtl() {
    this.chargeRateDtl = this.formAddGarbage.get('chargeRateDtl') as FormArray;
    this.trashList.forEach(element => {
      this.addChargeRate(element)
    });
  }

  addChargeRate(formData: any) {
    this.setFormChargeRate();
    this.formChargeRate.patchValue({
      trashType: formData.trashType,
      trashSize: formData.trashSize,
      chargeRates: formData.chargeRates,
    })
    this.chargeRateDtl = this.formAddGarbage.get('chargeRateDtl') as FormArray;
    this.chargeRateDtl.push(this.formChargeRate);
  }

  onTrashWeightChange(index: number, event: any) {
    this.chargeRateDtl = this.formAddGarbage.get('chargeRateDtl') as FormArray;
    this.chargeRateDtl.at(index).get('trashWeight').patchValue(NumberUtils.numberToDecimalFormat(event.target.value, '###,###'));
    let data = this.chargeRateDtl.at(index).value;
    let moneyAmount = (NumberUtils.decimalFormatToNumber(data.trashWeight) / 1000) * NumberUtils.decimalFormatToNumber(data.chargeRates);
    this.chargeRateDtl.at(index).get('moneyAmount').patchValue(NumberUtils.numberToDecimalFormat(moneyAmount));
    this.calculateTotal();
  }

  calculateTotal() {
    this.chargeRateDtl = this.formAddGarbage.get('chargeRateDtl') as FormArray;
    let totalTrashWeight = 0;
    let totalMoneyAmount = 0;
    for (let index = 0; index < this.chargeRateDtl.length; index++) {
      const element = this.chargeRateDtl.at(index).value;
      totalTrashWeight += NumberUtils.decimalFormatToNumber(element.trashWeight);
      totalMoneyAmount += (NumberUtils.decimalFormatToNumber(element.trashWeight) / 1000) * NumberUtils.decimalFormatToNumber(element.chargeRates);
    }
    this.formAddGarbage.patchValue({
      totalTrashWeight: NumberUtils.numberToDecimalFormat(totalTrashWeight),
      totalMoneyAmount: NumberUtils.numberToDecimalFormat(totalMoneyAmount),
    })
  }

  chargeRateValidate() {
    // let validateData = [
    //   { format: '', header: 'ประเภทขยะ', value: this.formChargeRate.value.trashType },
    //   { format: 'number', header: 'น้ำหนักขยะ', value: this.formChargeRate.value.trashWeight }
    // ];
    // this.validate.checking(validateData);
  }

  goBack() {
    if (Utils.isNotNull(this.formAddGarbage.get('garInfoId').value)) {
      this.router.navigate(['/garbagedis/garbagedis001']);
    } else {
      this.router.navigate(['/garbagedis/garbagedis002']);
    }
  }

  //=======================  Call Back_end =======================
  //List รหัสผู้ประกอบการ
  getSapCus() {
    const promise = new Promise((resolve, reject) => {
      this.ajax.doPost(URL.GET_SAP_CUT, this.formSearchCus.value).subscribe(
        (res: any) => {
          resolve(res);
        },
        err => {
          console.error(err);
          reject(err);
        }
      );
    });

    return promise.then((data: any) => {
      return data.data;
    });
  }

  //List ContractNo
  getSapContractNo(partner: string, branchCode: string) {
    const promise = new Promise((resolve, reject) => {
      this.ajax.doGet(`${URL.GET_SAP_CON_NO}${partner}/${branchCode}`).subscribe(
        (res: any) => {
          resolve(res);
        },
        err => {
          console.error(err);
          reject(err);
        }
      );
    });

    return promise.then((data: any) => {
      return data.data;
    });
  }

  findById(id) {
    this.commonService.loading();
    let data = {
      garReqId: id,
    }
    this.ajax.doPost(URL.FIND_ID, data).subscribe((res: ResponseData<any>) => {
      if (MessageService.MSG.SUCCESS == res.status) {
        this.formAddGarbage.get('customerCode').patchValue(res.data.customerCode);
        this.formAddGarbage.get('customerName').patchValue(res.data.customerName);
        this.formAddGarbage.get('customerBranch').patchValue(res.data.customerBranch);
        this.formAddGarbage.get('contractNo').patchValue(res.data.contractNo);
        this.formAddGarbage.get('rentalObject').patchValue(res.data.rentalObject);
        this.formAddGarbage.get('serviceType').patchValue(res.data.serviceType);
        this.formAddGarbage.get('trashLocation').patchValue(res.data.trashLocation);
        this.formAddGarbage.get('startDate').patchValue(res.data.startDate);
        this.calendarStart.setDate(this.formAddGarbage.get('startDate').value);
        // this.formAddGarbage.get('endDate').patchValue(res.data.endDate);
        this.calendarEnd.setDate(res.data.endDate);
        this.formAddGarbage.get('totalChargeRates').patchValue(NumberUtils.numberToDecimalFormat(res.data.totalChargeRates));
        this.formAddGarbage.get('totalTrashWeight').patchValue(NumberUtils.numberToDecimalFormat(res.data.totalTrashWeight));
        this.formAddGarbage.get('totalMoneyAmount').patchValue(NumberUtils.numberToDecimalFormat(res.data.totalMoneyAmount));
        this.formAddGarbage.get('address').patchValue(res.data.address);
        this.formAddGarbage.get('remark').patchValue(res.data.remark);
        this.chargeRateDtl = this.formAddGarbage.get('chargeRateDtl') as FormArray;
        res.data.chargeRateDtl.forEach(element => {
          this.setFormChargeRate();
          this.formChargeRate.patchValue({
            garReqDtlId: element.garReqDtlId,
            trashType: element.trashType,
            trashWeight: NumberUtils.numberToDecimalFormat(element.trashWeight, "###,###"),
            trashSize: NumberUtils.numberToDecimalFormat(element.trashSize, "###,###"),
            chargeRates: NumberUtils.numberToDecimalFormat(element.chargeRates),
            moneyAmount: NumberUtils.numberToDecimalFormat(element.moneyAmount),
          })
          this.chargeRateDtl.push(this.formChargeRate);
        });
      } else {
        this.modalError.openModal(res.message);
        this.goBack();
      }
      this.commonService.unLoading();
    })
  }

  findByGarInfoId() {
    this.commonService.loading();
    let data = {
      garInfoId: this.formAddGarbage.get('garInfoId').value,
    }
    this.ajax.doPost(URL.FIND_INFO_ID, data).subscribe((res: ResponseData<any>) => {
      if (MessageService.MSG.SUCCESS == res.status) {
        this.formAddGarbage.get('customerCode').patchValue(res.data.customerCode);
        this.formAddGarbage.get('customerName').patchValue(res.data.customerName);
        this.formAddGarbage.get('customerBranch').patchValue(res.data.customerBranch);
        this.formAddGarbage.get('contractNo').patchValue(res.data.contractNo);
        this.formAddGarbage.get('rentalObject').patchValue(res.data.rentalObject);
        this.formAddGarbage.get('serviceType').patchValue(res.data.serviceType);
        this.formAddGarbage.get('trashLocation').patchValue(res.data.trashLocation);
        this.formAddGarbage.get('startDate').patchValue(res.data.startDate);
        this.calendarStart.setDate(this.formAddGarbage.get('startDate').value);
        // this.formAddGarbage.get('endDate').patchValue(res.data.endDate);
        this.calendarEnd.setDate(res.data.endDate);
        this.formAddGarbage.get('totalChargeRates').patchValue(NumberUtils.numberToDecimalFormat(res.data.totalChargeRates));
        this.formAddGarbage.get('totalTrashWeight').patchValue(NumberUtils.numberToDecimalFormat(res.data.totalTrashWeight));
        this.formAddGarbage.get('totalMoneyAmount').patchValue(NumberUtils.numberToDecimalFormat(res.data.totalMoneyAmount));
        this.formAddGarbage.get('address').patchValue(res.data.address);
        this.formAddGarbage.get('remark').patchValue(res.data.remark);
        this.chargeRateDtl = this.formAddGarbage.get('chargeRateDtl') as FormArray;
        res.data.chargeRateDtl.forEach(element => {
          this.setFormChargeRate();
          this.formChargeRate.patchValue({
            garReqDtlId: element.garReqDtlId,
            trashType: element.trashType,
            trashWeight: NumberUtils.numberToDecimalFormat(element.trashWeight, "###,###"),
            trashSize: NumberUtils.numberToDecimalFormat(element.trashSize, "###,###"),
            chargeRates: NumberUtils.numberToDecimalFormat(element.chargeRates),
            moneyAmount: NumberUtils.numberToDecimalFormat(element.moneyAmount),
          })
          this.chargeRateDtl.push(this.formChargeRate);
        });
      } else {
        this.modalError.openModal(res.message);
        this.goBack();
      }
      this.commonService.unLoading();
    })
  }

  //============================= table ====================================
  //Table รหัสผู้ประกอบการ
  datatableCustomer() {
    if (this.tableCustomer != null) {
      this.tableCustomer.destroy();
    }
    this.tableCustomer = $("#datatableCustomer").DataTable({
      processing: true,
      serverSide: false,
      searching: false,
      ordering: false,
      paging: true,
      scrollX: true,
      data: this.customerList,
      columns: [
        {
          data: "customerCode",
          className: "text-left"
        },
        {
          data: "customerName",
          className: "text-left"
        },
        {
          data: "adrKind",
          className: "text-center"
        },
        {
          data: "address",
          className: "text-left"
        },
        {
          className: "text-center",
          render(data, type, row, meta) {
            return `<button class="btn btn-primary btn-sm" type="button">เลือก</button>`;
          }
        }
      ]
    });

    this.tableCustomer.on("click", "td > button.btn-primary", event => {
      const data = this.tableCustomer
        .row($(event.currentTarget).closest("tr"))
        .data();
      this.formAddGarbage.patchValue({
        customerCode: data.customerCode,
        customerName: data.customerName,
        customerBranch: data.adrKind + " : " + data.address
      });

      this.getContractNoList(data.partner, data.adrKind);
      this.onCloseModalCustomer();
    });
  }

  async onValidate() {
    const validateData = [
      { format: "", header: "รหัสผู้ประกอบการ", value: this.formAddGarbage.value.customerCode },
      { format: "", header: "เลขที่สัญญา", value: this.formAddGarbage.value.contractNo },
      { format: "", header: "พื้นที่เช่า", value: this.formAddGarbage.value.rentalObject },
      { format: "", header: "ประเภทการบริการ", value: this.formAddGarbage.value.serviceType },
      { format: "", header: "สถานที่วางถังขยะ", value: this.formAddGarbage.value.trashLocation },
      { format: "", header: "วันที่เริ่มใช่บริการ", value: this.formAddGarbage.value.startDate },
      { format: "", header: "วันที่สิ้นสุดบริการ", value: this.formAddGarbage.value.endDate },
      { format: "", header: "ที่อยู่จัดส่งใบแจ้งหนี้", value: this.formAddGarbage.value.address }
    ];
    if (!this.validate.checking(validateData)) {
      return;
    }
    if (this.formAddGarbage.valid) {
      // console.log('validator', this.formData);
      this.modalSave.openModal();
      return;
    }
  }

  //===========================  Action =====================
  onSave() {
    //set decimal to number
    let totalChargeRates = this.formAddGarbage.get('totalChargeRates').value;
    let totalTrashWeight = this.formAddGarbage.get('totalTrashWeight').value;
    let totalMoneyAmount = this.formAddGarbage.get('totalMoneyAmount').value;
    this.formAddGarbage.patchValue({
      totalChargeRates: NumberUtils.decimalFormatToNumber(totalChargeRates),
      totalTrashWeight: NumberUtils.decimalFormatToNumber(totalTrashWeight),
      totalMoneyAmount: NumberUtils.decimalFormatToNumber(totalMoneyAmount),
    })
    this.chargeRateDtl = this.formAddGarbage.get('chargeRateDtl') as FormArray;
    for (let index = 0; index < this.chargeRateDtl.length; index++) {
      const element = this.chargeRateDtl.value[index];
      this.chargeRateDtl.get(index.toString()).patchValue({
        trashType: element.trashType,
        trashWeight: NumberUtils.decimalFormatToNumber(element.trashWeight.toString()),
        trashSize: NumberUtils.decimalFormatToNumber(element.trashSize.toString()),
        chargeRates: NumberUtils.decimalFormatToNumber(element.chargeRates.toString()),
        moneyAmount: NumberUtils.decimalFormatToNumber(element.moneyAmount.toString()),
      })
    }
    if (Utils.isNotNull(this.formAddGarbage.get('garInfoId').value)) {
      this.updateGarbagedisInfo();
    } else {
      this.saveAddManageHeavyEquipment();
    }
  }

  saveAddManageHeavyEquipment() {
    console.log(
      "saveFormAddElectricity : ",
      this.formAddGarbage.value
    );
    this.commonService.loading();
    this.ajax
      .doPost(URL.SAVE, this.formAddGarbage.value)
      .subscribe((res: ResponseData<any>) => {
        console.log(res.data);
        if (MessageService.MSG.SUCCESS == res.status) {
          this.modalSuccess.openModal();
          this.goBack();
          console.log(res.message);
        } else {
          this.modalError.openModal(res.message);
          console.log(res.message);
        }
        this.commonService.unLoading();
      });
  }

  updateGarbagedisInfo() {
    this.commonService.loading();
    this.ajax
      .doPost(URL.UPDATE_INFO, this.formAddGarbage.value)
      .subscribe((res: ResponseData<any>) => {
        console.log(res.data);
        if (MessageService.MSG.SUCCESS == res.status) {
          this.modalSuccess.openModal();
          this.goBack();
        } else {
          this.modalError.openModal(res.message);
          console.log(res.message);
        }
        this.commonService.unLoading();
      });
  }

  //========================= validateControlSave ===============================
  validateControlSave(control: string) {
    return false;
  }
}

