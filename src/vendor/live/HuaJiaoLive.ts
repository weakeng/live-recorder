import Live from "./Live";
import Http from "../Http";
import {SiteJson, StreamJson} from "../Json";

class HuaJiaoLive extends Live {
    public static readonly SITE: SiteJson = {
        SITE_NAME: '花椒直播',
        SITE_CODE: 'HuaJiaoLive',
        SITE_ICON: 'https://www.huajiao.com/favicon.ico',
        MATCH_ROOM_URL: /^https:\/\/(www\.)?huajiao\.com\/user\/(\d+)/,
        BASE_ROOM_URL: 'https://www.huajiao.com/user/%s',
    };
    static readonly ROOM_INFO_URL = "https://www.huajiao.com/user/%s";

    private channel: string = '';
    private sn: string = '';

    async getLiveUrl() {
        let sid = `uuid${new Date().getTime()}`, ts = Math.ceil(new Date().getTime() / 1000);
        let url = `http://g2.live.360.cn/liveplay?stype=flv&channel=${this.channel}&bid=huajiao&sn=${this.sn}&sid=${sid}&_rate=xd&ts=${ts}&r=${sid}&_ostype=flash&_delay=0&_sign=null&_ver=13`;
        let body = await Http.request({
            url: url,
            header: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.100 Safari/537.36',
                'referer': 'https://www.huajiao.com',
            }
        }).catch(() => {
            throw `获取直播源信息失败,网络异常,${HuaJiaoLive.SITE.SITE_NAME}(${this.roomUrl})`;
        });

        var buffer = Buffer.from(body.substring(0, 3) + body.substring(6), 'base64');
        try {
            var res = JSON.parse(buffer.toString());
            let liveList = [];
            let item: StreamJson = {
                quality: '超清',
                lineIndex: '主线路',
                liveUrl: res['main'],
            };
            liveList.push(item);
            return liveList;
        } catch (e) {
            throw `获取直播源信息失败！无法解析,主播未开播或房间地址有误,${HuaJiaoLive.SITE.SITE_NAME}(${this.roomUrl}) ${e}`;
        }
    }

    async refreshRoomData() {
        let match_room_id = this.roomUrl.match(HuaJiaoLive.SITE.MATCH_ROOM_URL);
        if (match_room_id && match_room_id[2]) {
            this.setRoomId(parseInt(match_room_id[2]));
            let url = `https://webh.huajiao.com/User/getUserFeeds?_callback=callback&uid=${this.roomId}&fmt=jsonp`;
            let body = await Http.request({
                url: url,
                header: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.100 Safari/537.36',
                    'referer': this.roomUrl,
                }
            }).catch(() => {
                throw `获取房间信息失败,网络异常,${HuaJiaoLive.SITE.SITE_NAME}(${this.roomUrl})`;
            });
            let title ='';
            let isLive=false;
            try {
                let jsonStr = body.match(/callback\((.*?)\)/);
                let res = JSON.parse(jsonStr[1]);
                isLive = res['data']['feeds'][0]['type'] && res['data']['feeds'][0]['type'] === 1;
                body = await Http.request({
                    url: this.roomUrl,
                    header: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.100 Safari/537.36',
                        'referer': this.roomUrl,
                    }
                }).catch(() => {
                    throw `获取房间信息失败,网络异常,${HuaJiaoLive.SITE.SITE_NAME}(${this.roomUrl})`;
                });
                title = isLive ? res['data']['feeds'][0]['feed']['title'] : '';
                this.channel = isLive ? res['data']['feeds'][0]['relay']['channel'] : '';
                this.sn = isLive ? res['data']['feeds'][0]['feed']['sn'] : '';
            } catch (e) {
                throw `获取房间信息失败！主播未开播或房间号有误,${HuaJiaoLive.SITE.SITE_NAME}(${this.roomUrl}) error:${e}`;
            }
            let match_nick = body.match(/title>(.*?)的主页/);
            let match_icon = body.match(/"avatar":"(.*?)"/);
            if (match_nick && match_nick[1]) {
                this.setNickName(unescape(match_nick[1]))
                    .setTitle(title)
                    .setHeadIcon(match_icon[1])
                    .setCover(match_icon[1])
                    .setLiveStatus(isLive);
            } else {
                throw `获取房间信息失败！房间号有误,${HuaJiaoLive.SITE.SITE_NAME}(${this.roomUrl})`;
            }
        } else {
            throw `获取房间信息失败！主播未开播或房间号有误,${HuaJiaoLive.SITE.SITE_NAME}(${this.roomUrl})`;
        }
    }

    getBaseSite(): SiteJson {
        return HuaJiaoLive.SITE;
    }
}

export default HuaJiaoLive;