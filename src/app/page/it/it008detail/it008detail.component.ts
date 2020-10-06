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
import * as moment from 'moment';

declare var $: any;
const URL = {
  SAVE: "it008/save",
  UPDATE: "it007/update",
  FIND_BY_ID_LIST: "it007/find_id",
  GET_BY_ID: "it008/get-by-id",
  GET_CHARGE_RATE_ALL: "it0104/get_all",
  GET_DROPDOWN: 'lov/list-data-detail',
  GET_SAP_CUT: 'common/getSAPCustumer/',
  GET_SAP_CON_NO: 'common/getSAPContractNo/',
};
@Component({
  selector: 'app-it008detail',
  templateUrl: './it008detail.component.html',
  styleUrls: ['./it008detail.component.css']
})
export class It008detailComponent implements OnInit {
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
  formHeader: FormGroup = new FormGroup({});
  formSearchCus: FormGroup = new FormGroup({});
  flagRead = false;
  monthTypeFIX: any;

  breadcrumb: any = [
    {
      label: "หมวด IT",
      link: "/home/it",
    },
    {
      label: "ขอใช้บริการ Dedicated CUTE",
      link: "#",
    }
  ]; dataTableCharge: any;
  detailInfo: FormArray = new FormArray([]);
  detailList: any;
  flag: any;
  monthTypeFilter: any[] = [];

  constructor(
    private fb: FormBuilder,
    private modalService: BsModalService,
    private ajax: AjaxService,
    private validate: ValidateService,
    private router: Router,
    private route: ActivatedRoute,
    private commonService: CommonService
  ) {
    this.initialVariable();
    this.formSearchCus = this.fb.group({
      type: [''],
      criteria: ['']
    });

  }

  ngOnInit() {
    this.formHeader.get('id').patchValue(this.route.snapshot.queryParams['id']);
    this.flag = this.route.snapshot.queryParams['flag'];
    if (Utils.isNotNull(this.formHeader.get('id').value) && this.flag == 'IT007') {
      this.flagRead = true;
      document.getElementById("radio1").setAttribute('disabled', 'disabled');
      document.getElementById("radio2").setAttribute('disabled', 'disabled');
      this.findById(this.formHeader.get('id').value, this.flag);
    }
    if (Utils.isNotNull(this.formHeader.get('id').value) && this.flag == 'IT008R') {
      this.flagRead = true;
      document.getElementById("radio1").setAttribute('disabled', 'disabled');
      document.getElementById("radio2").setAttribute('disabled', 'disabled');
      this.findById(this.formHeader.get('id').value, this.flag);
    }
    if (Utils.isNotNull(this.formHeader.get('id').value) && this.flag == 'IT008E') {
      this.flagRead = false;
      this.findById(this.formHeader.get('id').value, this.flag);
    }
    if (!Utils.isNotNull(this.formHeader.get('id').value)) {
      this.getListDetail();
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

  goBack() {
    let path = '';
    if (this.flag == 'IT007') {
      path = 'it/it007';
    } else {
      path = 'it/it008';
    }
    this.routeTo(path);
  }

  onValidateBeforeSave() {
    let validateData = [
      { format: "", header: "รหัสผู้ประกอบการ", value: this.formHeader.get("entreprenuerCode").value },
      { format: "", header: "ชื่อผู้ประกอบการ", value: this.formHeader.get("entreprenuerName").value },
      { format: "", header: "เลขที่สัญญา", value: this.formHeader.get("contractNo").value },
      { format: "", header: "พื้นที่ตั้ง", value: this.formHeader.get("location").value },
      { format: "", header: "วันที่ขอใช้บริการ", value: this.formHeader.get("requestStartDate").value },
      { format: "", header: "สัญญาใช้บริการ", value: this.formHeader.get("contractData").value },
      { format: "", header: "รายละเอียดอุปกรณ์", value: this.detailInfo.value }
    ];
    if (this.validate.checking(validateData)) {
      if (this.formHeader.invalid) {
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
          // this.calendarEnd.setDate(element.contractEndDate);
          this.ajax.doGet(`common/getUtilityArea/${contractNo}`).subscribe((response: ResponseData<any>) => this.roList = response.data);
        }
        return;
      }
    });
  }

  getListDetail() {
    this.commonService.loading();
    this.ajax.doPost(URL.GET_CHARGE_RATE_ALL, {}).subscribe(async (res: ResponseData<any>) => {
      if (MessageService.MSG.SUCCESS == res.status) {
        this.formHeader.get('totalAmount').patchValue(0);
        for (let i = 0; i <= res.data.length; i++) {
          this.detailInfo.removeAt(0);
          if (this.monthTypeFIX == '12') {
            this.monthTypeFilter = res.data.filter((data) => {
              return data.monthType == '12';
            });
          } else if (this.monthTypeFIX == '36') {
            this.monthTypeFilter = res.data.filter((data) => {
              return data.monthType == '36';
            });
          } else if (this.monthTypeFIX == 'all') {
            this.monthTypeFilter = res.data.filter((data) => {
              return data.monthType == '36';
            });
          }
        }
        await this.monthTypeFilter.forEach((value) => {
          this.setDetailInfo(value);
        });
      } else {
        this.modalError.openModal(res.message);
      }
      this.commonService.unLoading();
    })
  }

  setDetailInfo(value) {
    this.detailInfo = this.formHeader.get('detailInfo') as FormArray;
    let pathData = this.fb.group({
      id: [''],
      serviceType: [''],
      chargeRate: [''],
      equipmentAmount: [''],
      totalAmount: [''],
    });
    pathData.patchValue(value);
    this.detailInfo.push(pathData);
  }

  findById(id, flag) {
    this.commonService.loading();
    let setURL = '';
    if (flag == 'IT007') {
      setURL = URL.FIND_BY_ID_LIST
    } else {
      setURL = URL.GET_BY_ID
    }
    let data = {
      id: id
    }
    this.ajax.doPost(setURL, data).subscribe((res: ResponseData<any>) => {
      if (MessageService.MSG.SUCCESS == res.status) {
        this.formHeader.get('entreprenuerCode').patchValue(res.data.entreprenuerCode);
        this.formHeader.get('entreprenuerName').patchValue(res.data.entreprenuerName);
        this.formHeader.get('entreprenuerBranch').patchValue(res.data.entreprenuerBranch);
        this.formHeader.get('contractNo').patchValue(res.data.contractNo);
        this.formHeader.get('contractData').patchValue(res.data.contractData);
        this.formHeader.get('location').patchValue(res.data.location);
        this.formHeader.get('requestStartDate').patchValue(res.data.requestStartDate);
        if (!this.flagRead) {
          this.calendarStart.setDate(res.data.requestStartDate);
        }
        this.formHeader.get('totalAmount').patchValue(res.data.totalAmount);

        for (let i = 0; i < res.data.detailInfo.length; i++) {
          this.setDetailInfo(res.data.detailInfo[i]);
        };
      } else {
        this.modalError.openModal(res.message);
        this.router.navigate(['/it/it008']);
      }
      this.commonService.unLoading();
    })
  }

  calculateTotalAmount(idx: any) {
    let calAmount: number = 0;
    this.detailInfo.value[idx].totalAmount = Number(this.detailInfo.value[idx].chargeRate) * Number(this.detailInfo.value[idx].equipmentAmount);
    for (let i = 0; i < this.detailInfo.value.length; i++) {
      calAmount = calAmount + (Number(this.detailInfo.value[i].chargeRate) * Number(this.detailInfo.value[i].equipmentAmount));
      this.formHeader.get("totalAmount").patchValue(calAmount);
    }
  }

  save() {
    let URLS = URL.SAVE;
    let path = 'it/it008';
    if (Utils.isNotNull(this.formHeader.get('id').value) && this.flag == 'IT007') {
      path = 'it/it007';
      URLS = URL.UPDATE;
    }
    this.ajax.doPost(URLS, this.formHeader.value).subscribe((response: ResponseData<any>) => {
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

  setStartDate(e) {
    this.formHeader.get('requestStartDate').patchValue(e);
    this.setEndDate(e, this.formHeader.get('contractData').value);
  }

  setEndDate(e, value) {
    const startDate = this.formHeader.get('requestStartDate').value;
    const endDateMoment = moment(startDate, "DD/MM/YYYY");
    if (value != null) {
      if (value === 'year') {
        endDateMoment.add(12, 'months');
        // this.getListDetail();
        this.monthTypeFIX = 'all'
      } else {
        endDateMoment.add(36, 'months');
        // this.getListDetail();
        this.monthTypeFIX = 'all'
      }
    } else {
      if (e.target.value === 'year') {
        endDateMoment.add(12, 'months');
        this.getListDetail();
        this.monthTypeFIX = '12'
      } else {
        endDateMoment.add(36, 'months');
        this.getListDetail();
        this.monthTypeFIX = '36'
      }
    }
    this.formHeader.get('requestEndDate').patchValue(endDateMoment.format("DD/MM/YYYY"));
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
      this.formHeader.patchValue({
        entreprenuerCode: data.customerCode,
        entreprenuerName: data.customerName,
        entreprenuerBranch: data.adrKind + " : " + data.address
      });
      this.getSapContractNo(data.partner, data.adrKind)
      this.onCloseModal();
    });
  }

  async removeDtl(idx: any) {
    this.detailInfo.removeAt(idx);
    this.commonService.loading();

    setTimeout(() => {
      this.commonService.unLoading();
    }, 200);
  }

  initialVariable() {
    this.formHeader = this.fb.group({
      id: [''],
      entreprenuerCode: [''], //รหัสผู้ประกอบการ
      entreprenuerName: [''], //ชื่อผู้ประกอบการ
      entreprenuerBranch: [''], //สาขา
      contractNo: [''], // เลขที่สัญญา
      location: [''],// สถานที่ติดตั้ง 
      totalAmount: [''],// เงินรวม
      contractData: ['years'],// สัญญาใช้บริการ (ตัวเลือก)
      requestStartDate: [''],// วันที่ขอใช้บริการ
      requestEndDate: [''],// สิ้นสุดสัญญาใช้บริการ (เวลา)
      detailInfo: this.fb.array([])
    });

    this.detailInfo = this.formHeader.get('detailInfo') as FormArray;
  }

  formDetail(): FormGroup {
    return this.fb.group({
      equipment: [''],
      chargeRate: [],
      equipmentAmount: [],
      totalAmount: [],
    });
  }

  control(control: string) {
    return this.formHeader.get(control);
  }

}
