import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { AjaxService } from 'src/app/_service/ajax.service';

const URL = {
    SYNC_DATA: "communicate008/sync-data",
    SEARCH: "communicate008/search",
    SEND_TO_SAP: "communicate008/send-to-sap",
};

@Injectable()
export class Communi008Srevice {

    constructor(private ajax: AjaxService) { }

    syncData(periodMonth: String) {
        return this.ajax.doGet(`${URL.SYNC_DATA}/${periodMonth}`);
    }

    search(formSearch: FormGroup) {
        return this.ajax.doPost(URL.SEARCH, formSearch.value);
    }

    sendTosap(idxList: any[]) {
        return this.ajax.doPost(URL.SEND_TO_SAP, idxList);
    }
}