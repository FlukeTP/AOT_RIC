import { Component, OnInit, ViewChild } from "@angular/core";
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

const URL = {
  SAVE: "heavyeqp002/save",
  EDIT_ID: "heavyeqp002/listEditId",
  GET_DROPDOWN: "heavyeqp004/list",
  GET_DROPDOWN_LOV: "lov/list-data-detail",
  EDIT: "heavyeqp002/edit"
};

@Component({
  selector: "app-heavyeqp002detail",
  templateUrl: "./heavyeqp002detail.component.html",
  styleUrls: ["./heavyeqp002detail.component.css"]
})
export class Heavyeqp002detailComponent implements OnInit {
  breadcrumb: any = [
    {
      label: "หมวดเครื่องทุ่นแรง",
      link: "/home/heavyeqp"
    },
    {
      label: "จัดดารเครื่องทุ่นแรง",
      link: "#"
    },
    {
      label: "เพิ่มข้อมูลจัดการเครื่องทุ่นแรง",
      link: "#"
    }
  ];

  @ViewChild("saveModal") modalSave: ModalConfirmComponent;
  @ViewChild("errorModal") modalError: ModalErrorComponent;
  @ViewChild("successModal") modalSuccess: ModalSuccessComponent;

  formManageHeavyEquipment: FormGroup;
  meterType: any;
  airport: any;
  id: any;
  dataEleId: any;
  meterId: number;
  buttomedit: boolean = true;
  descTh1: any;
  equipmentType: any;
  equipmentStatus: any;
  equipmentTypeFilter: any;

  constructor(
    private formBuilder: FormBuilder,
    private commonService: CommonService,
    private ajax: AjaxService,
    private route: ActivatedRoute,
    private validate: ValidateService,
    private router: Router,
  ) {
    this.formManageHeavyEquipment = this.formBuilder.group({
      manageHeavyEquipmentId: [""],
      equipmentCode: ["", Validators.required],
      equipmentType: ["", Validators.required],
      equipmentNo: ["", Validators.required],
      status: ["", Validators.required],
      responsiblePerson: ["", Validators.required],
      remark: ["", Validators.required],
      numberLicensePlate: ["", Validators.required],
      licensePlate: ["", Validators.required]
    });
  }
  ngOnInit() {
    this.getDropDawn();
    this.id = this.route.snapshot.queryParams["id"] || "";
    console.log("this.id : ", this.id);
    if (Utils.isNotNull(this.id)) {
      this.editEleId(this.id);
      this.buttomedit = false;
    }
  }

  saveManageHeavyEquipment() {
    console.log(
      "saveFormAddElectricity : ",
      this.formManageHeavyEquipment.value
    );
    this.commonService.loading();
    this.ajax
      .doPost(URL.SAVE, this.formManageHeavyEquipment.value)
      .subscribe((res: ResponseData<any>) => {
        console.log(res.data);
        if (MessageService.MSG.SUCCESS == res.status) {
          this.modalSuccess.openModal();
          this.router.navigate(["/heavyeqp/heavyeqp002"]);
          console.log(res.message);
        } else {
          this.modalError.openModal("บันทึกล้มเหลว");
          console.log(res.message);
        }
        this.commonService.unLoading();
      });
  }

  editEleId(id: any) {
    let manageHeavyEquipmentId = id;
    console.log("editFormAddLov : ", manageHeavyEquipmentId);
    this.commonService.loading();
    this.ajax
      .doPost(URL.EDIT_ID, {
        manageHeavyEquipmentId: parseInt(manageHeavyEquipmentId)
      })
      .subscribe((res: ResponseData<any>) => {
        console.log(res.data);
        if (MessageService.MSG.SUCCESS == res.status) {
          this.dataEleId = res.data;
          this.formManageHeavyEquipment.patchValue({
            manageHeavyEquipmentId: this.dataEleId.manageHeavyEquipmentId,
            equipmentCode: this.dataEleId.equipmentCode,
            equipmentType: this.dataEleId.equipmentType,
            equipmentNo: this.dataEleId.equipmentNo,
            status: this.dataEleId.status,
            responsiblePerson: this.dataEleId.responsiblePerson,
            remark: this.dataEleId.remark,
            numberLicensePlate: this.dataEleId.numberLicensePlate,
            licensePlate: this.dataEleId.licensePlate,
          });
          // this.formManageHeavyEquipment.controls.meterType.patchValue(
          //   this.dataEleId.meterType
          // );
        } else {
          console.log(res.message);
        }
        this.commonService.unLoading();
      });
  }

  editManageHeavyEquipmen() {
    console.log(
      "editformManageHeavyEquipment : ",
      this.formManageHeavyEquipment.value
    );
    this.commonService.loading();
    this.ajax
      .doPost(URL.EDIT, this.formManageHeavyEquipment.value)
      .subscribe((res: ResponseData<any>) => {
        console.log(res.data);
        if (MessageService.MSG.SUCCESS == res.status) {
          console.log(res.message);
          this.modalSuccess.openModal();
          this.router.navigate(["/heavyeqp/heavyeqp002"]);
        } else {
          this.modalError.openModal("แก้ไขล้มเหลว");
          console.log(res.message);
        }
        this.commonService.unLoading();
      });
  }

  getDropDawn() {
    this.commonService.loading();
    this.ajax
      .doPost(`${URL.GET_DROPDOWN}`, {})
      .subscribe((res: ResponseData<any>) => {
        console.log("meter", res.data);
        this.equipmentType = res.data;
      });
    this.ajax
      .doPost(`${URL.GET_DROPDOWN_LOV}`, { lovKey: "EQUIPMENT_STATUS" })
      .subscribe((res: ResponseData<any>) => {
        console.log("testtest :", res.data);
        this.equipmentStatus = res.data;
        this.commonService.unLoading();
      });
  }

  onChangeType(e){
    console.log(e.target.value);
    
    this.equipmentTypeFilter = this.equipmentType.filter(data => {
      return data.equipmentType == e.target.value;
    });
    console.log("datat : ",this.equipmentTypeFilter);
    
    this.formManageHeavyEquipment.patchValue({
      remark: this.equipmentTypeFilter[0].detail,

    });
    // console.log(this.dataeqplistFilter);
  }

  //===========================  Action =====================
  onSave() {
    if (Utils.isNotNull(this.id)) {
      console.log("update");
      this.editManageHeavyEquipmen();
    } else {
      console.log("save");
      this.saveManageHeavyEquipment();
    }
  }

  async onValidate() {
    const validateData = [
      {
        format: "",
        header: "รหัสเครื่องทุ่นแรง",
        value: this.formManageHeavyEquipment.value.equipmentCode
      },
      {
        format: "",
        header: "ประเภทเครื่องทุ่นแรง",
        value: this.formManageHeavyEquipment.value.equipmentType
      },
      {
        format: "",
        header: "หมายเลขเครื่องทุ่นแรง",
        value: this.formManageHeavyEquipment.value.equipmentNo
      },
      {
        format: "",
        header: "สถานะ",
        value: this.formManageHeavyEquipment.value.status
      },
      {
        format: "",
        header: "ทะเบียนรถ ",
        value: this.formManageHeavyEquipment.value.licensePlate
      },
      {
        format: "",
        header: "หมายเลข",
        value: this.formManageHeavyEquipment.value.numberLicensePlate
      },
      {
        format: "",
        header: "ผู้รับผิดชอบ",
        value: this.formManageHeavyEquipment.value.responsiblePerson
      }
    ];
    if (!this.validate.checking(validateData)) {
      return;
    }
    if (this.formManageHeavyEquipment.valid) {
      // console.log('validator', this.formData);
      this.modalSave.openModal();
      return;
    }
  }

  //========================= validateControlSave ===============================
  validateControlSave(control: string) {
    return false;
  }
}












