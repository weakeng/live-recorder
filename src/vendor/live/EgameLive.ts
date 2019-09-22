import Api from "./Api";
import Live from  "./Live";
class EgameLive extends Live  {
    public static readonly SITE_NAME = "企鹅电竞";
    public static readonly SITE_ICON="https://egame.qq.com/favicon.ico";
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
export default EgameLive;