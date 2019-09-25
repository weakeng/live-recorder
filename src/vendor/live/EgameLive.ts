import Live from "./Live";
import {SiteJson, StreamJson} from "./Json";
import Http from "../Http";

class EgameLive extends Live {
    public static readonly SITE: SiteJson = {
        SITE_NAME: '企鹅电竞',
        SITE_CODE: 'EgameLive',
        SITE_ICON: 'https://egame.qq.com/favicon.ico',
        MATCH_ROOM_URL: /^http(s)?:\/\/egame\.qq\.com\/(\d+)/,
        BASE_ROOM_URL: 'https://egame.qq.com/%s',
    };

    constructor(roomUrl: string) {
        super(roomUrl);
    }

    async getLiveUrl() {
        let body = await Http.request({url: this.roomUrl}).catch((e) => {
            throw `获取直播源信息失败,网络异常,${EgameLive.SITE.SITE_NAME}(${this.roomUrl})`;
        });
        let match = body.match(/var playerInfo = (.*?);/);
        if (match[1]) {
            let arr = JSON.parse(match[1]);
            let liveList: Array<StreamJson> = [];
            arr.urlArray.forEach((vo: any) => {
                let item: StreamJson = {
                    quality: vo['desc'],
                    lineIndex: '主线路',
                    liveUrl: vo['playUrl'],
                };
                liveList.unshift(item);
            });
            return liveList;
        } else {
            throw `获取直播源信息失败！主播未开播或房间号有误,${EgameLive.SITE.SITE_NAME}(${this.roomUrl})`;
        }
    }

    async refreshRoomData() {
        let body = await Http.request({url: this.roomUrl}).catch((e) => {
            throw `获取房间信息失败,网络异常,${EgameLive.SITE.SITE_NAME}(${this.roomUrl})`;
        });
        let match_title = body.match(/title:"([^"]*)"/);
        let match_nick = body.match(/nickName:"([^"]*)"/);
        let match_isLive = /var playerInfo = (.*?);/.test(body);
        let match_faceUrl = body.match(/<img src="(.*?)" alt="profileInfo.nickName"/);
        let match_roomId = body.match(/pid:"(\d+)_/);
        // console.log(match_title, match_nick, match_isLive, match_faceUrl, match_roomId);
        if (match_title[1]) {
            this.setTitle(match_title[1]);
            this.setNickName(match_nick[1]);
            this.setHeadIcon((match_faceUrl[1]));
            this.setCover((match_faceUrl[1]));
            this.setRoomId(match_roomId[1]);
            this.setLiveStatus(match_isLive);
            this.roomUrl = EgameLive.SITE.BASE_ROOM_URL.replace(/%s/, match_roomId[1]);
        } else {
            throw `获取房间信息失败！主播未开播或房间号有误,${EgameLive.SITE.SITE_NAME}(${this.roomUrl})`;
        }

    }

    getBaseSite(): SiteJson {
        return EgameLive.SITE;
    }

}

export default EgameLive;