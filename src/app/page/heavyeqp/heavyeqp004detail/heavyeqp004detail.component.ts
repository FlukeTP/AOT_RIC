import { Component, OnInit, ViewChild } from "@angular/core";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
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
  SAVE: "heavyeqp004/save",
  EDIT_ID: "heavyeqp004/listEditId",
  EDIT: "heavyeqp004/edit"
};

@Component({
  selector: "app-heavyeqp004detail",
  templateUrl: "./heavyeqp004detail.component.html",
  styleUrls: ["./heavyeqp004detail.component.css"]
})
export class Heavyeqp004detailComponent implements OnInit {
  breadcrumb: any = [
    {
      label: "หมวดเครื่องทุ่นแรง",
      link: "/home/heavyeqp"
    },
    {
      label: "จัดการประเภทเครื่องทุ่นแรง",
      link: "#"
    },
    {
      label: "เพิ่มข้อมูลจัดการประเภทเครื่องทุ่นแรง",
      link: "#"
    }
  ];

  @ViewChild("saveModal") modalSave: ModalConfirmComponent;
  @ViewChild("errorModal") modalError: ModalErrorComponent;
  @ViewChild("successModal") modalSuccess: ModalSuccessComponent;

  formManageHeavyEquipment: FormGroup;
  id: any;
  dataEleId: any;
  buttomedit: boolean = true;

  equipmentType: any;

  constructor(
    private formBuilder: FormBuilder,
    private commonService: CommonService,
    private ajax: AjaxService,
    private route: ActivatedRoute,
    private validate: ValidateService,
    private router: Router,
  ) {
    this.formManageHeavyEquipment = this.formBuilder.group({
      heavyManageEquipmentTypeId: [""],
      glAccount: ["", Validators.required],
      equipmentType: ["", Validators.required],
      detail: [""] 
    });
  }
  ngOnInit() {
    this.id = this.route.snapshot.queryParams["id"] || "";
    console.log("this.id : ", this.id);
    if (Utils.isNotNull(this.id)) {
      this.editEleId(this.id);
      this.buttomedit = false;
    }
  }

  saveManageHeavyEquipment() {
    this.commonService.loading();
    this.ajax.doPost(URL.SAVE, this.formManageHeavyEquipment.value).subscribe((res: ResponseData<any>) => {
      if (MessageService.MSG.SUCCESS == res.status) {
        this.modalSuccess.openModal();
        this.router.navigate(["/heavyeqp/heavyeqp004"]);
        console.log(res.message);
      } else {
        this.modalError.openModal("บันทึกล้มเหลว");
        console.log(res.message);
      }
      this.commonService.unLoading();
    });
  }

  editEleId(id: any) {
    let heavyManageEquipmentTypeId = id;
    this.commonService.loading();
    this.ajax.doPost(URL.EDIT_ID, { heavyManageEquipmentTypeId: parseInt(heavyManageEquipmentTypeId) })
      .subscribe((res: ResponseData<any>) => {
        if (MessageService.MSG.SUCCESS == res.status) {
          this.dataEleId = res.data;
          this.formManageHeavyEquipment.patchValue({
            heavyManageEquipmentTypeId: this.dataEleId.heavyManageEquipmentTypeId,
            glAccount: this.dataEleId.glAccount,
            equipmentType: this.dataEleId.equipmentType,
            detail : this.dataEleId.detail
          });
        } else {
          console.log(res.message);
        }
        this.commonService.unLoading();
      });
  }

  editManageHeavyEquipmen() {
    this.commonService.loading();
    this.ajax.doPost(URL.EDIT, this.formManageHeavyEquipment.value).subscribe((res: ResponseData<any>) => {
      if (MessageService.MSG.SUCCESS == res.status) {
        console.log(res.message);
        this.modalSuccess.openModal();
        this.router.navigate(["/heavyeqp/heavyeqp004"]);
      } else {
        this.modalError.openModal("แก้ไขล้มเหลว");
        console.log(res.message);
      }
      this.commonService.unLoading();
    });
  }

  //===========================  Action =====================
  onSave() {
    if (Utils.isNotNull(this.id)) {
      this.editManageHeavyEquipmen();
    } else {
      this.saveManageHeavyEquipment();
    }
  }

  async onValidate() {
    const validateData = [
      {
        format: "",
        header: "GL Account",
        value: this.formManageHeavyEquipment.value.glAccount
      },
      {
        format: "",
        header: "ประเภทเครื่องทุ่นแรง",
        value: this.formManageHeavyEquipment.value.equipmentType
      },
      {
        format: "",
        header: "รายละเอียด",
        value: this.formManageHeavyEquipment.value.detail
      }
    ];
    if (!this.validate.checking(validateData)) {
      return;
    }
    if (this.formManageHeavyEquipment.valid) {
      this.modalSave.openModal();
      return;
    }
  }
}