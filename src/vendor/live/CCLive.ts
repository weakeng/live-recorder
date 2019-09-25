import Live from "./Live";
import Http from "../Http";
import {SiteJson,StreamJson} from "./Json";

class CCLive extends Live {
   public static readonly SITE: SiteJson = {
        SITE_NAME: 'CC直播',
        SITE_CODE: 'CCLive',
        SITE_ICON: 'https://cc.163.com/favicon.ico',
        MATCH_ROOM_URL: /^http(s)?:\/\/cc\.163\.com\/(\d+)/,
        BASE_ROOM_URL: 'https://cc.163.com/%s',
    };

    public static readonly BASE_API_LIVE_URL = "http://cgi.v.cc.163.com/video_play_url/%s";

    constructor(roomUrl: string) {
        super(roomUrl);
        if (!CCLive.SITE.MATCH_ROOM_URL.test(roomUrl)) {
            throw `房间地址有误:${roomUrl}`;
        }
        super(roomUrl);
    }

    getBaseSite(): SiteJson{
        return CCLive.SITE;
    }
    async getLiveUrl(){
        let url = CCLive.BASE_API_LIVE_URL.replace(/%s/, `${this.roomId}`);
        let res = await Http.request({url: url}).catch(() => {
            throw `获取直播源信息失败,网络异常,${CCLive.SITE.SITE_NAME}(${this.roomUrl})`;
        });
        if (res['videourl']) {
            let liveList = [];
            let item:StreamJson = {
                quality: '超清',
                lineIndex: '主线路',
                liveUrl: res['videourl'],
            };
            liveList.push(item);
            return liveList;
        } else {
            throw `获取直播源信息失败！主播未开播或房间号有误,${CCLive.SITE.SITE_NAME}(${this.roomUrl})`;
        }
    }

    async refreshRoomData() {
        let body = await Http.request({url: this.roomUrl}).catch(() => {
            throw `获取房间信息失败,网络异常,${CCLive.SITE.SITE_NAME}(${this.roomUrl})`;
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
            this.roomUrl = CCLive.SITE.BASE_ROOM_URL.replace(/%s/, `${this.roomId}`);
            this.setCover(match['anchorPic'] ? match['anchorPic'][1] : '');
            this.setHeadIcon(match['anchorPic'] ? match['anchorPic'][1] : '');
            this.setLiveStatus(match['isLive'] ? !!match['isLive'][1] : false);
            this.setNickName(match['anchorName'] ? match['anchorName'][1] : '');
            this.setTitle(match['title'] ? match['title'][1] : '');
        } else {
            throw `获取房间信息失败!主播未开播或房间地址有误,${CCLive.SITE.SITE_NAME}(${this.roomUrl})`;
        }
    }

}

export default CCLive;