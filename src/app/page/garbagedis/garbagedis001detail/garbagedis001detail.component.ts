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
import * as moment from "moment";

const URL = {
  SAVE: "heavyeqp001/save",
  // EDIT_ID: "heavyeqp002/listEditId",
  // GET_DROPDOWN: "lov/list-data-detail",
  // EDIT: "heavyeqp002/edit"
  GET_DROPDOWN_EQP: "heavyeqp002/list",
  GET_SAP_CUT: "common/getSAPCustumer/",
  GET_SAP_CON_NO: "common/getSAPContractNo/",
  GET_DROPDOWN_LOV: "lov/list-data-detail"
};

@Component({
  selector: "app-garbagedis001detail",
  templateUrl: "./garbagedis001detail.component.html",
  styleUrls: ["./garbagedis001detail.component.css"]
})
export class Garbagedis001detailComponent implements OnInit {
  @ViewChild("saveModal") modalSave: ModalConfirmComponent;
  @ViewChild("errorModal") modalError: ModalErrorComponent;
  @ViewChild("successModal") modalSuccess: ModalSuccessComponent;

  breadcrumb: any = [
    {
      label: "หมวดกำจัดขยะ",
      link: "/home/firebrigade"
    },
    {
      label: "บันทึกข้อมูลบริการกำจัดขยะ",
      link: "#"
    },
    {
      label: "บันทึกข้อมูลบริการกำจัดขยะ",
      link: "#"
    }
  ];

  formAddGarbage: FormGroup;

  // custummer table
  modalCustomer: BsModalRef;
  tableCustomer: any;
  customerList: any[] = [];
  contractNoList: any[] = [];
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
      trashServiceReqId: [""],
      custumerCode: ["", Validators.required],
      custumerName: ["", Validators.required],
      custumerBranch: ["", Validators.required],
      contractNo: ["", Validators.required],
      startDateDate: ["", Validators.required],
      endDateDate: ["", Validators.required],
      trashLocation: ["", Validators.required],
      trashType: ["", Validators.required],
      trashCollectionFrequency: ["", Validators.required],
      trashSize: ["", Validators.required],
      totalChargeRates: ["", Validators.required],
      remark: [""],
      airport: ["", Validators.required],
      generalWaste: ["", Validators.required],
      numberTanks: ["", Validators.required],
      status: ["", Validators.required]
    });
  }

  ngOnInit() {
    this.getDropDawn();
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
      .doPost(URL.GET_DROPDOWN_EQP, {})
      .subscribe((res: ResponseData<any>) => {
        this.eqplist = res.data;
        console.log("res", this.eqplist);
        this.commonService.unLoading();
      });
  }


  //=================== modal ============================
  async openModalCustomer(template: TemplateRef<any>) {
    this.modalCustomer = this.modalService.show(template, {
      class: "modal-xl"
    });
    this.customerList = await this.getSapCus();
    this.datatableCustomer();
  }

  //=================== Action ============================
  async getContractNoList(partner: any) {
    //clear data
    this.formAddGarbage.get("contractNo").patchValue("");
    this.contractNoList = await this.getSapContractNo(partner);
  }

  onCloseModalCustomer() {
    this.modalCustomer.hide();
  }

  //=======================  Call Back_end =======================
  //List รหัสผู้ประกอบการ
  getSapCus() {
    let type = "1";
    const promise = new Promise((resolve, reject) => {
      this.ajax.doGet(`${URL.GET_SAP_CUT}${type}`).subscribe(
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
  getSapContractNo(partner: string) {
    const promise = new Promise((resolve, reject) => {
      this.ajax.doGet(`${URL.GET_SAP_CON_NO}${partner}`).subscribe(
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
        custumerCode: data.customerCode,
        custumerName: data.customerName,
        custumerBranch: data.adrKind + " : " + data.address
      });

      this.getContractNoList(data.partner);
      this.onCloseModalCustomer();
    });
  }

  async onValidate() {
    const validateData = [
      {
        format: "",
        header: "จำนวนเงินรวม",
        value: this.formAddGarbage.value.totalMoney
      }
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
      this.formAddGarbage.value
    );
    this.commonService.loading();
    this.ajax
      .doPost(URL.SAVE, this.formAddGarbage.value)
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
      this.formAddGarbage.value
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
