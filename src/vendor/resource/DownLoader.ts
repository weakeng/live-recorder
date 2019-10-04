import ffmpeg from 'fluent-ffmpeg';
import path from "path";
import Cache from '../Cache';

class DownLoader {

    public static readonly STATUS_PAUSE = 11;//暂停中
    public static readonly STATUS_DOWNLOAD = 12;//正在下载
    public static readonly STATUS_FINISH = 13;//下载完成

    public onErr: (err: any) => void = function () {
    };
    public onEnd: () => void = function () {
    };
    public onLog: (err: any) => void = function () {
    };
    public id: string;


    public constructor(id: any) {
        DownLoader.init();
        this.id = id;
    }


    public static init() {
        let ffmpegPath = '';
        switch (process.platform) {
            case 'win32':
                ffmpegPath = path.join(process.cwd(), "resources/bin/win32/", "ffmpeg.exe");
                break;
            case 'linux':
                ffmpegPath = path.join(process.cwd(), "resources/bin/linux/", "ffmpeg");
                break;
            case 'darwin':
                ffmpegPath = path.join(process.cwd(), "resources/bin/darwin/", "ffmpeg");
                break;
        }
        ffmpeg.setFfmpegPath(ffmpegPath);
    }

    public run(videoUrl: string, savePath: string, referer: string = '') {
        let setting = Cache.getConfig();
        let time = setting.videoTime * 60;
        const command = ffmpeg(videoUrl)
            .inputOption('-user-agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.86 Safari/537.36',
                '-headers', `referer: ${referer}`)
            .outputOptions(
                '-c', 'copy'
            )
            .output(savePath)
            .on('error', (err) => {
                //录制失败通知
                this.onErr(err);
            })
            .on('end', () => {
                //录制结束通知
                this.onEnd();
            })
            .on('stderr', (stderrLine) => {
                this.onLog(stderrLine);
            });
        command.run();
        return command;
    }


    public static stop(command: any) {
        if (command) {
            // console.log(command);
            command.ffmpegProc && command.ffmpegProc.stdin.write('q')
        } else {
            throw '无法中断此任务';
        }
    }
}

export default DownLoader;