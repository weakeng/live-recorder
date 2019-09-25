interface SiteJson {
    SITE_NAME: string;
    SITE_CODE: string;
    SITE_ICON: string;
    MATCH_ROOM_URL: RegExp;
    BASE_ROOM_URL: string;
}

interface StreamJson {
    'quality': string;
    'lineIndex': string;
    'liveUrl': string;
}

interface LiveInfoJson {
    siteName: string,
    siteIcon: string,
    nickName: string,
    headIcon: string,
    title: string,
    roomUrl: string,
    oldStatus: boolean,//上次检测直播状态
    liveStatus: boolean,//这次检测直播状态
    isAutoRecord: boolean,
    recordStatus: number,
    addTime: number,
}

interface settingJson {
    savePath: string,
    refreshTime: number,
    videoTime: number,
    notice: boolean,
}

export {SiteJson, StreamJson, LiveInfoJson,settingJson};

