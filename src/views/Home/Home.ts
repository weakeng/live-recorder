import Vue from "vue";
import LiveFactory from "../../vendor/live/LiveFactory";
import Recorder from "../../vendor/Recorder";
import path from "path";
import Cache from "../../vendor/Cache";
import Util from "../../vendor/Util";

export default Vue.extend({
    mounted: function () {
        this.siteCode = this.siteNameList[0]["siteCode"];
        this.refreshRoomData();
        /*        this.$once("hook:beforeDestroy", () => {
                    if (this.interVal) {
                        clearInterval(this.interVal || undefined);
                        this.interVal = null;
                    }
                });*/
    },
    data() {
        return {
            siteNameList: LiveFactory.getAllSiteName(),
            siteAddress: '',
            roomNumber: '',
            liveInfoList: Cache.readRoomList(),
            addLive_method: "输入网址",
            siteCode: 0,
            cmdList: {}, //以roomUrl为唯一索引cmd数组
            modal_add_live: false,
            liveInfoHeader: [
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
                            h("strong", params.row.nickName,{ attrs: {style: 'cursor:pointer'},})
                        ]);
                    }
                },
                {
                    title: "直播标题",
                    align: "center",
                    key: "title"
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
        };
    },

    methods: {
        async recordRoomUrl(index: number, roomUrl: string) {
            let list = null;
            let live;
            try {
                live = LiveFactory.getLive(roomUrl);
                await live.refreshRoomData();
                list = await live.getLiveUrl();
            } catch (error) {
                this.$Message.error(error);
                return;
            }
            let recorder = new Recorder(roomUrl);
            recorder.onErr = err => {
                this.liveInfoList[index]['recordStatus'] = Recorder.STATUS_PAUSE;
                Cache.saveRoom(roomUrl, {'recordStatus': Recorder.STATUS_PAUSE});
                this.$Message.error(`${recorder.id}:出错了。。。`);
                console.error(`${recorder.id}:`, err);
            };
            recorder.onEnd = () => {
                if (this.liveInfoList[index]['recordStatus'] == Recorder.STATUS_RECORDING) {
                    this.liveInfoList[index]['recordStatus'] = Recorder.STATUS_AWAIT_RECORD;
                    Cache.saveRoom(roomUrl, {'recordStatus': Recorder.STATUS_AWAIT_RECORD});
                }
                console.info(`${recorder.id}:录制完成。。。`);
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
                this.$Message.error("创建下载目录失败");
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
            //@ts-ignore
            this.cmdList[roomUrl] = recorder.record(list[0]["liveUrl"], savepath); //以roomUrl为唯一索引cmd数组
        },
        refreshRoomData() {
            // @ts-ignore
            if (!this.recorder_timer) this.recorder_timer = setInterval(() => {
                this.liveInfoList = Cache.readRoomList();
                this.liveInfoList.forEach((room: any, index: number) => {
                    if (room['isAutoRecord'] && room['recordStatus'] == Recorder.STATUS_PAUSE) {
                        room['recordStatus'] = Recorder.STATUS_AWAIT_RECORD;
                    }
                    if (room['recordStatus'] == Recorder.STATUS_AWAIT_RECORD && room['liveStatus']) {
                        this.recordRoomUrl(index, room['roomUrl']).then().catch((err) => {
                            console.error(err)
                        });
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
                    this.$Message.info(error);
                    return;
                }
            } else if (this.addLive_method === "输入房间号") {
                try {
                    live = LiveFactory.getLiveByRoomId(this.siteCode, this.roomNumber);
                } catch (error) {
                    this.$Message.info(error);
                    return;
                }
            } else {
                this.$Message.info("出错了。。。");
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
                    recordStatus: Recorder.STATUS_PAUSE
                };
                for (let i = 0; i < this.liveInfoList.length; i++) {
                    if (this.liveInfoList[i].roomUrl === live.roomUrl) {
                        this.$Message.info("该主播已存在。。。");
                        return;
                    }
                }
                this.liveInfoList.push(item);
                //@ts-ignore
                this.cmdList[live.roomUrl] = null;
                Cache.writeRoomList(this.liveInfoList);
            } catch (error) {
                console.log(error);
                this.$Message.error(error);
            }
            this.siteAddress = '';
            this.roomNumber = '';
        },
        cancelAddLive() {
            console.log("Clicked cancel");
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
                        marginRight: "5px"
                    },
                    on: {
                        click: async () => {
                            if (recording) return;
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
                            try {
                                this.liveInfoList[params.index]['recordStatus'] = Recorder.STATUS_PAUSE;
                                this.liveInfoList[params.index]['isAutoRecord'] = false;
                                Cache.saveRoom(params['row']['roomUrl'], {
                                    'recordStatus': Recorder.STATUS_PAUSE,
                                    'isAutoRecord': false
                                });
                                //@ts-ignore
                                Recorder.stop(this.cmdList[params.row.roomUrl]);
                            } catch (error) {
                                console.error(error);
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
                /*                h("Button", {
                                    props: {
                                        type: "info",
                                        size: "small",
                                        shape: "circle",
                                        icon: "ios-link"
                                    },
                                    on: {
                                        click: () => {
                                            require("electron").shell.openExternal(params.row.roomUrl);
                                        }
                                    }
                                })*/
            ]);
        }
    }
});
