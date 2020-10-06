import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonService } from 'src/app/_service/ common.service';
import { AjaxService } from 'src/app/_service/ajax.service';
import { ResponseData } from 'src/app/common/models/response-data.model';
import { Utils } from 'src/app/common/helper';
import { MessageService } from 'src/app/_service/message.service';
import { ButtonDatatable } from 'src/app/components/buttons/button-datatable';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { NumberUtils } from 'src/app/common/helper/number';
import { ModalConfirmComponent } from 'src/app/components/modal/modal-confirm/modalConfirm.component';
import { ModalErrorComponent } from 'src/app/components/modal/modal-error/modalError.component';
import { ModalSuccessComponent } from 'src/app/components/modal/modal-success/modalSuccess.component';
import { ModalCustomComponent } from 'src/app/components/modal/modal-custom/modalCustom.component';
declare var $: any;

const URL = {
  EXPORT: "download-template-info",
  GET_LIST: 'it001/list',
  SAVE: "it001/save",
};
@Component({
  selector: 'app-it001',
  templateUrl: './it001.component.html',
  styleUrls: ['./it001.component.css']
})
export class It001Component implements OnInit {
  @ViewChild('modalEditEndDate') modalEditEndDate: ModalCustomComponent;
  @ViewChild('saveModal') modalSave: ModalConfirmComponent;
  @ViewChild('errorModal') modalError: ModalErrorComponent;
  @ViewChild('successModal') modalSuccess: ModalSuccessComponent;

  dataTable: any;
  formSearch = new FormGroup({});
  datas: any[] = [];
  modalRef: BsModalRef;
  breadcrumb: any = [
    {
      label: "หมวด IT",
      link: "/home/it",
    },
    {
      label: "ขอใช้บริการเครือข่ายหมวด IT",
      link: "#",
    }
  ];
  endDateInfo: string;
  formHeader: FormGroup;
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private modalService: BsModalService,
    private commonService: CommonService,
    private ajax: AjaxService
  ) {
    this.formHeader = this.fb.group({
      networkCreateInvoiceId: [''],
      entreprenuerCode: [''], //รหัสผู้ประกอบการ
      entreprenuerName: [''], //ชื่อผู้ประกอบการ
      contractNo: [''], // เลขที่สัญญา
      itLocation: [''],// สถานที่ติดตั้ง 
      totalAmount: [''],// เงินรวม
      rentalObjectCode: [''],// พื้นที่
      remark: [''],// หมายเหตุ
      requestStartDate: [''],// วันที่ขอใช้บริการ
      requestEndDate: [''],// สิ้นสุดสัญญาใช้บริการ (เวลา)

    });

    this.formSearch = this.fb.group({
      entreprenuerName: [''],
      entreprenuerCode: [''],
      requestStartDate: [''],
      contractNo: ['']
    });
  }

  ngOnInit() {
    this.doGetList();
  }

  ngAfterViewInit(): void {
    this.initDataTable();
    this.clickBtn();
  }

  doGetList() {
    this.ajax.doPost(URL.GET_LIST, {}).subscribe(
      (res: ResponseData<any>) => {
        this.datas = res.data;
        this.initDataTable();
        this.commonService.unLoading();
      },
      (err) => {
        this.commonService.unLoading();
      }
    );
  }
  getExcel() {
    this.commonService.loading();
    let arrOfId: string[] = [];
    arrOfId.push("-");
    arrOfId.push("-");
    console.log("arrOfId:", arrOfId);
    this.ajax.download(`${URL.EXPORT}/IT001/${arrOfId.join(",")}`);
    this.commonService.unLoading();
  }

  search() {
    this.ajax.doPost(URL.GET_LIST, this.formSearch.value).subscribe(
      (res: ResponseData<any>) => {
        this.datas = res.data;
        this.initDataTable();
        this.commonService.unLoading();
      },
      (err) => {
        this.commonService.unLoading();
      }
    );
  }

  initDataTable = () => {
    if (this.dataTable != null) {
      this.dataTable.destroy();
    }
    let renderNumberToDecimalFormat = function (data, type, row, meta) {
      return NumberUtils.numberToDecimalFormat(Number(data));
    };
    let renderNumberVat = function (data, type, row, meta) {
      return NumberUtils.numberToDecimalFormat(Number(data * 1.07));
    };
    let renderString = function (data, type, row, meta) {
      return Utils.isNull($.trim(data)) ? "-" : data;
    };
    this.dataTable = $('#datatable').DataTable({
      data: this.datas, ...this.commonService.configDataTable(),
      ...{ scrollX: false },
      columns: [
        {
          data: 'entreprenuerCode',
          className: 'text-center',
          render: renderString
        },
        {
          data: 'entreprenuerName',
          className: 'text-center',
          render: renderString
        },
        {
          data: 'contractNo',
          className: 'text-center',
          render: renderString
        },
        {
          data: 'itLocation',
          className: 'text-center',
          render: renderString
        },
        {
          data: 'rentalObjectCode',
          className: 'text-center',
          render: renderString
        },
        {
          data: 'totalAmount',
          className: 'text-right',
          render: renderNumberToDecimalFormat
        },
        {
          data: 'totalAmount',
          className: 'text-center',
          render: renderNumberVat
        },
        {
          data: 'requestStartDate',
          className: 'text-center',
          render: renderString
        },
        {
          data: 'requestEndDate',
          className: 'text-center',
          render: renderString
        },
        {
          render: (data, type, full, meta) => {
            return `${ButtonDatatable.detail('detail')} ${ButtonDatatable.edit('edit')} ${ButtonDatatable.cancel('cancel', 'วันที่ยกเลิก')}`;
          }
        }
      ]
    });
  }
  onAdd() {
    this.router.navigate(['/it/it001detail'], {
      queryParams: {
        flag: 'C',
      }
    });
  }

  clickBtn() {
    this.dataTable.on("click", "td > button", e => {
      let dataRow = this.dataTable.row($(e.currentTarget).closest("tr")).data();
      const { id } = e.currentTarget;
      if (dataRow) {
        switch (id) {
          case 'detail':
            this.router.navigate(['/it/it001detail'], {
              queryParams: {
                networkCreateInvoiceId: dataRow.networkCreateInvoiceId,
                flag: 'R',
              }
            });
            break;
          case 'edit':
            this.router.navigate(['/it/it001detail'], {
              queryParams: {
                networkCreateInvoiceId: dataRow.networkCreateInvoiceId,
                flag: 'U',
              }
            });
            break;
          case 'cancel':
            this.formHeader.get('networkCreateInvoiceId').patchValue(dataRow.networkCreateInvoiceId);
            this.formHeader.get('entreprenuerCode').patchValue(dataRow.entreprenuerCode);
            this.formHeader.get('entreprenuerName').patchValue(dataRow.entreprenuerName);
            this.formHeader.get('contractNo').patchValue(dataRow.contractNo);
            this.formHeader.get('itLocation').patchValue(dataRow.itLocation);
            this.formHeader.get('totalAmount').patchValue(dataRow.totalAmount);
            this.formHeader.get('requestStartDate').patchValue(dataRow.requestStartDate);
            this.formHeader.get('requestEndDate').patchValue(dataRow.requestEndDate);
            this.formHeader.get('rentalObjectCode').patchValue(dataRow.rentalObjectCode);
            this.formHeader.get('remark').patchValue(dataRow.remark);
            this.openModalCustom(dataRow.requestEndDate);
            break;
        }
      }
    });
  }

  beforeSave() {
    this.modalSave.openModal();
  }

  save() {
    this.ajax.doPost(URL.SAVE, this.formHeader.value).subscribe((response: ResponseData<any>) => {
      if (MessageService.MSG.SUCCESS === response.status) {
        this.modalSuccess.openModal();
        this.doGetList();
        this.onCloseModal();
      } else {
        this.modalError.openModal(response.message);
      }
    });
  }

  setEndDate(e) {
    this.formHeader.get('requestEndDate').patchValue(e);
  }

  openModalCustom(text: string) {
    this.endDateInfo = text;
    this.modalRef = this.modalService.show(this.modalEditEndDate, { class: 'modal-xl' });
  }

  onCloseModal() {
    this.modalRef.hide();
  }

}