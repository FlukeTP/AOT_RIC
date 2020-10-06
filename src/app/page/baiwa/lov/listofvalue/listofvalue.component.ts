import { Component, OnInit, ViewChild } from '@angular/core';
import { AjaxService } from 'src/app/_service/ajax.service';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { CommonService } from 'src/app/_service/ common.service';
import { ResponseData } from 'src/app/common/models/response-data.model';
import { MessageService } from 'src/app/_service/message.service';
import { Router } from '@angular/router';
import { ModalSuccessComponent } from 'src/app/components/modal/modal-success/modalSuccess.component';
import { ModalErrorComponent } from 'src/app/components/modal/modal-error/modalError.component';
declare var $: any;

const URL = {
  EDIT: "electric002/edit",
  LIST: "lov/list",
  RELOAD: "preferences/reload-cache"
}

@Component({
  selector: 'app-listofvalue',
  templateUrl: './listofvalue.component.html',
  styleUrls: ['./listofvalue.component.css']
})
export class ListofvalueComponent implements OnInit {
  @ViewChild('successModal') modalSuccess: ModalSuccessComponent;
  @ViewChild('errorModal') modalError: ModalErrorComponent;

  dataList: any[] = [];
  showMainContent: Boolean = true;
  formSearch: FormGroup;
  formEdit: FormGroup;
  datadetail: any;
  datadetailedit: any;
  dataListFilter: any[] = [];
  dataListFilterEdit: any[] = [];
  dataTable: any;
  constructor(
    private ajax: AjaxService,
    private commonService: CommonService,
    private formBuilder: FormBuilder,
    private router: Router,
  ) {
    this.formSearch = this.formBuilder.group({
      lovKey: ["", Validators.required]
    })
  }

  breadcrumb: any = [
    {
      label: "ตั้งค่าข้อมูล",
      link: "/home",
    },
    {
      label: "รายการข้อมูล LOV",
      link: "/components/lov",
    }
  ];

  ShowHideButton() {
    this.showMainContent = this.showMainContent ? false : true;
  }

  ngOnInit() {
    this.getList();
  }

  showModal(id: any) {
    this.dataListFilter = [];
    this.datadetail = [];
    this.dataListFilter = this.dataList.filter((data) => {
      return data.meterId == id;
    });
    this.datadetail = this.dataListFilter[0]
    console.log("datafilter", this.datadetail);
    $('#myModal').modal('show');
  }

  hideModal() {
    $('#myModal').modal('hide');
  }

  showModalEdit(id: any) {
    this.dataListFilterEdit = [];
    this.dataListFilterEdit = this.dataList.filter((data) => {
      return data.meterId == id;
    });
    this.datadetailedit = this.dataListFilterEdit[0]
    this.formEdit.patchValue({
      meterId: this.datadetailedit.meterId,
      meterType: this.datadetailedit.meterType,
      meterName: this.datadetailedit.meterName,
      meterLocation: this.datadetailedit.meterLocation,
      meterStatus: this.datadetailedit.meterStatus,
      remark: this.datadetailedit.remark,
      serialNo: this.datadetailedit.serialNo,
      multipleValue: this.datadetailedit.multipleValue,
      functionalLocation: this.datadetailedit.functionalLocation,
      serviceNumber: this.datadetailedit.serviceNumber,
      airport: this.datadetailedit.airport
    })
    $('#myModalEdit').modal('show');
  }

  hideModalEdit() {
    $('#myModalEdit').modal('hide');
  }

  reloadCache() {
    this.commonService.loading();
    this.ajax.doGet(URL.RELOAD).subscribe((res: ResponseData<any>) => {
      if (MessageService.MSG.SUCCESS == res.status) {
        this.modalSuccess.openModal();
      } else {
        this.modalError.openModal(res.message);
      }
      this.commonService.unLoading();
    })
  }

  getList() {
    this.commonService.loading();
    this.ajax.doPost(URL.LIST, this.formSearch.value).subscribe((res: ResponseData<any>) => {
      console.log("this.dataList : ", res.data);
      this.dataList = res.data;
      console.log("this.dataList : ", this.dataList);
      this.initDataTable();
      this.commonService.unLoading();
    });
  }

  initDataTable = () => {
    if (this.dataTable != null) {
      this.dataTable.destroy();
    }
    this.dataTable = $('#datatable').DataTable({
      lengthChange: false,
      searching: false,
      ordering: false,
      processing: true,
      serverSide: false,
      paging: true,
      data: this.dataList,
      columns: [
        {
          className: "text-center",
          render: function (data, type, row, meta) {
            return meta.row + meta.settings._iDisplayStart + 1;
          }
        }, {
          data: 'lovKey', className: 'text-center'
        }, {
          data: 'descripton'
        }, {
          className: 'text-center',
          render(data, type, row, meta) {
            return `<button class="btn btn-info btn-sm" type="button">จัดการข้อมูล</button>`;
          }
        },
      ],
    });

    this.dataTable.on('click', 'td > button.btn-info', (event) => {
      const data = this.dataTable.row($(event.currentTarget).closest('tr')).data();
      console.log(data);
      this.router.navigate(['components/lov/management'], {
        queryParams: {
          id: data.lovHeaderId
        }
      });
    });
  }



}
