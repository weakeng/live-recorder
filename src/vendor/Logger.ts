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
                    }
                },
                categories: {
                    default: {appenders: ['dateFile'], level: 'ALL'}
                }
            }
        );
        Logger.log = log4js.getLogger('default');
        return Logger.log;
    }
}

export default Logger;

