import { Injectable } from '@angular/core';
import { AjaxService } from 'src/app/_service/ajax.service';
import { FormGroup } from '@angular/forms';

const URL = {
    CHECK_DATA: "communicate007/check-sync-data",
    SYNC_DATA: "communicate007/sync-data",
    SEARCH: "communicate007/search",
    SEND_TO_SAP: "communicate007/send-to-sap",
};

@Injectable()
export class Communi007Srevice {

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