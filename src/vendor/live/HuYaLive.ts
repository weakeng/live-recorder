import Live from "./Live";
import Http from "../Http";
import {SiteJson, StreamJson} from "./Json";

class HuYaLive extends Live {
    public static readonly SITE: SiteJson = {
        SITE_NAME: '虎牙直播',
        SITE_CODE: 'HuYaLive',
        SITE_ICON: 'https://huya.com/favicon.ico',
        MATCH_ROOM_URL: /^https:\/\/(www\.)?huya\.com\/(\w+)/,
        BASE_ROOM_URL: 'https://www.huya.com/%s',
    };

    public constructor(roomUrl: string) {
        super(roomUrl);
    }

    getBaseSite(): SiteJson {
        return HuYaLive.SITE;
    }

    public async refreshRoomData() {
        let body = await Http.request({url: this.roomUrl,'header': {Referer: 'https://www.huya.com'}}).catch(() => {
            throw `获取房间信息失败,网络异常,${HuYaLive.SITE.SITE_NAME}(${this.roomUrl})`;
        });
        let match_title = body.match(/<h1 id="J_roomTitle" title="(.*?)">(.*?)<\/h1>/);
        let match_nick = body.match(/<h3 class="host-name" title="(.*?)">(.*?)<\/h3>/);
        let match_head = body.match(/<img id="avatar-img" src="(.*?)" alt="(.*?)">/);
        body = body.replace(/&amp;/g, '&');
        let match_config = body.match(/hyPlayerConfig = ([^;]+);/);
        let match_room_info = body.match(/var TT_ROOM_DATA = (.*?);/);
        if (!match_title) {
            throw `获取房间信息失败,主播未开播或房间地址有误,${HuYaLive.SITE.SITE_NAME}(${this.roomUrl})`;
        }

        this.setTitle(match_title[1]);
        this.setNickName(match_nick[1]);
        this.setHeadIcon(match_head[1]);
        this.setCover(match_head[1]);
        let room = JSON.parse(match_room_info[1]);
        this.setRoomId(room['profileRoom']);
        this.roomUrl = HuYaLive.SITE.BASE_ROOM_URL.replace(/%s/, room['profileRoom']);
        let data = JSON.parse(match_config[1]);
        if (!data.stream) {
            this.setLiveStatus(false);
        } else {
            this.setLiveStatus(true);
        }
    }

    public async getLiveUrl() {
        let body = await Http.request({url: this.roomUrl}).catch(() => {
            throw `获取直播源信息失败,网络异常,${HuYaLive.SITE.SITE_NAME}(${this.roomUrl})`;
        });
        body = body.replace(/&amp;/g, 'A=========B');
        let match_config = body.match(/hyPlayerConfig = ([^;]+);/);
        let data = JSON.parse(match_config[1]);
        if (data.stream) {
            let urlList = data.stream.data[0].gameStreamInfoList;
            let rateList = data.stream.vMultiStreamInfo;
            let liveList = [];
            for (let i = 0; i < urlList.length; i++) {
                for (let j = 0; j < rateList.length; j++) {
                    let iBitRate = rateList[j].iBitRate;
                    iBitRate = iBitRate ? `_${iBitRate}` : '';
                    let url = urlList[i].sHlsUrl + '/' + urlList[i].sStreamName + iBitRate + '.' + urlList[i].sHlsUrlSuffix + '?' + urlList[i].sHlsAntiCode;
                    url = url.replace(/A=========B/g, '&amp;');
                    let item: StreamJson = {
                        quality: rateList[j].sDisplayName,
                        lineIndex: `${urlList[i].iLineIndex}`,
                        liveUrl: url
                    };
                    liveList.unshift(item);
                }
            }
            return liveList;
        } else {
            throw `获取直播源信息失败！主播未开播或房间地址有误,${HuYaLive.SITE.SITE_NAME}(${this.roomUrl})`;
        }
    }
}

export default HuYaLive;



