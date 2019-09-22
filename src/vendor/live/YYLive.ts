import Api from "./Api";
import Live from "./Live";
class YYLive extends Live  {
    public static readonly SITE_NAME = "YY直播";
    public static readonly MATCH_ROOM_URL = /.*/;
    public constructor(liveUrl:string){
        super(liveUrl);
    }

    getLiveUrl(): any {
    }

    getSiteIcon(): string {
        return "";
    }

    getSiteName(): string {
        return "";
    }

    refreshRoomData(): void {
    }

}
export default YYLive;