import fs from 'fs';
import path from 'path';

class Util {
    public static mkdirsSync(dirname:string) {
        if (fs.existsSync(dirname)) {
            return true;
        } else {
            if (this.mkdirsSync(path.dirname(dirname))) {
                fs.mkdirSync(dirname);
                return true;
            }
        }
    }

    public static filterEmoji(str:string) {
        return str.replace(/\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDE4F]/g, "");
    }
}

export default Util;