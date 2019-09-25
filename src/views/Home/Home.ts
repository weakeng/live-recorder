import Vue from "vue";
import LiveFactory from "../../vendor/live/LiveFactory";
import Recorder from "../../vendor/Recorder";
import path from "path";
import Cache from "../../vendor/Cache";
import Util from "../../vendor/Util";
import Logger from "../../vendor/Logger";
import Live from "../../vendor/live/Live";
import {LiveInfoJson, StreamJson} from "@/vendor/live/Json";
import fs from "fs";
import store from "@/store";


export default Vue.extend({
    mounted: function () {
        this.siteCode = this.siteNameList[0]["siteCode"];
        this.refreshRoomData();
        console.log(this.liveInfoList, this.cmdList);
    },
    data() {
        return {
            siteNameList: LiveFactory.getAllSiteName(),
            siteAddress: '',
            roomNumber: '',
            liveInfoList: Cache.readRoomList(),
            addLive_method: "输入网址",
            siteCode: '',
            modal_add_live: false,
            logger: Logger.init(),
            // @ts-ignore
            liveInfoHeader: this.tableHeadInit(),
        };
    },
    beforeDestroy() {
        Cache.writeRoomList(this.liveInfoList);
    },
    methods: {
        async recordRoomUrl(index: number, roomUrl: string) {
            if (this.cmdList[roomUrl]) {
                this.logger.error('重复录制了...', roomUrl);
                return;
            }

            let cmdNum = 0;
            for (let index in this.cmdList) {
                if (this.cmdList[index]) cmdNum++;
            }

            if (cmdNum > 10) {
                this.liveInfoList[index].isAutoRecord = false;
                this.liveInfoList[index].recordStatus = false;
                this.showInfo('最多10个任务，达到录制上限自动暂停。。。');
                this.logger.error('最多10个任务，达到录制上限自动暂停。。。...', roomUrl);
                return;
            }

            let list: Array<StreamJson> = [];
            let live: Live;
            try {
                live = LiveFactory.getLive(roomUrl);
                await live.refreshRoomData();
                if (!live.getLiveStatus()) {
                    this.showError('主播暂未开播!');
                    return;
                }
                list = await live.getLiveUrl();
            } catch (error) {
                this.logger.error('获取直播源失败', error);
                this.showError('获取直播源失败');
                return;
            }
            let recorder = new Recorder(roomUrl);
            recorder.onErr = err => {
                this.cmdList[recorder.id] = null;
                let flag = false;
                for (let i = 0; i < this.liveInfoList.length; i++) {
                    if (this.liveInfoList[i].roomUrl == recorder.id) {
                        this.liveInfoList[i]['recordStatus'] = Recorder.STATUS_PAUSE;
                        this.showError(`${live.getNickName()} 录制出错了。。。`);
                        this.logger.error(`${live.getNickName()} ${recorder.id} 录制出错了。。。`, err);
                        flag = true;
                        break;
                    }
                }
                if (!flag) {
                    this.logger.info(`recorder.onErr ${live.getNickName()} ${recorder.id} 可能已经被删除。。。`);
                }
            };
            recorder.onEnd = () => {
                this.cmdList[recorder.id] = null;
                let flag = false;
                for (let i = 0; i < this.liveInfoList.length; i++) {
                    if (this.liveInfoList[i].roomUrl == recorder.id) {
                        if (this.liveInfoList[i]['recordStatus'] == Recorder.STATUS_RECORDING) {
                            this.liveInfoList[i]['recordStatus'] = Recorder.STATUS_AWAIT_RECORD;
                            this.logger.info(`${live.getNickName()} ${recorder.id} 录制完成。。。切换为待录制状态`);
                            this.showInfo(`${live.getNickName()} 录制完成,等待自动录制中。。。`);
                            return;
                        }
                        this.logger.info(`${live.getNickName()} ${recorder.id} 录制完成。。。`);
                        this.showInfo(`${live.getNickName()} 录制完成`);
                        flag = true;
                        break;
                    }
                }
                if (!flag) {
                    this.logger.info(`recorder.onEnd ${live.getNickName()} ${recorder.id} 可能已经被删除。。。`);
                }
            };
            let date = new Date();
            let $siteName = live.getBaseSite().SITE_NAME;
            let $nickName = Util.filterEmoji(live.getNickName());
            let $date = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
            let savePath = path.join(process.cwd(), "resources/video", $siteName, $nickName, $date);
            let fileName = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}_${date.getHours()}-${date.getMinutes()}-${date.getSeconds()}.mp4`;
            let res = Util.mkdirsSync(savePath);
            if (!res) {
                this.logger.error("创建下载目录失败", savePath);
                this.showError("创建下载目录失败");
                return;
            }
            this.liveInfoList[index]['recordStatus'] = Recorder.STATUS_RECORDING;
            savePath = path.join(process.cwd(), "resources/video", $siteName, $nickName, $date, fileName);
            this.showInfo(`${live.getNickName()} 开始录制。。。`);
            this.logger.info(`${live.getNickName()} ${roomUrl} 开始录制。。。`);
            this.cmdList[roomUrl] = recorder.record(list[0]["liveUrl"], savePath); //以roomUrl为唯一索引cmd数组
        },
        refreshRoomData() {
            let id = new Date().getSeconds();
            let timer = this.$store.state.timer;
            // @ts-ignore
            if (!timer) {
                let interval = setInterval(async () => {
                    // this.showInfo(`执行定时器:${id}`);
                    // this.logger.debug(`执行定时器:${id}`);
                    Cache.writeRoomList(this.liveInfoList);
                    Promise.all(this.liveInfoList.map(async (room: LiveInfoJson, index: number) => {
                        // this.logger.info(`Promise.all :${room.roomUrl} ${index}`);
                        let live = LiveFactory.getLive(room.roomUrl);
                        try {
                            await live.refreshRoomData();
                            room.nickName = live.getNickName();
                            room.headIcon = live.getHeadIcon();
                            room.title = live.getTitle() || room.title;
                            room.oldStatus = room.liveStatus;
                            room.liveStatus = live.getLiveStatus();
                        } catch (error) {
                            this.logger.error({msg: '刷新房间信息失败！', roomUrl: room.roomUrl, error: error});
                        }
                        if (room['isAutoRecord'] && room['recordStatus'] == Recorder.STATUS_PAUSE) {
                            room['recordStatus'] = Recorder.STATUS_AWAIT_RECORD;
                        }
                        if (!room['liveStatus'] && room['recordStatus'] == Recorder.STATUS_RECORDING) {
                            room['recordStatus'] = Recorder.STATUS_PAUSE;
                            this.logger.info(`${room.nickName} ${room['roomUrl']} 自动暂停`);
                            try {
                                Recorder.stop(this.cmdList[room['roomUrl']]);
                            } catch (e) {
                                this.logger.error(`自动暂停失败`, room.nickName, e);
                            }
                        }
                        if (room['recordStatus'] == Recorder.STATUS_AWAIT_RECORD && room['liveStatus']) {
                            if (this.cmdList[room['roomUrl']]) {
                                this.showError(`${room.nickName} 重复录制了。。。`);
                                this.logger.error(`${room.nickName} 重复录制了。。。`);
                            } else {
                                this.recordRoomUrl(index, room['roomUrl']).then().catch((err) => {
                                    this.showError(`${room.nickName} 录制失败。。。`);
                                    this.logger.error(room.nickName + ' 录制失败', err);
                                });
                            }
                        }
                        if (!room.oldStatus && room.liveStatus) {
                            const notification = {
                                title: `${room.siteName}(${room.nickName})开播了`,
                                body: '主播开播了，快去给心仪的主播录制吧！',
                                icon: room.headIcon,
                                silent: true,
                                requireInteraction: true,
                                sticky: true,
                            };
                            new Notification(notification.title, notification);
                            this.logger.debug(`${room.siteName}(${room.nickName})开播了`);
                        } else if (room.oldStatus && !room.liveStatus) {
                            const notification = {
                                title: `${room.siteName}(${room.nickName})下播了`,
                                body: '主播下播了，快去看看自己录制的视频吧！',
                                icon: room.headIcon,
                                silent: true,
                                requireInteraction: true,
                                sticky: true,
                            };
                            new Notification(notification.title, notification);
                            this.logger.debug(`${room.siteName}(${room.nickName})下播了`);
                        }
                    })).then(() => {
                    }).catch((err) => {
                        this.logger.info(`Promise.all : error `, err);
                    });
                }, 10000);
                store.commit('setTimer', interval);
            }
        },
        remove(index: number) {
            if (confirm("确定要删除该任务吗")) {
                this.liveInfoList.splice(index, 1);
                Cache.writeRoomList(this.liveInfoList);
            }
        },

        async sureAddLive() {
            let live: Live;
            if (this.addLive_method === "输入网址") {
                try {
                    live = LiveFactory.getLive(this.siteAddress);
                } catch (error) {
                    this.showError(error);
                    this.logger.error(error);
                    return;
                }
            } else if (this.addLive_method === "输入房间号") {
                try {
                    live = LiveFactory.getLiveByRoomId(this.siteCode, this.roomNumber);
                } catch (error) {
                    this.showError(error);
                    this.logger.error(error);
                    return;
                }
            } else {
                this.showError("出错了。。。");
                this.logger.error('出错了。。。');
                return;
            }
            try {
                await live.refreshRoomData();
                let item: LiveInfoJson = {
                    siteName: live.getBaseSite().SITE_NAME,
                    siteIcon: live.getBaseSite().SITE_ICON,
                    nickName: live.getNickName(),
                    headIcon: live.getHeadIcon(),
                    title: live.getTitle(),
                    roomUrl: live.roomUrl,
                    oldStatus: live.getLiveStatus(),
                    liveStatus: live.getLiveStatus(),
                    isAutoRecord: false,
                    recordStatus: Recorder.STATUS_PAUSE,
                    addTime: new Date().getTime(),
                };
                // console.log(live);
                for (let i = 0; i < this.liveInfoList.length; i++) {
                    if (this.liveInfoList[i].roomUrl === live.roomUrl) {
                        this.showInfo("该主播已存在。。。");
                        return;
                    }
                }
                this.liveInfoList.unshift(item);
                Cache.writeRoomList(this.liveInfoList);
                //@ts-ignore
                this.cmdList[live.roomUrl] = null;
            } catch (error) {
                this.logger.error(error);
                this.showError(error);
            }
            this.siteAddress = '';
            this.roomNumber = '';
        },
        cancelAddLive() {
            // console.log("Clicked cancel");
        },
        tableHeadInit(): Array<any> {
            return [
                {
                    title: "直播平台",
                    align: "center",
                    key: "siteName",
                    width: 150,
                    // @ts-ignore
                    filters: this.getSiteNameFilters(),
                    filterMultiple: false,
                    filterMethod(value: any, row: any) {
                        return value === row.siteName;
                    },
                    render: (h: any, params: any) => {
                        return h("div", {attrs: {style: ""}}, [
                            h("img", {
                                props: {
                                    type: "primary",
                                    size: "small"
                                },
                                attrs: {
                                    src: params.row.siteIcon,
                                    style:
                                        "border-radius:50%;width: 40px;height: 40px;vertical-align: middle;margin-right:10px"
                                },
                                style: {}
                            }),
                            h("strong", params.row.siteName)
                        ]);
                    }
                },
                {
                    title: "主播名称",
                    align: "left",
                    key: "nickName",
                    render: (h: any, params: any) => {
                        return h("div", {attrs: {style: ""}}, [
                            h("img", {
                                props: {
                                    type: "primary",
                                    size: "small"
                                },
                                attrs: {
                                    src: params.row.headIcon,
                                    style:
                                        "border-radius:50%;width: 40px;height: 40px;vertical-align: middle;margin-right:10px;cursor: pointer;"
                                },
                                style: {},
                                on: {
                                    click: () => {
                                        require("electron").shell.openExternal(params.row.roomUrl);
                                    }
                                }
                            }),
                            h("strong", params.row.nickName, {attrs: {style: 'cursor:pointer'},})
                        ]);
                    }
                },
                {
                    title: "直播标题",
                    align: "left",
                    key: "title",
                    width: 180,
                },
                {
                    title: "直播状态",
                    width: 112,
                    align: "center",
                    key: "liveStatus",
                    filters: [{label: '直播中', value: true}, {label: '未开播', value: false}],
                    filterMultiple: false,
                    filterMethod(value: any, row: any) {
                        return value === row.liveStatus;
                    },
                    render: (h: any, params: any) => {
                        // @ts-ignore
                        return this.renderLiveStatus(h, params);
                    }
                },
                {
                    title: "自动录制",
                    align: "center",
                    width: 95,
                    key: "isAutoRecord",

                    render: (h: any, params: any) => {
                        return h('i-switch',
                            {
                                props: {
                                    type: "info",
                                    value: params["row"]["isAutoRecord"] === true
                                },
                                on: {
                                    "on-change": (status: any) => {
                                        //@ts-ignore
                                        this.liveInfoList[params.index]['isAutoRecord'] = status;
                                        //@ts-ignore
                                        Cache.saveRoom(params['row']['roomUrl'], {'isAutoRecord': status});
                                    }
                                }
                            })
                    }
                },
                {
                    title: "操作",
                    key: "action",
                    width: 125,
                    align: "center",
                    render: (h: any, params: any) => {
                        // @ts-ignore
                        return this.renderAction(h, params);
                    }
                }
            ]
        },
        getSiteNameFilters() {
            let list = LiveFactory.getAllSiteName();
            //@ts-ignore
            let fiterList = [];
            list.forEach(vo => {
                fiterList.push({
                    label: vo.siteName,
                    value: vo.siteName
                });
            });
            //@ts-ignore
            return fiterList;
        },
        renderLiveStatus(h: any, params: any) {
            if (params.row.liveStatus) {
                return h("Icon", {
                    props: {
                        type: "ios-checkmark-circle",
                        size: 24,
                        color: "#00cc66"
                    }
                });
            } else {
                return h("Icon", {
                    props: {
                        type: "ios-close-circle",
                        size: 24,

                        color: "#ff3300"
                    }
                });
            }
        },
        renderAction(h: any, params: any) {
            //@ts-ignore
            let recording = this.liveInfoList[params.index]['recordStatus'] == Recorder.STATUS_RECORDING;
            return h("div", [
                h("Button", {
                    props: {
                        type: "primary",
                        size: "small",
                        icon: recording ? "" : "md-play",
                        loading: recording,
                        shape: "circle"
                    },
                    style: {
                        marginRight: "5px",
                        // display: params.row.liveStatus ? 'inline-block' : 'none'
                    },
                    on: {
                        click: async () => {
                            if (recording) return;
                            // @ts-ignore
                            if (this.cmdList[params['row']['roomUrl']]) {
                                this.showError(`${params['row']['nickName']} 重复录制了。。。`);
                                this.logger.error(`重复录制了。。。`, params['row']);
                            }
                            await this.recordRoomUrl(params.index, params['row']['roomUrl']);
                        }
                    }
                }),
                h("Button", {
                    props: {
                        type: "warning",
                        size: "small",
                        icon: "ios-pause",
                        shape: "circle",
                        disabled: !recording
                    },
                    style: {
                        marginRight: "5px",
                        display: recording ? 'inline-block' : 'none'
                    },
                    on: {
                        click: () => {
                            this.logger.info(`${params.row.nickName} 暂停中。。。`);
                            try {
                                Recorder.stop(this.cmdList[params.row.roomUrl]);
                                this.liveInfoList[params.index]['recordStatus'] = Recorder.STATUS_PAUSE;
                                this.liveInfoList[params.index]['isAutoRecord'] = false;
                            } catch (error) {
                                this.showError("无法暂停");
                                this.logger.error(`${params.row.nickName} 暂停出错了。。。`, error);
                            }
                        }
                    }
                }),
                h("Button", {
                    props: {
                        type: "error",
                        size: "small",
                        shape: "circle",
                        icon: "ios-trash",
                        disabled: recording
                    },
                    style: {
                        marginRight: "5px",
                        display: recording ? 'none' : 'inline-block'
                    },
                    on: {
                        click: () => {
                            this.remove(params.index);
                        }
                    }
                }),
                h("Button", {
                    props: {
                        type: "warning",
                        size: "small",
                        shape: "circle",
                        icon: "ios-folder",
                    },
                    style: {
                        marginRight: "5px",
                    },
                    on: {
                        click: () => {
                            const {shell} = require("electron").remote;
                            let $siteName = params.row.siteName;
                            let $nickName = Util.filterEmoji(params.row.nickName);
                            let savePath = path.join(process.cwd(), "resources/video", $siteName, $nickName);
                            if (fs.existsSync(savePath)) {
                                shell.showItemInFolder(savePath);
                            } else {
                                this.showInfo("录制文件为空");
                            }

                        }
                    }
                })
            ]);
        },
        showInfo(msg: any) {
            msg = typeof msg == "string" ? msg : JSON.stringify(msg);
            this.$Notice.info({
                title: '信息',
                desc: msg
            });
        },
        showError(msg: any) {
            msg = typeof msg == "string" ? msg : JSON.stringify(msg);
            this.$Notice.error({
                title: '信息',
                desc: msg
            });
        }
    }
});

