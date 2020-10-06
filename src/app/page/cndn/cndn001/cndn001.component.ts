import { Component, OnInit, ViewChild } from '@angular/core';
import { Utils } from 'src/app/common/helper';
import { ButtonDatatable } from 'src/app/components/buttons/button-datatable';
import { MessageService } from 'src/app/_service/message.service';
import { NumberUtils } from 'src/app/common/helper/number';
import { CommonService } from 'src/app/_service/ common.service';
import { AjaxService } from 'src/app/_service/ajax.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { ResponseData } from 'src/app/common/models/response-data.model';
import { ModalErrorComponent } from 'src/app/components/modal/modal-error/modalError.component';
import { mapDocType, mapSapType, mapCnDnTh, DOC_TYPE_CONSTANT, SAP_TYPE_CONSTANT } from 'src/app/common/constant/CnDn.constants';

const URL = {
  GET_ALL: "cndn001/get_all",
}

declare var $: any;
@Component({
  selector: 'app-cndn001',
  templateUrl: './cndn001.component.html',
  styleUrls: ['./cndn001.component.css']
})
export class Cndn001Component implements OnInit {
  @ViewChild('errorModal') modalError: ModalErrorComponent;

  breadcrumb: any = [
    {
      label: "ลด/เพิ่มหนี้",
      link: "/home/cndn",
    },
    {
      label: "รายการลด/เพิ่มหนี้",
      link: "#",
    }
  ]

  formSearch: FormGroup;
  // data table 
  dataTable: any;
  dataList: any[] = [];
  docTypeList: any[] = [];
  sapTypeList: any[] = [];

  constructor(
    private ajax: AjaxService,
    private commonService: CommonService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.formSearch = this.fb.group({
      docType: [""],
      customerName: [""],
      sapType: [""],
      cnDn: [""],
    })
  }

  // ===================== Initial setting ============
  ngOnInit() {
    this.docTypeList = Object.values(DOC_TYPE_CONSTANT);
    this.sapTypeList = Object.values(SAP_TYPE_CONSTANT);
  }

  ngAfterViewInit(): void {
    this.getList();
    this.initDataTable();
    // call Function event Click button in dataTable
    this.clickBtn();
  }

  // =============== Action ======================

  // =================== call back-end ===================
  getList() {
    this.commonService.loading();
    this.ajax.doPost(URL.GET_ALL, this.formSearch.value).subscribe((res: ResponseData<any>) => {
      if (MessageService.MSG.SUCCESS == res.status) {
        this.dataList = res.data;
        this.initDataTable();
      } else {
        this.modalError.openModal(res.message);
      }
      this.commonService.unLoading();
    })
  }
  // ========================= data table ======================
  initDataTable = () => {
    if (this.dataTable != null) {
      this.dataTable.destroy();
    }

    let renderString = function (data, type, row, meta) {
      return Utils.isNull($.trim(data)) ? "-" : data;
    };

    console.log("this.commonService.configDataTable", this.commonService.configDataTable);
    this.dataTable = $('#datatable').DataTable({
      ...this.commonService.configDataTable(),
      ...{ scrollX: false },
      data: this.dataList,
      columns: [
        {
          data: 'docType', className: 'text-left',
          render: function (data, type, row, meta) {
            return Utils.isNull($.trim(mapDocType(data))) ? "-" : mapDocType(data);
          }
        }, {
          data: 'customerName', className: 'text-left',
          render: renderString
        }, {
          data: 'oldInvoiceNo', className: 'text-center',
          render: renderString
        }, {
          data: 'oldReceiptNo', className: 'text-center',
          render: renderString
        }, {
          data: 'sapType', className: 'text-left',
          render: function (data, type, row, meta) {
            return Utils.isNull($.trim(mapSapType(data))) ? "-" : mapSapType(data);
          }
        }, {
          data: 'cnDn', className: 'text-left',
          render: function (data, type, row, meta) {
            return Utils.isNull($.trim(mapCnDnTh(data))) ? "-" : mapCnDnTh(data);
          }
        }, {
          data: 'amount', className: 'text-left',
          render(data, type, row, meta) {
            return NumberUtils.numberToDecimalFormat(data);
          }
        }, {
          data: 'totalAmount', className: 'text-right',
          render(data, type, row, meta) {
            return NumberUtils.numberToDecimalFormat(data);
          }
        }, {
          data: 'createdBy', className: 'text-left',
          render: renderString
        }, {
          data: 'invoiceNo', className: 'text-center',
          render: renderString
        }, {
          data: 'receiptNo', className: 'text-center',
          render: renderString
        }, {
          className: 'text-center',
          data: 'sapStatus',
          render(data, type, full, meta) {
            return MessageService.SAP.getStatus(data, "sapErr");
          }
        }, {
          className: 'text-left',
          render(data, type, row, meta) {
            let _btn = '';
            if (Utils.isNull(row.showButton)) {
              _btn = `${ButtonDatatable.edit('edit', 'แก้ไข', true)}`;
            } else {
              _btn = `${ButtonDatatable.edit('edit', 'แก้ไข')}`;
            }
            return _btn;
          }
        }
      ],
    });
  }
  // event Click button in dataTable
  clickBtn() {
    this.dataTable.on('click', 'td > button#edit', (event) => {
      const data = this.dataTable.row($(event.currentTarget).closest('tr')).data();
      this.router.navigate(["/cndn/cndn001detail"], {
        queryParams: {
          cnDnId: data.cnDnId
        }
      });
    });

    this.dataTable.on('click', 'tbody tr button#sapErr', (event) => {
      const data = this.dataTable.row($(event.currentTarget).closest('tr')).data();
      this.modalError.openModal(MessageService.SAP.getMsgErr(data.sapError));
    });
  }

}
