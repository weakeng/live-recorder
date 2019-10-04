import Vue from "Vue";

class Notice {
    public static showInfo(self: Vue, msg: any) {
        msg = typeof msg == "string" ? msg : JSON.stringify(msg);
        self.$Notice.info({
            title: '信息',
            desc: msg
        });
    }

    public static showError(self: Vue, msg: any) {
        msg = typeof msg == "string" ? msg : JSON.stringify(msg);
        self.$Notice.error({
            title: '信息',
            desc: msg
        });
    }
}
export default Notice;