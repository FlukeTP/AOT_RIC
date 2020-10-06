import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { ModalConfirmComponent } from 'src/app/components/modal/modal-confirm/modalConfirm.component';
import { ModalSuccessComponent } from 'src/app/components/modal/modal-success/modalSuccess.component';
import { ModalErrorComponent } from 'src/app/components/modal/modal-error/modalError.component';
import { FormGroup, FormArray, FormBuilder, Validators } from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal/';
import { ValidateService } from 'src/app/_service/validate.service';
import { AjaxService } from 'src/app/_service/ajax.service';
import { CommonService } from 'src/app/_service/ common.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Utils } from 'src/app/common/helper';
import { ResponseData } from 'src/app/common/models/response-data.model';
import { MessageService } from 'src/app/_service/message.service';
declare var $: any;

const URL = {

  SAVE_CUSTOMER: "pos004/save-customer",
  GET_BY_ID_CUSTOMER: "pos004/get-by-id-customer",

  SAVE_USER: "pos004/save-user",
  LIST_USER: "pos004/list-user",
  GET_BY_ID_USER: "pos004/get-by-id-user",
  DELETE_USER: "pos004/delete-user",


  GET_SAP_CUT: 'common/getSAPCustumer/',
  GET_SAP_CON_NO: 'common/getSAPContractNo/',
  GET_DROPDOWN_LOV: "lov/list-data-detail"
};

@Component({
  selector: 'app-pos004detail',
  templateUrl: './pos004detail.component.html',
  styleUrls: ['./pos004detail.component.css']
})
export class Pos004detailComponent implements OnInit {
  @ViewChild('saveCustomerModal') modalSaveCustomer: ModalConfirmComponent;
  @ViewChild('delModal') delModal: ModalConfirmComponent;
  @ViewChild('successModal') successModal: ModalSuccessComponent;
  @ViewChild('errorModal') modalError: ModalErrorComponent;

  // formDataCustomer
  formDataCustomer: FormGroup;
  // pos009DtlReq: FormArray = new FormArray([]);

  // formDataUser
  formDataUser: FormGroup;



  // custummer table
  modalCustomer: BsModalRef;
  tableCustomer: any;
  customerList: any[] = [];
  contractNoList: any[] = [];

  // posRoleList table
  posRoleList: any[] = [];
  listCheck: any[] = [];

  // userList table
  userList: any[] = [];
  tableUser: any;

  // User
  modalUser: BsModalRef;

  // airportList
  airportList: any[] = [];


  // get by id
  id: string = '';

  userId: string = '';

  flagEdit: boolean = false;
  breadcrumb: any = [
    {
      label: "หมวดข้อมูลยอดรายได้",
      link: "/pos",
    },
    {
      label: "เพิ่มจัดการบัญชีผู้ประกอบการ",
      link: "#",
    },

  ];
  constructor(
    private formBuilder: FormBuilder,
    private validate: ValidateService,
    private modalService: BsModalService,
    private ajax: AjaxService,
    private commonService: CommonService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.formCustomer();
    this.formUser();
    this.getDropDawn();
    this.getPosRole();
  }

  ngOnInit() {
    this.id = this.route.snapshot.queryParams['id'] || "";
    if (Utils.isNotNull(this.id)) {
      this.getByIdCustomer(this.id);
      this.getUserList();
      this.formDataCustomer.get('posCustomerId').patchValue(this.id);
    }
  }

  //======================= Form =======================
  formCustomer() {
    this.formDataCustomer = this.formBuilder.group({
      posCustomerId: [''],
      customerCode: [''],
      customerName: [''],
      customerBranch: [''],
      contractNo: [''],
      rentalArea: [''],
      remark: [''],
    })
  }
  //======================= Form Modal =======================
  formUser() {
    this.formDataUser = this.formBuilder.group({
      userId: [""],
      posCustomerId: [""],
      userName: [""],
      password: [''],
      confirmPass: [''],
      name: [""],
      surname: [""],
      airportCode: [""],
      airportDes: [""],
      email: [""],
      role: this.formBuilder.array([])
    });
  }
  //=================== Action ============================



  onSaveCustomer() {
    this.saveCustomer();
  }

  onDelUser() {
    this.deleteUser(this.userId);
  }

  onPages = () => {
    this.router.navigate(["/pos/pos004"]);
  }


  async getContractNoList(partner: any , branchCode:string) {
    //clear data
    this.formDataCustomer.get('contractNo').patchValue('');
    this.contractNoList = await this.getSapContractNo(partner, branchCode);
    console.log("this.contractNoList", this.contractNoList);
  }

  setAirport(e) {
    this.airportList = this.airportList.filter((data) => {
      return data.lovCode == e.target.value
    })
    this.formDataUser.patchValue({
      airportCode: this.airportList[0].lovCode,
      airportDes: this.airportList[0].descTh1
    })

    this.getDropDawn();
  }

  async onValidateCustomer() {
    const validateData = [
      { format: '', header: 'รหัสผู้ประกอบการ', value: this.formDataCustomer.value.customerCode },
      { format: '', header: 'ชื่อผู้ประกอบการ', value: this.formDataCustomer.value.customerName },
      { format: '', header: 'สาขา', value: this.formDataCustomer.value.customerBranch },
      { format: '', header: 'เลขที่สัญญา', value: this.formDataCustomer.value.contractNo },
      { format: '', header: 'พื้นที่การเช่า', value: this.formDataCustomer.value.rentalArea }
    ];

    if (!this.validate.checking(validateData)) {
      return;
    }
    if (this.formDataCustomer.valid) {
      console.log('validator', this.formDataCustomer);
      this.modalSaveCustomer.openModal();
      return;
    }
  }



  async onSaveUser() {
    let passMath = '';
    if (this.formDataUser.get('password').value !== this.formDataUser.get('confirmPass').value) {
      passMath = ''
    } else {
      passMath = 'math'
    }
    const validateData = [
      { format: '', header: 'ชื่อ', value: this.formDataUser.value.name },
      { format: '', header: 'นามสกุล', value: this.formDataUser.value.surname },
      { format: '', header: 'email', value: this.formDataUser.value.email },
      { format: '', header: 'ท่าอากาศยาน', value: this.formDataUser.value.airportCode },
      { format: '', header: 'Username', value: this.formDataUser.value.userName },
      { format: '', header: 'Password', value: Utils.isNotNull(this.formDataUser.value.userId) ? 'unCheck' : this.formDataUser.value.password },
      { format: '', header: 'Confirm Password', value: Utils.isNotNull(this.formDataUser.value.userId) ? 'unCheck' : this.formDataUser.value.confirmPass },
      { format: '', header: 'รหัสผ่านต้องตรงกัน', value: passMath }
    ];
    this.formDataUser.get('posCustomerId').patchValue(this.id);
    if (!this.validate.checking(validateData)) {
      return;
    }
    if (this.formDataUser.valid) {
      this.saveUser();
    }
  }
  // ----------------checkboxUser--------------------------
  checkboxUser(item: any, event) {
    console.log(item.lovCode);
    console.log(event.target.checked);
    if (event.target.checked) {
      this.listCheck.push(item.lovCode);
    }
    else if (!event.target.checked) {
      const index = this.listCheck.indexOf(item.lovCode);
      this.listCheck.splice(index, 1);
    }
    console.log("this.listCheck", this.listCheck);
    this.formDataUser.setControl('role', this.formBuilder.array(this.listCheck));
  }

  checkdVal(item: any) {
    const index = this.listCheck.indexOf(item.lovCode);
    if (index > -1) {
      return true;
    } else {
      return false;
    }
  }
  // !-----------------------------checkboxUser------------------

  //=================== modal ============================
  async openModalCustomer(template: TemplateRef<any>) {
    this.modalCustomer = this.modalService.show(template, { class: 'modal-xl' });
    this.customerList = await this.getSapCus();
    this.datatableCustomer();
  }

  onCloseModalCustomer() {
    this.modalCustomer.hide();
  }


  openModalUser() {
    this.formDataUser.reset();
    this.getPosRole();
    this.listCheck = [];
    // this.flagEdit = false;
    $('#userModal').modal('show')
  }
  onCloseModalUser() {
    $('#userModal').modal('hide')
  }

  //=======================  Call Back_end =======================
  saveCustomer() {
    console.log('saveCustomer');
    this.commonService.loading();
    this.ajax.doPost(URL.SAVE_CUSTOMER, this.formDataCustomer.value).subscribe((res: ResponseData<any>) => {
      console.log(res);
      if (MessageService.MSG.SUCCESS == res.status) {
        this.successModal.openModal();
        this.onPages();
      } else if (MessageService.MSG.DUPLICATE_DATA == res.status) {
        this.modalError.openModal('เลขที่สัญญา นี้มีอยู่ในระบบแล้ว ไม่สามารถบันทึกได้');
      } else {
        this.modalError.openModal(res.message);
      }
      this.commonService.unLoading();
    });
  }


  getByIdCustomer(id: String) {
    this.commonService.loading();
    this.ajax.doGet(`${URL.GET_BY_ID_CUSTOMER}/${id}`).subscribe((res: ResponseData<any>) => {
      if (MessageService.MSG.SUCCESS == res.status) {
        this.formDataCustomer.get('customerCode').patchValue(res.data.customerCode);
        this.formDataCustomer.get('customerName').patchValue(res.data.customerName);
        this.formDataCustomer.get('customerBranch').patchValue(res.data.customerBranch);
        this.formDataCustomer.get('contractNo').patchValue(res.data.contractNo);
        this.formDataCustomer.get('rentalArea').patchValue(res.data.rentalArea);
        this.formDataCustomer.get('remark').patchValue(res.data.remark);
      } else {
        this.modalError.openModal(res.message);
      }
      this.commonService.unLoading();
    });
  }

  saveUser() {
    console.log('saveUser');
    this.commonService.loading();
    this.ajax.doPost(URL.SAVE_USER, this.formDataUser.value).subscribe((res: ResponseData<any>) => {
      console.log(res);
      if (MessageService.MSG.SUCCESS == res.status) {
        this.successModal.openModal();
        this.onCloseModalUser();
        this.getUserList();
      } else if (MessageService.MSG.DUPLICATE_DATA == res.status) {
        this.modalError.openModal('ชื่อ Username นี้มีอยู่ในระบบแล้ว ไม่สามารถบันทึกได้');
      } else {
        this.modalError.openModal(res.message);
      }
      this.commonService.unLoading();
    });
  }

  getUserList() {
    this.commonService.loading();
    this.ajax.doGet(`${URL.LIST_USER}/${this.id}`).subscribe((res: ResponseData<any>) => {
      console.log(res);
      if (MessageService.MSG.SUCCESS == res.status) {
        if (res.data.length > 0) {
          this.userList = res.data;
        } else {
          this.userList = [];
        }
      } else {
        this.userList = [];
        this.modalError.openModal(res.message);
      }
      this.datatableUser();
      this.commonService.unLoading();
    });

  }

  getByIdUser(id: String) {
    this.commonService.loading();
    this.ajax.doGet(`${URL.GET_BY_ID_USER}/${id}`).subscribe((res: ResponseData<any>) => {
      if (MessageService.MSG.SUCCESS == res.status) {
        this.formDataUser.get('userId').patchValue(res.data.userId);
        this.formDataUser.get('posCustomerId').patchValue(res.data.posCustomerId);
        this.formDataUser.get('userName').patchValue(res.data.userName);
        this.formDataUser.get('name').patchValue(res.data.name);
        this.formDataUser.get('surname').patchValue(res.data.surname);
        this.formDataUser.get('email').patchValue(res.data.email);
        this.formDataUser.get('airportCode').patchValue(res.data.airportCode);
        this.formDataUser.get('airportDes').patchValue(res.data.airportDes);


        res.data.role.forEach((obj, idx) => {
          this.listCheck.push(obj.roleCode);
        });
        this.getPosRole();
      } else {
        this.modalError.openModal(res.message);
      }
      this.commonService.unLoading();
    });
  }



  //List รหัสผู้ประกอบการ
  getSapCus() {
    let type = '1';

    const promise = new Promise((resolve, reject) => {
      this.ajax.doPost(`${URL.GET_SAP_CUT}`, {type : type}).subscribe(
        (res: any) => {
          resolve(res);
        },
        (err) => {
          console.error(err);
          reject(err);
        });
    });

    return promise.then((data: any) => {
      return data.data;
    });
  }

  //List ContractNo
  getSapContractNo(partner: string, branchCode:String) {
    const promise = new Promise((resolve, reject) => {
      this.ajax.doGet(`${URL.GET_SAP_CON_NO}${partner}/${branchCode}`).subscribe(
        (res: any) => {
          resolve(res);
        },
        (err) => {
          console.error(err);
          reject(err);
        });
    });

    return promise.then((data: any) => {
      return data.data;
    });
  }

  getDropDawn() {
    this.ajax.doPost(`${URL.GET_DROPDOWN_LOV}`, { lovKey: "AIRPORT" }).subscribe((res: ResponseData<any>) => {
      this.airportList = res.data;
    });
  }

  getPosRole() {
    this.ajax.doPost(`${URL.GET_DROPDOWN_LOV}`, { lovKey: "POS_ROLE" }).subscribe((res: ResponseData<any>) => {
      this.posRoleList = res.data;
    });
  }


  deleteUser(id: any) {
    this.ajax.doDelete(`${URL.DELETE_USER}/${id}`).subscribe((res: ResponseData<any>) => {
      if (MessageService.MSG.SUCCESS == res.status) {
        this.getUserList();
      } else {
        this.modalError.openModal(res.message);
      }
    });
  }


  //============================= table ====================================
  //Table รหัสผู้ประกอบการ
  datatableCustomer() {
    if (this.tableCustomer != null) {
      this.tableCustomer.destroy();
    }
    let configtb = this.commonService.configDataTable();
    configtb.searching = true
    this.tableCustomer = $('#datatableCustomer').DataTable({
      ...configtb,
      scrollX: true,
      data: this.customerList,
      columns: [
        {
          data: 'customerCode', className: 'text-left'
        }, {
          data: 'customerName', className: 'text-left'
        }, {
          data: 'adrKind', className: 'text-center'
        }, {
          data: 'address', className: 'text-left'
        }, {
          className: 'text-center',
          render(data, type, row, meta) {
            return `<button class="btn btn-primary btn-sm" type="button">เลือก</button>`;
          }
        },
      ],
    });

    this.tableCustomer.on('click', 'td > button.btn-primary', (event) => {
      const data = this.tableCustomer.row($(event.currentTarget).closest('tr')).data();
      this.formDataCustomer.patchValue({
        customerCode: data.customerCode,
        customerName: data.customerName,
        customerBranch: data.adrKind + " : " + data.address
      });
      console.log("data", data.adrKind);
      this.getContractNoList(data.partner, data.adrKind );
      this.onCloseModalCustomer();
    });
  }


  //Table รหัสผู้ประกอบการ
  datatableUser() {
    if (this.tableUser != null) {
      this.tableUser.destroy();
    }
    this.tableUser = $('#datatableUser').DataTable({
      processing: true,
      serverSide: false,
      searching: false,
      ordering: false,
      paging: true,
      scrollX: true,
      data: this.userList,
      columns: [
        {
          data: 'userName', className: 'text-left'
        },
        {
          className: 'text-center',
          render(data, type, row, meta) {
            return row.name + ' ' + row.surname
          }
        },
        {
          data: 'airportDes', className: 'text-center'
        },
        {
          data: 'role',
          className: 'text-center',
          render(data, type, row, meta) {
            let msg = '';
            if (data != null && data.length > 0) {
              data.forEach((obj, idx) => {
                if (idx > 0) {
                  msg += " , " + obj.roleCode;
                } else {
                  msg = obj.roleCode;
                }
              });

            } else {
              msg = '-'
            }
            return msg
          }
        }, {
          render: (data, type, full, meta) => {
            let _btn = '';
            _btn += `<button type="button" class="btn btn-warning btn-social-icon" id="edit"><i class="fa fa-pencil-square-o" aria-hidden="true"></i></button>`;
            return _btn;
          },
          className: "text-center"
        },
        {
          className: 'text-center',
          render(data, type, row, meta) {
            return `<button class="btn btn-danger btn-sm" type="button" id="del" ><i class="fa  fa-times" aria-hidden="true"></i></button>`;
          }
        }
      ],
    });

    this.tableUser.on('click', 'tbody tr button#edit', (e) => {
      var closestRow = $(e.target).closest('tr');
      var data = this.tableUser.row(closestRow).data();
      this.getByIdUser(data.userId);
      this.openModalUser();
    });

    this.tableUser.on('click', 'tbody tr button#del', (e) => {
      var closestRow = $(e.target).closest('tr');
      var data = this.tableUser.row(closestRow).data();
      this.delModal.openModal();
      this.userId = data.userId;
    });

  }
}


