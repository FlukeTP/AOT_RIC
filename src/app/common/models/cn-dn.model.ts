export interface CnDnRequest {
    id: string;
    customerCode: string;
    customerName: string;
    customerBranch: string;
    contractNo: string;
    oldInvoiceNo: string;
    oldReceiptNo: string;
    requestType: string;
    docType: string;
    sapType: string;
    oldTotalAmount: number;
    glAccount: string;
    oldTransactionNo: string;
}