import Live from "./Live";

class DouYuLive extends Live {
    public static readonly SITE_NAME = "斗鱼直播";
    public static readonly SITE_CODE = "DouYuLive";
    public static readonly SITE_ICON = "https://douyu.com/favicon.ico";
    public static readonly MATCH_ROOM_URL = /.*/;

    getLiveUrl(): any {
    }

    getSiteIcon(): string {
        return DouYuLive.SITE_ICON;
    }

    getSiteName(): string {
        return DouYuLive.SITE_ICON;
    }

    refreshRoomData(): void {
    }
}

export default DouYuLive;