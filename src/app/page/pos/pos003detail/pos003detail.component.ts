import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ModalConfirmComponent } from 'src/app/components/modal/modal-confirm/modalConfirm.component';
import { ModalSuccessComponent } from 'src/app/components/modal/modal-success/modalSuccess.component';
import { ModalErrorComponent } from 'src/app/components/modal/modal-error/modalError.component';
import { InputCalendarComponent } from 'src/app/components/input/input-calendar/input-calendar.component';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { AjaxService } from 'src/app/_service/ajax.service';
import { CommonService } from 'src/app/_service/ common.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ValidateService } from 'src/app/_service/validate.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { MessageService } from 'src/app/_service/message.service';
import { ResponseData } from 'src/app/common/models/response-data.model';
import { Utils } from 'src/app/common/helper';

declare var $: any;

const URLS = {
  SAVE: 'pos003/save',
  GET_VALUE_EDIT: 'pos003/get-value-edit/'
}
@Component({
  selector: 'app-pos003detail',
  templateUrl: './pos003detail.component.html',
  styleUrls: ['./pos003detail.component.css']
})
export class Pos003detailComponent implements OnInit {
  private modalRef: BsModalRef;
  @ViewChild('addProductModal') modalAddProduct: ElementRef;
  @ViewChild('addPaymentModal') modalAddPayment: ElementRef;
  @ViewChild('saveModal') modalSave: ModalConfirmComponent;
  @ViewChild('removeProduct') removeProductModal: ModalConfirmComponent;
  @ViewChild('removePayment') removePaymentModal: ModalConfirmComponent;
  @ViewChild('successModal') modalSuccess: ModalSuccessComponent;
  @ViewChild('errorModal') modalError: ModalErrorComponent;
  @ViewChild('startCalendar') startCalendar: InputCalendarComponent;
  @ViewChild('endCalendar') endCalendar: InputCalendarComponent;

  breadcrumb: any = [
    {
      label: "หมวดข้อมูลยอดรายได้",
      link: "/pos",
    },
    {
      label: "เพิ่มข้อมูลยอดรายได้ของผู้ประกอบการ",
      link: "#",
    }
  ];

  formGroupHeader: FormGroup;
  formGroupProduct: FormGroup;
  formArrayProduct: FormArray;
  formGroupPayment: FormGroup;
  formArrayPayment: FormArray;
  indexTemp: number;
  caseName: string = '';
  file: FormData;

  constructor(
    private fb: FormBuilder,
    private ajax: AjaxService,
    private commonService: CommonService,
    private route: ActivatedRoute,
    private router: Router,
    private modalService: BsModalService,
    private validate: ValidateService
  ) {
    this.setFormGroupHeader();
    this.setFormArrayProduct();
    this.setFormArrayPayment();
    const revCusId = this.route.snapshot.queryParams['revCusId'] || '';
    if (revCusId) {
      this.setValueEdit(revCusId);
    }
  }
  // =============== Initial setting ======================
  ngOnInit() {
  }

  setFormGroupHeader() {
    this.formGroupHeader = this.fb.group({
      revCusId: [""],
      contractNo: [""],
      customerCode: [""],
      customerName: [""],
      startSaleDate: ["", Validators.required],
      endSaleDate: ["", Validators.required],
      fileName: ["", Validators.required]
    });
  }

  setFormGroupProduct() {
    this.formGroupProduct = this.fb.group({
      cusProId: [""],
      productType: ["", Validators.required],
      includingVatSale: ["", Validators.required],
      excludingVatSale: ["", Validators.required],
      receiptNum: ["", Validators.required]
    });
  }

  setFormGroupPayment() {
    this.formGroupPayment = this.fb.group({
      cusPayId: [""],
      paymentType: ["", Validators.required],
      currency: ["", Validators.required],
      exchangeRate: ["", Validators.required],
      amount: ["", Validators.required],
      amountBaht: ["", Validators.required]
    });
  }

  setFormArrayProduct() {
    this.formArrayProduct = this.fb.array([]);
  }

  setFormArrayPayment() {
    this.formArrayPayment = this.fb.array([]);
  }

  // ================== Action ===================
  openModalCustom(typeName: string, caseName: string) {
    this.caseName = caseName;
    if (this.caseName == 'ADD') {
      if (typeName == 'PRODUCT') {
        this.setFormGroupProduct();
        this.modalRef = this.modalService.show(this.modalAddProduct, { class: 'modal-lg' });
      } else {
        this.setFormGroupPayment();
        this.modalRef = this.modalService.show(this.modalAddPayment, { class: 'modal-lg' });
      }
    } else {
      if (typeName == 'PRODUCT') {
        this.modalRef = this.modalService.show(this.modalAddProduct, { class: 'modal-lg' });
      } else {
        this.modalRef = this.modalService.show(this.modalAddPayment, { class: 'modal-lg' });
      }
    }
  }

  onCloseModal() {
    this.modalRef.hide();
  }

  dateChange(event, formControlName: string) {
    this.formGroupHeader.get(formControlName).patchValue(event);
  }

  onBack() {
    this.router.navigate(['/pos/pos003']);
  }

  onOpenModalSave() {
    let validateData = [
      { format: "", header: "วันที่ขายเริ่มต้น", value: this.formGroupHeader.get("startSaleDate").value },
      { format: "", header: "วันที่ขายสิ้นสุด", value: this.formGroupHeader.get("endSaleDate").value },
      { format: "", header: "ไฟล์แนบ", value: this.formGroupHeader.get("fileName").value }
    ];
    if (this.validate.checking(validateData)) {
      if (this.formGroupHeader.invalid) {
        this.modalError.openModal(MessageService.MSG.REQUIRE_FIELD);
      } else {
        this.modalSave.openModal();
      }
    }
  }

  checkCaseEditProduct() {
    if (this.caseName == 'EDIT') {
      this.formArrayProduct.at(this.indexTemp).patchValue({
        productType: this.formGroupProduct.get("productType").value,
        includingVatSale: this.formGroupProduct.get("includingVatSale").value,
        excludingVatSale: this.formGroupProduct.get("excludingVatSale").value,
        receiptNum: this.formGroupProduct.get("receiptNum").value
      })
      this.onCloseModal();
    } else {
      this.addProduct();
    }
  }

  addProduct() {
    let validateData = [
      { format: "", header: "ประเภทสินค้า/บริการ", value: this.formGroupProduct.get("productType").value },
      { format: "decimal", header: "ยอดขายรวมภาษี", value: this.formGroupProduct.get("includingVatSale").value },
      { format: "decimal", header: "ยอดขายไม่รวมภาษี", value: this.formGroupProduct.get("excludingVatSale").value },
      { format: "number", header: "จำนวนใบเสร็จ", value: this.formGroupProduct.get("receiptNum").value }
    ];
    if (this.validate.checking(validateData)) {
      if (this.formGroupProduct.invalid) {
        this.modalError.openModal(MessageService.MSG.REQUIRE_FIELD);
      } else {
        this.formArrayProduct.push(this.formGroupProduct);
        this.onCloseModal();
      }
    }
  }

  checkCaseEditPayment() {
    if (this.caseName == 'EDIT') {
      this.formArrayPayment.at(this.indexTemp).patchValue({
        paymentType: this.formGroupPayment.get("paymentType").value,
        currency: this.formGroupPayment.get("currency").value,
        exchangeRate: this.formGroupPayment.get("exchangeRate").value,
        amount: this.formGroupPayment.get("amount").value,
        amountBaht: this.formGroupPayment.get("amountBaht").value
      })
      this.onCloseModal();
    } else {
      this.addPayment();
    }
  }

  addPayment() {
    let validateData = [
      { format: "", header: "ประเภทการชำระเงิน", value: this.formGroupPayment.get("paymentType").value },
      { format: "", header: "สกุลเงิน", value: this.formGroupPayment.get("currency").value },
      { format: "decimal", header: "อัตราแลกเปลี่ยน", value: this.formGroupPayment.get("exchangeRate").value },
      { format: "decimal", header: "จำนวนเงิน", value: this.formGroupPayment.get("amount").value },
      { format: "decimal", header: "จำนวนเงิน(บาท)", value: this.formGroupPayment.get("amountBaht").value }
    ];
    if (this.validate.checking(validateData)) {
      if (this.formGroupPayment.invalid) {
        this.modalError.openModal(MessageService.MSG.REQUIRE_FIELD);
      } else {
        this.formArrayPayment.push(this.formGroupPayment);
        this.onCloseModal();
      }
    }
  }

  removeProductConfirm(index: number) {
    this.indexTemp = index;
    this.removeProductModal.openModal();
  }

  removePaymentConfirm(index: number) {
    this.indexTemp = index;
    this.removePaymentModal.openModal();
  }

  onRemoveProduct() {
    this.formArrayProduct.removeAt(this.indexTemp);
  }

  onRemovePayment() {
    this.formArrayPayment.removeAt(this.indexTemp);
  }

  editProduct(index: number, typeName: string, caseName: string) {
    this.caseName = caseName;
    this.indexTemp = index;
    let product = this.formArrayProduct.at(index).value;
    this.setFormGroupProduct();
    this.formGroupProduct.patchValue({
      cusProId: product.cusProId,
      productType: product.productType,
      includingVatSale: product.includingVatSale,
      excludingVatSale: product.excludingVatSale,
      receiptNum: product.receiptNum
    })
    this.openModalCustom(typeName, this.caseName);
  }

  editPayment(index: number, typeName: string, caseName: string) {
    this.caseName = caseName;
    this.indexTemp = index;
    let payment = this.formArrayPayment.at(index).value;
    this.setFormGroupPayment();
    this.formGroupPayment.patchValue({
      cusPayId: payment.cusPayId,
      paymentType: payment.paymentType,
      currency: payment.currency,
      exchangeRate: payment.exchangeRate,
      amount: payment.amount,
      amountBaht: payment.amountBaht
    })
    this.openModalCustom(typeName, this.caseName);
  }

  onCheckBeforeSave() {
    const validateData = [
      { format: '', header: 'ไฟล์แนบ', value: this.formGroupHeader.get('fileName').value },
      { format: '', header: 'วันที่ขายเริ่มต้น', value: this.formGroupHeader.get('startSaleDate').value },
      { format: '', header: 'วันที่ขายสิ้นสุด', value: this.formGroupHeader.get('endSaleDate').value }
    ];
    if (this.validate.checking(validateData)) {
      if (this.formGroupHeader.invalid) {
        this.modalError.openModal(MessageService.MSG.REQUIRE_FIELD);
      } else {
        this.modalSave.openModal();
      }
    }
  }

  // ================= call back-end =======================
  onSave() {
    // ===== mock data
    this.formGroupHeader.patchValue({
      contractNo: '06CMFN0162001',
      customerCode: '11000900',
      customerName: 'บริษัท บางจาก จำกัด (มหาชน)',
    })
    // ======
    let data = {
      header: this.formGroupHeader.value,
      product: this.formArrayProduct.value,
      payment: this.formArrayPayment.value
    }
    if (Utils.isNotNull(this.file)) {
      this.file.delete('json');
    } else {
      this.file = new FormData();
    }
    this.file.append('json', JSON.stringify(data));

    this.commonService.loading();
    this.ajax.doPost(URLS.SAVE, this.file).subscribe((res: ResponseData<any>) => {
      if (MessageService.MSG.SUCCESS == res.status) {
        this.modalSuccess.openModal();
        this.router.navigate(['/pos/pos003']);
      } else {
        this.modalError.openModal(res.message);
      }
      this.commonService.unLoading();
    });
  }
  // Edit
  setValueEdit(id) {
    this.ajax.doGet(URLS.GET_VALUE_EDIT + id).subscribe(
      (res: ResponseData<any>) => {
        console.log(res);
        if (MessageService.MSG.SUCCESS === res.status) {
          const dataSet = res.data;
          this.formGroupHeader.patchValue({
            revCusId: dataSet.header.revCusId,
            contractNo: dataSet.header.contractNo,
            customerCode: dataSet.header.customerCode,
            customerName: dataSet.header.customerName,
            startSaleDate: dataSet.header.startSaleDate,
            endSaleDate: dataSet.header.endSaleDate,
            fileName: dataSet.header.fileName,
          })
          this.startCalendar.setDate(this.formGroupHeader.get('startSaleDate').value);
          this.endCalendar.setDate(this.formGroupHeader.get('endSaleDate').value);
          for (let index = 0; index < dataSet.product.length; index++) {
            const element = dataSet.product[index];
            this.setFormGroupProduct();
            this.formGroupProduct.patchValue({
              cusProId: element.cusProId,
              productType: element.productType,
              includingVatSale: element.includingVatSale,
              excludingVatSale: element.excludingVatSale,
              receiptNum: element.receiptNum,
            })
            this.formArrayProduct.push(this.formGroupProduct);
          }
          for (let index = 0; index < dataSet.payment.length; index++) {
            const element = dataSet.payment[index];
            this.setFormGroupPayment();
            this.formGroupPayment.patchValue({
              cusPayId: element.cusPayId,
              paymentType: element.paymentType,
              currency: element.currency,
              exchangeRate: element.exchangeRate,
              amount: element.amount,
              amountBaht: element.amountBaht,
            })
            this.formArrayPayment.push(this.formGroupPayment);
          }
        } else {
          this.modalError.openModal(res.message);
        }
      }, (err) => {
        console.error(err);
      }
    )
  }
  // ============== manage file ===============
  onUpload = (event: any) => {
    event.preventDefault();
    const form = $('#upload-form')[0];
    this.file = new FormData(form);
    if (event.target.files.length > 0) {
      this.formGroupHeader.get('fileName').patchValue(event.target.files[0].name.split('.').slice(0, -1).join('.'));
    } else {
      this.formGroupHeader.get('fileName').patchValue('');
    }
  }

}
