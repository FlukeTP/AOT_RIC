import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { AjaxService } from 'src/app/_service/ajax.service';
import { CommonService } from 'src/app/_service/ common.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ValidateService } from 'src/app/_service/validate.service';
import { ModalConfirmComponent } from 'src/app/components/modal/modal-confirm/modalConfirm.component';
import { ModalSuccessComponent } from 'src/app/components/modal/modal-success/modalSuccess.component';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { CheckNumber, Utils } from 'src/app/common/helper';
import { ResponseData } from 'src/app/common/models/response-data.model';
import { MessageService } from 'src/app/_service/message.service';
import { ModalErrorComponent } from 'src/app/components/modal/modal-error/modalError.component';
import { InputCalendarComponent } from 'src/app/components/input/input-calendar/input-calendar.component';


declare var $: any;

const URL = {
  SAVE: "it001/save",
  GET_BY_ID: "it001/get-by-id",
  GET_CHARGE_RATE_ALL: "it0101/get_all",
  GET_DROPDOWN: 'lov/list-data-detail',
  GET_SAP_CUT: 'common/getSAPCustumer/',
  GET_SAP_CON_NO: 'common/getSAPContractNo/',
  UPDATE_SERVICE: "it011/update",
  FIND_ID_SERVICE: "it011/find_id",
};

@Component({
  selector: 'app-it001detail',
  templateUrl: './it001detail.component.html',
  styleUrls: ['./it001detail.component.css']
})
export class It001detailComponent implements OnInit {
  @ViewChild('saveModal') modalSave: ModalConfirmComponent;
  @ViewChild('errorModal') modalError: ModalErrorComponent;
  @ViewChild('successModal') modalSuccess: ModalSuccessComponent;
  @ViewChild('calendarStart') calendarStart: InputCalendarComponent;
  @ViewChild('calendarEnd') calendarEnd: InputCalendarComponent;

  modalRef: BsModalRef;
  cusList: any[] = [];
  contractNoList: any[] = [];
  roList: any[] = [];
  dataTable: any;

  /* form */
  formSave: FormGroup = new FormGroup({});
  formSearchCus: FormGroup = new FormGroup({});

  flagEdit: boolean = false;

  breadcrumb: any = [
    {
      label: "หมวด IT",
      link: "/home/it",
    },
    {
      label: "ขอใช้บริการเครือข่าย",
      link: "#",
    }
  ];
  dataTableCharge: any;
  detailChargeRate: FormArray = new FormArray([]);
  listChargeRate: any;

  constructor(
    private fb: FormBuilder,
    private modalService: BsModalService,
    private ajax: AjaxService,
    private validate: ValidateService,
    private router: Router,
    private route: ActivatedRoute,
    private commonService: CommonService
  ) {
    this.formSearchCus = this.fb.group({
      type: [''],
      criteria: ['']
    });

  }

  async ngOnInit() {

    await this.initialVariable();
    this.formSave.get('networkCreateInvoiceId').patchValue(this.route.snapshot.queryParams['networkCreateInvoiceId']);
    this.formSave.get('itNetworkServiceId').patchValue(this.route.snapshot.queryParams['itNetworkServiceId']);
    let flag = this.route.snapshot.queryParams['flag'];
    if (Utils.isNotNull(this.formSave.get('networkCreateInvoiceId').value) && flag === 'R') {
      this.flagEdit = false;
      this.findById(this.formSave.get('networkCreateInvoiceId').value);
    } else if (Utils.isNotNull(this.formSave.get('networkCreateInvoiceId').value) && flag === 'U') {
      this.flagEdit = true;
      this.findById(this.formSave.get('networkCreateInvoiceId').value);
    } else if (Utils.isNotNull(this.formSave.get('itNetworkServiceId').value)) {
      this.findByIdNetworkSevice();
    } else if (flag === 'C') {
      this.flagEdit = true;
      this.getListChargeRate();
    }
  }

  openModalCustom(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, { class: 'modal-xl' });
    this.formSearchCus.reset();
    this.getCustomerList();
  }
  onCloseModal() {
    this.modalRef.hide();
  }
  onValidateBeforeSave() {
    console.log("DATA : ", this.formSave.value);
    // return;
    let validateData = [
      { format: "", header: "รหัสผู้ประกอบการ", value: this.formSave.get("entreprenuerCode").value },
      { format: "", header: "ชื่อผู้ประกอบการ", value: this.formSave.get("entreprenuerName").value },
      { format: "", header: "เลขที่สัญญา", value: this.formSave.get("contractNo").value },
      { format: "", header: "พื้นที่เช่า", value: this.formSave.get("rentalObjectCode").value },
      { format: "", header: "วันที่ขอใช้บริการ", value: this.formSave.get("requestStartDate").value },
      { format: "", header: "วันที่สิ้นสุดบริการ", value: this.formSave.get("requestEndDate").value },
    ];
    if (this.validate.checking(validateData)) {
      if (this.formSave.invalid) {
        this.modalError.openModal("กรุณากรอกข้อมูลให้ครบ");
      } else {
        this.modalSave.openModal();
      }
    }
  }

  getCustomerList() {
    this.formSearchCus.patchValue({ type: 'null' })
    this.ajax.doPost(URL.GET_SAP_CUT, this.formSearchCus.value).subscribe((response: ResponseData<any>) => {
      if (MessageService.MSG.SUCCESS === response.status) {
        this.cusList = response.data;
        this.datatable();
        this.clickTdBtn();
      }
    });
  }

  getSapContractNo(partner: string, adrKind: string) {
    this.ajax.doGet(`${URL.GET_SAP_CON_NO}${partner + "/" + adrKind}`).subscribe((response: ResponseData<any>) => {
      if (MessageService.MSG.SUCCESS === response.status) {
        this.contractNoList = response.data;
      }
    });
  }

  onContractNoChange(event) {
    let contractNo = event.target.value;
    this.contractNoList.forEach(element => {
      if (contractNo === element.contractNo) {
        if (Utils.isNotNull(element.contractEndDate)) {
          this.formSave.get('requestEndDate').patchValue(element.contractEndDate);
          // this.calendarEnd.setDate(element.contractEndDate);
          this.ajax.doGet(`common/getUtilityArea/${contractNo}`).subscribe((response: ResponseData<any>) => this.roList = response.data);
        }
        return;
      }
    });
  }

  getListChargeRate() {
    this.commonService.loading();
    this.ajax.doPost(URL.GET_CHARGE_RATE_ALL, {}).subscribe(async (res: ResponseData<any>) => {
      if (MessageService.MSG.SUCCESS == res.status) {
        console.log("detailChargeRate :", this.detailChargeRate.value);
        this.formSave.get('totalAmount').patchValue(0);
        for (let i = 0; i <= res.data.length; i++) {
          this.detailChargeRate.removeAt(0);
        }
        await res.data.forEach((value) => {
          this.setListChargeRate(value);
        });
      } else {
        this.modalError.openModal(res.message);
      }
      this.commonService.unLoading();
    })
  }

  setListChargeRate(value) {
    this.detailChargeRate = this.formSave.get('detailChargeRate') as FormArray;
    let pathData = this.fb.group({
      id: [''],
      serviceType: [''],
      chargeRate: [''],
      calculateInfo: [''],
      totalAmount: [''],
    });
    pathData.patchValue(value);
    this.detailChargeRate.push(pathData);
  }

  findById(id) {
    this.commonService.loading();
    let data = {
      networkCreateInvoiceId: id
    }
    this.ajax.doPost(URL.GET_BY_ID, data).subscribe((res: ResponseData<any>) => {
      if (MessageService.MSG.SUCCESS == res.status) {
        this.formSave.get('entreprenuerCode').patchValue(res.data.entreprenuerCode);
        this.formSave.get('entreprenuerName').patchValue(res.data.entreprenuerName);
        this.formSave.get('entreprenuerBranch').patchValue(res.data.entreprenuerBranch);
        this.formSave.get('contractNo').patchValue(res.data.contractNo);
        this.formSave.get('rentalObjectCode').patchValue(res.data.rentalObjectCode);
        this.formSave.get('itLocation').patchValue(res.data.itLocation);
        this.formSave.get('requestStartDate').patchValue(res.data.requestStartDate);
        this.formSave.get('requestEndDate').patchValue(res.data.requestEndDate);
        if (this.flagEdit) {
          this.calendarStart.setDate(this.formSave.get('requestStartDate').value);
          this.calendarEnd.setDate(this.formSave.get('requestEndDate').value);
        }
        this.formSave.get('remark').patchValue(res.data.remark);
        this.formSave.get('totalAmount').patchValue(res.data.totalAmount);

        for (let i = 0; i < res.data.detailChargeRate.length; i++) {
          this.setListChargeRate(res.data.detailChargeRate[i]);
        };
      } else {
        this.modalError.openModal(res.message);
        this.goBack();
      }
      this.commonService.unLoading();
    })
  }

  findByIdNetworkSevice() {
    this.commonService.loading();
    this.ajax.doPost(URL.FIND_ID_SERVICE, this.formSave.value).subscribe((res: ResponseData<any>) => {
      if (MessageService.MSG.SUCCESS == res.status) {
        this.formSave.get('entreprenuerCode').patchValue(res.data.entreprenuerCode);
        this.formSave.get('entreprenuerName').patchValue(res.data.entreprenuerName);
        this.formSave.get('entreprenuerBranch').patchValue(res.data.entreprenuerBranch);
        this.formSave.get('contractNo').patchValue(res.data.contractNo);
        this.formSave.get('rentalObjectCode').patchValue(res.data.rentalObjectCode);
        this.formSave.get('itLocation').patchValue(res.data.itLocation);
        this.formSave.get('requestStartDate').patchValue(res.data.requestStartDate);
        this.formSave.get('requestEndDate').patchValue(res.data.requestEndDate);
        if (this.flagEdit) {
          this.calendarStart.setDate(this.formSave.get('requestStartDate').value);
          this.calendarEnd.setDate(this.formSave.get('requestEndDate').value);
        }

        this.formSave.get('remark').patchValue(res.data.remark);
        this.formSave.get('totalAmount').patchValue(res.data.totalAmount);

        for (let i = 0; i < res.data.detailChargeRate.length; i++) {
          this.setListChargeRate(res.data.detailChargeRate[i]);
        };
      } else {
        this.modalError.openModal(res.message);
        this.goBack();
      }
      this.commonService.unLoading();
    })
  }

  goBack() {
    if (Utils.isNotNull(this.formSave.get('itNetworkServiceId').value)) {
      this.router.navigate(['/it/it011']);
    } else {
      this.router.navigate(['/it/it001']);
    }
  }

  calculateTotalAmount(idx: any) {
    let calAmount: number = 0;
    for (let i = 0; i < this.detailChargeRate.value.length; i++) {
      calAmount += Number(this.detailChargeRate.value[i].totalAmount);
      this.formSave.get("totalAmount").patchValue(calAmount);
    }
    console.log("calAmount :", this.formSave.get("totalAmount").value);
  }

  save() {
    let ULR = URL.SAVE;
    let path = 'it/it001';
    if (Utils.isNotNull(this.formSave.get('itNetworkServiceId').value)) {
      ULR = URL.UPDATE_SERVICE;
      path = 'it/it011';
    }
    this.ajax.doPost(ULR, this.formSave.value).subscribe((response: ResponseData<any>) => {
      if (MessageService.MSG.SUCCESS === response.status) {
        this.modalSuccess.openModal();
        this.routeTo(path);
      } else {
        this.modalError.openModal(response.message);
      }
    });
  }

  routeTo(path: string, param?) {
    this.router.navigate([path]);
  }

  setStartDate(e, control: string) {
    this.formSave.get(control).patchValue(e);
  }

  setEndDate(e, control: string) {
    this.formSave.get(control).patchValue(e);
  }

  datatable() {
    if (this.dataTable != null) {
      this.dataTable.destroy();
    }
    this.dataTable = $('#datatableCustomer').DataTable({
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
        },
        {
          data: 'customerName', className: 'text-left'
        },
        {
          data: 'adrKind', className: 'text-left'
        },
        {
          data: 'address', className: 'text-left'
        },
        {
          className: 'text-center',
          render(data, type, row, meta) {
            return `<button class="btn btn-primary btn-sm" type="button">เลือก</button>`;
          }
        },
      ],
    });
  }

  clickTdBtn = () => {
    this.dataTable.on('click', 'td > button.btn-primary', (event) => {
      const data = this.dataTable.row($(event.currentTarget).closest('tr')).data();
      this.formSave.patchValue({
        entreprenuerCode: data.customerCode,
        entreprenuerName: data.customerName,
        entreprenuerBranch: data.adrKind + " : " + data.address
      });
      this.getSapContractNo(data.partner, data.adrKind)
      this.onCloseModal();
    });
  }

  async removeDtl(idx: any) {
    this.detailChargeRate.removeAt(idx);
    this.commonService.loading();

    setTimeout(() => {
      this.commonService.unLoading();
    }, 200);
  }

  initialVariable() {
    this.formSave = this.fb.group({
      networkCreateInvoiceId: [''],
      itNetworkServiceId: [''],
      entreprenuerCode: [''], //รหัสผู้ประกอบการ
      entreprenuerName: [''], //ชื่อผู้ประกอบการ
      entreprenuerBranch: [''], //สาขา
      contractNo: [''], // เลขที่สัญญา
      itLocation: [''],// สถานที่ติดตั้ง 
      totalAmount: [''],// เงินรวม
      rentalObjectCode: [''],//รหัสพื้นที่เช่า
      requestStartDate: [''],// วันที่ขอใช้บริการ
      requestEndDate: [''],// วันที่สิ้นสุดขอใช้บริการ
      remark: [''],//หมายเหตุ 
      detailChargeRate: this.fb.array([])
    });

    this.detailChargeRate = this.formSave.get('detailChargeRate') as FormArray;
  }

  formChargeRate(): FormGroup {
    return this.fb.group({
      id: [''],
      serviceType: [''],
      chargeRate: [''],
      calculateInfo: [''],
      totalAmount: [''],
    });
  }

  control(control: string) {
    return this.formSave.get(control);
  }
}
