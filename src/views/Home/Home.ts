import Vue from "vue";
import LiveFactory from "../../vendor/live/LiveFactory";
import Recorder from "../../vendor/Recorder";
import path from "path";
import Cache from "../../vendor/Cache";
import Util from "../../vendor/Util";
import Logger from "../../vendor/Logger";
import Live from "../../vendor/live/Live";

export default Vue.extend({
    mounted: function () {
        this.refreshRoomData();
        this.siteCode = this.siteNameList[0]["siteCode"];
    },
    data() {
        return {
            siteNameList: LiveFactory.getAllSiteName(),
            siteAddress: '',
            roomNumber: '',
            liveInfoList: Cache.readRoomList(),
            addLive_method: "输入网址",
            siteCode: '',
            cmdList: {}, //以roomUrl为唯一索引cmd数组
            modal_add_live: false,
            logger: Logger.init(),
            // @ts-ignore
            liveInfoHeader: this.tableHeadInit(),
        };
    },

    methods: {
        async recordRoomUrl(index: number, roomUrl: string) {
            // @ts-ignore
            if (this.cmdList[roomUrl]) {
                return;
            }
            let list: Array<any> = [];
            let live: Live;
            try {
                live = LiveFactory.getLive(roomUrl);
                await live.refreshRoomData();
                list = await live.getLiveUrl();
            } catch (error) {
                this.logger.error('获取直播源失败', error);
                this.showError('获取直播源失败');
                return;
            }
            let recorder = new Recorder(roomUrl);
            recorder.onErr = err => {
                this.liveInfoList.forEach((item: any) => {
                    if (item.roomUrl == roomUrl) {
                        item['recordStatus'] = Recorder.STATUS_PAUSE;
                    }
                });
                Cache.saveRoom(roomUrl, {'recordStatus': Recorder.STATUS_PAUSE});
                this.showError(`${live.getNickName()} 录制出错了。。。`);
                this.logger.error(`${live.getNickName()} ${recorder.id} 录制出错了。。。`, err);

                try {
                    // @ts-ignore
                    Recorder.stop(this.cmdList[recorder.id]);
                } catch (e) {
                    this.showError(`${live.getNickName()} 录制出错后自动暂停出错了`);
                    this.logger.error(`${live.getNickName()} ${recorder.id} 录制出错后自动暂停出错了`, e);
                }
                // @ts-ignore
                this.cmdList[recorder.id] = null;
            };
            recorder.onEnd = () => {
                let isAuto = false;
                this.liveInfoList.forEach((item: any) => {
                    if (item.roomUrl == roomUrl) {
                        if (item['recordStatus'] == Recorder.STATUS_RECORDING) {
                            isAuto = true;
                            item['recordStatus'] = Recorder.STATUS_AWAIT_RECORD;
                            Cache.saveRoom(roomUrl, {'recordStatus': Recorder.STATUS_AWAIT_RECORD});
                            this.logger.info(`${live.getNickName()} ${recorder.id} 录制完成。。。切换为待录制状态`);
                            this.showInfo(`${live.getNickName()} 录制完成,等待自动录制中。。。`);
                        }
                    }
                });
                // @ts-ignore
                this.cmdList[roomUrl] = null;
                if (isAuto) return;
                this.logger.info(`${live.getNickName()} ${roomUrl} 录制完成。。。`);
                this.showInfo(`${live.getNickName()} 录制完成`);
            };
            let date = new Date();
            let $siteName = live.getSiteName();
            let $nickName = Util.filterEmoji(live.getNickName());
            let $date =
                date.getFullYear() +
                "-" +
                (date.getMonth() + 1) +
                "-" +
                date.getDate();
            let savepath = path.join(
                process.cwd(),
                "resources/video",
                $siteName,
                $nickName,
                $date
            );
            let fileName =
                date.getFullYear() +
                "" +
                (date.getMonth() + 1) +
                "" +
                date.getDate() +
                "-" +
                date.getHours() +
                "_" +
                date.getMinutes() +
                "_" +
                date.getSeconds() +
                ".mp4";
            let res = Util.mkdirsSync(savepath);
            if (!res) {
                this.logger.error("创建下载目录失败", savepath);
                this.showError("创建下载目录失败");
                return;
            }
            this.liveInfoList[index]['recordStatus'] = Recorder.STATUS_RECORDING;
            Cache.saveRoom(roomUrl, {'recordStatus': Recorder.STATUS_RECORDING});
            savepath = path.join(
                process.cwd(),
                "resources/video",
                $siteName,
                $nickName,
                $date,
                fileName
            );
            this.showInfo(`${live.getNickName()} 开始录制。。。`);
            this.logger.info(`${live.getNickName()} ${roomUrl} 开始录制。。。`);
            //@ts-ignore
            this.cmdList[roomUrl] = recorder.record(list[0]["liveUrl"], savepath); //以roomUrl为唯一索引cmd数组
            console.log('cmdList start', roomUrl, this.cmdList);
        },
        refreshRoomData() {
            // @ts-ignore
            if (!this.recorder_timer) this.recorder_timer = setInterval(() => {
                this.liveInfoList = Cache.readRoomList();
                this.liveInfoList.forEach((room: any, index: number) => {
                    if (room['isAutoRecord'] && room['recordStatus'] == Recorder.STATUS_PAUSE) {
                        room['recordStatus'] = Recorder.STATUS_AWAIT_RECORD;
                        Cache.saveRoom(room.roomUrl, {recordStatus: Recorder.STATUS_AWAIT_RECORD});
                    }
                    if (!room['liveStatus'] && room['recordStatus'] == Recorder.STATUS_RECORDING) {
                        room['recordStatus'] = Recorder.STATUS_PAUSE;
                        Cache.saveRoom(room.roomUrl, {recordStatus: Recorder.STATUS_PAUSE});
                        this.logger.info(`${room.nickName} ${room['roomUrl']} 自动暂停`);
                        this.showInfo(`${room.nickName} 自动暂停`);
                        console.log('cmdList stop', room['roomUrl'], this.cmdList);
                        try {
                            //@ts-ignore
                            Recorder.stop(this.cmdList[room['roomUrl']]);
                        } catch (e) {
                            this.showError(room.nickName + ' 自动暂停失败');
                            this.logger.error(`自动暂停失败`, room.nickName, e);
                        }
                        //@ts-ignore`
                        this.cmdList[room['roomUrl']] = null;
                    }
                    if (room['recordStatus'] == Recorder.STATUS_AWAIT_RECORD && room['liveStatus']) {
                        // @ts-ignore
                        if (this.cmdList[room['roomUrl']]) {
                            this.showError(`${room.nickName} 重复录制了。。。`);
                            this.logger.error(`重复录制了。。。`, room);
                        } else {
                            this.recordRoomUrl(index, room['roomUrl']).then().catch((err) => {
                                this.showError(`${room.nickName} 录制失败。。。`);
                                this.logger.error(room.nickName + ' 录制失败', err);
                            });
                        }
                    }
                });
            }, 10000);
        },
        remove(index: number) {
            this.liveInfoList.splice(index, 1);
            Cache.writeRoomList(this.liveInfoList);
        },

        async sureAddLive() {

            let live = null;
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
                let item = {
                    siteName: live.getSiteName(),
                    siteIcon: live.getSiteIcon(),
                    nickName: live.getNickName(),
                    headIcon: live.getHeadIcon(),
                    title: live.getTitle(),
                    roomUrl: live.roomUrl,
                    liveStatus: live.getLiveStatus(),
                    isAutoRecord: false,
                    recordStatus: Recorder.STATUS_PAUSE,
                    addTime: new Date().getTime(),
                };
                for (let i = 0; i < this.liveInfoList.length; i++) {
                    if (this.liveInfoList[i].roomUrl === live.roomUrl) {
                        this.showInfo("该主播已存在。。。");
                        return;
                    }
                }
                this.liveInfoList.unshift(item);
                //@ts-ignore
                this.cmdList[live.roomUrl] = null;
                Cache.writeRoomList(this.liveInfoList);
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
                    align: "center",
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
                    align: "center",
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
                    width: 100,
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
                            this.liveInfoList[params.index]['recordStatus'] = Recorder.STATUS_PAUSE;
                            this.liveInfoList[params.index]['isAutoRecord'] = false;
                            Cache.saveRoom(params['row']['roomUrl'], {
                                'recordStatus': Recorder.STATUS_PAUSE,
                                'isAutoRecord': false
                            });
                            this.logger.info(`${params.row.nickName} 暂停中。。。`);
                            console.log('cmdList stop', params.row.roomUrl, this.cmdList);
                            try {
                                //@ts-ignore
                                Recorder.stop(this.cmdList[params.row.roomUrl]);
                            } catch (error) {
                                this.showError("无法暂停");
                                this.logger.error(`${params.row.nickName} 暂停出错了。。。`, params.row, error);
                            }
                            //@ts-ignore
                            this.cmdList[params.row.roomUrl] = null;
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
