import {SiteJson, StreamJson} from "./Json";
import Api from "./Api";

abstract class Live implements Api {

    public roomUrl: string = '';//房间地址
    protected roomId: number = 0;//真实房间号
    protected nickName: string = '';//主播昵称
    protected headIcon: string = '';//主播头像
    protected title: string = '';//直播标题
    protected cover: string = '';//直播封面
    protected liveStatus: boolean = false;//直播状态

    public constructor(roomUrl: string) {
        this.roomUrl = roomUrl;
    }

    abstract getLiveUrl(): any;

    abstract refreshRoomData(): void;

    abstract getBaseSite(): SiteJson;

    public setRoomId(roomId: number) {
        this.roomId = roomId;
    }

    public getRoomId() {
        return this.roomId;
    }

    public setNickName(nickName: string) {
        this.nickName = nickName;
    }

    public getNickName() {
        return this.nickName;
    }

    public setHeadIcon(headIcon: string) {
        this.headIcon = headIcon;
    }

    public getHeadIcon() {
        return this.headIcon;
    }

    public setTitle(title: string) {
        this.title = title;
    }

    public getTitle() {
        return this.title;
    }

    public setCover(cover: string) {
        this.cover = cover;
    }

    public getCover() {
        return this.cover;
    }

    public setLiveStatus(liveStatus: boolean) {
        this.liveStatus = liveStatus;
    }

    public getLiveStatus() {
        return this.liveStatus;
    }
}

export default Live;