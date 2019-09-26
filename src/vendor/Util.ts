import fs from 'fs';
import path from 'path';
import Cache from './Cache';
class Util {
    public static mkdirsSync(dirname: string) {
        if (fs.existsSync(dirname)) {
            return true;
        } else {
            if (this.mkdirsSync(path.dirname(dirname))) {
                fs.mkdirSync(dirname);
                return true;
            }
        }
    }

    public static filterEmoji(str: string) {
        return str.replace(/\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDE4F]/g, "");
    }

    public static getSavePath(){
        let setting=Cache.getConfig();
        let savePath =path.join(process.cwd(), "resources/video/直播录制小助手视频");
        if(fs.existsSync(setting.savePath)) savePath=path.join(setting.savePath,'直播录制小助手视频');
        return savePath;
    }
    public static readFileList(dir:string, filesList:{}[]) {
        const files = fs.readdirSync(dir);
        files.forEach((item, index) => {
            let fullPath = path.join(dir, item);
            const stat = fs.statSync(fullPath);
            if (stat.isDirectory()) {      
                Util.readFileList(path.join(dir, item), filesList); 
            } else {
                let date=new Date(stat.atimeMs);
                let dateText = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
                let arr=dir.split('\\');
                let vo={mdate:arr.pop(),nickName:arr.pop(),siteName:arr.pop(),file:item,filePath:fullPath,size:`${(stat.size/1024/1024).toFixed(1)}MB`,date:dateText,time:stat.atimeMs};            
                filesList.push(vo);                     
            }        
        });
        return filesList;
    }
}

export default Util;