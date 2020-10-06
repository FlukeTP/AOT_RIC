import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { CommonService } from 'src/app/_service/ common.service';
import { AjaxService } from 'src/app/_service/ajax.service';
import { ResponseData } from 'src/app/common/models/response-data.model';
import { MessageService } from 'src/app/_service/message.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Utils } from 'src/app/common/helper';
import { ValidateService } from 'src/app/_service/validate.service';
import { ModalConfirmComponent } from 'src/app/components/modal/modal-confirm/modalConfirm.component';
import { ModalErrorComponent } from 'src/app/components/modal/modal-error/modalError.component';
import { ModalSuccessComponent } from 'src/app/components/modal/modal-success/modalSuccess.component';

const URL = {
  SAVE: "electric002/save",
  EDIT_ID: "electric002/listEditId",
  GET_DROPDOWN: "lov/list-data-detail",
  EDIT: "electric002/edit"
}


@Component({
  selector: 'app-ele002detail',
  templateUrl: './ele002detail.component.html',
  styleUrls: ['./ele002detail.component.css']
})
export class Ele002detailComponent implements OnInit {
  breadcrumb: any = [
    {
      label: "หมวดไฟฟ้า",
      link: "/home/elec",
    },
    {
      label: "จัดการมิเตอร์ไฟฟ้า",
      link: "electricity/ele002",
    },
    {
      label: "เพิ่มมิเตอร์ไฟฟ้า",
      link: "#",
    },
  ];

  @ViewChild('saveModal') modalSave: ModalConfirmComponent;
  @ViewChild('errorModal') modalError: ModalErrorComponent;
  @ViewChild('successModal') modalSuccess: ModalSuccessComponent;
  
  formAddElectricity: FormGroup;
  meterType: any;
  airport: any;
  id: any;
  dataEleId: any;
  meterId: number;
  buttomedit: boolean = true;
  descTh1: any;

  constructor(
    private formBuilder: FormBuilder,
    private commonService: CommonService,
    private ajax: AjaxService,
    private route: ActivatedRoute,
    private validate: ValidateService,
    private router: Router
  ) {
    this.formAddElectricity = this.formBuilder.group({
      meterId: [""],
      meterType: [""],
      meterName: ["", Validators.required],
      meterLocation: ["", Validators.required],
      meterStatus: ["", Validators.required],
      remark: ["", Validators.required],
      serialNo: ["", Validators.required],
      multipleValue: ["", Validators.required],
      functionalLocation: ["", Validators.required],
      serviceNumber: ["", Validators.required],
      airport: [""]
    })
  }
  ngOnInit() {
    this.getDropDawn();
    this.id = this.route.snapshot.queryParams['id'] || "";
    console.log("this.id : ", this.id);
    if (Utils.isNotNull(this.id)) {
      this.editEleId(this.id);
      this.buttomedit = false;
    }
  }


  saveFormAddElectricity() {
    console.log("saveFormAddElectricity : ", this.formAddElectricity.value);
    this.commonService.loading();
    this.ajax.doPost(URL.SAVE, this.formAddElectricity.value).subscribe((res: ResponseData<any>) => {
      console.log(res.data);
      if (MessageService.MSG.SUCCESS == res.status) {
        this.modalSuccess.openModal();
        this.router.navigate(["/electricity/ele002"]);
        console.log(res.message);
      } else {
        this.modalError.openModal('บันทึกล้มเหลว');
        console.log(res.message);
      }
      this.commonService.unLoading();
    });
  }

  editEleId(id: any) {
    let meterId = id
    console.log("editFormAddLov : ", meterId);
    this.commonService.loading();
    this.ajax.doPost(URL.EDIT_ID, {
      'meterId': parseInt(meterId)
    }).subscribe((res: ResponseData<any>) => {
      console.log(res.data);
      if (MessageService.MSG.SUCCESS == res.status) {
        this.dataEleId = res.data;
        this.formAddElectricity.patchValue({
          meterId: this.id,
          // meterType: this.dataEleId.meterType,
          meterName: this.dataEleId.meterName,
          meterLocation: this.dataEleId.meterLocation,
          meterStatus: this.dataEleId.meterStatus,
          remark: this.dataEleId.remark, 
          serialNo: this.dataEleId.serialNo,
          multipleValue: this.dataEleId.multipleValue,
          functionalLocation: this.dataEleId.functionalLocation,
          serviceNumber: this.dataEleId.serviceNumber,
          airport: this.dataEleId.airport
        })
        this.formAddElectricity.controls.meterType.patchValue(this.dataEleId.meterType);
      } else {
        console.log(res.message);
      }
      this.commonService.unLoading();
    });
  }

  editFormAddElectricity() {
    console.log("editFormAddElectricity : ", this.formAddElectricity.value);
    this.commonService.loading();
    this.ajax.doPost(URL.EDIT, this.formAddElectricity.value).subscribe((res: ResponseData<any>) => {
      console.log(res.data);
      if (MessageService.MSG.SUCCESS == res.status) {
        console.log(res.message);
        this.router.navigate(["/electricity/ele002"]);
      } else {
        console.log(res.message);
      }
      this.commonService.unLoading();
    });
  }

  getDropDawn() {
    this.commonService.loading();
    this.ajax.doPost(`${URL.GET_DROPDOWN}`, { lovKey: "METER_TYPE" }).subscribe((res: ResponseData<any>) => {
      console.log("meter", res.data);
      this.meterType = res.data;
    });
    this.ajax.doPost(`${URL.GET_DROPDOWN}`, { lovKey: "AIRPORT" }).subscribe((res: ResponseData<any>) => {
      console.log("meter", res.data);
      this.airport = res.data;
      this.commonService.unLoading();
    });
  }

  //===========================  Action =====================
  onSave() {
    if (Utils.isNotNull(this.id)) {
      console.log('update');
      this.editFormAddElectricity();
    } else {
      console.log('save');
      this.saveFormAddElectricity();
    }
  }

  async onValidate() {
    const validateData = [
      { format: '', header: 'ประเภทมิเตอร์', value: this.formAddElectricity.value.meterType },
      { format: '', header: 'ชื่อมิเตอร์', value: this.formAddElectricity.value.meterName },
      { format: '', header: 'สถานที่ตั้งมิเตอร์', value: this.formAddElectricity.value.meterLocation },
      { format: '', header: 'สถานะ', value: this.formAddElectricity.value.meterStatus },
      { format: '', header: 'สนามบิน ', value: this.formAddElectricity.value.airport },
      { format: '', header: 'Serial No.มิเตอร์', value: this.formAddElectricity.value.serialNo },
      { format: '', header: 'ตัวคูณ', value: this.formAddElectricity.value.multipleValue },
      { format: '', header: 'Functional Location', value: this.formAddElectricity.value.functionalLocation },
      { format: '', header: 'เลขที่ให้บริการ', value: this.formAddElectricity.value.serviceNumber },
      { format: '', header: 'หมายเหตุ', value: this.formAddElectricity.value.remark }
    ];
    if (!this.validate.checking(validateData)) {
      return;
    }
    if (this.formAddElectricity.valid) {
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

