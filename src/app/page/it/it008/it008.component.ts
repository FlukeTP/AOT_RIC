import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { ModalCustomComponent } from 'src/app/components/modal/modal-custom/modalCustom.component';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonService } from 'src/app/_service/ common.service';
import { AjaxService } from 'src/app/_service/ajax.service';
import { ResponseData } from 'src/app/common/models/response-data.model';
import { Utils } from 'src/app/common/helper';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { MessageService } from 'src/app/_service/message.service';
import { ButtonDatatable } from 'src/app/components/buttons/button-datatable';
import { ModalConfirmComponent } from 'src/app/components/modal/modal-confirm/modalConfirm.component';
import { ModalErrorComponent } from 'src/app/components/modal/modal-error/modalError.component';
import { ModalSuccessComponent } from 'src/app/components/modal/modal-success/modalSuccess.component';
import { NumberUtils } from 'src/app/common/helper/number';
declare var $: any;

const URL = {
  EXPORT: "download-template-info",
  GET_LIST: 'it008/list',
  SAVE: "it008/save"
};
@Component({
  selector: 'app-it008',
  templateUrl: './it008.component.html',
  styleUrls: ['./it008.component.css']
})
export class It008Component implements OnInit {
  @ViewChild('modalEditEndDate') modalEditEndDate: ModalCustomComponent;
  @ViewChild('saveModal') modalSave: ModalConfirmComponent;
  @ViewChild('errorModal') modalError: ModalErrorComponent;
  @ViewChild('successModal') modalSuccess: ModalSuccessComponent;

  dataTable: any;
  datas: any[] = [];
  breadcrumb: any = [
    {
      label: "หมวด IT",
      link: "/home/it",
    },
    {
      label: "ขอใช้บริการ Dedicated CUTE",
      link: "#",
    }
  ];
  endDateInfo: string;
  modalRef: BsModalRef;
  formSearch = new FormGroup({});
  formHeader: FormGroup;
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private modalService: BsModalService,
    private fb: FormBuilder,
    private commonService: CommonService,
    private ajax: AjaxService
  ) {
    this.formHeader = this.fb.group({
      id: [''],
      entreprenuerCode: [''], //รหัสผู้ประกอบการ
      entreprenuerName: [''], //ชื่อผู้ประกอบการ
      contractNo: [''], // เลขที่สัญญา
      location: [''],// สถานที่ติดตั้ง 
      totalAmount: [''],// เงินรวม
      contractData: [''],// สัญญาใช้บริการ (ตัวเลือก)
      requestStartDate: [''],// วันที่ขอใช้บริการ
      requestEndDate: [''],// สิ้นสุดสัญญาใช้บริการ (เวลา)

    });
    this.formSearch = this.fb.group({
      entreprenuerName: [''],
      entreprenuerCode: [''],
      roomType: [''],
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
    Object.keys(this.formHeader.value).forEach(key => {
      if (this.formHeader.get(key).value !== "") {
        arrOfId.push(this.formHeader.get(key).value);
      } else {
        arrOfId.push("-");
      }

    });
    console.log("arrOfId:", arrOfId);
    this.ajax.download(`${URL.EXPORT}/IT008/${arrOfId.join(",")}`);
    this.commonService.unLoading();
  }


  initDataTable = () => {
    if (this.dataTable != null) {
      this.dataTable.destroy();
    }
    let renderNumberToDecimalFormat = function (data, type, row, meta) {
      return NumberUtils.numberToDecimalFormat(Number(data));
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
          data: 'totalAmount',
          className: 'text-right',
          render: renderNumberToDecimalFormat
        },
        {
          // className: "text-center",
          render: (data, type, full, meta) => {
            return `${ButtonDatatable.detail('detail')} ${ButtonDatatable.edit('edit')} ${ButtonDatatable.cancel('cancel', 'วันที่ยกเลิก')}`;
          }
        }
      ]
    });
  }

  clickBtn() {
    this.dataTable.on("click", "td > button", e => {
      let dataRow = this.dataTable.row($(e.currentTarget).closest("tr")).data();
      const { id } = e.currentTarget;
      if (dataRow) {
        switch (id) {
          case 'detail':
            this.router.navigate(['/it/it008detail'], {
              queryParams: {
                id: dataRow.id,
                flag: 'IT008R'
              }
            });
            break;
          case 'edit':
            this.router.navigate(['/it/it008detail'], {
              queryParams: {
                id: dataRow.id,
                flag: 'IT008E'
              }
            });
            break;
          case 'cancel':
            this.formHeader.get('id').patchValue(dataRow.id);
            this.formHeader.get('entreprenuerCode').patchValue(dataRow.entreprenuerCode);
            this.formHeader.get('entreprenuerName').patchValue(dataRow.entreprenuerName);
            this.formHeader.get('contractNo').patchValue(dataRow.contractNo);
            this.formHeader.get('contractData').patchValue(dataRow.contractData);
            this.formHeader.get('location').patchValue(dataRow.location);
            this.formHeader.get('requestStartDate').patchValue(dataRow.requestStartDate);
            this.formHeader.get('requestEndDate').patchValue(dataRow.requestEndDate);
            this.formHeader.get('totalAmount').patchValue(dataRow.totalAmount);
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