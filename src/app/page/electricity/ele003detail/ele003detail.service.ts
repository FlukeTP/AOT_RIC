import { Injectable } from '@angular/core';
import { AjaxService } from 'src/app/_service/ajax.service';
import { ResponseData } from 'src/app/common/models/response-data.model';
import { MessageService } from 'src/app/_service/message.service';
import { FormBuilder } from '@angular/forms';
import { Observable } from 'rxjs';
const URLS = {
  SAVE_DATA: 'electric003/save',
  GET_DROPDOWN: 'lov/list-data-detail',
  GET_CONFIG: 'electric003/getRateChargeConfig',
};
@Injectable()
export class Ele003detailService {

  constructor(
    private ajax: AjaxService,
    private formBuilder: FormBuilder,
  ) { }

  saveService(dataSave): Observable<any> {

    return new Observable((obs) => {
      this.ajax.doPost(URLS.SAVE_DATA, dataSave).subscribe((res: ResponseData<any>) => {
        if (MessageService.MSG.SUCCESS === res.status) {
          obs.next(res);
        } else {
          console.log(res.message);
          obs.next(res);
        }
      });
    });
  }

  getParams(paramsKey: string) {
    const primise = new Promise((resolve, reject) => {
      this.ajax.doPost(`${URLS.GET_DROPDOWN}`, { lovKey: paramsKey }).subscribe(
        (res: any) => {
          resolve(res);
        },
        (err) => {
          console.error(err);
          reject(err);
        });
    });

    return primise.then((data: any) => {
      return data.data;
    });
  }



  getConfig(ampare: string, phase: string) {
    const promise = new Promise((resolve, reject) => {
      this.ajax.doPost(`${URLS.GET_CONFIG}`, { electricPhase: phase, electricAmpere: ampare }).subscribe(
        (res: any) => {
          resolve(res);
        },
        (err) => {
          console.error(err);
          reject(err);
        });
    });

    return promise.then((data: any) => {
      return data.data;
    });
  }

  getFormSave(flag) {
    if (flag === 0) {
      return {
        idCard: [],
        customerCode: [],
        customerName: [],
        customerBranch: [],
        requestStartDate: [],
        requestEndDate: [],
        contractNo: [],
        addressDocument: [],
        requestType: [''],
        applyType: [''],
        voltageType: [''],
        electricRateType: [''],
        electricVoltageType: [''],
        defaultMeterNo: [0],
        meterSerialNo: [],
        meterType: [],
        adhocType: [''],
        adhocUnit: [],
        adhocChargeRate: [],
        installPosition: [],
        installPositionService: [],
        installServiceArea: [],
        rentalAreaCode: [],
        rentalAreaName: [''],
        paymentType: [''],
        remark: [],
        meterName: [],
        customerType: [],
        serviceCharge: this.formBuilder.array([]),

        bankName: [],
        bankBranch: [],
        bankExplanation: [],
        bankGuaranteeNo: [],
        bankExpNo: [],

        sumChargeRates: [],
        sumVatChargeRates: [],
        totalChargeRate: []

      };
    } else if (flag === 1) {
      return {
        idCard: [],
        customerCode: [],
        customerName: [],
        requestStartDate: [],
        requestEndDate: [],
        contractNo: [],
        addressDocument: [],
        requestType: [''],
        applyType: [''],
        voltageType: ['1'],
        electricRateType: ['อัตราปกติ แบบก้าวหน้า'],
        electricVoltageType: ['แรงดันต่ำ'],
        defaultMeterNo: [0],
        meterSerialNo: [],
        meterType: [],
        adhocType: [''],
        adhocUnit: [],
        adhocChargeRate: [],
        installPosition: [],
        installPositionService: [],
        installServiceArea: [],
        rentalAreaCode: [],
        rentalAreaName: [''],
        paymentType: [''],
        remark: [],
        meterName: [],
        customerType: [],
        serviceCharge: this.formBuilder.array([]),

        bankName: [],
        bankBranch: [],
        bankExplanation: [],
        bankGuaranteeNo: [],
        bankExpNo: [],

        sumChargeRates: [],
        sumVatChargeRates: [],
        totalChargeRate: []
      };
    } else {
      return {};
    }
  }

  setValeSave1(dataSet) {
    return {
      idCard: dataSet.idCard,
      customerCode: dataSet.customerCode,
      customerName: dataSet.customerName,
      customerBranch: dataSet.customerBranch,
      requestStartDate: dataSet.requestStartDateStr,
      requestEndDate: dataSet.requestEndDateStr,
      contractNo: dataSet.contractNo,
      addressDocument: dataSet.addressDocument,
      requestType: dataSet.requestType,
      applyType: dataSet.applyType,
      voltageType: dataSet.voltageType,
      electricRateType: dataSet.electricRateType,
      electricVoltageType: dataSet.electricVoltageType,
      defaultMeterNo: dataSet.defaultMeterNo,
      meterSerialNo: dataSet.meterSerialNo,
      meterType: dataSet.meterType,
      adhocType: dataSet.adhocType,
      adhocUnit: dataSet.adhocUnit,
      adhocChargeRate: dataSet.adhocChargeRate,
      installPosition: dataSet.installPosition,
      installPositionService: dataSet.installPositionService,
      rentalAreaCode: dataSet.rentalAreaCode,
      rentalAreaName: dataSet.rentalAreaName,
      paymentType: dataSet.paymentType,
      remark: dataSet.remark,
      createDate: dataSet.createDate,
      createdBy: dataSet.createdBy,
      isDelete: dataSet.isDelete,
      meterName: dataSet.meterName,
      customerType: dataSet.customerType,
      approveStatus: dataSet.approveStatus,
      bankName: dataSet.bankName,
      bankBranch: dataSet.bankBranch,
      bankExplanation: dataSet.bankExplanation,
      bankGuaranteeNo: dataSet.bankGuaranteeNo,
      bankExpNo: dataSet.bankExpStr,
    };
  }
  setValeSave2(dataSet) {
    return {
      idCard: dataSet.idCard,
      customerCode: dataSet.customerCode,
      customerName: dataSet.customerName,
      customerBranch: dataSet.customerBranch,
      contractNo: dataSet.contractNo,
      requestStartDate: dataSet.requestStartDateStr,
      requestEndDate: dataSet.requestEndDateStr,
      addressDocument: dataSet.addressDocument,
      requestType: dataSet.requestType,
      applyType: dataSet.applyType,
      voltageType: dataSet.voltageType,
      electricRateType: dataSet.electricRateType,
      electricVoltageType: dataSet.electricVoltageType,
      defaultMeterNo: dataSet.defaultMeterNo,
      meterSerialNo: dataSet.meterSerialNo,
      meterType: dataSet.meterType,
      adhocType: dataSet.adhocType,
      adhocUnit: dataSet.adhocUnit,
      adhocChargeRate: dataSet.adhocChargeRate,
      installPosition: dataSet.installPosition,
      installPositionService: dataSet.installPositionService,
      rentalAreaCode: dataSet.rentalAreaCode,
      rentalAreaName: dataSet.rentalAreaName,
      paymentType: dataSet.paymentType,
      remark: dataSet.remark,
      createDate: dataSet.createDate,
      createdBy: dataSet.createdBy,
      isDelete: dataSet.isDelete,
      meterName: dataSet.meterName,
      customerType: dataSet.customerType,
      approveStatus: dataSet.approveStatus,
      bankName: dataSet.bankName,
      bankBranch: dataSet.bankBranch,
      bankExplanation: dataSet.bankExplanation,
      bankGuaranteeNo: dataSet.bankGuaranteeNo,
      bankExpNo: dataSet.bankExpStr,
    };
  }
}
