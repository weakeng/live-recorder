import path from "path";
import fs from "fs";
import Vue from "Vue";
import Notice from "@/vendor/Notice";
import {ResourceJson} from "@/vendor/Json";
import Logger from "@/vendor/Logger";
import Resource from "@/vendor/resource/Resource";
import Downloader from "@/vendor/resource/DownLoader";
import Util from "@/vendor/Util";
import moment from "moment";

//ffmpeg -user-agent "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3554.0 Safari/537.36" -headers "referer: https://avgle.com"  -i "https://ip167794489.cdn.qooqlevideo.com/key=3A88D53A2KHJb3csZr2LlA,s=,end=1569943303,limit=2/data=1569943303/state=OviW/referer=force,.avgle.com/reftag=56109644/media=hlsA/ssd2/177/4/184994294.m3u8" -c copy demo.mp4
export default Vue.extend({
    name: "resource",
    mounted() {
    },
    data() {
        return {
            userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 10_3_1 like Mac OS X) AppleWebKit/603.1.30 (KHTML, like Gecko) Version/10.0 Mobile/14E304 Safari/602.1',
            websrc: '',
            preload: `file:${path.join(process.cwd(), "resources/preload.js")}`,
            modal_get_resource: false,
            logger: Logger.init(),
            headArr: [
                {
                    title: '资源名称',
                    key: 'name',
                    align: 'center',
                    width: 120,
                    render: (h: any, params: any) => {
                        return h('div', [
                            h('strong', params.row.name)
                        ]);
                    }
                },
                {
                    title: '资源类型',
                    key: 'type',
                    align: 'center',
                    width: 120,
                    render: (h: any, params: any) => {
                        return h('div', [
                            h('strong', params.row.type == Resource.TYPE_VIDEO ? '点播资源' : "直播资源")
                        ]);
                    }
                },
                {
                    title: '资源地址',
                    align: 'center',
                    key: 'resourceUrl'
                },
                {
                    title: '操作',
                    width: 100,
                    key: 'action',
                    align: 'center',
                    render: (h: any, params: any) => {
                        // @ts-ignore
                        return this.renderAction(h, params);
                    }
                }
            ],
            cmdList: {},
            resourceList: []
        }
    },
    methods: {
        search_resource() {
            //@ts-ignore
            this.$refs.webview.reload();
        },
        //#EXT-X-ENDLIST 视频,直播
        openModal() {
            this.preload = `file:${path.join(process.cwd(), "resources/preload.js")}`;
            this.modal_get_resource = true;
            this.$nextTick(() => {
                // @ts-ignore
                let wq = this.$refs.webview.getWebContents().session.webRequest;
                // @ts-ignore
                this.$refs.webview.addEventListener("did-fail-load", (res) => {
                    console.log('did-fail-load', res);
                });
                let reg = new RegExp(/\.flv|\.m3u8|\.mp4/);
                wq.onResponseStarted((details: any) => {
                    let tt = new Date().getTime();
                    if (reg.test(details.url)) {
                        //'video/x-flv'
                        let header = details['responseHeaders'];
                        let contentType = '';
                        let type = 0;
                        if (header.hasOwnProperty('Content-Type')) {
                            contentType = header['Content-Type'][0];
                        } else if (header.hasOwnProperty('content-type')) {
                            contentType = header['content-type'][0];
                        } else {
                            this.logger.error("获取响应头类型失败！", details.url, header);
                            return;
                        }
                        if (contentType.indexOf('video/x-flv') !== -1 || contentType.indexOf('application/x-mpegurl') !== -1) {
                            type = Resource.TYPE_LIVE;
                        } else if (contentType.indexOf('video/flv') !== -1 || contentType.indexOf('application/vnd.apple.mpegurl') !== -1 || contentType.indexOf('video/mp4') !== -1) {
                            type = Resource.TYPE_VIDEO;
                        } else {
                            this.logger.error("无法匹配资源类型", details.url, contentType);
                            return;
                        }
                        let res: ResourceJson = {
                            url: this.websrc,
                            resourceUrl: details.url,
                            id: tt,
                            addTime: tt,
                            downloadStatus: Downloader.STATUS_PAUSE,
                            // @ts-ignore
                            name: this.$refs.webview.getTitle(),
                            type: type,
                        };
                        // @ts-ignore
                        this.resourceList.push(res);
                        Notice.showInfo(this, ':) 已探测到视频资源。。。');
                    }
                });
            });
        },
        modal_ok() {
            this.websrc = '';
            this.modal_get_resource = false;
        },
        modal_cancel() {
            this.websrc = '';
            this.modal_get_resource = false;
        },
        renderAction(h: any, params: any) {
            let downloading = this.resourceList[params.index]['downloadStatus'] == Downloader.STATUS_DOWNLOAD;
            let pause = this.resourceList[params.index]['downloadStatus'] == Downloader.STATUS_PAUSE;
            let finish = this.resourceList[params.index]['downloadStatus'] == Downloader.STATUS_FINISH;
            return h("div", [
                h("Button", {
                    props: {
                        type: "primary",
                        size: "small",
                        icon: downloading ? "" : "md-cloud-download",
                        loading: downloading,
                        shape: "circle"
                    },
                    style: {
                        marginRight: "5px",
                        display: finish ? 'none' : 'inline-block'
                    },
                    on: {
                        click: () => {
                            if (this.cmdList[params.row.id]) {
                                return;
                            }
                            let savePath = Util.getVideoSavePath();
                            let dateText = moment().format('YYYYMMDD');
                            let timeText = moment().format('HHmmss');
                            savePath = path.join(savePath, dateText);
                            let res = Util.mkdirsSync(savePath);
                            if (!res) {
                                this.logger.error("创建下载目录失败", savePath);
                                this.cmdList[params.row.id] = null;
                                // @ts-ignore
                                this.resourceList[params.index]['downloadStatus'] = Downloader.STATUS_PAUSE;
                                Notice.showError(this, "创建下载目录失败");
                                return;
                            }
                            let fileName = `${params.row.name}~${dateText}~${timeText}.mp4`;
                            let downloader = new Downloader(params.row.url);
                            this.cmdList[params.row.id] = downloader.run(params.row.resourceUrl, path.join(savePath, fileName), params.row.url);
                            // @ts-ignore
                            this.resourceList[params.index]['downloadStatus'] = Downloader.STATUS_DOWNLOAD;
                            downloader.onEnd = () => {
                                for (let i = 0; i < this.resourceList.length; i++) {
                                    if (this.resourceList[i]['url'] === params.row.url) {
                                        // @ts-ignore
                                        this.resourceList[i]['downloadStatus'] = Downloader.STATUS_FINISH;
                                        this.cmdList[params.row.id] = null;
                                        this.logger.info("下载完成", params.row.name);
                                        Notice.showInfo(this, `下载完成 ${params.row.name}`);
                                    }
                                }
                            };
                            downloader.onErr = (err) => {
                                for (let i = 0; i < this.resourceList.length; i++) {
                                    if (this.resourceList[i]['url'] === params.row.url) {
                                        // @ts-ignore
                                        this.resourceList[i]['downloadStatus'] = Downloader.STATUS_PAUSE;
                                        this.cmdList[params.row.id] = null;
                                        this.logger.error("下载失败", err, params.row.resourceUrl);
                                        Notice.showError(this, `下载失败 ${params.row.name}`);
                                    }
                                }
                            }
                        }
                    }
                }),
                h("Button", {
                    props: {
                        type: "warning",
                        size: "small",
                        icon: "ios-pause",
                        shape: "circle",
                        disabled: pause || finish
                    },
                    style: {
                        marginRight: "5px",
                        display: pause || finish ? 'none' : 'inline-block'
                    },
                    on: {
                        click: () => {
                            this.$Modal.confirm({
                                title: '提示',
                                content: `确定要暂停吗？无法断点下载`,
                                onOk: () => {
                                    try {
                                        // @ts-ignore
                                        this.resourceList[params.index]['downloadStatus'] = Downloader.STATUS_PAUSE;
                                        Downloader.stop(this.cmdList[params.row.id]);
                                    } catch (e) {
                                        Notice.showError(this, "无法暂停此任务");
                                    }
                                }
                            });

                        }
                    }
                }),
                h("Button", {
                    props: {
                        type: "error",
                        size: "small",
                        shape: "circle",
                        icon: "ios-trash",
                        disabled: downloading,
                    },
                    style: {
                        marginRight: "5px",
                        display: downloading ? 'none' : 'inline-block'
                    },
                    on: {
                        click: () => {
                            this.$Modal.confirm({
                                title: '提示',
                                content: `确定要删除此任务吗？`,
                                onOk: () => {
                                    this.resourceList.splice(params.index, 1);
                                }
                            });

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
                        display: finish ? 'inline-block' : 'none'
                    },
                    on: {
                        click: () => {
                            const {shell} = require("electron").remote;
                            let savePath = Util.getVideoSavePath();
                            let dateText = moment().format('YYYYMMDD');
                            savePath = path.join(savePath, dateText);
                            if (fs.existsSync(savePath)) {
                                shell.showItemInFolder(savePath);
                            } else {
                                Notice.showInfo(this, "下载文件为空");
                            }

                        }
                    }
                })
            ])
                ;
        },
    }
});