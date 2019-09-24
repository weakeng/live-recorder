import InkeLive from "./InkeLive";
import HuYaLive from "./HuYaLive";
import CCLive from "./CCLive";
import DouYuLive from "./DouYuLive";
import EgameLive from "./EgameLive";
import HuaJiaoLive from "./HuaJiaoLive";
import YYLive from "./YYLive";
import Logger from '../Logger';
import Cache from '../Cache';
import {LiveInfoJson} from "@/vendor/live/Json";

class LiveFactory {
    public static getLive(roomUrl: string) {
        if (InkeLive.SITE.MATCH_ROOM_URL.test(roomUrl)) {
            return new InkeLive(roomUrl);
        } else if (HuYaLive.SITE.MATCH_ROOM_URL.test(roomUrl)) {
            return new HuYaLive(roomUrl);
        } else if (CCLive.SITE.MATCH_ROOM_URL.test(roomUrl)) {
            return new CCLive(roomUrl);
        } else if (DouYuLive.SITE.MATCH_ROOM_URL.test(roomUrl)) {
            return new DouYuLive(roomUrl);
        } else if (EgameLive.SITE.MATCH_ROOM_URL.test(roomUrl)) {
            return new EgameLive(roomUrl);
        } else if (YYLive.SITE.MATCH_ROOM_URL.test(roomUrl)) {
            return new YYLive(roomUrl);
        } else if (HuaJiaoLive.SITE.MATCH_ROOM_URL.test(roomUrl)) {
            return new HuaJiaoLive(roomUrl);
        } else {
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
            case DouYuLive.SITE.SITE_CODE:
                roomUrl = DouYuLive.SITE.BASE_ROOM_URL.replace(/%s/, roomId);
                return new DouYuLive(roomUrl);
            case EgameLive.SITE.SITE_CODE:
                roomUrl = EgameLive.SITE.BASE_ROOM_URL.replace(/%s/, roomId);
                return new EgameLive(roomUrl);
            case YYLive.SITE.SITE_CODE:
                roomUrl = YYLive.SITE.BASE_ROOM_URL.replace(/%s/, roomId);
                return new YYLive(roomUrl);
                case HuaJiaoLive.SITE.SITE_CODE:
                    roomUrl = HuaJiaoLive.SITE.BASE_ROOM_URL.replace(/%s/, roomId);
                    return new HuaJiaoLive(roomUrl);
            default:
                throw "房间地址有误";
        }
    }

    public static getAllSiteName(): Array<any> {
        return [
            {siteCode: InkeLive.SITE.SITE_CODE, siteName: InkeLive.SITE.SITE_NAME},
            {siteCode: HuYaLive.SITE.SITE_CODE, siteName: HuYaLive.SITE.SITE_NAME},
            {siteCode: CCLive.SITE.SITE_CODE, siteName: CCLive.SITE.SITE_NAME},
            {siteCode: DouYuLive.SITE.SITE_CODE, siteName: DouYuLive.SITE.SITE_NAME},
            {siteCode: EgameLive.SITE.SITE_CODE, siteName: EgameLive.SITE.SITE_NAME},
            {siteCode: YYLive.SITE.SITE_CODE, siteName: YYLive.SITE.SITE_NAME},
            {siteCode: HuaJiaoLive.SITE.SITE_CODE, siteName: HuaJiaoLive.SITE.SITE_NAME},
        ]
    }

    public static refreshRoomData() {
        let list: Array<LiveInfoJson> = Cache.readRoomList();
        let resList: Array<LiveInfoJson> = [];
        let newItem: LiveInfoJson;
        Promise.all(list.map(async (item: LiveInfoJson) => {
            let live = LiveFactory.getLive(item.roomUrl);
            try {
                await live.refreshRoomData();
                newItem = {
                    siteName: live.getBaseSite().SITE_NAME,
                    siteIcon: live.getBaseSite().SITE_ICON,
                    nickName: live.getNickName() || item['nickName'],
                    headIcon: live.getHeadIcon() || item['headIcon'],
                    title: live.getTitle() || item['title'],
                    roomUrl: live.roomUrl,
                    liveStatus: live.getLiveStatus(),
                    isAutoRecord: item['isAutoRecord'] || false,
                    recordStatus: item['recordStatus'] || 1,
                    addTime: item['addTime'] || new Date().getTime(),
                };
            } catch (error) {
                newItem = item;
                Logger.init().error({msg: '刷新房间信息失败！', roomUrl: item.roomUrl, error: error});
            }
            resList.push(newItem);
        })).then(() => {
            let res = resList.sort(function (a: LiveInfoJson, b: LiveInfoJson) {
                return b['addTime'] - a['addTime'];
            });
            Cache.writeRoomList(res);
        });
    }
}

export default LiveFactory;