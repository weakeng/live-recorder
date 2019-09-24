import fs from 'fs';
import path from 'path';

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


    public static mapDir(dir:any, callback:Function, finish:Function) {
        fs.readdir(dir, function (err, files) {
            if (err) {
                return false;
            }
            files.forEach((filename, index) => {
                let pathname = path.join(dir, filename);
                fs.stat(pathname, (err, stats) => { // 读取文件信息
                    if (err) {
                        console.log('获取文件stats失败');
                        return
                    }
                    if (stats.isDirectory()) {
                        Util.mapDir(pathname, callback, finish)
                    } else if (stats.isFile()) {
                        if (['.json', '.less'].includes(path.extname(pathname))) {  // 排除 目录下的 json less 文件
                            return
                        }
                        fs.readFile(pathname, (err, data) => {
                            if (err) {
                                return false;
                            }
                            callback && callback(data)
                        })
                    }
                });
                if (index === files.length - 1) {
                    finish && finish()
                }
            })
        })
    }
}

export default Util;