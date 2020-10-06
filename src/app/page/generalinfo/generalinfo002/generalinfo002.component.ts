import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { AjaxService } from 'src/app/_service/ajax.service';
import { MessageService } from 'src/app/_service/message.service';
import { ResponseData } from 'src/app/common/models/response-data.model';
import { CommonService } from 'src/app/_service/ common.service';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { ButtonDatatable } from 'src/app/components/buttons/button-datatable';
import { ModalCustomComponent } from 'src/app/components/modal/modal-custom/modalCustom.component';

const URL = {
  GET_SAP_CUT: 'common/getSAPCustumer/',
  GET_SAP_CON_NO: 'common/getSAPContractNo/',
};
@Component({
  selector: 'app-generalinfo002',
  templateUrl: './generalinfo002.component.html',
  styleUrls: ['./generalinfo002.component.css']
})
export class Generalinfo002Component implements OnInit {
  @ViewChild('modalRemark') modalRemark: ModalCustomComponent;
  @ViewChild('modalDetail') modalDetail: ModalCustomComponent;

  dataTable: any;
  dataTableContract: any;
  cusList: any[] = [];
  contractNoList: any[] = [];
  modalRef: BsModalRef;
  formSearch: FormGroup = new FormGroup({});
  formDetail: FormGroup = new FormGroup({});
  breadcrumb: any = [
    {
      label: "ข้อมูลทั่วไป",
      link: "/home/geninfo",
    },
    {
      label: "ผลลัพธ์ของการค้นหาผู้ประกอบการ",
      link: "#",
    }
  ];
  constructor(
    private fb: FormBuilder,
    private ajax: AjaxService,
    private modalService: BsModalService,
    private commonService: CommonService,
  ) {

    this.formDetail = this.fb.group({
      customerId: [''],
      customerCode: [''],
      customerName: [''],
      adrKind: [''],
      contactName: [''],
      phoneNo: [''],
      address: [''],
      status: [''],
      customerType: [''],
      partner: [''],
      businessPartner: [''],
      name1: [''],
      name2: [''],
      name3: [''],
      name4: [''],
      branchCode: [''],
      street: [''],
      street2: [''],
      street3: [''],
      street4: [''],
      street5: [''],
      district: [''],
      city: [''],
      postCode: [''],
      taxNumber: [''],
      country: ['']
    });

    this.formSearch = this.fb.group({
      type: [''],
      criteria: ['']
    });
  }
  ngOnInit() {
    this.datatable();
    this.clickBtn();
  }

  search() {
    this.cusList = [];
    this.formSearch.patchValue({ type: 'null' })
    this.ajax.doPost(URL.GET_SAP_CUT, this.formSearch.value).subscribe((response: ResponseData<any>) => {
      if (MessageService.MSG.SUCCESS === response.status) {
        this.cusList = response.data;
        this.datatable();
      }
    });
  }

  getSapContractNo(partner: string, adrKind: string) {
    this.ajax.doGet(`${URL.GET_SAP_CON_NO}${partner + "/" + adrKind}`).subscribe(async (res: ResponseData<any>) => {
      if (MessageService.MSG.SUCCESS === res.status) {
        for (let i = 0; i < res.data.length; i++) {
          this.contractNoList.push({
            contractNo: res.data[i].contractNo,
            roName: '',
          })
          this.getRentalAreaList(res.data[i].contractNo);
        };
        console.log('this.contractNoList :', this.contractNoList);
        this.datatableContract();
      }
    });
  }

  getRentalAreaList(contractNo: string) {
    if (contractNo) {
      this.ajax.doGet(`common/getUtilityArea/${contractNo}`).subscribe((response: ResponseData<any>) => {
        this.contractNoList.push({
          contractNo: contractNo,
          roName: response.data[0].roName,
        })
      });
    }
  }

  datatableContract() {
    if (this.dataTableContract != null) {
      this.dataTableContract.destroy();
    }
    this.dataTableContract = $('#datatableContract').DataTable({
      ...this.commonService.configDataTable(),
      ...{ scrollX: false },
      data: this.contractNoList,
      columns: [
        {
          data: 'contractNo', className: 'text-center'
        },
        // {
        //   className: 'text-center',
        //   render(data, type, row, meta) {
        //     return `-`;
        //   }
        // }
        {
          data: 'roName', className: 'text-center'
        }
      ]
    });
  }

  datatable() {
    if (this.dataTable != null) {
      this.dataTable.destroy();
    }
    this.dataTable = $('#datatable').DataTable({
      ...this.commonService.configDataTable(),
      ...{ scrollX: false },
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
        }
        ,
        {
          data: 'address', className: 'text-left'
        },
        {
          className: 'text-center',
          render(data, type, row, meta) {
            return `${ButtonDatatable.detail('detail')}`;
          }
        },
      ],
    });
  }

  clickBtn() {
    this.dataTable.on("click", "td > button", e => {
      let dataRow = this.dataTable.row($(e.currentTarget).closest("tr")).data();
      const { id } = e.currentTarget;
      if (dataRow) {
        switch (id) {
          case 'detail':
            this.pacthValueData(dataRow)
            this.openModalCustom();
            this.getSapContractNo(dataRow.partner, dataRow.adrKind);
            break;
        }
      }
    });
  }

  openModalCustom() {
    this.modalRef = this.modalService.show(this.modalDetail, { class: 'modal-xl' });
  }

  onCloseModal() {
    this.modalRef.hide();
  }

  pacthValueData(data) {
    this.formDetail.get('customerId').patchValue(data.customerId);
    this.formDetail.get('customerCode').patchValue(data.customerCode);
    this.formDetail.get('customerName').patchValue(data.customerName);
    this.formDetail.get('adrKind').patchValue(data.adrKind);
    this.formDetail.get('contactName').patchValue(data.contactName);
    this.formDetail.get('phoneNo').patchValue(data.phoneNo);
    this.formDetail.get('address').patchValue(data.address);
    this.formDetail.get('status').patchValue(data.status);
    this.formDetail.get('customerType').patchValue(data.customerType);
    this.formDetail.get('partner').patchValue(data.partner);
    this.formDetail.get('businessPartner').patchValue(data.businessPartner);
    this.formDetail.get('name1').patchValue(data.name1);
    this.formDetail.get('name2').patchValue(data.name2);
    this.formDetail.get('name3').patchValue(data.name3);
    this.formDetail.get('name4').patchValue(data.name4);
    this.formDetail.get('branchCode').patchValue(data.branchCode);
    this.formDetail.get('street').patchValue(data.street);
    this.formDetail.get('street2').patchValue(data.street2);
    this.formDetail.get('street3').patchValue(data.street3);
    this.formDetail.get('street4').patchValue(data.street4);
    this.formDetail.get('street5').patchValue(data.street5);
    this.formDetail.get('district').patchValue(data.district);
    this.formDetail.get('city').patchValue(data.city);
    this.formDetail.get('postCode').patchValue(data.postCode);
    this.formDetail.get('taxNumber').patchValue(data.taxNumber);
    this.formDetail.get('country').patchValue(data.countr);
  }

}
