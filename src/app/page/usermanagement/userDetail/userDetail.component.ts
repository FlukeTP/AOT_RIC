import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { CommonService } from 'src/app/_service/ common.service';
import { AjaxService } from 'src/app/_service/ajax.service';
import { ResponseData } from 'src/app/common/models/response-data.model';
import { MessageService } from 'src/app/_service/message.service';
import { Router, ActivatedRoute } from '@angular/router';
import { ModalConfirmComponent } from 'src/app/components/modal/modal-confirm/modalConfirm.component';
import { Utils } from 'src/app/common/helper/utils';
import { ModalErrorComponent } from 'src/app/components/modal/modal-error/modalError.component';


const URL = {
  SAVE: "users/save",
  GET_USER: "users/getUser",
  EDIT: "users/edit",
  GET_ALL: "users/get_all",
  GET_DROPDOWN: "lov/list-data-detail"
}

@Component({
  selector: 'app-userDetail',
  templateUrl: './userDetail.component.html',
  styleUrls: ['./userDetail.component.css']
})
export class UserDetailComponent implements OnInit {
  validEmail: boolean = false
  formAddUser: FormGroup;
  submitted: Boolean = false;
  passwordTop: any;
  passwordMatch: boolean = false;
  @ViewChild('saveModal') modalSave: ModalConfirmComponent;
  @ViewChild('errorModal') modalError: ModalErrorComponent;
  id: any;
  dataUserEdit: any;
  buttomedit: boolean = true;
  roleList: any[] = [];
  listCheck: any[] = [];
  roleId: number;
  airport: any;
  test: any;
  constructor(
    private formBuilder: FormBuilder,
    private commonService: CommonService,
    private ajax: AjaxService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.formAddUser = this.formBuilder.group({
      userId: ["", Validators.required],
      userName: ["", Validators.required],
      password: ['', Validators.required],
      confirmPass: ['', Validators.required],
      name: ["", Validators.required],
      surname: ["", Validators.required],
      airportCode: ["", Validators.required],
      airportDes: ["", Validators.required],
      email: ["", Validators.required],
      role: this.formBuilder.array([])
    })
  }
  breadcrumb: any = [
    {
      label: "ตั้งค่าผู้ใช้งาน",
      link: "/home",
    },
    {
      label: "ผู้เข้าใช้งาน",
      link: "/user/user",
    },
    {
      label: "เพิ่มผู้เข้าใช้งาน",
      link: "#",
    }
  ];
  ngOnInit() {
    this.getDropDawn();
    this.id = this.route.snapshot.queryParams['id'] || "";
    if (Utils.isNotNull(this.id)) {
      this.getUserDetail(this.id);
      this.buttomedit = false;
    } else {
      this.getRoleList();
    }
  }

  checkIfMatchingPasswords(passwordKey: string, passwordConfirmationKey: string) {
    if (passwordKey !== passwordConfirmationKey) {
      console.log("error");
      this.modalError.openModal("รหัสผ่านต้องตรงกัน");
    }
    else {
      console.log("success");
      this.commonService.loading();
      this.ajax.doPost(URL.SAVE, this.formAddUser.value).subscribe((res: ResponseData<any>) => {
        if (MessageService.MSG.SUCCESS == res.status) {
          this.router.navigate(['user/user']);
        } else {
          console.log(res.message);
        }
        this.commonService.unLoading();
      });
    }
  }

  getDropDawn() {
    this.commonService.loading();
    this.ajax.doPost(`${URL.GET_DROPDOWN}`, { lovKey: "AIRPORT" }).subscribe((res: ResponseData<any>) => {
      console.log("meter", res.data);
      this.airport = res.data;
      this.commonService.unLoading();
    });
  }

  setAirport(e) {
    this.airport = this.airport.filter((data) => {
      return data.lovCode == e.target.value
    })
    this.formAddUser.patchValue({
      airportCode: this.airport[0].lovCode,
      airportDes: this.airport[0].descTh1
    })

    this.getDropDawn();
  }

  saveUser() {
    this.checkIfMatchingPasswords(this.formAddUser.value.password, this.formAddUser.value.confirmPass);
  }

  checkboxUser(item: any, event) {
    console.log(item.roleCode);
    if (event.target.checked) {
      this.listCheck.push(item.roleCode);
    }
    else if (!event.target.checked) {

      const index = this.listCheck.indexOf(item.roleCode);
      this.listCheck.splice(index, 1);
    }
    console.log("this.listCheck", this.listCheck);
    this.formAddUser.setControl('role', this.formBuilder.array(this.listCheck));
  }

  checkboxAll(event) {
    // console.log(item.roleCode);
    if (event.target.checked) {
      // this.listCheck.push(item.roleCode);
    }
    else if (!event.target.checked) {
      this.listCheck = [];
    }
  }

  checkdVal(item: any) {
    const index = this.listCheck.indexOf(item.roleCode);
    if (index > -1) {
      return true;
    } else {
      return false;
    }
  }

  onChange(newValue) {
    const validEmailRegEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (validEmailRegEx.test(newValue.target.value)) {
      this.validEmail = true;
      console.log("this.validEmail : ", this.validEmail);
    } else {
      this.validEmail = false;
    }
  }

  validateControlSave2(control: string) {
    return this.formAddUser.get(control).invalid && (this.formAddUser.get(control).touched || this.validEmail);
  }

  // ---------------------------------------------------------------------------- edit ---------------------------------------------------------------------------------

  getUserDetail(id: any) {
    let userId = id
    this.commonService.loading();
    this.ajax.doPost(URL.GET_USER, {
      "userId": userId
    }).subscribe((res: ResponseData<any>) => {
      console.log("res.data", res.data);
      if (MessageService.MSG.SUCCESS == res.status) {
        console.log(res.message);
        this.dataUserEdit = res.data.user;
        console.log("dfdfdf : ", this.dataUserEdit);

        this.setDatatoFormEdit();
        this.setDataRole(res.data.role);
      } else {
        console.log(res.message);
      }
      this.commonService.unLoading();
    });
  }

  setDatatoFormEdit() {
    this.formAddUser.patchValue({
      userId: this.dataUserEdit.userId,
      userName: this.dataUserEdit.userName,
      name: this.dataUserEdit.name,
      surname: this.dataUserEdit.surname,
      email: this.dataUserEdit.email,
      airportCode: this.dataUserEdit.airportCode,
      airportDes: this.dataUserEdit.airportDes
    })
  }
  setDataRole(role: any) {
    console.log("role", role);
    this.listCheck = role.map(function (value) {
      return value.roleCode;
    });
    console.log("this.listCheck", this.listCheck);
    this.getRoleList();
  }
  edit() {
    this.commonService.loading();
    this.ajax.doPost(URL.EDIT, this.formAddUser.value).subscribe((res: ResponseData<any>) => {
      console.log(res.data);
      if (MessageService.MSG.SUCCESS == res.status) {
        this.router.navigate(['user/user']);
      } else {
        console.log(res.message);
      }
      this.commonService.unLoading();
    });
  }

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



}
