export const DOC_TYPE_CONSTANT = {
    ELECTRICITY: {
        KEY: "ELECTRICITY",
        TEXT_TH: "ไฟฟ้า"
    },
    WATER: {
        KEY: "WATER",
        TEXT_TH: "ปะปา"
    },
    TELEPHONE: {
        KEY: "TELEPHONE",
        TEXT_TH: "โทรศัพท์"
    },
    INTERCOM: {
        KEY: "INTERCOM",
        TEXT_TH: "อุปกรณ์สื่อสาร"
    },
    IT: {
        KEY: "IT",
        TEXT_TH: "IT"
    },
    EQUIPMENT: {
        KEY: "EQUIPMENT",
        TEXT_TH: "เครื่องทุ่นแรง"
    },
    GARBAGEDISPOSAL: {
        KEY: "GARBAGEDISPOSAL",
        TEXT_TH: "กำจัดขยะ"
    },
    FIREBRIGADE: {
        KEY: "FIREBRIGADE",
        TEXT_TH: "ดับเพลิง"
    },
    COMMUNICATE: {
        KEY: "COMMUNICATE",
        TEXT_TH: "สื่อสาร"
    },
}

export const SAP_TYPE_CONSTANT = {
    INSTALLATION: {
        KEY: "INSTALLATION",
        TEXT_TH: "ค่าติดตั้ง"
    },
    DEPOSIT: {
        KEY: "DEPOSIT",
        TEXT_TH: "เงินประกัน"
    },
    PACKAGES: {
        KEY: "PACKAGES",
        TEXT_TH: "เหมาจ่าย"
    },
    REFUND: {
        KEY: "REFUND",
        TEXT_TH: "คืนเงินประกัน"
    },
    INVOICE: {
        KEY: "INVOICE",
        TEXT_TH: "การตั้งหนี้"
    },
}

export const REQUEST_TYPE = {
    PACKAGES: {
        KEY: "PACKAGES",
        TEXT_TH: "เหมาจ่าย"
    },
    TEMPORARY: {
        KEY: "TEMPORARY",
        TEXT_TH: "ชั่วคราว"
    },
    PERMANENT: {
        KEY: "PERMANENT",
        TEXT_TH: "ถาวร"
    },
    OTHER: {
        KEY: "OTHER",
        TEXT_TH: "อื่น ๆ"
    },
}

export const CASH = {
    CASH_EN: "CASH",
    CASH_TH: "เงิดสด",
}

export const ONE_TIME = {
    ONE_TIME_EN: "ONE_TIME",
    ONE_TIME_TH: "รายครั้ง",
}


export function mapDocType(key): string {
    let value = "";
    switch (key) {
        case DOC_TYPE_CONSTANT.ELECTRICITY.KEY:
            value = DOC_TYPE_CONSTANT.ELECTRICITY.TEXT_TH;
            break;
        case DOC_TYPE_CONSTANT.WATER.KEY:
            value = DOC_TYPE_CONSTANT.WATER.TEXT_TH;
            break;
        case DOC_TYPE_CONSTANT.TELEPHONE.KEY:
            value = DOC_TYPE_CONSTANT.TELEPHONE.TEXT_TH;
            break;
        case DOC_TYPE_CONSTANT.INTERCOM.KEY:
            value = DOC_TYPE_CONSTANT.INTERCOM.TEXT_TH;
            break;
        case DOC_TYPE_CONSTANT.IT.KEY:
            value = DOC_TYPE_CONSTANT.IT.TEXT_TH;
            break;
        case DOC_TYPE_CONSTANT.EQUIPMENT.KEY:
            value = DOC_TYPE_CONSTANT.EQUIPMENT.TEXT_TH;
            break;
        case DOC_TYPE_CONSTANT.GARBAGEDISPOSAL.KEY:
            value = DOC_TYPE_CONSTANT.GARBAGEDISPOSAL.TEXT_TH;
            break;
        case DOC_TYPE_CONSTANT.FIREBRIGADE.KEY:
            value = DOC_TYPE_CONSTANT.FIREBRIGADE.TEXT_TH;
            break;
        case DOC_TYPE_CONSTANT.COMMUNICATE.KEY:
            value = DOC_TYPE_CONSTANT.COMMUNICATE.TEXT_TH;
            break;

        default:
            break;
    }
    return value;
}

export function mapSapType(key): string {
    let value = "";
    switch (key) {
        case SAP_TYPE_CONSTANT.INSTALLATION.KEY:
            value = SAP_TYPE_CONSTANT.INSTALLATION.TEXT_TH;
            break;
        case SAP_TYPE_CONSTANT.DEPOSIT.KEY:
            value = SAP_TYPE_CONSTANT.DEPOSIT.TEXT_TH;
            break;
        case SAP_TYPE_CONSTANT.PACKAGES.KEY:
            value = SAP_TYPE_CONSTANT.PACKAGES.TEXT_TH;
            break;
        case SAP_TYPE_CONSTANT.REFUND.KEY:
            value = SAP_TYPE_CONSTANT.REFUND.TEXT_TH;
            break;
        case SAP_TYPE_CONSTANT.INVOICE.KEY:
            value = SAP_TYPE_CONSTANT.INVOICE.TEXT_TH;
            break;

        default:
            break;
    }
    return value;
}

export function mapRequestType(key): string {
    let value = "";
    switch (key) {
        case REQUEST_TYPE.PACKAGES.KEY:
            value = REQUEST_TYPE.PACKAGES.TEXT_TH;
            break;
        case REQUEST_TYPE.TEMPORARY.KEY:
            value = REQUEST_TYPE.TEMPORARY.TEXT_TH;
            break;
        case REQUEST_TYPE.PERMANENT.KEY:
            value = REQUEST_TYPE.PERMANENT.TEXT_TH;
            break;
        case REQUEST_TYPE.OTHER.KEY:
            value = REQUEST_TYPE.OTHER.TEXT_TH;
            break;

        default:
            break;
    }
    return value;
}

export function mapCnDnTh(key): string {
    let value = "";
    switch (key) {
        case "CN":
            value = "ลดหนี้";
            break;
        case "DN":
            value = "เพิ่มหนี้";
            break;

        default:
            break;
    }
    return value;
}