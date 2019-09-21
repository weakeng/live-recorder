import fs from 'fs';
import path from 'path';
class Cache {
    static readonly ROOM_LIST_FILE=path.join(process.cwd(), "resources/cache/", "room_list.json");
    public static set(fileName: string, data: any) {
        fs.writeFileSync(fileName, JSON.stringify(data));
    }
    public static get(fileName: string) {
        let data;
        if (fs.existsSync(fileName)) {
            data = fs.readFileSync(fileName, 'utf-8'); 
            data = JSON.parse(String(data)) || []
        }
        else {
            data = [];
        }
        return data;
    }
    public static writeRoomList(roomList:any) {
        for(let i=0;i<roomList.length;i++){
            if(roomList[i]['cmd']) roomList[i]['cmd']=null;
        }
        this.set(Cache.ROOM_LIST_FILE,roomList);
    }
    public static readRoomList() {
        return this.get(Cache.ROOM_LIST_FILE);
    }
}
export default Cache;