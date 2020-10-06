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
  LIST: "constant/list",
  RELOAD: "paramconfig/reload"
}

@Component({
  selector: 'app-system-constant',
  templateUrl: './system-constant.component.html',
  styleUrls: ['./system-constant.component.css']
})
export class SystemConstantComponent implements OnInit {
  @ViewChild('successModal') modalSuccess: ModalSuccessComponent;
  @ViewChild('errorModal') modalError: ModalErrorComponent;

  formSearch: FormGroup;
  dataList: any[] = [];
  dataTable: any;

  constructor(
    private ajax: AjaxService,
    private commonService: CommonService,
    private formBuilder: FormBuilder,
    private router: Router
  ) {
    this.formSearch = this.formBuilder.group({
      constantKey: ["", Validators.required]
    })
  }

  breadcrumb: any = [
    {
      label: "ตั้งค่าข้อมูล",
      link: "/home",
    },
    {
      label: "รายการconstant",
      link: "#",
    }
  ];

  ngOnInit() {
    this.getList();
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

  initDataTable = () => {
    if (this.dataTable != null) {
      this.dataTable.destroy();
    }
    this.dataTable = $('#datatable').DataTable({
      ...this.commonService.configDataTable(),
      data: this.dataList,
      columns: [
        {
          className: "text-center",
          render: function (data, type, row, meta) {
            return meta.row + meta.settings._iDisplayStart + 1;
          }
        }, {
          data: 'constantKey', className: 'text-center'
        }, {
          data: 'constantValue'
        }, {
          render: (data, type, full, meta) => {
            let _btn = '';
            _btn += `<button type="button" class="btn btn-warning btn-social-icon" id="edit"><i class="fa fa-pencil-square-o" aria-hidden="true"></i></button>`;
            return _btn;
          },
          className: "text-center"
        }
      ],
    });

    this.dataTable.on('click', 'tbody tr button#edit', (e) => {
      var closestRow = $(e.target).closest('tr');
      var data = this.dataTable.row(closestRow).data();
      this.router.navigate(['components/constant/detail'], {
        queryParams: {
          id: data.constantId
        }
      });
    });
  }
}
