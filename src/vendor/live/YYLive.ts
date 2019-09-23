import Live from "./Live";
import {SiteJson, StreamJson} from "./Json";
import Http from "../Http";

class YYLive extends Live {
    public static readonly SITE: SiteJson = {
        SITE_NAME: 'YY直播',
        SITE_CODE: 'YYLive',
        SITE_ICON: 'https://yy.com/favicon.ico',
        MATCH_ROOM_URL: /https:\/\/(www\.)?yy\.com\/(\w+)/,
        BASE_ROOM_URL: 'https://www.yy.com/%s',
    };

    public static readonly BASE_LIVE_URL = "https://interface.yy.com/hls/new/get/%s/%s/2000?source=wapyy&callback=jsonp2";

    constructor(roomUrl: string) {
        super(roomUrl);
    }
    async getLiveUrl() {
        let url = YYLive.BASE_LIVE_URL.replace(/%s/g, `${this.roomId}`);
        let body = await Http.request({url: url, 'Referer': 'https://wap.yy.com'}).catch(() => {
            throw `获取直播源信息失败,网络异常,${YYLive.SITE.SITE_NAME}(${this.roomUrl})`;
        });
        console.log(url, body);
        let matches = body.match(/jsonp2\((.*?)\)/);
        if (matches[1]) {
            let res = JSON.parse(matches[1]);
            console.log(res);
        } else {
            throw `获取直播源信息失败！主播未开播或房间号有误,${YYLive.SITE.SITE_NAME}(${this.roomUrl})`;
        }
        return [];
    }

    async refreshRoomData() {
        let body: string = await Http.request({url: this.roomUrl}).catch((e) => {
            throw `获取房间信息失败,网络异常,${YYLive.SITE.SITE_NAME}(${this.roomUrl})`;
        });
        let match_nick = body.match(/nick: "([^"]*)"/);
        let match_roomId = body.match(/ssid: "([^"]*)"/);
        let match_head = body.match(/logo: "([^"]*)"/);
        if (match_roomId && match_roomId[1]) {
            this.setTitle('');//todo setTitle
            this.setNickName(match_nick[1]);
            this.setHeadIcon((match_head[1]));
            this.setCover((match_head[1]));
            this.setRoomId(match_roomId[1]);
            this.setLiveStatus(false);//todo setLiveStatus
            this.roomUrl = YYLive.SITE.BASE_ROOM_URL.replace(/%s/, match_roomId[1]);
        } else {
            throw `获取房间信息失败！主播未开播或房间号有误,${YYLive.SITE.SITE_NAME}(${this.roomUrl})`;
        }
    }

    getBaseSite(): SiteJson {
        return YYLive.SITE;
    }
}

export default YYLive;