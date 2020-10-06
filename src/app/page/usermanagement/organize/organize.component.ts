import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalConfirmComponent } from 'src/app/components/modal/modal-confirm/modalConfirm.component';
import { ModalSuccessComponent } from 'src/app/components/modal/modal-success/modalSuccess.component';
import { ModalErrorComponent } from 'src/app/components/modal/modal-error/modalError.component';
import { AjaxService } from 'src/app/_service/ajax.service';
import { CommonService } from 'src/app/_service/ common.service';
import { ResponseData } from 'src/app/common/models/response-data.model';
import { MessageService } from 'src/app/_service/message.service';
import { Router } from '@angular/router';

const URL = {
  GET_ALL: 'org/get_all',
  DELETE: 'org/delete',
}

@Component({
  selector: 'app-organize',
  templateUrl: './organize.component.html',
  styleUrls: ['./organize.component.css']
})
export class OrganizeComponent implements OnInit {

  @ViewChild('confirmModal') modalConfirm: ModalConfirmComponent;
  @ViewChild('successModal') modalSuccess: ModalSuccessComponent;
  @ViewChild('errorModal') modalError: ModalErrorComponent;

  breadcrumb: any = [
    {
      label: "ตั้งค่าผู้ใช้งาน",
      link: "/home",
    },
    {
      label: "หน่วยงาน",
      link: "#",
    }
  ];

  orgList: any[] = [];
  orgId: number;

  constructor(
    private ajax: AjaxService,
    private commonService: CommonService,
    private router: Router
  ) { }

  // =============== Initial setting ================
  ngOnInit() {
    this.getOrgList();
  }

  // ================ Action =====================

  onDelete(id: number) {
    this.orgId = id;
    this.modalConfirm.openModal();
  }

  onClickEdit(id: number) {
    this.router.navigate(['/user/organize-add'], {
      queryParams: {
        id: id
      }
    })
  }
  

  // ==================== call back-end =====================
  getOrgList() {
    this.commonService.loading();
    this.ajax.doGet(URL.GET_ALL).subscribe((res: ResponseData<any>) => {
      if (MessageService.MSG.SUCCESS == res.status) {
        this.orgList = res.data;
      } else {
        this.modalError.openModal(res.message);
      }
      this.commonService.unLoading();
    })
  }

  onClickConfirm() {
    this.commonService.loading();
    let data = {
      orgId: this.orgId
    }
    this.ajax.doPost(URL.DELETE, data).subscribe((res: ResponseData<any>) => {
      if (MessageService.MSG.SUCCESS == res.status) {
        this.modalSuccess.openModal()
        this.getOrgList();
      } else {
        this.modalError.openModal(res.message);
      }
      this.commonService.unLoading();
    })
  }
}
