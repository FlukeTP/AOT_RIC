import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { AjaxService } from 'src/app/_service/ajax.service';
import { CommonService } from 'src/app/_service/ common.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ValidateService } from 'src/app/_service/validate.service';

import { ModalConfirmComponent } from 'src/app/components/modal/modal-confirm/modalConfirm.component';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { Utils } from 'src/app/common/helper';
import { ResponseData } from 'src/app/common/models/response-data.model';
import { MessageService } from 'src/app/_service/message.service';
import { ModalErrorComponent } from 'src/app/components/modal/modal-error/modalError.component';
import { ModalSuccessComponent } from 'src/app/components/modal/modal-success/modalSuccess.component';
import { log } from 'util';
declare var $: any;

const URL = {
  GET_DROPDOWN: 'water0114/get',
  SAVE: "water009/save",
  UPDATE: "water009/update",
  DELETE: "water009/delete-dtl",
  GET_SAP_CUT: 'common/getSAPCustumer/',
  GET_SAP_CON_NO: 'common/getSAPContractNo/',
  GET_BY_ID: "water009/get-by-id",
  GET_RENTAL_AREA: 'common/getUtilityArea/',
  GET_PAY_MEN: 'lov/list-data-detail',
};

@Component({
  selector: 'app-water009detail',
  templateUrl: './water009detail.component.html',
  styleUrls: ['./water009detail.component.css']
})
export class Water009detailComponent implements OnInit {
  @ViewChild('saveModal') modalSave: ModalConfirmComponent;
  @ViewChild('successModal') successModal: ModalSuccessComponent;
  @ViewChild('errorModal') modalError: ModalErrorComponent;

  formData: FormGroup;
  water009DtlReq: FormArray = new FormArray([]);
  formSearchCus: FormGroup = new FormGroup({});
  modalForm: FormGroup;

  modalRef: BsModalRef;

  tableCus: any;
  cusList: any[] = [];
  contractNoList: any[] = [];

  serviceTypeList: any[] = [];

  totalNetAmount: number;
  totalNetAmountStr: any;
  flagEdit = false;
  ;
  paymentTypeList: any[] = [];

  id: string = '';
  constructor(
    private formBuilder: FormBuilder,
    private validate: ValidateService,
    private modalService: BsModalService,
    private ajax: AjaxService,
    private commonService: CommonService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.formDataDetail009();
    this.dataFormList();
    this.formModal();
    this.getDropdown();
    this.getPayment();

    this.totalNetAmount = 0;
    this.totalNetAmountStr = '';

    this.formSearchCus = this.formBuilder.group({
      type: [''],
      criteria: ['']
    });

  }

  breadcrumb: any = [
    {
      label: "หมวดน้ำประปา",
      link: "/water",
    },
    {
      label: "ค่าปรับน้ำเสีย",
      link: "#",
    },

  ];

  ngOnInit() {
    this.id = this.route.snapshot.queryParams['id'] || "";
    if (Utils.isNotNull(this.id)) {
      this.getById(this.id);
      this.flagEdit = true;
      this.formData.get('wasteHeaderId').patchValue(this.id);
    }
  }

  //========== GET_DROPDOWN ===============
  getDropdown() {
    this.ajax.doPost(URL.GET_DROPDOWN, {}).subscribe((res: ResponseData<any>) => {
      if (res.data.length > 0) {
        this.serviceTypeList = res.data;
      } else {
        this.serviceTypeList = [];
      }
    });
  }

  getPayment() {
    this.ajax.doPost(`${URL.GET_PAY_MEN}`, { lovKey: 'PAYMENT_TYPE_WASTE' }).subscribe(
      (res: any) => {
        this.paymentTypeList = res.data;
      });
  }

  async getContractNoList(partner: any, adrKind: any) {
    //clear data
    this.formData.get('contractNo').patchValue('');
    this.contractNoList = await this.getSapContractNo(partner, adrKind);
  }

  //======================= Form =======================
  formDataDetail009() {
    this.formData = this.formBuilder.group({
      wasteHeaderId: [''],
      customerCode: [''],
      customerName: [''],
      customerBranch: [''],
      contractNo: [''],
      rentalArea: [''],
      rentalAreaCode: [''],
      rentalAreaName: [''],
      paymentType: [''],
      remark: [''],
      water009DtlReq: this.formBuilder.array([])
    })
    this.water009DtlReq = this.formData.get('water009DtlReq') as FormArray;
  }
  //======================= Form List =======================
  dataFormList(): FormGroup {
    return this.formBuilder.group({
      wasteDetailId: [''],
      serviceType: [''],
      chargeRate: [''],
      unit: [''],
      amount: [''],
      vat: [''],
      netAmount: ['']
    });
  }
  //======================= Form Modal =======================
  formModal() {
    this.modalForm = this.formBuilder.group({
      serviceType: ['', Validators.required],
      chargeRate: ['', Validators.required],
      unit: ['', Validators.required],
    });
  }
  //========================  ACTION ==================
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
      { format: '', header: 'รหัสผู้ประกอบการ', value: this.formData.value.customerCode },
      { format: '', header: 'ชื่อผู้ประกอบการ', value: this.formData.value.customerName },
      { format: '', header: 'สาขา', value: this.formData.value.customerBranch },
      { format: '', header: 'เลขที่สัญญา', value: this.formData.value.contractNo },
      { format: '', header: 'วิธีชำระเงิน', value: this.formData.value.paymentType }
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



  onChangeServiceType(e) {
    if (Utils.isNotNull(e.target.value)) {
      var serviceType1 = this.serviceTypeList.find(res => res.wasteConfigId == e.target.value).serviceType;
      var chargeRate1 = this.serviceTypeList.find(res => res.wasteConfigId == e.target.value).chargeRates;

      this.modalForm.patchValue({
        serviceType: serviceType1,
        chargeRate: Utils.isNotNull(chargeRate1) && chargeRate1 != '-' ? chargeRate1 : ''
      })
    } else {
      this.modalForm.reset();
    }
  }

  addDtl() {
    const validateData = [
      { format: '', header: 'ประเภทบริการ', value: this.modalForm.value.serviceType },
      { format: '', header: 'อัตราค่าภาระ', value: this.modalForm.value.chargeRate },
      { format: '', header: 'จำนวนหน่วย', value: this.modalForm.value.unit }
    ];
    if (!this.validate.checking(validateData)) {
      return;
    }

    if (this.modalForm.valid) {
      let chargeRateCal = this.modalForm.get('chargeRate').value;
      let unitCal = this.modalForm.get('unit').value == '' ? 0 : this.modalForm.get('unit').value;
      //=======  calculate ==========
      let amountCal = chargeRateCal * unitCal;
      let vat = 0.07;
      let vatCal = unitCal * vat;
      let netAmountCal = amountCal + vatCal;
      this.totalNetAmount += netAmountCal;
      this.totalNetAmountStr = this.totalNetAmount;
      //! =======  calculate ==========
      this.water009DtlReq = this.formData.get('water009DtlReq') as FormArray;
      this.water009DtlReq.push(this.dataFormList());
      let idx = this.water009DtlReq.length - 1;
      this.water009DtlReq.at(idx).get('serviceType').patchValue(this.modalForm.get('serviceType').value);
      this.water009DtlReq.at(idx).get('chargeRate').patchValue(this.modalForm.get('chargeRate').value);
      this.water009DtlReq.at(idx).get('unit').patchValue(this.modalForm.get('unit').value);
      this.water009DtlReq.at(idx).get('amount').patchValue(amountCal);
      // this.water009DtlReq.at(idx).get('vat').patchValue(vatCal);
      this.water009DtlReq.at(idx).get('netAmount').patchValue(netAmountCal);

      this.commonService.loading();

      this.commonService.unLoading();
      this.hideModal();
    }


  }

  removeDtl(idx, netAmount: any, wasteDetailId: any) {
    console.log("length : ", this.water009DtlReq.length + " removeItem  idx :", idx + "netAmount ", netAmount + "wasteDetailId ", wasteDetailId);
    if (wasteDetailId) {
      this.deleteDtl(wasteDetailId);
    }

    this.water009DtlReq.removeAt(idx)
    this.commonService.loading();
    if (this.water009DtlReq.length > 0) {
      this.totalNetAmount = this.totalNetAmount - netAmount;
      this.totalNetAmountStr = this.totalNetAmount;
    } else {
      this.totalNetAmount = 0;
      this.totalNetAmountStr = '';
    }

    setTimeout(() => {
      this.commonService.unLoading();
    }, 500);
  }


  //=================== modal ===============
  openModalCustom2(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, { class: 'modal-xl' });
    this.formSearchCus.reset();
    this.getCus();
  }

  async getCus() {
    this.formSearchCus.patchValue({ type: 'null' })
    this.cusList = await this.getSapCus(this.formSearchCus.value);
    this.datatableCus();
  }

  onCloseModal() {
    this.modalRef.hide();
  }

  onPages = () => {
    this.router.navigate(["/water/water009"], {});
  }

  showModal() {
    $('#myModal').modal('show')
    $('#serviceTypeM').val('')
    this.modalForm.reset();
  }

  hideModal() {
    $('#myModal').modal('hide')
  }
  //=======================  Call Back_end =======================
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

        let totalNetAmountStr1 = 0;
        this.formData.get('customerCode').patchValue(res.data.customerCode);
        this.formData.get('customerName').patchValue(res.data.customerName);
        this.formData.get('customerBranch').patchValue(res.data.customerBranch);
        this.formData.get('contractNo').patchValue(res.data.contractNo);
        this.formData.get('rentalAreaCode').patchValue(res.data.rentalAreaCode);
        this.formData.get('rentalAreaName').patchValue(res.data.rentalAreaName);
        this.formData.get('paymentType').patchValue(res.data.paymentType);
        this.formData.get('remark').patchValue(res.data.remark);

        if (res.data.water009DtlRes.length > 0) {
          this.water009DtlReq.controls.splice(0, this.water009DtlReq.controls.length);
          this.water009DtlReq.patchValue([]);
          res.data.water009DtlRes.forEach((e, index) => {
            this.water009DtlReq.push(this.dataFormList());
            this.water009DtlReq.at(index).get('wasteDetailId').patchValue(e.wasteDetailId);
            this.water009DtlReq.at(index).get('serviceType').patchValue(e.serviceType);
            this.water009DtlReq.at(index).get('chargeRate').patchValue(e.chargeRate);
            this.water009DtlReq.at(index).get('unit').patchValue(e.unit);
            this.water009DtlReq.at(index).get('amount').patchValue(e.amount);
            this.water009DtlReq.at(index).get('vat').patchValue(e.vat);
            this.water009DtlReq.at(index).get('netAmount').patchValue(e.netAmount);

            totalNetAmountStr1 += e.netAmount;

          });
          this.totalNetAmount = totalNetAmountStr1;
          this.totalNetAmountStr = this.totalNetAmount;

        } else {
          this.water009DtlReq.controls.splice(0, this.water009DtlReq.controls.length);
          this.water009DtlReq.patchValue([]);
        }
      } else {
        this.modalError.openModal(res.message);
      }
      this.commonService.unLoading();
    });
  }

  //List รหัสผู้ประกอบการ
  getSapCus(data: any) {
    const promise = new Promise((resolve, reject) => {
      this.ajax.doPost(URL.GET_SAP_CUT, data).subscribe(
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
  getSapContractNo(partner: string, adrKind: string) {
    const promise = new Promise((resolve, reject) => {
      this.ajax.doGet(`${URL.GET_SAP_CON_NO}${partner + '/' + adrKind}`).subscribe(
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
  //============================= table ====================================
  //Table รหัสผู้ประกอบการ
  datatableCus() {
    if (this.tableCus != null) {
      this.tableCus.destroy();
    }
    this.tableCus = $('#datatableCus').DataTable({
      processing: true,
      serverSide: false,
      searching: false,
      ordering: false,
      paging: true,
      scrollX: true,
      data: this.cusList,
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

    this.tableCus.on('click', 'td > button.btn-primary', (event) => {
      const data = this.tableCus.row($(event.currentTarget).closest('tr')).data();
      this.formData.patchValue({
        customerCode: data.customerCode,
        customerName: data.customerName,
        customerBranch: data.adrKind + " : " + data.address
      });

      this.getContractNoList(data.partner, data.adrKind);
      this.onCloseModal();
    });
  }


  async getRentalAreaList(event) {
    let contractNo = '0';
    if (Utils.isNotNull(event.target.value)) {
      contractNo = event.target.value;
    }

    this.ajax.doGet(`${URL.GET_RENTAL_AREA}${contractNo}`).subscribe(
      (res: any) => {
        console.log(res.data.length);
        if (res.data.length != 0) {
          this.formData.patchValue({
            rentalAreaCode: res.data[0].roNumber,
            rentalAreaName: res.data[0].roName
          })
        } else {
          this.formData.patchValue({
            rentalAreaCode: '',
            rentalAreaName: ''
          })
        }

      });
  }





}
