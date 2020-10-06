import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalConfirmComponent } from 'src/app/components/modal/modal-confirm/modalConfirm.component';
import { ModalSuccessComponent } from 'src/app/components/modal/modal-success/modalSuccess.component';
import { ModalErrorComponent } from 'src/app/components/modal/modal-error/modalError.component';
import { AjaxService } from 'src/app/_service/ajax.service';
import { CommonService } from 'src/app/_service/ common.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ResponseData } from 'src/app/common/models/response-data.model';
import { MessageService } from 'src/app/_service/message.service';
import { ValidateService } from 'src/app/_service/validate.service';
import { Observable } from 'rxjs';

let URL = {
  GET_BY_ID: 'role/get_by_id',
  SAVE: 'role/save',
}

@Component({
  selector: 'app-roleDetail',
  templateUrl: './roleDetail.component.html',
  styleUrls: ['./roleDetail.component.css']
})
export class RoleDetailComponent implements OnInit {

  @ViewChild('saveModal') modalSave: ModalConfirmComponent;
  @ViewChild('successModal') modalSuccess: ModalSuccessComponent;
  @ViewChild('errorModal') modalError: ModalErrorComponent;

  breadcrumb: any = [
    {
      label: "ตั้งค่าผู้ใช้งาน",
      link: "home",
    },
    {
      label: "จัดการข้อมูลสิทธิ์การใช้งาน",
      link: "#",
    }
  ];

  formGroup: FormGroup;

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
    this.formGroup.get('roleId').patchValue(this.route.snapshot.queryParams['id']);
    if (this.formGroup.get('roleId').value != null && this.formGroup.get('roleId').value != '') {
      this.getRoleById();
    }
  }

  setFormGroup() {
    this.formGroup = this.fb.group({
      roleId: [""],
      roleCode: ["", Validators.required],
      roleCategory: ["", Validators.required],
      roleDesc: ["", Validators.required],
    })
  }

  // ================= Action ==================
  onOpenModalSave() {
    let validateData = [
      { format: "text", header: "Code", value: this.formGroup.get("roleCode").value },
      { format: "text", header: "Category", value: this.formGroup.get("roleCategory").value },
      { format: "text", header: "Description", value: this.formGroup.get("roleDesc").value }
    ];
    if (this.validate.checking(validateData)) {
      if (this.formGroup.invalid) {
        this.modalError.openModal("กรุณากรอกข้อมูลให้ครบ");
      } else {
        this.modalSave.openModal();
      }
    }
  }

  onClickSave() {
    this.saveRole().subscribe(() => {
      this.router.navigate(['/user/role']);
    });
  }
  // ==================== call back-end =================
  getRoleById() {
    this.commonService.loading();
    this.ajax.doPost(URL.GET_BY_ID, this.formGroup.value).subscribe((res: ResponseData<any>) => {
      if (MessageService.MSG.SUCCESS == res.status) {
        this.formGroup.patchValue({
          roleId: res.data.roleId,
          roleCode: res.data.roleCode,
          roleCategory: res.data.roleCategory,
          roleDesc: res.data.roleDesc,
        })
      } else {
        this.modalError.openModal(res.message);
      }
      this.commonService.unLoading();
    })
  }

  saveRole(): Observable<any> {
    return new Observable<any>(obs => {
      this.commonService.loading();
      this.ajax.doPost(URL.SAVE, this.formGroup.value).subscribe((res: ResponseData<any>) => {
        if (MessageService.MSG.SUCCESS == res.status) {
          obs.next(res.data);
          this.modalSuccess.openModal();
        } else {
          obs.error(res.message);
          this.modalError.openModal(res.message);
        }
        this.commonService.unLoading();
      })
    });
  }

}
