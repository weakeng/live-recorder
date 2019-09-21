import InkeLive from "./InkeLive";
import HuYaLive from "./HuYaLive";
import CCLive from "./CCLive";
// import DouYuLive from "./DouYuLive";
// import EgameLive from "./EgameLive";
// import YYLive from "./YYLive";
// import HuaJiaoLive from "./HuaJiaoLive";
import Cache from '../Cache';
import Live from "./Live";

class LiveFactory {
    public static getLive(roomUrl: string) {
        if (InkeLive.MATCH_ROOM_URL.test(roomUrl)) {
            return new InkeLive(roomUrl);
        } else if (HuYaLive.MATCH_ROOM_URL.test(roomUrl)) {
            return new HuYaLive(roomUrl);
        } else if (CCLive.MATCH_ROOM_URL.test(roomUrl)) {
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

    public static getLiveByRoomId(siteNameCode: number, roomId: string) {
        let roomUrl;
        switch (siteNameCode) {
            case Live.InkeLive:
                roomUrl = InkeLive.BASE_ROOM_URL.replace(/%s/, roomId);
                return new InkeLive(roomUrl);
            case Live.HuYaLive:
                roomUrl = HuYaLive.BASE_ROOM_URL.replace(/%s/, roomId);
                return new HuYaLive(roomUrl);
            case Live.CCLive:
                roomUrl = CCLive.BASE_ROOM_URL.replace(/%s/, roomId);
                return new CCLive(roomUrl);
            default:
                throw "房间地址有误";
        }
    }

    public static getAllSiteName(): Array<any> {
        return [
            {siteCode: Live.InkeLive, siteName: InkeLive.SITE_NAME},
            {siteCode: Live.HuYaLive, siteName: HuYaLive.SITE_NAME},
            {siteCode: Live.CCLive, siteName: CCLive.SITE_NAME},
            // DouYuLive.SITE_NAME,
            // EgameLive.SITE_NAME,
            // YYLive.SITE_NAME,
            // HuaJiaoLive.SITE_NAME
        ]
    }

    public static refreshRoomData() {
        let list = Cache.readRoomList();
        let liveList: any = [];
        Promise.all(list.map(async (item: any) => {
            let live = LiveFactory.getLive(item.roomUrl);
            try {
                await live.refreshRoomData().catch((error)=>{
                    console.error(error);
                });
            } catch (error) {
                console.error(error);
            }
            liveList.push(live);
        })).then(() => {
            list = [];
            liveList.forEach((live: any) => {
                let item = {
                    siteName: live.getSiteName(),
                    siteIcon: live.getSiteIcon(),
                    nickName: live.getNickName(),
                    headIcon: live.getHeadIcon(),
                    title: live.getTitle(),
                    roomUrl: live.roomUrl,
                    liveStatus: live.getLiveStatus(),
                };
                list.push(item);
            });
            Cache.writeRoomList(list);
        });
    }
}

export default LiveFactory;