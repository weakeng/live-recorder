import ffmpeg from 'fluent-ffmpeg';
import path from "path";

class Resource {
    public static readonly TYPE_VIDEO = 1;//点播资源
    public static readonly TYPE_LIVE = 2;//直播资源

    //ffmpeg -f concat -safe 0 -i 20191004~112515.txt  -c copy output.mp4
    public static concat(listText: string, savePath: string, onEnd: Function, onErr: Function) {
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
        const command = ffmpeg(listText)
            .inputOptions('-f', 'concat', '-safe', '0')
            .outputOptions('-c', 'copy')
            .output(savePath)
            .on('error', (err) => {
                //录制失败通知
                onErr(err);
            }).on('end', (err) => {
                //录制结束通知
                onEnd();
            });
        command.run();
        return () => {
            //@ts-ignore
            command.ffmpegProc.stdin.write('q');
        };
    }
}

export default Resource;