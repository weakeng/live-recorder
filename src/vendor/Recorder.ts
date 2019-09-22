import ffmpeg from 'fluent-ffmpeg';
import path from "path";

class Recorder {
    public static readonly STATUS_PAUSE=1;//暂停中
    public static readonly STATUS_RECORDING=2;//正在录制
    public static readonly STATUS_AWAIT_RECORD=3;//等待录制

    public onErr: (err: any) => void = function () {
    };
    public onEnd: () => void = function () {
    };
    public id: any;

    public constructor(id: any) {
        Recorder.init();
        this.id = id;
    }

    public static init() {
        const ffmpegPath = path.join(process.cwd(), "resources/bin/", "ffmpeg.exe");
        ffmpeg.setFfmpegPath(ffmpegPath);
    }

    public record(liveUrl: string, savePath: string) {
        const command = ffmpeg(liveUrl)
            .outputOptions(
                '-user-agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.86 Safari/537.36',
                '-c', 'copy',
                '-t', '180'
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
            .on('stderr', () => {
                // console.log(stderrLine);
                //todo 写入ffmpeg运行日志
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