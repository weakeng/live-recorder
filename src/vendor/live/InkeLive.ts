import Live from "./Live";
import Http from "../Http"
import {SiteJson, StreamJson} from "./Json";

class InkeLive extends Live {
    public static readonly SITE: SiteJson = {
        SITE_NAME: '映客直播',
        SITE_CODE: 'InkeLive',
        SITE_ICON: 'http://inke.cn/favicon.ico',
        MATCH_ROOM_URL: /^http:\/\/(www\.)?inke\.cn\/live\.html\?uid=(\d+)/,
        BASE_ROOM_URL: 'http://inke.cn/live.html?uid=%s',
    };

    public static readonly BASE_ROOM_MSG_URL = "http://baseapi.busi.inke.cn/live/LiveInfo?uid=%s";
    public static readonly BASE_API_LIVE_URL = "http://webapi.busi.inke.cn/web/live_share_pc?uid=%s";


    public constructor(roomUrl: string) {
        super(roomUrl);
        let match = this.roomUrl.match(InkeLive.SITE.MATCH_ROOM_URL);
        if (!match) {
            throw (`房间地址有误${roomUrl}`);
        } else {
            let roomId = parseInt(match[2]);
            roomId = isNaN(roomId) ? 0 : roomId;
            this.setRoomId(roomId);
            this.roomUrl = InkeLive.SITE.BASE_ROOM_URL.replace(/%s/, `${roomId}`);
        }
    }

    public async refreshRoomData() {
        let url = InkeLive.BASE_ROOM_MSG_URL.replace(/%s/, `${this.roomId}`);
        let res = await Http.request({url: url}).catch((err) => {
            throw `获取房间信息失败,网络异常,${InkeLive.SITE.SITE_NAME}(${this.roomUrl})`;
        });
        if (res['error_code'] === 0) {
            this.setNickName(res['data']['live_info']['user']['nick']);
            this.setHeadIcon(res['data']['live_info']['user']['pic']);
            this.setCover(res['data']['live_info']['user']['pic']);
            this.setTitle(res['data']['live_info']['name']);

            if (res['data']['live_info']['status'] === 0) {
                this.setLiveStatus(false);
            } else {
                this.setLiveStatus(true);
            }
        } else {
            this.setLiveStatus(false);
            throw `获取房间信息失败,主播未开播或房间地址有误,${InkeLive.SITE.SITE_NAME}(${this.roomUrl})`;
        }
    }

    public async getLiveUrl() {
        let url = InkeLive.BASE_API_LIVE_URL.replace(/%s/, `${this.roomId}`)
        let res = await Http.request({url: url}).catch(() => {
            throw `获取直播源信息失败,网络异常,${InkeLive.SITE.SITE_NAME}(${this.roomUrl})`;
        });
        if (res['error_code'] === 0) {
            let liveList = [];
            let item: StreamJson = {
                quality: '超清',
                lineIndex: '主线路',
                liveUrl: res['data']['live_addr'][0]['hls_stream_addr'],
            };
            liveList.push(item);
            return liveList;
        } else {
            throw `获取直播源信息失败！主播未开播或房间地址有误,${InkeLive.SITE.SITE_NAME}(${this.roomUrl})`;
        }
    }

    getBaseSite(): SiteJson {
        return InkeLive.SITE;
    }

}

export default InkeLive;