import fs from 'fs';
import path from 'path';
import {settingJson, LiveInfoJson} from "@/vendor/live/Json";
import Util from './Util';
import Recorder from "@/vendor/Recorder";

class Cache {
    static readonly ROOM_LIST_FILE = path.join(process.cwd(), "resources/cache/", "room_list.json");
    static readonly CONFIG_FILE = path.join(process.cwd(), "resources/cache/", "config.json");

    public static set(fileName: string, data: any) {
        fs.writeFileSync(fileName, JSON.stringify(data));
    }

    public static get(fileName: string) {
        let data;
        if (fs.existsSync(fileName)) {
            data = fs.readFileSync(fileName, 'utf-8');
            data = JSON.parse(String(data)) || []
        } else {
            Util.mkdirsSync(path.join(process.cwd(), "resources/cache"));
            data = [];
        }
        return data;
    }

    public static writeConfig(config: settingJson) {
        this.set(Cache.CONFIG_FILE, config);
    }

    public static getConfig(): settingJson {
        let data: settingJson;
        if (fs.existsSync(Cache.CONFIG_FILE)) {
            let str = fs.readFileSync(Cache.CONFIG_FILE, 'utf-8');
            data = JSON.parse(String(str)) || []
        } else {
            data = {
                "savePath": path.join(process.cwd(), "resources/video"),
                "refreshTime": 10,
                "videoTime": 20,
                "notice": true
            };
            Util.mkdirsSync(data.savePath);
            Util.mkdirsSync(path.join(process.cwd(), "resources/cache"));
            this.set(Cache.CONFIG_FILE, data);
        }
        return data;
    }

    public static writeRoomList(roomList: any) {
        for (let i = 0; i < roomList.length; i++) {
            if (roomList[i]['cmd']) roomList[i]['cmd'] = null;
        }
        this.set(Cache.ROOM_LIST_FILE, roomList);
    }

    public static readRoomList() {
        let list = this.get(Cache.ROOM_LIST_FILE);
        list.forEach((item: LiveInfoJson) => {
            item.liveStatus = false;
            item.oldStatus = false;
            item.recordStatus = Recorder.STATUS_PAUSE;
        });
        return list;
    }

    public static saveRoom(roomUrl: string, _roomOption: {}) {
        let roomOpt = {};
        let key_match = /siteName|siteIcon,nickName|headIcon|title|liveStatus|isAutoRecord|recordStatus/;
        for (let vo in _roomOption) {
            if (key_match.test(vo)) {
                //@ts-ignore
                roomOpt[vo] = _roomOption[vo];
            }
        }
        let roomList = Cache.readRoomList();
        for (let i = 0; i < roomList.length; i++) {
            if (roomUrl == roomList[i]['roomUrl']) {
                roomList[i] = Object.assign(roomList[i], roomOpt);
                Cache.writeRoomList(roomList);
                return;
            }
        }
    }
}

export default Cache;

