import Live from "./Live";
import {SiteJson} from "./Json";

class HuaJiaoLive extends Live {
    public static readonly SITE: SiteJson = {
        SITE_NAME: 'CC直播',
        SITE_CODE: 'CCLive',
        SITE_ICON: 'https://cc.163.com/favicon.ico',
        MATCH_ROOM_URL: /http(s)?:\/\/cc\.163\.com\/(\d+)/,
        BASE_ROOM_URL: 'https://cc.163.com/%s',
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