import fs from 'fs';
import path from 'path';
import {settingJson} from "@/vendor/live/Json";

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
            data = [];
        }
        return data;
    }

    public static writeConfig(config: settingJson) {
        this.set(Cache.CONFIG_FILE, config);
    }

    public static getConfig(): settingJson {
        return this.get(Cache.CONFIG_FILE);
    }

    public static writeRoomList(roomList: any) {
        for (let i = 0; i < roomList.length; i++) {
            if (roomList[i]['cmd']) roomList[i]['cmd'] = null;
        }
        this.set(Cache.ROOM_LIST_FILE, roomList);
    }

    public static readRoomList() {
        return this.get(Cache.ROOM_LIST_FILE);
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

    public static addRoom(siteName: string, siteIcon: string, nickName: string, headIcon: string, title: string, roomUrl: string, liveStatus: boolean, isAutoRecord: boolean, recordStatus: number, addTime: number) {
        let roomList = Cache.readRoomList();
        roomList.forEach((vo: any) => {
            if (vo['roomUrl'] === roomUrl) {
                return;
            }
        });
        let room = {
            'siteName': siteName,
            'nickName': nickName,
            'siteIcon': siteIcon,
            'headIcon': headIcon,
            'title': title,
            'roomUrl': roomUrl,
            'liveStatus': liveStatus,
            'isAutoRecord': isAutoRecord,
            'recordStatus': recordStatus,
            'addTime': addTime
        };
        roomList.push(room);
        Cache.writeRoomList(roomList);
    }
}

export default Cache;

