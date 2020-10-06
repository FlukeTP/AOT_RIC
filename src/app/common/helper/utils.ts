
export class Utils {
    public static isNull(obj) {
        return obj === null || obj === undefined || obj === "";
    }

    public static isNotNull(obj) {
        return obj !== null && obj !== undefined && obj !== "";
    }

    //type number (1, 2, 3, 4, 5, 6, 7, 8, 9, 0, - , . )
    // ** must use (keypress) on html **
    public static numberOnly(e) {
        return (
            e.charCode == 45 ||
            e.charCode == 46 ||
            (e.charCode >= 48 && e.charCode <= 57)
        );
    }
}
