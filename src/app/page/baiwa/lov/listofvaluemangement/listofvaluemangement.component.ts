import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators, FormArray } from '@angular/forms';
import { CommonService } from 'src/app/_service/ common.service';
import { AjaxService } from 'src/app/_service/ajax.service';
import { ResponseData } from 'src/app/common/models/response-data.model';
import { MessageService } from 'src/app/_service/message.service';
import { Router, ActivatedRoute } from '@angular/router';
import { ModalConfirmComponent } from 'src/app/components/modal/modal-confirm/modalConfirm.component';
import { Utils } from 'src/app/common/helper/utils';

const URL = {
  SAVE: "lov/save-data-detail",
  EDIT: "lov/listdata",
  EDIT_DATA: "lov/edit",
  LIST_DATA_EDIT: "lov/list-data-detail"
}

@Component({
  selector: 'app-listofvaluemangement',
  templateUrl: './listofvaluemangement.component.html',
  styleUrls: ['./listofvaluemangement.component.css']
})
export class ListofvaluemangementComponent implements OnInit {

  breadcrumb: any = [
    {
      label: "ตั้งค่าข้อมูล",
      link: "/home",
    },
    {
      label: "รายการข้อมูล",
      link: "/components/lov",
    },
    {
      label: "Management",
      link: "#",
    },
  ];
  buttomedit: boolean = true;
  dataLovSearch: any;
  formAddLov: FormGroup;
  formSave: FormGroup;
  id: string = '';
  formSaveToapi: any;
  @ViewChild('saveModal') modalSave: ModalConfirmComponent;

  fwLovDetailReqs: FormArray = new FormArray([]);
  formEditToapi: any;
  lovKeyToedit: any;

  constructor(
    private formBuilder: FormBuilder,
    private commonService: CommonService,
    private ajax: AjaxService,
    private router: Router,
    private route: ActivatedRoute,
  ) {
    this.formAddLov = this.formBuilder.group({
      lovHeaderId: ["", Validators.required],
      lovKey: ["", Validators.required],
      descripton: ["", Validators.required]
    })
    this.formSave = this.formBuilder.group({
      published: true,
      fwLovDetailReqs: this.formBuilder.array([]),
    })
  }
  ngOnInit() {
    this.id = this.route.snapshot.queryParams['id'] || "";
    console.log("this.id : ", this.id);
    if (Utils.isNotNull(this.id)) {
      this.editFormAddLovSearch(this.id);
      this.buttomedit = false;
    }
    this.addCreds();
    this.formEditAll();
  }

  addCreds() {
    this.fwLovDetailReqs = this.formSave.controls.fwLovDetailReqs as FormArray;
    this.fwLovDetailReqs.push(this.formBuilder.group({
      lovKey: '',
      lovCode: '',
      descTh1: '',
      descTh2: '',
      descEn1: '',
      descEn2: '',
      orderNo: ''
    }));
    console.log("this.depaccList : ",  this.formSave.get('fwLovDetailReqs').get([0]).get('lovCode').value);
    if(this.fwLovDetailReqs.value.lovKey != ""){
      for (let i = 0; i < this.fwLovDetailReqs.controls.length; i++) {
        this.fwLovDetailReqs.at(i).get('lovKey').patchValue(this.formAddLov.value.lovKey);
      }
    }
  }

  formSaveData(id: string) {
    this.formSaveToapi = {
      fwLovDetailReqs: [],
      lovKey: id
    }
  }

  saveToData() {
    this.formSaveToapi.fwLovDetailReqs = this.formSave.get('fwLovDetailReqs').value;
    console.log("testttt33 : ", this.formSaveToapi);
    this.saveFormAddLov();
  }

  saveFormAddLov() {
    console.log("lovManagementList : ", this.formSaveToapi);
    this.commonService.loading();
    this.ajax.doPost(URL.SAVE, this.formSaveToapi).subscribe((res: ResponseData<any>) => {
      console.log(res.data);
      if (MessageService.MSG.SUCCESS == res.status) {
        this.router.navigate(['components/lov']);
      } else {
        console.log(res.message);
      }
      this.commonService.unLoading();
    });
  }

  delete(idx) {
    console.log("testetstestes", idx);
    let index = idx;
    this.fwLovDetailReqs.removeAt(index);
  }


  editFormAddLovSearch(id: any) {
    let lovHeaderId = id
    console.log("editFormAddLov : ", lovHeaderId);
    this.commonService.loading();
    this.ajax.doPost(URL.EDIT, { lovHeaderId }).subscribe((res: ResponseData<any>) => {
      console.log(res.data);
      if (MessageService.MSG.SUCCESS == res.status) {
        console.log(res.message);
        this.dataLovSearch = res.data;
        this.formSaveData(this.dataLovSearch.lovKey);
        this.setDataTo();
      } else {
        console.log(res.message);
      }
      this.commonService.unLoading();
    });
  }

  setDataTo() {
    this.formAddLov.patchValue({
      lovHeaderId: this.dataLovSearch.lovHeaderId,
      lovKey: this.dataLovSearch.lovKey,
      descripton: this.dataLovSearch.descripton
    })
    this.listDataEdit();
  }

  listDataEdit() {
    console.log("editFormAddElectricity : ", this.formAddLov.value);
    this.commonService.loading();
    this.ajax.doPost(URL.LIST_DATA_EDIT, this.formAddLov.value).subscribe((res: ResponseData<any>) => {
      console.log(res.data);
      this.fwLovDetailReqs = this.formSave.get('fwLovDetailReqs') as FormArray;
      if (res.data.length > 0) {
        //set show button save
        this.fwLovDetailReqs.controls.splice(0, this.fwLovDetailReqs.controls.length);
        this.fwLovDetailReqs.patchValue([]);
        res.data.forEach((e, index) => {
          this.fwLovDetailReqs.push(this.listDataTab1());
          this.fwLovDetailReqs.at(index).get('lovDetailId').patchValue(e.lovDetailId);  
          this.fwLovDetailReqs.at(index).get('lovKey').patchValue(e.lovKey);
          this.fwLovDetailReqs.at(index).get('lovCode').patchValue(e.lovCode);
          this.fwLovDetailReqs.at(index).get('descTh1').patchValue(e.descTh1.trim());
          this.fwLovDetailReqs.at(index).get('descTh2').patchValue(e.descTh2.trim());
          this.fwLovDetailReqs.at(index).get('descEn1').patchValue(e.descEn1.trim());
          this.fwLovDetailReqs.at(index).get('descEn2').patchValue(e.descEn2.trim());
          this.fwLovDetailReqs.at(index).get('orderNo').patchValue(e.orderNo);
        });
      } else {
        this.fwLovDetailReqs.controls.splice(0, this.fwLovDetailReqs.controls.length);
        this.fwLovDetailReqs.patchValue([]);
      }
      // check length add form
      if (res.data.length == 0) {
        this.buttomedit = true;
        this.addCreds();
      }
      this.commonService.unLoading();
    });
  }

  listDataTab1(): FormGroup {
    return this.formBuilder.group({
      lovDetailId: [''],
      lovKey: [''],
      lovCode: [''],
      descTh1: [''],
      descTh2: [''],
      descEn1: [''],
      descEn2: [''],
      orderNo: ['']
    });
  }

  formEditAll() {
    this.formEditToapi = {
      fwLovHReq: {
        lovHeaderId: '',
        lovKey: '',
        descripton: '',
      },
      fwLovDetailReqs: []
    }
  }

  editFormAddLov() {
    this.formEditToapi.fwLovHReq.lovHeaderId = this.formAddLov.value.lovHeaderId;
    this.formEditToapi.fwLovHReq.lovKey = this.formAddLov.value.lovKey;
    this.formEditToapi.fwLovHReq.descripton = this.formAddLov.value.descripton;
    this.formEditToapi.fwLovDetailReqs = this.fwLovDetailReqs.value;
    console.log("edit : ", this.formEditToapi);
    this.commonService.loading();
    this.ajax.doPost(URL.EDIT_DATA, this.formEditToapi).subscribe((res: ResponseData<any>) => {
      console.log(res.data);
      if (MessageService.MSG.SUCCESS == res.status) {
        console.log(res.message);
        this.router.navigate(['components/lov']);
      } else {
        console.log(res.message);
      }
      this.commonService.unLoading();
    });
  }

}
