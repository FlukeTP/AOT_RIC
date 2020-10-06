import {
  Component,
  OnInit,
  ViewChild,
  TemplateRef,
  Input
} from "@angular/core";
import {
  FormGroup,
  FormControl,
  FormBuilder,
  Validators
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
import * as moment from 'moment';
import { NumberUtils } from 'src/app/common/helper/number';

const URL = {
  SAVE: "heavyeqp001/save",
  // EDIT_ID: "heavyeqp002/listEditId",
  // GET_DROPDOWN: "lov/list-data-detail",
  // EDIT: "heavyeqp002/edit"

  GET_DROPDOWN_EQP: "heavyeqp002/list",
  GET_SAP_CUT: 'common/getSAPCustumer/',
  GET_SAP_CON_NO: 'common/getSAPContractNo/',
  GET_RENTAL_AREA: 'common/getUtilityArea/',
  GET_DROPDOWN_LOV: "lov/list-data-detail"
};

@Component({
  selector: "app-heavyeqp001detail",
  templateUrl: "./heavyeqp001detail.component.html",
  styleUrls: ["./heavyeqp001detail.component.css"]
})
export class Heavyeqp001detailComponent implements OnInit {
  @ViewChild("saveModal") modalSave: ModalConfirmComponent;
  @ViewChild("errorModal") modalError: ModalErrorComponent;
  @ViewChild("successModal") modalSuccess: ModalSuccessComponent;

  breadcrumb: any = [
    {
      label: "หมวดเครื่องทุ่นแรง",
      link: "/home/heavyeqp"
    },
    {
      label: "รายได้ค่าบริการเครื่องทุ่นแรง",
      link: "#"
    },
    {
      label: "เพิ่มข้อมูลรายได้ค่าบริการเครื่องทุ่นแรง",
      link: "#"
    }
  ];

  formAddManageHeavyEquipment: FormGroup;
  formSearchCus: FormGroup = new FormGroup({});
  // custummer table
  id: any;
  paymentType: any;
  eqplist: any;
  dataeqplistFilter: any[] = [];
  total2: any;
  total: any;
  sumall: any;
  datepipe: any;
  datepipe1: string;
  datepipe2: string;

  tableCus: any;
  cusList: any[] = [];
  contractNoList: any[] = [];
  modalRef: BsModalRef;

  //Area
  rentalAreaList: any[] = [];

  //paymentType
  paymentTypeList: any[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private commonService: CommonService,
    private modalService: BsModalService,
    private ajax: AjaxService,
    private route: ActivatedRoute,
    private validate: ValidateService,
    private router: Router
  ) {
    this.formAddManageHeavyEquipment = this.formBuilder.group({
      heavyEquipmentRevenueId: [""],
      entreprenuerServiceCode: [""],
      entreprenuerServiceName: [""],
      entreprenuerServiceNo: [""],
      custumerCode: ["", Validators.required],
      custumerName: ["", Validators.required],
      custumerBranch: ["", Validators.required],
      contractNo: ["", Validators.required],
      equipmentType: ["", Validators.required],
      licensePlate: ["", Validators.required],
      numberLicensePlate: ["", Validators.required],
      startDate: [""],
      startTimeHH: [""],
      startTimeMM: [""],
      endDate: [""],
      endDateHH: [""],
      endDateMM: [""],
      periodTime: [""],
      allFees: ["", Validators.required],
      vat: ["", Validators.required],
      driverRates: ["", Validators.required],
      totalMoney: ["", Validators.required],
      paymentType: [""],
      responsiblePerson: ["", Validators.required],
      remark: [""],
      equipmentCode: [""]
    });

    this.formSearchCus = this.formBuilder.group({
      type: [''],
      criteria: ['']
    });
  }

  ngOnInit() {
    this.getDropDawn();
  }
  getDropDawn() {
    this.commonService.loading();
    this.ajax
      .doPost(`${URL.GET_DROPDOWN_LOV}`, { lovKey: "TRASH_PAYMENT_TYPE" })
      .subscribe((res: ResponseData<any>) => {
        console.log("meter", res.data);
        this.paymentType = res.data;
      });
    this.ajax
      .doPost(URL.GET_DROPDOWN_EQP, {})
      .subscribe((res: ResponseData<any>) => {
        this.eqplist = res.data;
        console.log("res", this.eqplist);
        this.commonService.unLoading();
      });
  }

  onChangeType(e) {
    this.dataeqplistFilter = this.eqplist.filter(data => {
      return data.manageHeavyEquipmentId == e.target.value;
    });
    this.formAddManageHeavyEquipment.patchValue({
      // equipmentCode: this.dataeqplistFilter[0].equipmentCode,
      equipmentType: this.dataeqplistFilter[0].equipmentType,
      licensePlate: this.dataeqplistFilter[0].licensePlate,
      remark: this.dataeqplistFilter[0].remark,
      numberLicensePlate: this.dataeqplistFilter[0].numberLicensePlate,
      responsiblePerson: this.dataeqplistFilter[0].responsiblePerson
    });
    console.log(this.dataeqplistFilter);
  }

  sum() {
    let vat = NumberUtils.decimalFormatToNumber(this.formAddManageHeavyEquipment.value.allFees) * 0.07;
    let sumfeeVat = NumberUtils.decimalFormatToNumber(this.formAddManageHeavyEquipment.value.allFees) + vat;
    var dreivefeeam = Utils.isNull(this.formAddManageHeavyEquipment.value.driverRates) ? 0 : this.formAddManageHeavyEquipment.value.driverRates
    this.sumall = sumfeeVat +  NumberUtils.decimalFormatToNumber(dreivefeeam);
    this.formAddManageHeavyEquipment.patchValue({
      driverRates: dreivefeeam,
      vat: NumberUtils.numberToDecimalFormat(vat),
      totalMoney: NumberUtils.numberToDecimalFormat(this.sumall)
    });
  }

  setDate(e) {
    this.formAddManageHeavyEquipment.patchValue({
      startDate: e
    })

  }
  setDateEnd(e) {
    this.formAddManageHeavyEquipment.patchValue({
      endDate: e
    })
  }

  setTime() {
    this.datepipe1 = this.formAddManageHeavyEquipment.value.startDate + ' ' + this.formAddManageHeavyEquipment.value.startTimeHH + ':' + this.formAddManageHeavyEquipment.value.startTimeMM;
    this.datepipe2 = this.formAddManageHeavyEquipment.value.endDate + ' ' + this.formAddManageHeavyEquipment.value.endDateHH + ':' + this.formAddManageHeavyEquipment.value.endDateMM;
    var ms = moment(this.datepipe2, "DD/MM/YYYY HH:mm:ss").diff(moment(this.datepipe1, "DD/MM/YYYY HH:mm:ss"));
    var d = moment.duration(ms);
    var s = Math.floor(d.asHours()) + moment.utc(ms).format(" ชั่วโมง mm นาที");
    this.formAddManageHeavyEquipment.patchValue({
      // periodTime :  moment.utc(moment(this.datepipe2,"DD/MM/YYYY HH:mm:ss").diff(moment(this.datepipe1,"DD/MM/YYYY HH:mm:ss"))).format("Days วัน hh ชั่วโมง mm นาที")
      periodTime: d.days() + ' วัน ' + d.hours() + ' ชั่วโมง ' + d.minutes() + ' นาที'
    })
  }

  //=================== modal ===============
  openModalEntrepreneur(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, { class: 'modal-xl' });
    this.formSearchCus.reset();
    this.getCus();
  }

  //======================== ACTION ===================
  async getCus() {
    this.formSearchCus.patchValue({ type: 'null' })
    this.cusList = await this.getSapCus(this.formSearchCus.value);
    this.datatableCus();
  }

  async getContractNoList(partner: any, branchCode: string) {
    //clear contractNo
    this.formAddManageHeavyEquipment.get('contractNo').patchValue('');
    this.contractNoList = await this.getSapContractNo(partner, branchCode);
  }



  onCloseModal() {
    this.modalRef.hide();
  }

  setRentalAreaCode(even) {
    console.log(even.target.value);
    this.rentalAreaList = this.rentalAreaList.filter((data) => {
      return data.id == even.target.value
    })
    // this.formSave.patchValue({
    //   rentalAreaCode: this.rentalAreaList[0].roNumber,
    //   rentalAreaName: this.rentalAreaList[0].roName
    // })
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
      this.formAddManageHeavyEquipment.patchValue({
        custumerCode: data.customerCode,
        custumerName: data.customerName,
        custumerBranch: data.adrKind + " : " + data.address
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
  getSapContractNo(partner: string, branchCode: string) {
    const promise = new Promise((resolve, reject) => {
      this.ajax.doGet(`${URL.GET_SAP_CON_NO}${partner}/${branchCode}`).subscribe(
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
    let contractNo = '0';
    if (Utils.isNotNull(event.target.value)) {
      contractNo = event.target.value;
    }
    this.ajax.doGet(`${URL.GET_RENTAL_AREA}${contractNo}`).subscribe(
      (res: any) => {
        this.rentalAreaList = res.data;
      });
  }
  async onValidate() {
    const validateData = [
      {
        format: "",
        header: "รหัสผู้ประกอบการ",
        value: this.formAddManageHeavyEquipment.value.custumerCode
      },
      {
        format: "",
        header: "ชื่อผู้ประกอบการ",
        value: this.formAddManageHeavyEquipment.value.custumerName
      },
      {
        format: "",
        header: "สาขา",
        value: this.formAddManageHeavyEquipment.value.custumerBranch
      },
      {
        format: "",
        header: "เลขที่สัญญา",
        value: this.formAddManageHeavyEquipment.value.contractNo
      },
      {
        format: "",
        header: "เครื่องทุ่นแรง",
        value: this.formAddManageHeavyEquipment.value.equipmentType
      },
      // {
      //   format: "",
      //   header: "หมายเลข ",
      //   value: this.formAddManageHeavyEquipment.value.licensePlate
      // },
      // {
      //   format: "",
      //   header: "ทะเบียนรถ",
      //   value: this.formAddManageHeavyEquipment.value.numberLicensePlate
      // },
      // {
      //   format: "",
      //   header: "ผู้รับผิดชอบ",
      //   value: this.formAddManageHeavyEquipment.value.responsiblePerson
      // },
      {
        format: "",
        header: "จำนวนเงินรวม",
        value: this.formAddManageHeavyEquipment.value.totalMoney
      },
      {
        format: "",
        header: "รวมเงินจากการใช้งาน",
        value: this.formAddManageHeavyEquipment.value.allFees
      }
    ];
    if (!this.validate.checking(validateData)) {
      return;
    }
    if (this.formAddManageHeavyEquipment.valid) {
      // console.log('validator', this.formData);
      this.modalSave.openModal();
      return;
    }
  }

  //===========================  Action =====================
  onSave() {
    if (Utils.isNotNull(this.id)) {
      console.log("update");
      this.editAddManageHeavyEquipmen();
    } else {
      console.log("save");
      this.saveAddManageHeavyEquipment();
    }
  }

  saveAddManageHeavyEquipment() {
    console.log(
      "saveFormAddElectricity : ",
      this.formAddManageHeavyEquipment.value
    );
    let data = this.formAddManageHeavyEquipment.value;
    this.formAddManageHeavyEquipment.patchValue({
      vat: NumberUtils.decimalFormatToNumber(data.vat),
      totalMoney: NumberUtils.decimalFormatToNumber(data.totalMoney)
    })
    this.commonService.loading();
    this.ajax
      .doPost(URL.SAVE, this.formAddManageHeavyEquipment.value)
      .subscribe((res: ResponseData<any>) => {
        console.log(res.data);
        if (MessageService.MSG.SUCCESS == res.status) {
          this.modalSuccess.openModal();
          this.router.navigate(["/heavyeqp/heavyeqp001"]);
          console.log(res.message);
        } else {
          this.modalError.openModal("บันทึกล้มเหลว");
          console.log(res.message);
        }
        this.commonService.unLoading();
      });
  }

  editEqpId(id: any) {
    let manageHeavyEquipmentId = id;
    console.log("editFormAddLov : ", manageHeavyEquipmentId);
    // this.commonService.loading();
    // this.ajax
    //   .doPost(URL.EDIT_ID, {
    //     manageHeavyEquipmentId: parseInt(manageHeavyEquipmentId)
    //   })
    //   .subscribe((res: ResponseData<any>) => {
    //     console.log(res.data);
    //     if (MessageService.MSG.SUCCESS == res.status) {
    //       this.dataEleId = res.data;
    //       this.formManageHeavyEquipment.patchValue({
    //         manageHeavyEquipmentId: this.dataEleId.manageHeavyEquipmentId,
    //         equipmentCode: this.dataEleId.equipmentCode,
    //         equipmentType: this.dataEleId.equipmentType,
    //         equipmentNo: this.dataEleId.equipmentNo,
    //         status: this.dataEleId.status,
    //         responsiblePerson: this.dataEleId.responsiblePerson,
    //         remark: this.dataEleId.remark,
    //         numberLicensePlate: this.dataEleId.numberLicensePlate,
    //         licensePlate: this.dataEleId.licensePlate,
    //       });
    //       // this.formManageHeavyEquipment.controls.meterType.patchValue(
    //       //   this.dataEleId.meterType
    //       // );
    //     } else {
    //       console.log(res.message);
    //     }
    //     this.commonService.unLoading();
    //   });
  }

  editAddManageHeavyEquipmen() {
    console.log(
      "editformManageHeavyEquipment : ",
      this.formAddManageHeavyEquipment.value
    );
    // this.commonService.loading();
    // this.ajax
    //   .doPost(URL.EDIT, this.formManageHeavyEquipment.value)
    //   .subscribe((res: ResponseData<any>) => {
    //     console.log(res.data);
    //     if (MessageService.MSG.SUCCESS == res.status) {
    //       console.log(res.message);
    //       this.modalSuccess.openModal();
    //       this.router.navigate(["/heavyeqp/heavyeqp002"]);
    //     } else {
    //       this.modalError.openModal("แก้ไขล้มเหลว");
    //       console.log(res.message);
    //     }
    //     this.commonService.unLoading();
    //   });
  }

  //========================= validateControlSave ===============================
  validateControlSave(control: string) {
    return false;
  }



}




