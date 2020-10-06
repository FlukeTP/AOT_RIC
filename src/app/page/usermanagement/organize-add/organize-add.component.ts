import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalConfirmComponent } from 'src/app/components/modal/modal-confirm/modalConfirm.component';
import { ModalSuccessComponent } from 'src/app/components/modal/modal-success/modalSuccess.component';
import { ModalErrorComponent } from 'src/app/components/modal/modal-error/modalError.component';
import { AjaxService } from 'src/app/_service/ajax.service';
import { CommonService } from 'src/app/_service/ common.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { ResponseData } from 'src/app/common/models/response-data.model';
import { MessageService } from 'src/app/_service/message.service';
import { ValidateService } from 'src/app/_service/validate.service';
import { Utils } from 'src/app/common/helper';

let URL = {
  GET_BY_ID: 'org/get_by_id',
  SAVE: 'org/save',
}

@Component({
  selector: 'app-organize-add',
  templateUrl: './organize-add.component.html',
  styleUrls: ['./organize-add.component.css']
})
export class OrganizeAddComponent implements OnInit {

  @ViewChild('saveModal') modalSave: ModalConfirmComponent;
  @ViewChild('successModal') modalSuccess: ModalSuccessComponent;
  @ViewChild('errorModal') modalError: ModalErrorComponent;

  breadcrumb: any = [
    {
      label: "ตั้งค่าผู้ใช้งาน",
      link: "",
    },
    {
      label: "จัดการข้อมูลหน่วยงาน",
      link: "#",
    }
  ];

  formGroup: FormGroup;
  departDetail: FormArray;

  constructor(
    private ajax: AjaxService,
    private commonService: CommonService,
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private validate: ValidateService
  ) {
    this.setFormGroup();
  }

  // =============== Initial setting ================
  ngOnInit() {
    this.formGroup.get('orgId').patchValue(this.route.snapshot.queryParams['id']);
    if (this.formGroup.get('orgId').value != null && this.formGroup.get('orgId').value != '') {
      this.getOrgById();
    }
  }

  setFormGroup() {
    this.formGroup = this.fb.group({
      orgId: [""],
      orgCode: ["", Validators.required],
      orgDescription: ["", Validators.required],
      departDetail: this.fb.array([this.createDepartDetailForm()]),
    })
  }

  createDepartDetailForm(): FormGroup {
    return this.fb.group({
      departId: [""],
      departCode: ["", Validators.required],
      departDesc: ["", Validators.required]
    });
  }

  addDepartDetailForm(): void {
    this.departDetail = this.formGroup.get("departDetail") as FormArray;
    this.departDetail.push(this.createDepartDetailForm());
  }

  removeDepartDetailForm(index: number): void {
    this.departDetail = this.formGroup.get("departDetail") as FormArray;
    this.departDetail.removeAt(index);
  }

  clearDepartDetailForm() {
    this.departDetail = this.formGroup.get("departDetail") as FormArray;
    this.departDetail.controls.splice(0, this.departDetail.controls.length);
    this.departDetail.push(this.createDepartDetailForm());
  }

  // ================= Action ==================
  onOpenModalSave() {
    this.departDetail = this.formGroup.get("departDetail") as FormArray;
    let validateData = [
      { format: "", header: "Code", value: this.formGroup.get("orgCode").value },
      { format: "", header: "Description", value: this.formGroup.get("orgDescription").value }
    ];
    for (let index = 0; index < this.departDetail.controls.length; index++) {
      const element = this.departDetail.controls[index];
      validateData.push(
        { format: "", header: "Department Code row:" + (index + 1), value: element.get('departCode').value },
        { format: "", header: "Department Description row:" + (index + 1), value: element.get('departDesc').value }
      );
    }
    if (this.validate.checking(validateData)) {
      if (this.formGroup.invalid) {
        this.modalError.openModal("กรุณากรอกข้อมูลให้ครบ");
      } else {
        this.modalSave.openModal();
      }
    }
  }

  onClickSave() {
    if (this.formGroup.invalid) {
      this.modalError.openModal("กรุณากรอกข้อมูลให้ครบ");
    } else {
      this.saveOrg();
    }
  }
  // ==================== call back-end =================
  getOrgById() {
    this.commonService.loading();
    this.ajax.doPost(URL.GET_BY_ID, this.formGroup.value).subscribe((res: ResponseData<any>) => {
      if (MessageService.MSG.SUCCESS == res.status) {
        this.formGroup.patchValue({
          orgId: res.data.orgId,
          orgCode: res.data.orgCode,
          orgDescription: res.data.orgDescription,
        })
        // set detail
        if (Utils.isNotNull(res.data.departDetail)) {
          this.clearDepartDetailForm();
          this.departDetail = this.formGroup.get("departDetail") as FormArray;
          for (let index = 0; index < res.data.departDetail.length; index++) {
            const element = res.data.departDetail[index];
            this.departDetail.at(index).get('departId').patchValue(element.departId);
            this.departDetail.at(index).get('departCode').patchValue(element.departCode);
            this.departDetail.at(index).get('departDesc').patchValue(element.departDesc);
            this.addDepartDetailForm();
          }
          this.departDetail.removeAt(this.departDetail.controls.length - 1);
        }
      } else {
        this.modalError.openModal(res.message);
      }
      this.commonService.unLoading();
    })
  }

  saveOrg() {
    this.commonService.loading();
    this.ajax.doPost(URL.SAVE, this.formGroup.value).subscribe((res: ResponseData<any>) => {
      if (MessageService.MSG.SUCCESS == res.status) {
        this.modalSuccess.openModal()
        this.router.navigate(['/user/organize']);
      } else {
        this.modalError.openModal(res.message);
      }
      this.commonService.unLoading();
    })
  }
}
