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
    liveStatus: boolean,
    isAutoRecord: boolean,
    recordStatus: number,
    addTime: number,
}

export {SiteJson, StreamJson,LiveInfoJson};

