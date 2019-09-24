import path from 'path';
import * as log4js from 'log4js';

class Logger {
    private static log: log4js.Logger;

    public static init() {
        if (Logger.log) return Logger.log;
        log4js.configure(
            {
                appenders: {
                    dateFile: {
                        type: 'dateFile',
                        alwaysIncludePattern: true,
                        filename: path.join(process.cwd(), "resources/log/date/"),
                        pattern: "yyyy-MM-dd.log",
                    },
                    // 'email': {
                    //     type: '@log4js-node/smtp',
                    //     transport: {
                    //         plugin: 'smtp',
                    //         options: {
                    //             host: 'smtp.163.com',
                    //             port: 25,
                    //             auth: {
                    //                 user: 'qq976955017@163.com',
                    //                 pass: 'hellohao123',
                    //             }
                    //         }
                    //     },
                    //     path: path.join(process.cwd(), "resources/log/date"),
                    //     filename: "latest.log",
                    //     recipients: '976955017@qq.com',
                    //     subject: '直播录制小助手,运行错误日志定时发送',
                    //     attachment: {
                    //         enable: true,
                    //         filename: path.join(process.cwd(), "resources/log/date/latest.log"),
                    //         message: '打开附件，查看运行错误日志'
                    //     },
                    //     sendInterval: 120
                    // }

                },
                categories: {
                    default: {appenders: ['dateFile'], level: 'all'},
                }
            }
        );

        Logger.log = log4js.getLogger('default');
        return Logger.log;
    }
}

export default Logger;

