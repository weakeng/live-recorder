import Live from "./Live";
import Http from "../Http";
import {SiteJson, StreamJson} from "../Json";
import CryptoJS from "../md5";

class DouYuLive extends Live {
    public static readonly SITE: SiteJson = {
        SITE_NAME: '斗鱼直播',
        SITE_CODE: 'DouYuLive',
        SITE_ICON: 'https://douyu.com/favicon.ico',
        MATCH_ROOM_URL: /^https:\/\/(www\.)?douyu\.com\/(\w+)/,
        BASE_ROOM_URL: 'https://www.douyu.com/%s',
    };
    static readonly API_ROOM_INFO = "https://open.douyucdn.cn/api/RoomApi/room/%s";
    static readonly API_ENC_SIGN = "https://www.douyu.com/swf_api/homeH5Enc?rids=%s";
    static readonly API_GET_LIVE_URL = "https://www.douyu.com/lapi/live/getH5Play/%s";

    public constructor(roomUrl: string) {
        super(roomUrl);
    }

    async getLiveUrl() {
        let url = DouYuLive.API_ENC_SIGN.replace(/%s/, `${this.roomId}`);
        let data = await Http.request({url: url, 'header': {Referer: 'https://www.douyu.com'}}).catch(() => {
            throw `获取直播源信息失败,网络异常,${DouYuLive.SITE.SITE_NAME}(${this.roomUrl}) ${url}`;
        });
        if (data['data'] && data['data'][`room${this.roomId}`]) {
            let did = `did${Date.now()}`;//获取随机变量
            let time = Math.ceil(Date.now() / 1000);
            let code = data['data'][`room${this.roomId}`];
            const jsCode = `${CryptoJS};${code};ub98484234('${this.roomId}','${did}',${time})`;
            let sign = eval(jsCode);
            url = DouYuLive.API_GET_LIVE_URL.replace(/%s/, `${this.roomId}`);
            url = `${url}?${sign}`;
            let res = await Http.request({
                url: url,
                header: {Referer: 'https://www.douyu.com'},
                method: "post"
            }).catch(() => {
                throw `获取直播源信息失败,网络异常,${DouYuLive.SITE.SITE_NAME}(${this.roomUrl}) ${url}`;
            });
            if (res && res['error'] === 0 && res['data'] && res['data']['rtmp_url'] && res['data']['rtmp_live']) {
                let liveList: Array<StreamJson> = [];
                let item: StreamJson = {
                    quality: '超清',
                    lineIndex: '主线路',
                    liveUrl: `${res['data']['rtmp_url']}/${res['data']['rtmp_live']}`,
                };
                liveList.push(item);
                return liveList;
            } else {
                throw `获取直播源信息失败！接口异常,无法获取信息,${DouYuLive.SITE.SITE_NAME}(${this.roomUrl}) ` + JSON.stringify(res);
            }
        } else {
            throw `获取直播源信息失败,无法匹配签名信息,${DouYuLive.SITE.SITE_NAME}(${this.roomUrl})`;
        }
    }

    async refreshRoomData() {
        let match = true;
        let body = await Http.request({url: this.roomUrl}).catch(() => {
            throw `获取房间信息失败,网络异常,${DouYuLive.SITE.SITE_NAME}(${this.roomUrl})`;
        });
        let res = body.match(/\$ROOM.room_id =(\d+);/);
        if (res && res[1]) {
            let roomId = res[1];
            let url = DouYuLive.API_ROOM_INFO.replace(/%s/, roomId);
            res = await Http.request({url: url}).catch(() => {
                throw `获取直播源信息失败,网络异常,${DouYuLive.SITE.SITE_NAME}(${this.roomUrl})`;
            });
            let data = res['data'];
            if (!data) {
                match = false;
            }
            this.setTitle(data['room_name']);
            this.setNickName(data['owner_name']);
            this.setHeadIcon(data['avatar']);
            this.setCover(data['avatar']);
            this.setRoomId(data['room_id']);
            this.setLiveStatus(data['room_status'] == 1);
            this.roomUrl = DouYuLive.SITE.BASE_ROOM_URL.replace(/%s/, data['room_id']);
        } else {
            match = false;
        }
        if (!match) {
            throw `获取房间信息失败！主播未开播或房间号有误,${DouYuLive.SITE.SITE_NAME}(${this.roomUrl})`;
        }
    }

    getBaseSite(): SiteJson {
        return DouYuLive.SITE;
    }
}

export default DouYuLive;