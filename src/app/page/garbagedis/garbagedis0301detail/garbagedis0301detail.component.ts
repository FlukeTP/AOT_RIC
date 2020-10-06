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
import * as moment from 'moment';

const URL = {
  GET_DROPDOWN_LOV: "lov/list-data-detail",
  GET_DROPDOWN_LIST: "garbagedis003/list-trash-size",
  SAVE: "garbagedis003/save-trash-fee",
  LIST: "garbagedis003/list-trash-fee",
  EDIT: "garbagedis003/edit-trash-fee"
};

@Component({
  selector: 'app-garbagedis0301detail',
  templateUrl: './garbagedis0301detail.component.html',
  styleUrls: ['./garbagedis0301detail.component.css']
})
export class Garbagedis0301detailComponent implements OnInit {
  @ViewChild("saveModal") modalSave: ModalConfirmComponent;
  @ViewChild("errorModal") modalError: ModalErrorComponent;
  @ViewChild("successModal") modalSuccess: ModalSuccessComponent;

  formTrashSizeFee: FormGroup;
  buttomedit: boolean;
  id: any;
  trashType: any;
  sizeList: any;
  typeDis: boolean = false;
  dataList: any;

  constructor(
    private formBuilder: FormBuilder,
    private commonService: CommonService,
    private ajax: AjaxService,
    private route: ActivatedRoute,
    private validate: ValidateService,
    private router: Router
  ) {
    this.formTrashSizeFee = this.formBuilder.group({
      trashSizeServiceFeeId: [""],
      yearly: ["", Validators.required],
      trashType: ["", Validators.required],
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
      label: "กำหนดอัตราค่าภาระกำจัดขยะ",
      link: "#"
    }
  ];
  ngOnInit() {
    this.getDropDawn();
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
        return data.trashSizeServiceFeeId == id
      })
      this.formTrashSizeFee.patchValue({
        trashSizeServiceFeeId : this.dataList[0].trashSizeServiceFeeId,
        yearly: this.dataList[0].yearly,
        trashType: this.dataList[0].trashType,
        trashSize: this.dataList[0].trashSize,
        chargeRates: this.dataList[0].chargeRates,
        remark: this.dataList[0].remark
      })
      console.log("this.dataList : ", this.dataList);
      this.commonService.unLoading();
    });
  }

  getDropDawn() {
    this.commonService.loading();
    this.ajax
      .doPost(`${URL.GET_DROPDOWN_LOV}`, { lovKey: "TRASH_TYPE" })
      .subscribe((res: ResponseData<any>) => {
        console.log("TRASH_TYPE :", res.data);
        this.trashType = res.data;
      });
    this.ajax
      .doPost(URL.GET_DROPDOWN_LIST, {})
      .subscribe((res: ResponseData<any>) => {
        this.sizeList = res.data;
        console.log("res", this.sizeList);
        this.commonService.unLoading();
      });
  }

  saveTrashSize() {
    console.log("data : ", this.formTrashSizeFee.value);
    this.commonService.loading();
    this.ajax
      .doPost(URL.SAVE, this.formTrashSizeFee.value)
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
    console.log("data : ", this.formTrashSizeFee.value);
    this.commonService.loading();
    this.ajax.doPost(URL.EDIT, this.formTrashSizeFee.value).subscribe((res: ResponseData<any>) => {
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
        value: this.formTrashSizeFee.value.yearly
      },
      {
        format: "",
        header: "ประเภทขยะ ",
        value: this.formTrashSizeFee.value.trashType
      },
      {
        format: "",
        header: "ขนาด",
        value: this.formTrashSizeFee.value.trashSize
      },
      {
        format: "",
        header: "อัตราค่าภาระ",
        value: this.formTrashSizeFee.value.chargeRates
      }
    ];
    if (!this.validate.checking(validateData)) {
      return;
    }
    if (this.formTrashSizeFee.valid) {
      // console.log('validator', this.formData);
      this.modalSave.openModal();
      return;
    }
  }

  //========================= validateControlSave ===============================
  validateControlSave(control: string) {
    return false;
  }


  onChangeType(e){
    console.log(e.target.value.slice(3, 20));
    console.log(this.typeDis);
    if(e.target.value.slice(3, 20).trim() == "ขยะทั่วไป"){
      this.typeDis = true
    }else{
      this.typeDis = false
      this.formTrashSizeFee.get('trashSize').reset();
      this.formTrashSizeFee.get('chargeRates').reset();
    }
  }

  onChangeSize(e){
    console.log(e.target.value);
    this.sizeList = this.sizeList.filter((data) => {
      return data.trashSize == e.target.value
    })
    this.formTrashSizeFee.patchValue({
      chargeRates: this.sizeList[0].chargeRates
    })
    this.getDropDawn();
  }
}

