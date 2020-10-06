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
  GET_ALL: 'role/get_all',
  DELETE: 'role/delete',
}

@Component({
  selector: 'app-role',
  templateUrl: './role.component.html',
  styleUrls: ['./role.component.css']
})
export class RoleComponent implements OnInit {

  @ViewChild('confirmModal') modalConfirm: ModalConfirmComponent;
  @ViewChild('successModal') modalSuccess: ModalSuccessComponent;
  @ViewChild('errorModal') modalError: ModalErrorComponent;

  breadcrumb: any = [
    {
      label: "ตั้งค่าผู้ใช้งาน",
      link: "",
    },
    {
      label: "สิทธิ์การใช้งาน",
      link: "#",
    }
  ];

  roleList: any[] = [];
  roleId: number;

  constructor(
    private ajax: AjaxService,
    private commonService: CommonService,
    private router: Router
  ) { }

  // =============== Initial setting ================
  ngOnInit() {
    this.getRoleList();
  }

  // ================ Action =====================

  onDelete(id: number) {
    this.roleId = id;
    this.modalConfirm.openModal();
  }

  onClickEdit(id: number) {
    this.router.navigate(['/user/roleDetail'], {
      queryParams: {
        id: id
      }
    })
  }


  // ==================== call back-end =====================
  getRoleList() {
    this.commonService.loading();
    this.ajax.doGet(URL.GET_ALL).subscribe((res: ResponseData<any>) => {
      if (MessageService.MSG.SUCCESS == res.status) {
        this.roleList = res.data;
      } else {
        this.modalError.openModal(res.message);
      }
      this.commonService.unLoading();
    })
  }

  onClickConfirm() {
    this.commonService.loading();
    let data = {
      roleId: this.roleId
    }
    this.ajax.doPost(URL.DELETE, data).subscribe((res: ResponseData<any>) => {
      if (MessageService.MSG.SUCCESS == res.status) {
        this.modalSuccess.openModal()
        this.getRoleList();
      } else {
        this.modalError.openModal(res.message);
      }
      this.commonService.unLoading();
    })
  }

}
