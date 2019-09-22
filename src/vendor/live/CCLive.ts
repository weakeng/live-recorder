import Live from "./Live";
import Http from "../Http";

class CCLive extends Live {
    public static readonly SITE_NAME = "CC直播";
    public static readonly SITE_CODE = "CCLive";
    public static readonly SITE_ICON = "https://cc.163.com/favicon.ico";
    public static readonly MATCH_ROOM_URL = /http(s)?:\/\/cc\.163\.com\/(\d+)/;
    public static readonly BASE_ROOM_URL = "https://cc.163.com/%s";

    public static readonly BASE_API_LIVE_URL = "http://cgi.v.cc.163.com/video_play_url/%s";
    constructor(roomUrl: string) {
        if (!CCLive.MATCH_ROOM_URL.test(roomUrl)) {
            throw `房间地址有误:${roomUrl}`;
        }
        super(roomUrl);
    }

    async getLiveUrl() {
        let url = CCLive.BASE_API_LIVE_URL.replace(/%s/, `${this.roomId}`);
        let res = await Http.request({url: url}).catch(() => {
            throw `获取直播源信息失败,网络异常,${CCLive.SITE_NAME}(${this.roomUrl})`;
        });
        if (res['videourl']) {
            let liveList = [];
            let item = {
                quality:'超清',
                liveIndex: '主线路',
                liveUrl: res['videourl'],
            };
            liveList.push(item);
            return liveList;
        } else {
            throw `获取直播源信息失败！主播未开播或房间号有误,${CCLive.SITE_NAME}(${this.roomUrl})`;
        }
    }

    getSiteIcon(): string {
        return CCLive.SITE_ICON;
    }

    getSiteName(): string {
        return CCLive.SITE_NAME;
    }

    async refreshRoomData() {
        let body = await Http.request({url: this.roomUrl}).catch(() => {
            throw `获取房间信息失败,网络异常,${CCLive.SITE_NAME}(${this.roomUrl})`;
        });
        let match = {
            'anchorCcId': body.match(/anchorCcId\s*:\s*'(.*?)',/),
            'anchorPic': body.match(/anchorPic\s*:\s*'(.*?)',/),
            'isLive': body.match(/isLive\s*:\s*(\d),/),
            'anchorName': body.match(/anchorName\s*:\s*'(.*?)',/),
            'title': body.match(/title\s*:\s*'(.*?)',/),
        };
        if (match['anchorCcId'] && match['anchorCcId'][1]) {
            this.setRoomId(match['anchorCcId'] ? match['anchorCcId'][1] : 0);
            this.roomUrl = CCLive.BASE_ROOM_URL.replace(/%s/, `${this.roomId}`);
            this.setCover(match['anchorPic'] ? match['anchorPic'][1] : '');
            this.setHeadIcon(match['anchorPic'] ? match['anchorPic'][1] : '');
            this.setLiveStatus(match['isLive'] ? !!match['isLive'][1] : false);
            this.setNickName(match['anchorName'] ? match['anchorName'][1] : '');
            this.setTitle(match['title'] ? match['title'][1] : '');
        } else {
            throw `获取房间信息失败!主播未开播或房间地址有误,${CCLive.SITE_NAME}(${this.roomUrl})`;
        }

    }

}

export default CCLive;