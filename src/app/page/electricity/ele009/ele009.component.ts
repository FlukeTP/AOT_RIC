import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormArray } from '@angular/forms';
import { AjaxService } from 'src/app/_service/ajax.service';
import { CommonService } from 'src/app/_service/ common.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'src/app/_service/message.service';
import { ResponseData } from 'src/app/common/models/response-data.model';
import { ModalCustomComponent } from 'src/app/components/modal/modal-custom/modalCustom.component';
import { ModalErrorComponent } from 'src/app/components/modal/modal-error/modalError.component';
import { ButtonDatatable } from 'src/app/components/buttons/button-datatable';
import { IsEmptyPipe } from 'src/app/common/pipes/empty.pipe';

declare var $: any;

const URL = {
  GET: 'electric009/get',
  GET_HISTORY: 'electric009/get-history',
  EXPORT: "download-template-info"
};

@Component({
  selector: 'app-ele009',
  templateUrl: './ele009.component.html',
  styleUrls: ['./ele009.component.css']
})
export class Ele009Component implements OnInit {
  @ViewChild('modalRemark') modalRemark: ModalCustomComponent;
  @ViewChild('modalHistory') modalHistory: ModalCustomComponent;
  @ViewChild('errorModal') modalError: ModalErrorComponent;

  public formData: FormGroup;
  public dataList: FormArray = new FormArray([]);
  public remarkStr: string = '';
  dataTable: any;
  dataTableHistory: any;

  constructor(
    private formBuilder: FormBuilder,
    private ajax: AjaxService,
    private commonService: CommonService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.formData009();
    this.dataFormList();
  }

  breadcrumb: any = [
    {
      label: 'หมวดไฟฟ้า',
      link: '/home/elec',
    },
    {
      label: 'ปรับปรุงอัตราค่าภาระ ค่าบริการ FT',
      link: '#',
    }
  ];
  ngOnInit() {
    this.getData();
  }

  ngAfterViewInit(): void {
    this.initDataTable([]);
  }


  formData009() {
    this.formData = this.formBuilder.group({
      dataList: this.formBuilder.array([])
    });
    this.dataList = this.formData.get('dataList') as FormArray;
  }

  dataFormList(): FormGroup {
    return this.formBuilder.group({
      calConfigId: [''],
      validDate: [''],
      notificationDate: [''],
      value: [''],
      codeType: [''],
      remark: [''],
      updatedBy: [''],
      updatedDate: ['']
    });
  }

  onEdit(id) {
    this.router.navigate(['/electricity/ele009detail'], {
      queryParams: {
        id: id
      }
    });
  }

  getData() {
    this.commonService.loading();
    this.ajax.doPost(URL.GET, {}).subscribe((res: ResponseData<any>) => {
      console.log(res);
      if (MessageService.MSG.SUCCESS === res.status) {
        this.dataList = this.formData.get('dataList') as FormArray;
        if (res.data.length > 0) {
          this.initDataTable(res.data);
          // this.dataList.controls.splice(0, this.dataList.controls.length);
          // this.dataList.patchValue([]);
          // res.data.forEach((e, index) => {
          //   this.dataList.push(this.dataFormList());
          //   this.dataList.at(index).get('calConfigId').patchValue(e.calConfigId);
          //   this.dataList.at(index).get('validDate').patchValue(e.validDate);
          //   this.dataList.at(index).get('value').patchValue(e.value);
          //   this.dataList.at(index).get('codeType').patchValue(e.codeType);
          //   this.dataList.at(index).get('remark').patchValue(e.remark);
          //   this.dataList.at(index).get('updatedBy').patchValue(e.updatedBy);
          //   this.dataList.at(index).get('updatedDate').patchValue(e.updatedDate);
          // });
        } else {
          // this.dataList.controls.splice(0, this.dataList.controls.length);
          // this.dataList.patchValue([]);
        }

        console.log(res.message);
      } else {
        console.log(res.message);
      }
      this.commonService.unLoading();
    });
  }

  getExcel() {
    this.commonService.loading();
    this.ajax.download(`${URL.EXPORT}/ELECTRIC009/-}`);
    this.commonService.unLoading();
  }

  // ================ Action =================

  onClickRemark(tetx: string) {
    this.remarkStr = tetx;
    this.modalRemark.openModal();
  }

  onOpenModalHistory(codeType: string) {
    this.getHistory(codeType);
    this.modalHistory.openModal();
  }

  // ======================= call back-end ===================
  getHistory(codeType: string) {
    let data = {
      codeType: codeType
    }
    this.ajax.doPost(URL.GET_HISTORY, data).subscribe((res: ResponseData<any>) => {
      if (MessageService.MSG.SUCCESS == res.status) {
        this.initDataTableHistory(res.data);
      } else {
        this.modalError.openModal(res.message);
      }
    })
  }

  // ================= data table ==============
  initDataTable = (data: any[]) => {
    if (this.dataTable != null) {
      this.dataTable.destroy();
    }
    this.dataTable = $('#datatable').DataTable({
      ...this.commonService.configDataTable(),
      data: data,
      columns: [
        {
          data: 'validDate', className: 'text-center'
        },
        {
          data: 'notificationDate', className: 'text-center'
        },
        {
          data: 'value', className: 'text-right'
        },
        {
          data: 'updatedDate',
          render(data) {
            return new IsEmptyPipe().transform(data);
          }, className: 'text-center'
        },
        {
          data: 'updatedBy',
          render(data) {
            return new IsEmptyPipe().transform(data);
          }, className: 'text-center'
        },
        {
          render: (data, type, full, meta) => {
            return `${ButtonDatatable.detail('remark', 'หมายเหตุ')} ${ButtonDatatable.edit('edit')}`;;
          },className: 'text-center'
        }
        // {
        //   render: (data, type, full, meta) => {
        //     let _btn = '';
        //     _btn += `<button type="button" class="btn btn-info btn-social-icon" id="remark"><i class="fa fa-search" aria-hidden="true"></i></button>`;
        //     return _btn;
        //   },
        //   className: "text-center"
        // }, 
        // {
        //   render: (data, type, full, meta) => {
        //     let _btn = '';
        //     _btn += `<button type="button" class="btn btn-warning btn-social-icon" id="edit"><i class="fa fa-pencil-square-o" aria-hidden="true"></i></button>`;
        //     return _btn;
        //   },
        //   className: "text-center"
        // }, 
        // {
        //   render: (data, type, full, meta) => {
        //     let _btn = '';
        //     _btn += `<button type="button" class="btn btn-success btn-social-icon" id="history"><i class="fa fa-history" aria-hidden="true"></i></button>`;
        //     return _btn;
        //   },
        //   className: "text-center"
        // }
      ],
    });
    // remark button
    this.dataTable.on('click', 'tbody tr button#remark', (e) => {
      var closestRow = $(e.target).closest('tr');
      var data = this.dataTable.row(closestRow).data();
      this.onClickRemark(data.remark);
    });
    // edit button
    this.dataTable.on('click', 'tbody tr button#edit', (e) => {
      var closestRow = $(e.target).closest('tr');
      var data = this.dataTable.row(closestRow).data();
      this.onEdit(data.calConfigId);
    });
    // history button
    this.dataTable.on('click', 'tbody tr button#history', (e) => {
      var closestRow = $(e.target).closest('tr');
      var data = this.dataTable.row(closestRow).data();
      this.onOpenModalHistory(data.codeType);
    });
  }

  initDataTableHistory = (data: any[]) => {
    if (this.dataTableHistory != null) {
      this.dataTableHistory.destroy();
    }
    this.dataTableHistory = $('#datatableHistory').DataTable({
      ...this.commonService.configDataTable(),
      data: data,
      columns: [
        {
          data: 'historyCodeType', className: 'text-left'
        }, {
          data: 'historyBy', className: 'text-left'
        }, {
          data: 'historyDate', className: 'text-left'
        }
      ],
    });
  }

}
