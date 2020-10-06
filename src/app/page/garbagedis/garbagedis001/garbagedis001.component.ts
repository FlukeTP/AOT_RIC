import { Component, OnInit, ViewChild } from '@angular/core';
import { AjaxService } from 'src/app/_service/ajax.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ResponseData } from 'src/app/common/models/response-data.model';
import { MessageService } from 'src/app/_service/message.service';
import { ModalConfirmComponent } from 'src/app/components/modal/modal-confirm/modalConfirm.component';
import { ModalSuccessComponent } from 'src/app/components/modal/modal-success/modalSuccess.component';
import { ModalErrorComponent } from 'src/app/components/modal/modal-error/modalError.component';
import { CommonService } from 'src/app/_service/ common.service';
import { ToastrService } from 'ngx-toastr';
import { ValidateService } from 'src/app/_service/validate.service';
import { UserService } from 'src/app/_service/user.service.';
import { Utils } from 'src/app/common/helper/utils';
import { SAP_CONSTANT } from 'src/app/common/constant/SAP.constant';
import { InputCalendarComponent } from 'src/app/components/input/input-calendar/input-calendar.component';
import { NumberUtils } from 'src/app/common/helper/number';
import { ButtonDatatable } from 'src/app/components/buttons/button-datatable';
import { Router } from '@angular/router';
import { REQUEST_TYPE, DOC_TYPE_CONSTANT, SAP_TYPE_CONSTANT } from 'src/app/common/constant/CnDn.constants';
import { CnDnService } from 'src/app/_service/cn-dn.serviec';
import { CnDnRequest } from 'src/app/common/models/cn-dn.model';

const URL = {
  SEARCH: "garbagedis001/search",
  SERIAL_NO_LIST: "garbagedis001/dropdown/serial-no",
  EXPORT: "download-template-info",
  SAVE: "garbagedis001/save",
  UPLOAD_EXCEL: "garbagedis001/upload-excel",
  SYNC_DATA: "garbagedis001/sync_data",
  GET_ALL: "garbagedis001/get_all",
  SEND_SAP: "garbagedis001/sendToSAP",
}
declare var $: any;
@Component({
  selector: 'app-garbagedis001',
  templateUrl: './garbagedis001.component.html',
  styleUrls: ['./garbagedis001.component.css']
})
export class Garbagedis001Component implements OnInit {
  /* modal */
  @ViewChild('saveModal') saveModal: ModalConfirmComponent;
  @ViewChild('successModal') modalSuccess: ModalSuccessComponent;
  @ViewChild('errorModal') modalError: ModalErrorComponent;
  @ViewChild('syncModal') syncModal: ModalConfirmComponent;
  @ViewChild('calendarMonth') calendarMonth: InputCalendarComponent;
  breadcrumb: any = [
    {
      label: "หมวดกำจัดขยะ",
      link: "/home/garbagedis",
    },
    {
      label: "บันทึกข้อมูลบริการกำจัดขยะ",
      link: "#",
    }
  ];
  /* form */
  formSearch: FormGroup;
  dateNowStr: string = new Date().toLocaleDateString();
  // data table 
  dataTable: any;
  dataList: any[] = [];

  idxList: any[] = [];  // checked
  isNow: boolean = true;  // check date is now
  numChecked: number; // get number of input checkbox

  constructor(
    private ajax: AjaxService,
    private fb: FormBuilder,
    private commonService: CommonService,
    private toastr: ToastrService,
    private validate: ValidateService,
    private user: UserService,
    private router: Router,
    private cndn: CnDnService
  ) { }

  ngOnInit() {
    this.initialVariable();
  }

  ngAfterViewInit(): void {
    this.initDataTable();
    this.clickBtn();
  }

  initialVariable() {
    this.formSearch = this.fb.group({
      customerName: [''],
      monthly: ['', Validators.required],
      trashLocation: [''],
      rentalObject: [''],
      contractNo: [''],
    });
  }

  setDate(e) {
    this.formSearch.get('monthly').patchValue(e);
  }

  search() {
    const validateData = [
      { format: "", header: "ประจำเดือน", value: this.formSearch.value.monthly }
    ];
    if (!this.validate.checking(validateData)) {
      return;
    }
    if (this.formSearch.valid) {
      if (Utils.isNotNull(this.formSearch.get('monthly').value)) {
        let dateNow = new Date();
        let month = dateNow.getMonth() + 1;
        let year = dateNow.getFullYear();
        let monthly = this.formSearch.get('monthly').value.split("/");
        if (month == monthly[0] && year == monthly[1]) {
          this.isNow = true;
        } else {
          this.isNow = false;
        }
      }
      this.searchBackEnd();
      return;
    }
  }

  syncDataConfirm() {
    this.syncModal.openModal();
  }

  // ======================= back-end ==========================

  syncData() {
    this.commonService.loading();
    this.ajax.doPost(URL.SYNC_DATA, {}).subscribe((response: ResponseData<any>) => {
      if (MessageService.MSG.SUCCESS === response.status) {
        this.modalSuccess.openModal();
        let dateNow = new Date();
        let month = dateNow.getMonth() + 1;
        let year = dateNow.getFullYear();
        this.formSearch.get('monthly').patchValue(`${month}/${year}`);
        $('input-calendar > div > input')[0].value = this.formSearch.get('monthly').value;
        this.searchBackEnd();
      } else {
        this.modalError.openModal(response.message);
      }
      this.commonService.unLoading();
    });
  }

  searchBackEnd() {
    this.commonService.loading();
    this.ajax.doPost(URL.GET_ALL, this.formSearch.value).subscribe((response: ResponseData<any>) => {
      if (MessageService.MSG.SUCCESS === response.status) {
        this.dataList = response.data;
        this.initDataTable();
      } else {
        this.modalError.openModal(response.message);
      }
      this.commonService.unLoading();
    });
  }

  /* __________________________________________________________ */

  initDataTable = () => {
    if (this.dataTable != null) {
      this.dataTable.destroy();
    }

    let renderString = function (data, type, row, meta) {
      return Utils.isNull($.trim(data)) ? "-" : data;
    };

    let renderDecimalFormat = function (data, type, row, meta) {
      return NumberUtils.numberToDecimalFormat(Number(data));
    };

    this.dataTable = $('#datatable').DataTable({
      ...this.commonService.configDataTable(),
      data: this.dataList,
      columns: [
        {
          render: function (data, type, row, meta) {
            let str: string = `
            <div class="form-check">
              <input class="form-check-input position-static chk" type="checkbox" aria-label="...">
            </div>`;
            if (Utils.isNull(row.showButton)) {
              str = '-';
            }
            return str;
          },
          className: 'text-center'
        },
        {
          data: 'customerName',
          className: 'text-center',
          render: renderString
        },
        {
          data: 'contractNo',
          render: renderString
        },
        {
          data: 'trashLocation',
          render: renderString
        },
        {
          data: 'rentalObject',
          render: renderString
        },
        {
          data: 'generalWeight',
          render: renderDecimalFormat
        },
        {
          data: 'hazardousWeight',
          render: renderDecimalFormat
        },
        {
          data: 'infectiousWeight',
          render: renderDecimalFormat
        },
        {
          data: 'generalMoney',
          render: renderDecimalFormat
        },
        {
          data: 'hazardousMoney',
          render: renderDecimalFormat
        },
        {
          data: 'infectiousMoney',
          render: renderDecimalFormat
        },
        {
          data: 'totalMoney',
          render(data, type, full, meta) {
            return NumberUtils.numberToDecimalFormat(Number(data) * 1.07);
          }
        },
        {
          data: 'invoiceNo',
          className: 'text-center',
          render: renderString
        },
        {
          data: 'receiptNo',
          className: 'text-center',
          render: renderString
        },
        {
          className: 'text-center',
          data: 'sapStatus',
          render(data, type, full, meta) {
            let res = MessageService.SAP.getStatus(data, "sapErr")
            if (SAP_CONSTANT.STATUS.SUCCESS.CONST === data) {
              res += ButtonDatatable.cndn('cndn')
            }
            return res;
          }
        },
        {
          className: 'text-left',
          render(data, type, row, meta) {
            let _btn = '';
            if (Utils.isNull(row.showButton)) {
              _btn = `${ButtonDatatable.edit('edit', 'แก้ไข', true)}`
            } else {
              _btn = `${ButtonDatatable.edit('edit', 'แก้ไข')}`;
            }
            return _btn;
          }
        }
      ]
    });
    // get number of input.chk
    this.numChecked = $("input.chk").length;
  }

  // event Click button in dataTable
  clickBtn() {
    this.dataTable.on('click', 'td > button#edit', (event) => {
      const data = this.dataTable.row($(event.currentTarget).closest('tr')).data();
      this.router.navigate(['/garbagedis/garbagedis002detail'], {
        queryParams: {
          garInfoId: data.garInfoId
        }
      })
    });

    this.dataTable.on('click', 'tbody tr button#sapErr', (event) => {
      const data = this.dataTable.row($(event.currentTarget).closest('tr')).data();
      this.modalError.openModal(data.sapError);
    });

    this.dataTable.on("click", ".chk", (event) => {
      let data = this.dataTable.row($(event.currentTarget).closest("tr")).data();
      let index = this.idxList.findIndex(obj => obj.garInfoId == data.garInfoId);

      if (event.target.checked) {
        /* ________ check data in idxList _______ */
        if (index > -1) {
          this.idxList.splice(index, 1);
          $('#checkAll').prop("checked", false);
        } else {
          this.idxList.push(data.garInfoId);
          //check all is checked if checked every data
          if (this.numChecked == this.idxList.length) {
            $('#checkAll').prop("checked", true);
          }
        }
      } else {
        this.idxList.splice(index, 1);
        $('#checkAll').prop("checked", false);
      }
    });

    this.dataTable.on('click', 'tbody tr button#cndn', (event) => {
      const data = this.dataTable.row($(event.currentTarget).closest('tr')).data();
      let cndnData: CnDnRequest = {
        id: data.garInfoId,
        customerCode: data.customerCode,
        customerName: data.customerName,
        customerBranch: data.customerBranch,
        contractNo: data.contractNo,
        oldInvoiceNo: data.invoiceNo,
        oldReceiptNo: data.receiptNo,
        requestType: REQUEST_TYPE.OTHER.KEY,
        docType: DOC_TYPE_CONSTANT.GARBAGEDISPOSAL.KEY,
        sapType: SAP_TYPE_CONSTANT.INVOICE.KEY,
        oldTotalAmount: Number(data.totalMoney) * 1.07,
        glAccount: "4105090001",
        oldTransactionNo: data.transactionNo,
      }
      this.cndn.setData(cndnData);
      this.router.navigate(["/cndn/cndn001detail"], {
        queryParams: {
          path: "/garbagedis/garbagedis001"
        }
      });
    });
  }

  checkAll = (e) => {
    let rows = this.dataTable.rows({ search: "applied" }).nodes();
    $('input[type="checkbox"]', rows).prop("checked", e.target.checked);
    let dataInTable = this.dataTable.rows().data();
    if (e.target.checked) {
      this.idxList = [];
      for (let i = 0; i < dataInTable.length; i++) {
        if (Utils.isNotNull(dataInTable[i].showButton)) {
          this.idxList.push(dataInTable[i].garInfoId);
        }
      }
    } else {
      this.idxList = [];
    }
  }

  sendToSAP() {
    if (this.idxList.length == 0) {
      this.modalError.openModal(MessageService.MSG.DATA_UNCHECKED);
      return;
    }
    this.ajax.doPost(URL.SEND_SAP, this.idxList).subscribe((response: ResponseData<any>) => {
      if (MessageService.MSG.SUCCESS === response.status) {
        $('#checkAll').prop("checked", false);
        this.idxList = [];
        this.search();
        this.modalSuccess.openModal();
      } else {
        this.modalError.openModal(response.message);
      }
      this.commonService.unLoading();
    });
  }

  save() {

  }
}
