import Vue from "Vue";
import path from "path";
import Util from "@/vendor/Util";
import fs from "fs";
import LiveFactory from "@/vendor/live/LiveFactory";
export default Vue.extend({
    data() {
        return {

            fileList: [],
            headTable: [
                {
                    width:100,
                    title: '直播平台',
                    key: 'siteName',
                    //@ts-ignore
                    filters: this.getSiteNameFilters(),
                    filterMultiple: false,
                    filterMethod(value: any, row: any) {
                        return value === row.siteName;
                    },
                },
                {
                    width:130,
                    align:'center',
                    title: '主播名称',
                    key: 'nickName'
                },
                {
                    title: '文件名称',
                    align:'center',
                    key: 'file',
                    render: (h: any, params: any) => {
                        return h('div', [
                            h('Icon', {
                                props: {
                                    type: 'person'
                                }
                            }),
                            h('strong', params.row.file)
                        ]);
                    }
                },
                {
                    width:150,
                    title: '创建时间',
                    align:'center',
                    key: 'date'
                },
                {
                    width:90,
                    title: '文件大小',
                    align:'center',
                    key: 'size'
                },
                {
                    title: '操作',
                    key: 'action',
                    width: 150,
                    align: 'center',
                    //@ts-ignore
                    render: (h: any, params: any) => {
                        // @ts-ignore
                        return this.renderAction(h, params);
                    }
                }
            ]
        }
    },
    mounted() {
        let savePath = path.join(process.cwd(), "resources/video");
        Util.readFileList(savePath, this.fileList);
        this.fileList.sort((file1: any, file2: any) => {
            return file2['time'] - file1['time'];
        });
    },
    methods: {
        renderAction(h: any, params: any) {
            return h("div", [
                h("Button", {
                    props: {
                        type: "primary",
                        size: "small",
                        icon: "md-play",
                        shape: "circle"
                    },
                    style: {
                        marginRight: "5px",
                    },
                    on: {
                        click:() => {
                            require("electron").shell.openExternal(params.row.filePath);
                        }
                    }
                }),
                h("Button", {
                    props: {
                        type: "error",
                        size: "small",
                        shape: "circle",
                        icon: "ios-trash",
                    },
                    style: {
                        marginRight: "5px",
                    },
                    on: {
                        click: () => {
                            if (confirm('确定要删除吗')) {
                                fs.unlink(params.row.filePath, err => {
                                    if (err) {
                                        this.showError('删除失败');
                                    } else {
                                        this.fileList.splice(params.index, 1);
                                        this.showInfo('删除成功');
                                    }
                                });
                            }
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
                            const { shell } = require("electron").remote;
                            let path = params.row.filePath;
                            if (fs.existsSync(path)) {
                                shell.showItemInFolder(path);
                            } else {
                                this.showError("打开文件出错了");
                            }

                        }
                    }
                })
            ]);
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







