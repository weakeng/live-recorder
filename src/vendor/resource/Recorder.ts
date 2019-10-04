import ffmpeg from 'fluent-ffmpeg';
import path from "path";
import Cache from '../Cache';

// import process from "electron";
class Recorder {
    public static readonly STATUS_PAUSE = 1;//暂停中
    public static readonly STATUS_RECORDING = 2;//正在录制
    public static readonly STATUS_AWAIT_RECORD = 3;//等待录制

    public onErr: (err: any) => void = function () {
    };
    public onEnd: () => void = function () {
    };
    public onLog: (err: any) => void = function () {
    };
    public id: any;

    public constructor(id: any) {
        Recorder.init();
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

    public record(liveUrl: string, savePath: string) {
        let setting = Cache.getConfig();
        let time = setting.videoTime * 60;
        const command = ffmpeg(liveUrl)
            .outputOptions(
                '-c', 'copy',
                '-t', `${time}`
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
            throw '无法暂停此任务';
        }
    }
}

export default Recorder;