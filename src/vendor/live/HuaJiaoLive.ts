import Live from "./Live";
import {SiteJson} from "./Json";

class HuaJiaoLive extends Live {
    public static readonly SITE: SiteJson = {
        SITE_NAME: '花椒直播',
        SITE_CODE: 'HuaJiaoLive',
        SITE_ICON: 'https://www.huajiao.com/favicon.ico',
        MATCH_ROOM_URL: /https:\/\/(www\.)?huajiao\.com\/(\w+)/,
        BASE_ROOM_URL: 'https://www.huajiao.com/%s',
    };

    getLiveUrl(): Array<any> {
        return [];
    }

    refreshRoomData(): void {
    }

    getBaseSite(): SiteJson {
        return HuaJiaoLive.SITE;
    }
}

export default HuaJiaoLive;