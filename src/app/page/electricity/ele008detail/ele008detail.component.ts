import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormArray, FormBuilder, Validators } from '@angular/forms';
import { AjaxService } from 'src/app/_service/ajax.service';
import { CommonService } from 'src/app/_service/ common.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalConfirmComponent } from 'src/app/components/modal/modal-confirm/modalConfirm.component';
import { ResponseData } from 'src/app/common/models/response-data.model';
import { MessageService } from 'src/app/_service/message.service';
import { Utils } from 'src/app/common/helper';
import { ModalErrorComponent } from 'src/app/components/modal/modal-error/modalError.component';
import { ValidateService } from 'src/app/_service/validate.service';
import { ModalSuccessComponent } from 'src/app/components/modal/modal-success/modalSuccess.component';
declare var $: any;

declare var $: any;

const URL = {
  SAVE: "electric008/save",
  GET_BY_ID: 'electric008/get-by-id',
  UPDATE: "electric008/update",
  DELETE: "electric008/delete-dtl",
  GET_DROPDOWN: "lov/list-data-detail",
}

@Component({
  selector: 'app-ele008detail',
  templateUrl: './ele008detail.component.html',
  styleUrls: ['./ele008detail.component.css']
})
export class Ele008detailComponent implements OnInit {

  @ViewChild('saveModal') modalSave: ModalConfirmComponent;
  @ViewChild('successModal') successModal: ModalSuccessComponent;
  @ViewChild('errorModal') modalError: ModalErrorComponent;

  formData: FormGroup;
  electric008DtlReq: FormArray = new FormArray([]);
  modalForm: FormGroup;

  // List DropDown
  rateTypeList: any[] = [];
  voltageTypeList: any[] = [];

  id: any;
  constructor(
    private formBuilder: FormBuilder,
    private ajax: AjaxService,
    private commonService: CommonService,
    private route: ActivatedRoute,
    private router: Router,
    private validate: ValidateService
  ) {
    this.formDataDetail008();
    this.dataFormList();
    this.formModal();
    this.getDropDawn();
  }
  breadcrumb: any = [
    {
      label: "หมวดไฟฟ้า",
      link: "/home/elec",
    },
    {
      label: "ปรับปรุงอัตราค่าภาระการคิดค่าไฟฟ้าประเภทต่างๆ",
      link: "/electricity/ele008",
    },
    {
      label: "เพิ่มปรับปรุงอัตราค่าภาระการคิดค่าไฟฟ้าประเภทต่างๆ",
      link: "#",
    }
  ]
  ngOnInit() {
    this.id = this.route.snapshot.queryParams['id'] || '';
    if (Utils.isNotNull(this.id)) {
      this.getById(this.id);
      this.formData.get('typeConfigId').patchValue(this.id);
    }
  }
  //======================= Form =======================
  formDataDetail008() {
    this.formData = this.formBuilder.group({
      typeConfigId:[''],
      electricType: ['', Validators.required],
      rateType: ['', Validators.required],
      serviceChargeRates: ['', Validators.required],
      description: [''],
      electric008DtlReq: this.formBuilder.array([])
    })
    this.electric008DtlReq = this.formData.get('electric008DtlReq') as FormArray;
  }

  dataFormList(): FormGroup {
    return this.formBuilder.group({
      chargeMappingId: [''],
      voltageType: [''],
      startRange: [''],
      endRange: [''],
      chargeRates: [''],
      airport: ['']
    });
  }

  formModal() {
    this.modalForm = this.formBuilder.group({
      voltageType: ['', Validators.required],
      startRange: ['', Validators.required],
      endRange: ['', Validators.required],
      chargeRates: ['', Validators.required],
      airport: ['']
    });
  }
  //======================= DropDawn ==============================
  async getDropDawn() {
    this.ajax.doPost(`${URL.GET_DROPDOWN}`, { lovKey: "ELECTRIC_RATE_TYPE" }).subscribe((res: ResponseData<any>) => {
      this.rateTypeList = res.data;
    });

    this.ajax.doPost(`${URL.GET_DROPDOWN}`, { lovKey: "ELECTRIC_VOLTAGE_TYPE" }).subscribe((res: ResponseData<any>) => {
      this.voltageTypeList = res.data;
    });

  }
  //===========================  Action =====================
  addDtl() {
    const validateData = [
      { format: '', header: 'แรงดัน', value: this.modalForm.value.voltageType },
      { format: '', header: 'หน่วยเริ่มต้น', value: this.modalForm.value.startRange },
      { format: '', header: 'หน่วยสิ้นสุด', value: this.modalForm.value.endRange },
      { format: '', header: 'ค่าพลังงานไฟฟ้า', value: this.modalForm.value.chargeRates }
    ];
    if (!this.validate.checking(validateData)) {
      return;
    }
    if (this.modalForm.valid) {
      this.electric008DtlReq = this.formData.get('electric008DtlReq') as FormArray;
      this.electric008DtlReq.push(this.dataFormList());
      let idx = this.electric008DtlReq.length - 1;
      this.electric008DtlReq.at(idx).get('voltageType').patchValue(this.modalForm.get('voltageType').value);
      this.electric008DtlReq.at(idx).get('startRange').patchValue(this.modalForm.get('startRange').value);
      this.electric008DtlReq.at(idx).get('endRange').patchValue(this.modalForm.get('endRange').value);
      this.electric008DtlReq.at(idx).get('chargeRates').patchValue(this.modalForm.get('chargeRates').value);

      this.commonService.loading();

      this.commonService.unLoading();
      this.HideModal();
    }


  }

  removeElectric008DtlReq(idx, chargeMappingId: any): void {
    console.log("removeItem  idx :", idx + " chargeMappingId :", chargeMappingId);
    if (chargeMappingId) {
      this.deleteDtl(chargeMappingId);
    }

    this.electric008DtlReq.removeAt(idx)
    this.commonService.loading();
    setTimeout(() => {
      this.commonService.unLoading();
    }, 500);
  }

  onSave() {
    if (Utils.isNotNull(this.id)) {
      console.log('update');
      this.update();
    } else {
      console.log('save');
      this.save();
    }
  }

  async onValidate() {
    const validateData = [
      { format: '', header: 'ประเภทบริการ', value: this.formData.value.electricType },
      { format: '', header: 'ประเภทไฟฟ้า', value: this.formData.value.rateType },
      { format: '', header: 'ค่าบริการ', value: this.formData.value.serviceChargeRates }
    ];
    if (!this.validate.checking(validateData)) {
      return;
    }
    if (this.formData.valid) {
      console.log('validator', this.formData);
      this.modalSave.openModal();
      return;
    }
  }

  onPages = () => {
    this.router.navigate(["/electricity/ele008"], {});
  }

  ShowModae() {
    $('#myModal').modal('show')
    this.modalForm.reset();
    this.modalForm.get('voltageType').patchValue('');
  }
  HideModal() {
    $('#myModal').modal('hide')
  }

  //=========================== Back - end ======================
  save() {
    this.commonService.loading();
    this.ajax.doPost(URL.SAVE, this.formData.value).subscribe((res: ResponseData<any>) => {
      console.log(res);
      if (MessageService.MSG.SUCCESS == res.status) {
        this.successModal.openModal();
        this.onPages();
      } else {
        this.modalError.openModal(res.message);
      }
      this.commonService.unLoading();
    });
  }

  update() {
    this.commonService.loading();
    // this.ajax.doPut(`${URL.UPDATE}/${this.id}`, this.formData.value).subscribe((res: ResponseData<any>) => {
    //   if (MessageService.MSG.SUCCESS == res.status) {
    //     this.successModal.openModal();
    //     this.onPages();
    //   } else {
    //     this.modalError.openModal(res.message);
    //   }
    //   this.commonService.unLoading();
    // });

    this.ajax.doPost(URL.UPDATE, this.formData.value).subscribe((res: ResponseData<any>) => {
      console.log(res);
      if (MessageService.MSG.SUCCESS == res.status) {
        this.successModal.openModal();
        this.onPages();
      } else {
        this.modalError.openModal(res.message);
      }
      this.commonService.unLoading();
    });
  }

  deleteDtl(id: any) {
    this.ajax.doDelete(`${URL.DELETE}/${id}`).subscribe((res: ResponseData<any>) => {
      if (MessageService.MSG.SUCCESS == res.status) {
        this.getById(this.id);
      } else {
        this.modalError.openModal(res.message);
      }
    });
  }

  getById(id: String) {
    this.commonService.loading();
    this.ajax.doGet(`${URL.GET_BY_ID}/${id}`).subscribe((res: ResponseData<any>) => {
      if (MessageService.MSG.SUCCESS == res.status) {
        console.log(res);
        this.formData.get('electricType').patchValue(res.data.electricType);
        this.formData.get('rateType').patchValue(res.data.rateType);
        this.formData.get('serviceChargeRates').patchValue(res.data.serviceChargeRates);
        this.formData.get('description').patchValue(res.data.description);
        if (res.data.electric008DtlRes.length > 0) {
          this.electric008DtlReq.controls.splice(0, this.electric008DtlReq.controls.length);
          this.electric008DtlReq.patchValue([]);
          res.data.electric008DtlRes.forEach((e, index) => {
            this.electric008DtlReq.push(this.dataFormList());
            this.electric008DtlReq.at(index).get('chargeMappingId').patchValue(e.chargeMappingId);
            this.electric008DtlReq.at(index).get('voltageType').patchValue(e.voltageType);
            this.electric008DtlReq.at(index).get('startRange').patchValue(e.startRange);
            this.electric008DtlReq.at(index).get('endRange').patchValue(e.endRange);
            this.electric008DtlReq.at(index).get('chargeRates').patchValue(e.chargeRates);
          });

        } else {
          this.electric008DtlReq.controls.splice(0, this.electric008DtlReq.controls.length);
          this.electric008DtlReq.patchValue([]);
        }
      } else {
        this.modalError.openModal(res.message);
      }
      this.commonService.unLoading();
    });
  }

  //========================= validateControlSave ===============================
  validateControlSave(control: string) {
    return false;
  }

}
