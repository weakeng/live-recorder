import InkeLive from "./InkeLive";
import HuYaLive from "./HuYaLive";
import CCLive from "./CCLive";
import log from '../Logger';

// import DouYuLive from "./DouYuLive";
// import EgameLive from "./EgameLive";
// import YYLive from "./YYLive";
// import HuaJiaoLive from "./HuaJiaoLive";
import Cache from '../Cache';
import {LiveInfoJson} from "@/vendor/live/Json";
import Live from "@/vendor/live/Live";

class LiveFactory {
    public static getLive(roomUrl: string) {
        if (InkeLive.SITE.MATCH_ROOM_URL.test(roomUrl)) {
            return new InkeLive(roomUrl);
        } else if (HuYaLive.SITE.MATCH_ROOM_URL.test(roomUrl)) {
            return new HuYaLive(roomUrl);
        } else if (CCLive.SITE.MATCH_ROOM_URL.test(roomUrl)) {
            return new CCLive(roomUrl);
        }
        // else if (DouYuLive.MATCH_ROOM_URL.test(roomUrl)) {
        //     return new DouYuLive(roomUrl);
        // } 
        // else if (EgameLive.MATCH_ROOM_URL.test(roomUrl)) {
        //     return new EgameLive(roomUrl);
        // } 
        // else if (YYLive.MATCH_ROOM_URL.test(roomUrl)) {
        //     return new YYLive(roomUrl);
        // } 
        // else if (HuaJiaoLive.MATCH_ROOM_URL.test(roomUrl)) {
        //     return new HuaJiaoLive(roomUrl);
        // } 
        else {
            throw "房间地址有误";
        }
    }

    public static getLiveByRoomId(siteNameCode: String, roomId: string) {
        let roomUrl;
        switch (siteNameCode) {
            case InkeLive.SITE.SITE_CODE:
                roomUrl = InkeLive.SITE.BASE_ROOM_URL.replace(/%s/, roomId);
                return new InkeLive(roomUrl);
            case HuYaLive.SITE.SITE_CODE:
                roomUrl = HuYaLive.SITE.BASE_ROOM_URL.replace(/%s/, roomId);
                return new HuYaLive(roomUrl);
            case CCLive.SITE.SITE_CODE:
                roomUrl = CCLive.SITE.BASE_ROOM_URL.replace(/%s/, roomId);
                return new CCLive(roomUrl);
            default:
                throw "房间地址有误";
        }
    }

    public static getAllSiteName(): Array<any> {
        return [
            {siteCode: InkeLive.SITE.SITE_CODE, siteName: InkeLive.SITE.SITE_NAME},
            {siteCode: HuYaLive.SITE.SITE_CODE, siteName: HuYaLive.SITE.SITE_NAME},
            {siteCode: CCLive.SITE.SITE_CODE, siteName: CCLive.SITE.SITE_NAME},
            // DouYuLive.SITE_NAME,
            // EgameLive.SITE_NAME,
            // YYLive.SITE_NAME,
            // HuaJiaoLive.SITE_NAME
        ]
    }

    public static refreshRoomData() {
        let list = Cache.readRoomList();
        let liveList: Array<Live> = [];
        Promise.all(list.map(async (item: any) => {
            let live = LiveFactory.getLive(item.roomUrl);
            try {
                await live.refreshRoomData().catch((error) => {
                    log.init().error({msg: '刷新房间信息失败！', live: item, error: error});
                });
            } catch (error) {
                log.init().error({msg: '刷新房间信息失败！', live: item, error: error});
            }
            liveList.push(live);
        })).then(() => {
            let resList: Array<LiveInfoJson> = [];
            liveList.forEach((live: Live) => {
                let item: LiveInfoJson = {
                    siteName: live.getBaseSite().SITE_NAME,
                    siteIcon: live.getBaseSite().SITE_ICON,
                    nickName: live.getNickName(),
                    headIcon: live.getHeadIcon(),
                    title: live.getTitle(),
                    roomUrl: live.roomUrl,
                    liveStatus: live.getLiveStatus(),
                    isAutoRecord: false,
                    recordStatus: 1,
                    addTime: 0,
                };
                list.forEach((vo: any) => {
                    if (vo['roomUrl'] == item['roomUrl']) {
                        //@ts-ignore
                        item['isAutoRecord'] = vo['isAutoRecord'] || false;
                        //@ts-ignore
                        item['recordStatus'] = vo['recordStatus'] || 1;
                        //@ts-ignore
                        item['addTime'] = vo['addTime'] || new Date().getTime();
                    }
                });
                resList.push(item);
            });
            let res = resList.sort(function (a: LiveInfoJson, b: LiveInfoJson) {
                return b['addTime'] - a['addTime'];
            });
            Cache.writeRoomList(res);
        });
    }
}

export default LiveFactory;