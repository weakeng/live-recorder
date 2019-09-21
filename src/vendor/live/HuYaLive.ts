import Api from "./Api";
import Live from "./Live";
import Http from "../Http";

class HuYaLive extends Live implements Api {
    public static readonly SITE_NAME = "虎牙直播";
    public static readonly SITE_ICON="https://huya.com/favicon.ico";
    public static readonly BASE_ROOM_URL = "https://www.huya.com/%s";
    public static readonly MATCH_ROOM_URL = /https:\/\/(www\.)?huya\.com\/(\w+)/;

    public constructor(roomUrl: string) {
        super(roomUrl);
    }
    public getSiteName():string{
        return HuYaLive.SITE_NAME;
    }
    public  getSiteIcon():string{
        return HuYaLive.SITE_ICON;
    }
    public async refreshRoomData() {
        let body = await Http.request({ url: this.roomUrl });
        let match_title = body.match(/<h1 id="J_roomTitle" title="(.*?)">(.*?)<\/h1>/);
        let match_nick = body.match(/<h3 class="host-name" title="(.*?)">(.*?)<\/h3>/);
        let match_head = body.match(/<img id="avatar-img" src="(.*?)" alt="(.*?)">/);
        body = body.replace(/&amp;/g, '&');
        let match_config = body.match(/hyPlayerConfig = ([^;]+);/);
        let match_room_info=body.match(/var TT_ROOM_DATA = (.*?);/);
        if(!match_title) throw "房间号有误";
        this.setTitle(match_title[1]);
        this.setNickName(match_nick[1]);
        this.setHeadIcon(match_head[1]);
        this.setCover(match_head[1]);
        let room=JSON.parse(match_room_info[1]);
        this.setRoomId(room['profileRoom']);
        this.roomUrl=HuYaLive.BASE_ROOM_URL.replace(/%s/, room['profileRoom']);
        let data = JSON.parse(match_config[1]);
        if (!data.stream) {
            this.setLiveStatus(false);
        } else {
            this.setLiveStatus(true);
        }
    }

    public async getLiveUrl(){
        let body = await Http.request({ url: this.roomUrl });
        body = body.replace(/&amp;/g, 'A=========B');
        let match_config = body.match(/hyPlayerConfig = ([^;]+);/);
        let data = JSON.parse(match_config[1]);
        if (data.stream) {
            let urlList=data.stream.data[0].gameStreamInfoList;
            let liveList = [];
            for(let i=0;i<urlList.length;i++){
               let url=urlList[i].sHlsUrl+'/'+urlList[i].sStreamName+'.'+urlList[i].sHlsUrlSuffix+'?'+urlList[i].sHlsAntiCode;
               url = url.replace(/A=========B/g, '&amp;');
               let item={
                 lineIndex:'线路'+urlList[i].iLineIndex,
                 liveUrl:url
               };
               liveList.push(item);
            }
            return liveList;
        } else {
            throw `获取直播源信息失败！${HuYaLive.SITE_NAME}房间号${this.roomId},主播未开播或房间号有误`;
        }
    }
}
export default HuYaLive;


