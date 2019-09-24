import Live from "./Live";
import Http from "../Http";
import { SiteJson, StreamJson } from "./Json";
// import Logger from "@/vendor/Logger";

class HuaJiaoLive extends Live {
    public static readonly SITE: SiteJson = {
        SITE_NAME: '花椒直播',
        SITE_CODE: 'HuaJiaoLive',
        SITE_ICON: 'https://www.huajiao.com/favicon.ico',
        MATCH_ROOM_URL: /^https:\/\/(www\.)?huajiao\.com/,
        BASE_ROOM_URL: 'https://www.huajiao.com/i/%s',
    }
    static readonly API_LIVE_INFO = "http://rpc.paomianfan.com:27020/?action=videoUrl&roomUrl=ROOM_URL&roomId=ROOM_ID";
    static readonly ROOM_INFO_URL = "https://www.huajiao.com/user/%s";

    async getLiveUrl() {
        let roomUrl = HuaJiaoLive.ROOM_INFO_URL.replace("/%s/g", `${this.roomId}`);
        let url = HuaJiaoLive.API_LIVE_INFO.replace(/ROOM_URL/, roomUrl).replace(/ROOM_ID/, `${this.roomId}`);
        let res = await Http.request(
            {
                url: url,
                header: {
                    'user-agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 10_3_1 like Mac OS X) AppleWebKit/603.1.30 (KHTML, like Gecko) Version/10.0 Mobile/14E304 Safari/602.1',
                }
            }).catch(() => {
                throw `获取直播源信息失败！网络异常,${HuaJiaoLive.SITE.SITE_NAME}(${this.roomUrl})`;
            });
        if (res && res['error'] == 200 && res['data'] && res['data']['videoUrl']) {
            let liveList = [];
            let item: StreamJson = {
                quality: '超清',
                lineIndex: '主线路',
                liveUrl: res['data']['videoUrl'],
            };
            liveList.push(item);
            //todo 缓存处理
            return liveList;
        } else {
            throw `获取直播源信息失败！主播未开播或房间地址有误,${HuaJiaoLive.SITE.SITE_NAME}(${this.roomUrl}) ` + JSON.stringify(res);
        }
    }

    async refreshRoomData() {
        let body = await Http.request({
            url: this.roomUrl,
            header: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.100 Safari/537.36',
                'referer': 'https://www.huajiao.com',
            }
        }).catch(() => {
            throw `获取房间信息失败,网络异常,${HuaJiaoLive.SITE.SITE_NAME}(${this.roomUrl})`;
        });
        let match_id = body.match(/<span class="js-author-id">(\d+)<\/span>/);
        let match_nick = body.match(/<h3>(.*?)<\/h3>/);
        let match_icon = body.match(/<img src="http:\/\/image\.huajiao\.com\/(.*?)"\/>/);
        // Logger.init().debug(body);
        if (match_id && match_id[1]) {
            let icon = `http://image.huajiao.com/${match_icon[1]}`;
            this.setTitle('');
            this.setNickName(match_nick[1]);
            this.setHeadIcon(icon);
            this.setCover(icon);
            this.setRoomId(match_id[1]);
            this.setLiveStatus(true);
            this.roomUrl = HuaJiaoLive.SITE.BASE_ROOM_URL.replace(/%s/, match_id[1]);
        } else {
            throw `获取房间信息失败！主播未开播或房间号有误,${HuaJiaoLive.SITE.SITE_NAME}(${this.roomUrl})`;
        }
    }

    getBaseSite(): SiteJson {
        return HuaJiaoLive.SITE;
    }
}

export default HuaJiaoLive;