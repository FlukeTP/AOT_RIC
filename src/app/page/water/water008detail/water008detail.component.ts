import { Component, OnInit, ViewChild, ElementRef, TemplateRef } from '@angular/core';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { AjaxService } from 'src/app/_service/ajax.service';
import { CommonService } from 'src/app/_service/ common.service';
import { ResponseData } from 'src/app/common/models/response-data.model';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalConfirmComponent } from 'src/app/components/modal/modal-confirm/modalConfirm.component';
import { ModalSuccessComponent } from 'src/app/components/modal/modal-success/modalSuccess.component';
import { ModalErrorComponent } from 'src/app/components/modal/modal-error/modalError.component';
import { ModalCustomComponent } from 'src/app/components/modal/modal-custom/modalCustom.component';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { MessageService } from 'src/app/_service/message.service';
import { ValidateService } from 'src/app/_service/validate.service';
import { Utils } from 'src/app/common/helper';
import { InputCalendarComponent } from 'src/app/components/input/input-calendar/input-calendar.component';
import { NumberUtils } from 'src/app/common/helper/number';

declare var $: any;

const URL = {
  SAVE: "water008/save",
  FIND_ID: "water008/find_id",
  GET_METER: "water008/get_all_meter",
  FIND_METER: "water008/find_meter",
}
@Component({
  selector: 'app-water008detail',
  templateUrl: './water008detail.component.html',
  styleUrls: ['./water008detail.component.css']
})
export class Water008detailComponent implements OnInit {
  modalRef: BsModalRef;
  @ViewChild('saveModal') modalSave: ModalConfirmComponent;
  @ViewChild('successModal') modalSuccess: ModalSuccessComponent;
  @ViewChild('errorModal') modalError: ModalErrorComponent;
  @ViewChild('calendar') calendar: InputCalendarComponent;

  breadcrumb: any = [
    {
      label: "หมวดน้ำประปา",
      link: "/",
    },
    {
      label: "ขอเปลี่ยนมิเตอร์การใช้น้ำประปา",
      link: "/water/water008",
    },
    {
      label: "เพิ่มรายการขอเปลี่ยนมิเตอร์การใช้น้ำประปา",
      link: "#",
    },

  ];

  formGroup: FormGroup;
  formSearchMeter: FormGroup;
  //data table
  dataTable: any;
  datas: any[] = [];
  meterList: any[] = [];

  constructor(
    private fb: FormBuilder,
    private ajax: AjaxService,
    private commonService: CommonService,
    private route: ActivatedRoute,
    private modalService: BsModalService,
    private router: Router,
    private validate: ValidateService
  ) {
    this.setFormGroup();
  }
  // ============== Initial setting ============== 
  ngOnInit() {
    this.formGroup.get('reqId').patchValue(this.route.snapshot.queryParams['id']);
    this.formGroup.get('waterChangeId').patchValue(this.route.snapshot.queryParams['waterChangeId']);
    if (Utils.isNotNull(this.formGroup.get('reqId').value)) {
      this.findById(this.formGroup.get('reqId').value);
    } else if (Utils.isNotNull(this.formGroup.get('waterChangeId').value)) {
      this.findById(this.formGroup.get('reqId').value);
    } else {
      this.router.navigate(['/water/water003']);
    }
    this.getAllMeter();
  }

  setFormGroup() {
    this.formGroup = this.fb.group({
      waterChangeId: [""],
      reqId: [""],
      customerCode: [""],
      customerName: [""],
      customerBranch: [""],
      contractNo: [""],
      requestType: [""],
      oldSerialNo: [""],
      oldMeterName: [""],
      oldMeterType: [""],
      oldMeterLocation: [""],
      oldRentalAreaCode: [""],
      oldChargeRates: [""],
      oldVat: [""],
      oldTotalchargeRates: [""],
      newSerialNo: ["", Validators.required],
      newMeterName: [""],
      newMeterType: [""],
      newMeterLocation: [""],
      newRentalAreaCode: [""],
      newChargeRates: [""],
      newVat: [""],
      newTotalchargeRates: [""],
      dateChange: ["", Validators.required],
      remark: [""],
      airport: [""],
      invoiceNoReqcash: [""],
      receiptNoReqcash: [""],
      invoiceNoReqlg: [""],
      receiptNoReqlg: [""],
      transactionNoCash: [""],
      invoiceNoCash: [""],
      receiptNoCash: [""],
      sapStatusCash: [""],
      sapErrorDescCash: [""],
      transactionNoLg: [""],
      invoiceNoLg: [""],
      receiptNoLg: [""],
      sapStatusLg: [""],
      sapErrorDescLg: [""],
      showButtonCash: [""],
      showButtonLg: [""],
    })
    // criteria search meter
    this.formSearchMeter = this.fb.group({
      criteria: [""],
    })
  }

  // ============== Action ==================
  dateChange(event) {
    this.formGroup.get('dateChange').patchValue(event);
  }

  onBack() {
    let pathBack = '';
    if (Utils.isNotNull(this.formGroup.get('waterChangeId').value)) {
      pathBack = '/water/water008';
    } else {
      pathBack = '/water/water003';
    }
    this.router.navigate([pathBack]);
  }

  onOpenModalSave() {
    let validateData = [
      { format: "", header: "Serial No. มิเตอร์น้ำ", value: this.formGroup.get("newSerialNo").value },
      { format: "", header: "วันที่สิ้นสุดมิเตอร์น้ำเดิม", value: this.formGroup.get("dateChange").value }
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
    if (this.formGroup.invalid) {
      this.modalError.openModal("กรุณากรอกข้อมูลให้ครบ");
    } else {
      this.callSave();
    }
  }

  openModalCustom(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, { class: 'modal-lg' });
    this.datas = this.meterList.filter(v => {
      return v.serialNo != this.formGroup.get('oldSerialNo').value;
    });
    this.initDataTable();
  }

  onCloseModal() {
    this.modalRef.hide();
  }

  // ================ call back-end ==============
  callSave() {
    this.commonService.loading();
    // delete ','
    let oldChargeRates = NumberUtils.decimalFormatToNumber(this.formGroup.get('oldChargeRates').value);
    let oldVat = NumberUtils.decimalFormatToNumber(this.formGroup.get('oldVat').value);
    let oldTotalchargeRates = NumberUtils.decimalFormatToNumber(this.formGroup.get('oldTotalchargeRates').value);
    this.formGroup.patchValue({
      oldChargeRates: oldChargeRates,
      oldVat: oldVat,
      oldTotalchargeRates: oldTotalchargeRates,
    })
    // console.log("formGroup => ", this.formGroup.value);
    this.ajax.doPost(URL.SAVE, this.formGroup.value).subscribe((res: ResponseData<any>) => {
      if (MessageService.MSG.SUCCESS == res.status) {
        this.modalSuccess.openModal();
        this.router.navigate(['/water/water008']);
      } else {
        this.modalError.openModal(res.message);
      }
      this.commonService.unLoading();
    });
  }

  findById(id) {
    this.commonService.loading();
    let data = {
      reqId: id,
      waterChangeId: ''
    }
    if (Utils.isNotNull(this.formGroup.get('waterChangeId').value)) {
      data['waterChangeId'] = this.formGroup.get('waterChangeId').value
    }
    this.ajax.doPost(URL.FIND_ID, data).subscribe((res: ResponseData<any>) => {
      if (MessageService.MSG.SUCCESS == res.status) {
        this.formGroup.get('customerCode').patchValue(res.data.customerCode);
        this.formGroup.get('customerName').patchValue(res.data.customerName);
        this.formGroup.get('customerBranch').patchValue(res.data.customerBranch);
        this.formGroup.get('contractNo').patchValue(res.data.contractNo);
        this.formGroup.get('requestType').patchValue(res.data.requestType);
        this.formGroup.get('oldSerialNo').patchValue(res.data.oldSerialNo);
        this.formGroup.get('oldMeterName').patchValue(res.data.oldMeterName);
        this.formGroup.get('oldMeterType').patchValue(res.data.oldMeterType);
        this.formGroup.get('oldMeterLocation').patchValue(res.data.oldMeterLocation);
        this.formGroup.get('oldRentalAreaCode').patchValue(res.data.oldRentalAreaCode);
        this.formGroup.get('oldChargeRates').patchValue(NumberUtils.numberToDecimalFormat(res.data.oldChargeRates));
        this.formGroup.get('oldVat').patchValue(NumberUtils.numberToDecimalFormat(res.data.oldVat));
        this.formGroup.get('oldTotalchargeRates').patchValue(NumberUtils.numberToDecimalFormat(res.data.oldTotalchargeRates));
        this.formGroup.get('airport').patchValue(res.data.airport);
        this.formGroup.get('invoiceNoReqcash').patchValue(res.data.invoiceNoReqcash);
        this.formGroup.get('receiptNoReqcash').patchValue(res.data.receiptNoReqcash);
        this.formGroup.get('invoiceNoReqlg').patchValue(res.data.invoiceNoReqlg);
        this.formGroup.get('receiptNoReqlg').patchValue(res.data.receiptNoReqlg);
        this.formGroup.get('transactionNoCash').patchValue(res.data.transactionNoCash);
        this.formGroup.get('invoiceNoCash').patchValue(res.data.invoiceNoCash);
        this.formGroup.get('receiptNoCash').patchValue(res.data.receiptNoCash);
        this.formGroup.get('sapStatusCash').patchValue(res.data.sapStatusCash);
        this.formGroup.get('sapErrorDescCash').patchValue(res.data.sapErrorDescCash);
        this.formGroup.get('transactionNoLg').patchValue(res.data.transactionNoLg);
        this.formGroup.get('invoiceNoLg').patchValue(res.data.invoiceNoLg);
        this.formGroup.get('receiptNoLg').patchValue(res.data.receiptNoLg);
        this.formGroup.get('sapStatusLg').patchValue(res.data.sapStatusLg);
        this.formGroup.get('sapErrorDescLg').patchValue(res.data.sapErrorDescLg);
        this.formGroup.get('showButtonCash').patchValue(res.data.showButtonCash);
        this.formGroup.get('showButtonLg').patchValue(res.data.showButtonLg);
        if (Utils.isNotNull(this.formGroup.get('waterChangeId').value)) {
          this.formGroup.get('newSerialNo').patchValue(res.data.newSerialNo);
          this.formGroup.get('newMeterName').patchValue(res.data.newMeterName);
          this.formGroup.get('newMeterType').patchValue(res.data.newMeterType);
          this.formGroup.get('newMeterLocation').patchValue(res.data.newMeterLocation);
          this.formGroup.get('dateChange').patchValue(res.data.dateChange);
          this.calendar.setDate(this.formGroup.get('dateChange').value);
          this.formGroup.get('remark').patchValue(res.data.remark);
        }
      } else {
        this.modalError.openModal(res.message);
        this.router.navigate(['/water/water003']);
      }
      this.commonService.unLoading();
    })
  }

  findMeter(serialNo: string) {
    this.commonService.loading();
    let data = {
      newSerialNo: serialNo
    }
    this.ajax.doPost(URL.FIND_METER, data).subscribe((res: ResponseData<any>) => {
      if (MessageService.MSG.SUCCESS == res.status) {
        this.formGroup.get('newSerialNo').patchValue(res.data.newSerialNo);
        this.formGroup.get('newMeterName').patchValue(res.data.newMeterName);
        this.formGroup.get('newMeterType').patchValue(res.data.newMeterType);
        this.formGroup.get('newMeterLocation').patchValue(res.data.newMeterLocation);
      } else {
        this.modalError.openModal(res.message);
      }
      this.commonService.unLoading();
      this.onCloseModal();
    })
  }

  getAllMeter() {
    // this.commonService.loading();
    this.meterList = [];
    this.ajax.doPost(URL.GET_METER, this.formSearchMeter.value).subscribe((res: ResponseData<any>) => {
      if (MessageService.MSG.SUCCESS == res.status) {
        this.meterList = res.data;
        this.datas = this.meterList.filter(v => {
          return v.serialNo != this.formGroup.get('oldSerialNo').value;
        });
        this.initDataTable();
      } else {
        this.modalError.openModal(res.message);
      }
      // this.commonService.unLoading();
    })
  }

  // ========== data table ===============

  initDataTable = () => {
    if (this.dataTable != null) {
      this.dataTable.destroy();
    }
    this.dataTable = $('#datatable').DataTable({
      processing: true,
      serverSide: false,
      searching: false,
      ordering: false,
      paging: true,
      scrollX: true,
      data: this.datas,
      columns: [
        {
          data: 'serialNo', className: 'text-left'
        }, {
          data: 'meterName', className: 'text-left'
        }, {
          data: 'meterType', className: 'text-left'
        }, {
          data: 'meterLocation', className: 'text-left'
        }, {
          data: 'functionalLocation', className: 'text-left'
        }, {
          className: 'text-center',
          render(data, type, row, meta) {
            return `<button class="btn btn-primary btn-sm" type="button">เลือก</button>`;
          }
        },
      ],
    });

    this.dataTable.on('click', 'td > button.btn-primary', (event) => {
      const data = this.dataTable.row($(event.currentTarget).closest('tr')).data();
      this.findMeter(data.serialNo);
    });
  }

}
