import Api from "./Api";
import Live from "./Live";
import Http from "../Http";
import {VM} from 'vm2';
import MD5 from "crypto-js";
import * as queryString from 'query-string';

class DouYuLive extends Live implements Api {
    public static readonly SITE_NAME = "斗鱼直播";
    public static readonly SITE_ICON = "https://douyu.com/favicon.ico";
    public static readonly MATCH_ROOM_URL = /.*/;
    private signCaches: any;
    private disguisedNative = new Proxy({}, {
        get: function (target, name) {
            return 'function () { [native code] }'
        }
    });

    constructor(roomUrl: string) {
        super(roomUrl);
    }

    getLiveUrl(): any {
    }

    getSiteIcon(): string {
        return "";
    }

    getSiteName(): string {
        return "";
    }

    refreshRoomData(): void {
    }

    async getSignFn(address: any, rejectCache: any) {
        if (!rejectCache && this.signCaches.hasOwnProperty(address)) {
            return this.signCaches[address]
        }
        let json = await Http.request({url: 'https://www.douyu.com/swf_api/homeH5Enc?rids=' + address, json: true})
        if (json.error !== 0) throw new Error('Unexpected error code, ' + json.error)
        let code = json.data && json.data['room' + address]
        if (!code) throw new Error('Unexpected result with homeH5Enc, ' + JSON.stringify(json))

        const vm = new VM({
            sandbox: {
                CryptoJS: {MD5},
                window: this.disguisedNative,
                document: this.disguisedNative
            }
        });
        let sign = vm.run(code + ';ub98484234');
        this.signCaches[address] = sign;
        return sign
    }

    async getStream(address: any, quality: any, circuit: any, opts: any) {
        let sign = await this.getSignFn(address, opts.rejectCache);
        let did = Math.ceil(Date.now() / 100);
        let time = Math.ceil(Date.now() / 1000);
        let signed = sign(address, did, time);
        signed = queryString.parse(signed);

        let response = await Http.request({
            url: `https://www.douyu.com/lapi/live/getH5Play/${address}`,
            resolveWithFullResponse: true,
            simple: false,
            json: true,
            form: Object.assign({}, signed, {
                cdn: circuit,
                rate: opts.rate || 0,
                iar: 0,
                ive: 0
            })
        });
        console.log(response);
    }
}

export default DouYuLive;