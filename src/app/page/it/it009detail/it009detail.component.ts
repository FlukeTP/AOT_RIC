import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalConfirmComponent } from 'src/app/components/modal/modal-confirm/modalConfirm.component';
import { ModalSuccessComponent } from 'src/app/components/modal/modal-success/modalSuccess.component';
import { ModalErrorComponent } from 'src/app/components/modal/modal-error/modalError.component';
import { InputCalendarComponent } from 'src/app/components/input/input-calendar/input-calendar.component';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AjaxService } from 'src/app/_service/ajax.service';
import { CommonService } from 'src/app/_service/ common.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ValidateService } from 'src/app/_service/validate.service';
import { MessageService } from 'src/app/_service/message.service';
import { ResponseData } from 'src/app/common/models/response-data.model';
import { Utils } from 'src/app/common/helper';
import { ModalCustomComponent } from 'src/app/components/modal/modal-custom/modalCustom.component';
import { SAP_CONSTANT } from 'src/app/common/constant/SAP.constant';

const URL = {
  SAVE: "it009/save",
  GET_SAP_CUS: 'common/getSAPCustumer/',
  GET_SAP_CON_NO: 'common/getSAPContractNo/',
  FIND_ID: "it009/find_id"
}
@Component({
  selector: 'app-it009detail',
  templateUrl: './it009detail.component.html',
  styleUrls: ['./it009detail.component.css']
})
export class It009detailComponent implements OnInit {
  @ViewChild('selectCusModal') modalCustomer: ModalCustomComponent;
  @ViewChild('saveModal') modalSave: ModalConfirmComponent;
  @ViewChild('successModal') modalSuccess: ModalSuccessComponent;
  @ViewChild('errorModal') modalError: ModalErrorComponent;
  @ViewChild('calendar') calendar: InputCalendarComponent;
  breadcrumb: any = [
    {
      label: "หมวด IT",
      link: "/home/it",
    },
    {
      label: "ขอใช้บริการ Staff page และ Public page",
      link: "#",
    }
  ];

  formGroup: FormGroup;
  dataTableCustomer: any;
  dataListCustomer: any[] = [];
  contractNoList: any[] = [];
  constructor(
    private fb: FormBuilder,
    private ajax: AjaxService,
    private commonService: CommonService,
    private route: ActivatedRoute,
    private router: Router,
    private validate: ValidateService
  ) {
    this.formGroup = this.fb.group({
      itPageReqId: [""],
      customerCode: ["", Validators.required],
      customerName: ["", Validators.required],
      contractNo: ["", Validators.required],
      staffType: [""],
      publicType: [""],
      staffPageNum: [""],
      publicPageNum: [""],
      chargeRates: [""],
      vat: [""],
      totalAmount: [""],
      status: ["", Validators.required],
      requestStartDate: ["", Validators.required],
      remark: [""],
    });
  }
  // =========================== initial setting ===================
  ngOnInit() {
    this.formGroup.get('itPageReqId').patchValue(this.route.snapshot.queryParams['itPageReqId']);
    if (Utils.isNotNull(this.formGroup.get('itPageReqId').value)) {
      this.findById(this.formGroup.get('itPageReqId').value);
    }
  }
  // ============================ action =========================
  dateChange(event) {
    this.formGroup.get('requestStartDate').patchValue(event);
  }

  onValidateBeforeSave() {
    let validateData = [
      { format: "", header: "รหัสผู้ประกอบการ", value: this.formGroup.get("customerCode").value },
      { format: "", header: "ชื่อผู้ประกอบการ", value: this.formGroup.get("customerName").value },
      { format: "", header: "เลขที่สัญญา", value: this.formGroup.get("contractNo").value },
      { format: "", header: "สถานะ", value: this.formGroup.get("status").value },
      { format: "", header: "วันที่เริ่มใช้งาน", value: this.formGroup.get("requestStartDate").value },
    ];
    if (this.validate.checking(validateData)) {
      if (this.formGroup.invalid) {
        this.modalError.openModal("กรุณากรอกข้อมูลให้ครบ");
      } else {
        this.modalSave.openModal();
      }
    }
  }

  onOpenModalCustomer() {
    this.getCustomer();
    this.modalCustomer.openModal(ModalCustomComponent.MODAL_SIZE.EXTRA_LARGE);
  }

  // ================================ call back-end ==================
  callSave() {
    this.commonService.loading();
    this.ajax.doPost(URL.SAVE, this.formGroup.value).subscribe((res: ResponseData<any>) => {
      if (MessageService.MSG.SUCCESS == res.status) {
        this.modalSuccess.openModal();
        this.router.navigate(['/it/it009']);
      } else {
        this.modalError.openModal(res.message);
      }
      this.commonService.unLoading();
    });
  }

  findById(id) {
    this.commonService.loading();
    let data = {
      reqId: id
    }
    this.ajax.doPost(URL.FIND_ID, data).subscribe((res: ResponseData<any>) => {
      if (MessageService.MSG.SUCCESS == res.status) {
        this.formGroup.get('customerCode').patchValue(res.data.customerCode);
        this.formGroup.get('customerName').patchValue(res.data.customerName);
        this.formGroup.get('contractNo').patchValue(res.data.contractNo);
        this.formGroup.get('staffType').patchValue(res.data.staffType);
        this.formGroup.get('publicType').patchValue(res.data.publicType);
        this.formGroup.get('staffPageNum').patchValue(res.data.staffPageNum);
        this.formGroup.get('publicPageNum').patchValue(res.data.publicPageNum);
        this.formGroup.get('chargeRates').patchValue(res.data.chargeRates);
        this.formGroup.get('vat').patchValue(res.data.vat);
        this.formGroup.get('totalAmount').patchValue(res.data.totalAmount);
        this.formGroup.get('status').patchValue(res.data.status);
        this.formGroup.get('requestStartDate').patchValue(res.data.requestStartDate);
        this.calendar.setDate(this.formGroup.get('requestStartDate').value);
        this.formGroup.get('remark').patchValue(res.data.remark);
      } else {
        this.modalError.openModal(res.message);
        this.router.navigate(['/it/it009']);
      }
      this.commonService.unLoading();
    })
  }

  getCustomer() {
    this.commonService.loading();
    this.ajax.doGet(URL.GET_SAP_CUS + SAP_CONSTANT.CUSTOMER_BUTGROUP.B101).subscribe((res: ResponseData<any>) => {
      if (MessageService.MSG.SUCCESS == res.status) {
        this.dataListCustomer = res.data;
        this.initDataTableCustomer();
      } else {
        this.modalError.openModal(res.message);
      }
      this.commonService.unLoading();
    })
  }

  getContractNoList(partner: string) {
    this.commonService.loading();
    this.ajax.doGet(URL.GET_SAP_CON_NO + partner).subscribe((res: ResponseData<any>) => {
      if (MessageService.MSG.SUCCESS == res.status) {
        this.contractNoList = res.data;
      } else {
        this.modalError.openModal(res.message);
      }
      this.commonService.unLoading();
    })
  }

  // ====================== datatable ======================
  initDataTableCustomer = () => {
    if (this.dataTableCustomer != null) {
      this.dataTableCustomer.destroy();
    }
    this.dataTableCustomer = $('#datatableCus').DataTable({
      ...this.commonService.configDataTable(),
      data: this.dataListCustomer,
      columns: [
        {
          data: 'customerCode', className: 'text-left'
        }, {
          data: 'customerName', className: 'text-left'
        }, {
          data: 'address', className: 'text-left'
        }, {
          className: 'text-center',
          render(data, type, row, meta) {
            return `<button class="btn btn-primary btn-sm" id="selectCus" type="button">เลือก</button>`;
          }
        }
      ],
    });
    // call Function event Click button in dataTable
    this.clickBtn();
  }

  // event Click button in dataTable
  clickBtn() {
    this.dataTableCustomer.on('click', 'button#selectCus', (event) => {
      const data = this.dataTableCustomer.row($(event.currentTarget).closest('tr')).data();
      this.formGroup.patchValue({
        customerCode: data.customerCode,
        customerName: data.customerName,
        address: data.address
      })
      this.getContractNoList(data.partner);
      this.modalCustomer.onClick(ModalCustomComponent.MODAL_ACTION.CLOSE);
    });
  }
}
