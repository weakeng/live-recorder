import Live from "./Live";
import Http from "../Http";
import {SiteJson, StreamJson} from "../Json";

class DouYuLive extends Live {
    public static readonly SITE: SiteJson = {
        SITE_NAME: '斗鱼直播',
        SITE_CODE: 'DouYuLive',
        SITE_ICON: 'https://douyu.com/favicon.ico',
        MATCH_ROOM_URL: /^https:\/\/(www\.)?douyu\.com\/(\w+)/,
        BASE_ROOM_URL: 'https://www.douyu.com/%s',
    };
    static readonly API_ROOM_INFO = "https://open.douyucdn.cn/api/RoomApi/room/%s";
    static readonly API_LIVE_INFO = "http://rpc.paomianfan.com:27020/?action=videoUrl&roomUrl=ROOM_URL&roomId=ROOM_ID";

    public constructor(roomUrl: string) {
        super(roomUrl);
    }

    async getLiveUrl() {
        let url = DouYuLive.API_LIVE_INFO.replace(/ROOM_URL/, this.roomUrl).replace(/ROOM_ID/, `${this.roomId}`);
        let res = await Http.request({url: url}).catch(() => {
            throw `获取直播源信息失败！网络异常,${DouYuLive.SITE.SITE_NAME}(${this.roomUrl})`;
        });
        if (res && res['error'] == 200 && res['data'] && res['data']['videoUrl']) {
            let liveList = [];
            let item: StreamJson = {
                quality: '超清',
                lineIndex: '主线路',
                liveUrl: res['data']['videoUrl'],
            };
            liveList.push(item);
            //todo 缓存处理
            return liveList;
        } else {
            throw `获取直播源信息失败！主播未开播或房间地址有误,${DouYuLive.SITE.SITE_NAME}(${this.roomUrl}) `+JSON.stringify(res);
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