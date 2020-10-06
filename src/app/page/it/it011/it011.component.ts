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
import { InputCalendarComponent } from 'src/app/components/input/input-calendar/input-calendar.component';
import { NumberUtils } from 'src/app/common/helper/number';
import { ButtonDatatable } from 'src/app/components/buttons/button-datatable';
import { Router } from '@angular/router';
import { CnDnRequest } from 'src/app/common/models/cn-dn.model';
import { REQUEST_TYPE, DOC_TYPE_CONSTANT, SAP_TYPE_CONSTANT } from 'src/app/common/constant/CnDn.constants';
import { SAP_CONSTANT } from 'src/app/common/constant/SAP.constant';
import { CnDnService } from 'src/app/_service/cn-dn.serviec';

const URL = {
  SEARCH: "it011/search",
  SERIAL_NO_LIST: "it011/dropdown/serial-no",
  EXPORT: "download-template-info",
  SAVE: "it011/save",
  UPLOAD_EXCEL: "it011/upload-excel",
  SYNC_DATA: "it011/sync_data",
  GET_ALL: "it011/get_all",
  SEND_SAP: "it011/sendToSAP",
}
declare var $: any;

@Component({
  selector: 'app-it011',
  templateUrl: './it011.component.html',
  styleUrls: ['./it011.component.css']
})
export class It011Component implements OnInit {
  /* modal */
  @ViewChild('saveModal') saveModal: ModalConfirmComponent;
  @ViewChild('successModal') modalSuccess: ModalSuccessComponent;
  @ViewChild('errorModal') modalError: ModalErrorComponent;
  @ViewChild('syncModal') syncModal: ModalConfirmComponent;
  @ViewChild('calendarMonth') calendarMonth: InputCalendarComponent;
  breadcrumb: any = [
    {
      label: "หมวด IT",
      link: "/home/it",
    },
    {
      label: "รายการบริการเครือข่ายหมวด IT รายเดือน",
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
    this.initDataTable();
  }

  ngAfterViewInit(): void {
    // this.initDataTable();
    this.search();
    this.clickBtn();
  }

  initialVariable() {
    this.formSearch = this.fb.group({
      customerName: [''],
      monthly: [''],
      itLocation: [''],
      rentalObject: [''],
      contractNo: [''],
      periodMonth: [''],
    });
  }

  setDate(e) {
    let dateSplit = e.split("/");
    this.formSearch.get('periodMonth').patchValue(dateSplit[1].concat(dateSplit[0]));
    // this.formSearch.get('monthly').patchValue(e);
  }

  search() {
    // const validateData = [
    //   { format: "", header: "ประจำเดือน", value: this.formSearch.value.monthly }
    // ];
    // if (!this.validate.checking(validateData)) {
    //   return;
    // }
    // if (this.formSearch.valid) {
    //   if (Utils.isNotNull(this.formSearch.get('monthly').value)) {
    //     let dateNow = new Date();
    //     let month = dateNow.getMonth() + 1;
    //     let year = dateNow.getFullYear();
    //     let monthly = this.formSearch.get('monthly').value.split("/");
    //     if (month == monthly[0] && year == monthly[1]) {
    //       this.isNow = true;
    //     } else {
    //       this.isNow = false;
    //     }
    //   }
    //   this.searchBackEnd();
    //   return;
    // }
    this.ajax.doPost(URL.GET_ALL, this.formSearch.value).subscribe((response: ResponseData<any>) => {
      if (MessageService.MSG.SUCCESS === response.status) {
        this.dataList = response.data;
        this.initDataTable();
      } else {
        this.modalError.openModal(response.message);
      }
    });
  }

  syncDataConfirm() {
    this.syncModal.openModal();
  }

  // ======================= back-end ==========================

  syncData() {
    this.commonService.loading();
    this.ajax.doPost(URL.SYNC_DATA, this.formSearch.get('periodMonth').value).subscribe((response: ResponseData<any>) => {
      if (MessageService.MSG.SUCCESS === response.status) {
        this.modalSuccess.openModal(response.message);
        // let dateNow = new Date();
        // let month = dateNow.getMonth() + 1;
        // let year = dateNow.getFullYear();
        // this.formSearch.get('monthly').patchValue(`${month}/${year}`);
        // $('input-calendar > div > input')[0].value = this.formSearch.get('monthly').value;
        // this.searchBackEnd();
        this.search();
      } else {
        this.modalError.openModal(response.message);
      }
      this.commonService.unLoading();
    });
  }

  // searchBackEnd() {
  //   this.ajax.doPost(URL.GET_ALL, this.formSearch.value).subscribe((response: ResponseData<any>) => {
  //     if (MessageService.MSG.SUCCESS === response.status) {
  //       this.dataList = response.data;
  //       this.initDataTable();
  //     } else {
  //       this.modalError.openModal(response.message);
  //     }
  //   });
  // }

  /* __________________________________________________________ */

  initDataTable = () => {
    if (this.dataTable != null) {
      this.dataTable.destroy();
    }

    let renderString = function (data, type, row, meta) {
      return Utils.isNull($.trim(data)) ? "-" : data;
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
          data: 'itLocation',
          render: renderString
        },
        {
          data: 'rentalObject',
          render: renderString
        },
        {
          data: 'startDate',
          render: renderString
        },
        {
          data: 'endDate',
          render: renderString
        },
        {
          data: 'totalAmount',
          className: 'text-right',
          render(data, type, row, meta) {
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
          render(data, type, row, meta) {
            let res = MessageService.SAP.getStatus(data, "sapErr");
            if (SAP_CONSTANT.STATUS.SUCCESS.CONST === data) {
              res += ButtonDatatable.cndn('cndn')
            }
            return res;
          }
        },
        {
          className: 'text-left',
          render(data, type, row, meta) {
            return `${ButtonDatatable.detail('detail')}`;
          }
        }
      ],
      "createdRow": function (row, data, dataIndex) {
        if (data.flagEndDate === 'X') {
          $(row).css('background-color', '#f79b9b');
        }
      }
    });
    // get number of input.chk
    this.numChecked = $("input.chk").length;
  }

  // event Click button in dataTable
  clickBtn() {
    this.dataTable.on('click', 'td > button#detail', (event) => {
      const data = this.dataTable.row($(event.currentTarget).closest('tr')).data();
      this.router.navigate(['/it/it001detail'], {
        queryParams: {
          networkCreateInvoiceId: data.networkCreateInvoiceId,
          flag: 'R'
          // itNetworkServiceId: data.itNetworkServiceId
        }
      })
    });

    this.dataTable.on('click', 'tbody tr button#sapErr', (event) => {
      const data = this.dataTable.row($(event.currentTarget).closest('tr')).data();
      this.modalError.openModal(data.sapError);
    });

    this.dataTable.on("click", ".chk", (event) => {
      let data = this.dataTable.row($(event.currentTarget).closest("tr")).data();
      let index = this.idxList.findIndex(obj => obj.itNetworkServiceId == data.itNetworkServiceId);

      if (event.target.checked) {
        /* ________ check data in idxList _______ */
        if (index > -1) {
          this.idxList.splice(index, 1);
          $('#checkAll').prop("checked", false);
        } else {
          this.idxList.push(data.itNetworkServiceId);
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
        id: data.itNetworkServiceId,
        customerCode: data.customerCode,
        customerName: data.customerName,
        customerBranch: data.customerBranch,
        contractNo: data.contractNo,
        oldInvoiceNo: data.invoiceNo,
        oldReceiptNo: data.receiptNo,
        requestType: REQUEST_TYPE.OTHER.KEY,
        docType: DOC_TYPE_CONSTANT.IT.KEY,
        sapType: SAP_TYPE_CONSTANT.INVOICE.KEY,
        oldTotalAmount: Number(data.totalAmount) * 1.07,
        glAccount: "4105170002",
        oldTransactionNo: data.transactionNo,
      }
      this.cndn.setData(cndnData);
      this.router.navigate(["/cndn/cndn001detail"], {
        queryParams: {
          path: "/it/it011"
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
          this.idxList.push(dataInTable[i].itNetworkServiceId);
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

}
