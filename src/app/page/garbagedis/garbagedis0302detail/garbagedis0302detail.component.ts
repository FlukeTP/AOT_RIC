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
  SAVE: "garbagedis003/save-trash-size",
  LIST: "garbagedis003/list-trash-size",
  EDIT: "garbagedis003/edit-trash-size"
};

@Component({
  selector: "app-garbagedis0302detail",
  templateUrl: "./garbagedis0302detail.component.html",
  styleUrls: ["./garbagedis0302detail.component.css"]
})
export class Garbagedis0302detailComponent implements OnInit {
  @ViewChild("saveModal") modalSave: ModalConfirmComponent;
  @ViewChild("errorModal") modalError: ModalErrorComponent;
  @ViewChild("successModal") modalSuccess: ModalSuccessComponent;

  formTrashSize: FormGroup;
  buttomedit: boolean;
  id: any;
  dataList: any;

  constructor(
    private formBuilder: FormBuilder,
    private commonService: CommonService,
    private ajax: AjaxService,
    private route: ActivatedRoute,
    private validate: ValidateService,
    private router: Router
  ) {
    this.formTrashSize = this.formBuilder.group({
      trashSizeId: [""],
      yearly: ["", Validators.required],
      trashSize: ["", Validators.required],
      chargeRates: ["", Validators.required],
      remark: [""]
    });
  }
  breadcrumb: any = [
    {
      label: "หมวดกำจัดขยะ",
      link: "/"
    },
    {
      label: "กำหนดอัตราค่าภาระดับเพลิง",
      link: "#"
    }
  ];
  ngOnInit() {
    this.id = this.route.snapshot.queryParams["id"] || "";
    console.log("this.id : ", this.id);
    if (Utils.isNotNull(this.id)) {
      this.editEleId(this.id);
      this.buttomedit = false;
    }
  }


  editEleId(id : any){
    this.commonService.loading();
    this.ajax.doPost(URL.LIST, {}).subscribe((res: ResponseData<any>) => {
      console.log(res.data);
      this.dataList = res.data
      this.dataList = this.dataList.filter((data) => {
        return data.trashSizeId == id
      })
      this.formTrashSize.patchValue({
        trashSizeId : this.dataList[0].trashSizeId,
        yearly: this.dataList[0].yearly,
        trashSize: this.dataList[0].trashSize,
        chargeRates: this.dataList[0].chargeRates,
        remark: this.dataList[0].remark
      })
      console.log("this.dataList : ", this.dataList);
      this.commonService.unLoading();
    });
  }


  saveTrashSize() {
    console.log("data : ", this.formTrashSize.value);
    this.commonService.loading();
    this.ajax
      .doPost(URL.SAVE, this.formTrashSize.value)
      .subscribe((res: ResponseData<any>) => {
        console.log(res.data);
        if (MessageService.MSG.SUCCESS == res.status) {
          this.modalSuccess.openModal();
          this.router.navigate(["/garbagedis/garbagedis003"]);
          console.log(res.message);
        } else {
          this.modalError.openModal("บันทึกล้มเหลว");
          console.log(res.message);
        }
        this.commonService.unLoading();
      });
  }

  editTrashSize() {
    console.log("data : ", this.formTrashSize.value);
    this.commonService.loading();
    this.ajax.doPost(URL.EDIT, this.formTrashSize.value).subscribe((res: ResponseData<any>) => {
      console.log(res.data);
      if (MessageService.MSG.SUCCESS == res.status) {
        console.log(res.message);
        this.modalSuccess.openModal();
        this.router.navigate(["/garbagedis/garbagedis003"]);
      } else {
        this.modalError.openModal("บันทึกล้มเหลว");
        console.log(res.message);
      }
      this.commonService.unLoading();
    });
  }

  //===========================  Action =====================
  onSave() {
    if (Utils.isNotNull(this.id)) {
      console.log("update");
      this.editTrashSize();
    } else {
      console.log("save");
      this.saveTrashSize();
    }
  }

  async onValidate() {
    const validateData = [
      {
        format: "",
        header: "ประจำปี",
        value: this.formTrashSize.value.yearly
      },
      {
        format: "",
        header: "ขนาด",
        value: this.formTrashSize.value.trashSize
      },
      {
        format: "",
        header: "อัตราค่าภาระ",
        value: this.formTrashSize.value.chargeRates
      }
    ];
    if (!this.validate.checking(validateData)) {
      return;
    }
    if (this.formTrashSize.valid) {
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
