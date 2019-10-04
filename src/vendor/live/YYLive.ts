import Live from "./Live";
import { SiteJson, StreamJson } from "../Json";
import Http from "../Http";

class YYLive extends Live {
    public static readonly SITE: SiteJson = {
        SITE_NAME: 'YY直播',
        SITE_CODE: 'YYLive',
        SITE_ICON: 'https://yy.com/favicon.ico',
        MATCH_ROOM_URL: /^https:\/\/(www\.)?yy\.com\/(\w+)/,
        BASE_ROOM_URL: 'https://www.yy.com/%s',
    };

    public static readonly BASE_LIVE_URL = "https://interface.yy.com/hls/new/get/%s/%s/2000?source=wapyy&callback=jsonp2";
    public static readonly BASE_ROOM_INFO_URL = "https://wap.yy.com/mobileweb/play/liveinfo?sid=%s&ssid=%s";

    constructor(roomUrl: string) {
        super(roomUrl);
    }

    async getLiveUrl() {
        let url = YYLive.BASE_LIVE_URL.replace(/%s/g, `${this.roomId}`);
        let res = await Http.request({
            url: url,
            header: {
                'user-agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 10_3_1 like Mac OS X) AppleWebKit/603.1.30 (KHTML, like Gecko) Version/10.0 Mobile/14E304 Safari/602.1',
                'referer': 'https://wap.yy.com',
            },
            json: false
        }).catch((e) => {
            throw `获取直播源信息失败,网络异常,${YYLive.SITE.SITE_NAME}(${this.roomUrl})`;
        });
        let hls = '';
        // console.log(url,res);
        if (typeof res == 'string') {
            let matches = res.match(/jsonp2\((.*?)\)/);
            if (matches && matches[1]) {
                try {
                    let res = JSON.parse(matches[1]);
                    if (res['hls']) {
                        hls = res['hls'];
                    }
                } catch (e) {
                }
            }
        }
        if (hls) {
            let liveList = [];
            let item: StreamJson = {
                quality: '超清',
                lineIndex: '主线路',
                liveUrl: hls,
            };
            liveList.push(item);
            return liveList;
        } else {
            throw `获取直播源信息失败！主播未开播或房间号有误,${YYLive.SITE.SITE_NAME}(${this.roomUrl})`;
        }
    }

    async refreshRoomData() {
        let res = await Http.request({
            url: this.roomUrl,
            header: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.100 Safari/537.36' },
        }).catch((e) => {
            throw `获取房间信息失败,网络异常1,${YYLive.SITE.SITE_NAME}(${this.roomUrl})`;
        });

        let match_roomId = res.match(/sid : "([^"]*)"/);
        // console.log( res,match_roomId,this.roomUrl);
        if (match_roomId && match_roomId[1]) {
            let roomId = match_roomId[1];
            let url = YYLive.BASE_ROOM_INFO_URL.replace(/%s/g, roomId);
            let res = await Http.request({ url: url }).catch((e) => {
                throw `获取房间信息失败,网络异常2,${YYLive.SITE.SITE_NAME}(${this.roomUrl})`;
            });
            if (res && res['code'] === 0) {
                let data = res['data'];
                this.setTitle(data['liveDesc']);
                if (data['liveName']) this.setNickName(data['liveName']);
                if (data['thumb']) this.setHeadIcon((data['thumb']));
                this.setCover((data['snapshot']));
                this.setRoomId(data['asid']);
                this.setLiveStatus(true);
                this.roomUrl = YYLive.SITE.BASE_ROOM_URL.replace(/%s/, match_roomId[1]);
            } else {
                this.setLiveStatus(false);
            }
        } else {
            throw `获取房间信息失败！主播未开播或房间号有误,${YYLive.SITE.SITE_NAME}(${this.roomUrl})`;
        }
    }

    getBaseSite(): SiteJson {
        return YYLive.SITE;
    }
}

export default YYLive;