import fs from "fs";
import path from "path";
import moment from "moment";
import {Vue, Component} from "vue-property-decorator"
import Util from "@/vendor/Util";
import LiveFactory from "@/vendor/live/LiveFactory";
import Notice from "@/vendor/Notice";
import Resource from "@/vendor/resource/Resource";
import Logger from "@/vendor/Logger";

interface FileList {
    [key: string]: any
}

@Component
export default class extends Vue {
    public fileList: Array<any> = [];
    public fileListTemp: Array<any> = [];
    public fileListArr: FileList = [];
    public nickNameList: Array<string> = [];
    public selectList = [];
    public dateText = '';
    public nickName = '';
    public logger = Logger.init();
    public headTable = this.initTableHead();

    mounted() {
        this.init();
    }

    private init() {
        let savePath = Util.getSavePath();
        fs.existsSync(savePath) && Util.readFileList(savePath, this.fileList);
        this.fileList.sort((file1: any, file2: any) => {
            return file2['time'] - file1['time'];
        });
        this.fileList.forEach((item) => {
            let vo = `${item['siteName']}-${item['nickName']}`;
            if (this.nickNameList.indexOf(vo) < 0) {
                this.nickNameList.push(vo);
            }
            this.fileListArr[vo] = this.fileListArr[vo] ? this.fileListArr[vo] : [];
            this.fileListArr[vo].push(item);
        });
        this.fileListTemp = this.fileList;
    }

    private doSelectList(selectList: any) {
        this.selectList = selectList;
    }

    private deleteAll() {
        let len = this.selectList.length;
        if (len <= 0) {
            Notice.showInfo(this, `至少选中一项删除！`);
            return;
        }
        this.$Modal.confirm({
            title: '提示',
            content: `确认要删除这${len}个视频吗`,
            onOk: () => {
                let success = 0, error = 0;
                for (let i = 0; i < len; i++) {
                    this.fileList.forEach((item, index) => {
                        if (item['filePath'] === this.selectList[i]['filePath']) {
                            this.fileList.splice(index, 1);
                            fs.unlinkSync(this.selectList[i]['filePath']);
                        }
                    });
                }
                Notice.showInfo(this, `删除成功！`);
            }
        });
    }

    private nickChange() {
        if (this.nickName) {
            //@ts-ignore
            let fileList = this.fileListArr[this.nickName];
            if (this.dateText) {
                fileList = [];
                //@ts-ignore
                this.fileListArr[this.nickName].forEach((item: any) => {
                    let date1 = new Date(item.time);
                    let date2 = new Date(this.dateText);
                    if (date1.getFullYear() == date2.getFullYear() && date1.getMonth() == date2.getMonth() && date1.getDate() == date2.getDate()) {
                        fileList.push(item);
                    }
                });
            }
            this.fileList = fileList;
        }
    }

    private dateChange() {
        if (this.dateText) {
            let fileList: Array<any> = [];
            this.fileListTemp.forEach((item: any) => {
                let date1 = new Date(item.time);
                let date2 = new Date(this.dateText);
                if (date1.getFullYear() == date2.getFullYear() && date1.getMonth() == date2.getMonth() && date1.getDate() == date2.getDate()) {
                    if (this.nickName) {
                        if (this.nickName == `${item['siteName']}-${item['nickName']}`) {
                            fileList.push(item);
                        }
                    } else {
                        fileList.push(item);
                    }
                }
            });
            this.fileList = fileList;
        }
    }

    private resetData() {
        this.fileList = this.fileListTemp;
        this.nickName = '';
        this.dateText = '';
    }

    private clearDate() {
        this.dateText = '';
        this.nickChange();
    }

    private renderAction(h: any, params: any) {
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
                    click: () => {
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
                        this.doDelete(params);
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
                        this.openSavePath(params);

                    }
                }
            })
        ]);
    }

    private openConcatPath() {
        let Path=path.join(Util.getConcatSavePath(), moment().format('YYYYMMDD'));
        if(fs.existsSync(Path)){
            require("electron").shell.openExternal(Path);
        }else{
            Notice.showInfo(this,'暂无合成视频');
        }
    }

    private concatToMp4() {
        if (this.fileList.length <= 1) {
            Notice.showError(this, "请选择2个以上视频进行合并！");
            return;
        }
        this.fileList.sort((file1: any, file2: any) => {
            return file1['time'] - file2['time'];
        });

        let nickName = this.nickName;
        let dateText = moment().format('YYYYMMDD');
        let timeText = moment().format('HHmmss');
        let savePath = path.join(Util.getConcatSavePath(), dateText);
        let fileList = path.join(savePath, `${dateText}~${timeText}.txt`);
        let outFileName = path.join(savePath, `${dateText}~${timeText}.mp4`);
        let res = Util.mkdirsSync(savePath);
        if (!res) {
            this.logger.error("创建合成视频目录失败", savePath);
            Notice.showError(this, "创建合成视频目录失败");
            return;
        }

        this.fileList.forEach((file) => {
            // @ts-ignore
            let filepath = file['filePath'];
            fs.appendFileSync(fileList, `file '${filepath}'\n`);
        });
        let stopFunc = Resource.concat(fileList, outFileName, () => {
            Notice.showInfo(this, "合成成功");
            fs.existsSync(fileList) && fs.unlinkSync(fileList);
        }, (err: any) => {
            this.logger.error("合成失败！", err, fileList, outFileName);
            Notice.showError(this, "合成失败");
            fs.existsSync(fileList) && fs.unlinkSync(fileList);
        })
    }

    private getSiteNameFilters() {
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
    }

    private initTableHead() {
        return [
            {
                type: 'selection',
                width: 60,
                align: 'center'
            },
            {
                width: 105,
                title: '直播平台',
                align: 'center',
                key: 'siteName',
                //@ts-ignore
                filters: this.getSiteNameFilters(),
                filterMultiple: false,
                filterMethod(value: any, row: any) {
                    return value === row.siteName;
                },
            },
            {
                width: 130,
                align: 'center',
                title: '主播名称',
                key: 'nickName'
            },
            {
                title: '文件名称',
                align: 'left',
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
                width: 150,
                title: '创建时间',
                align: 'center',
                key: 'date'
            },
            {
                width: 90,
                title: '文件大小',
                align: 'center',
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

    private doDelete(params: any) {
        this.$Modal.confirm({
            title: '提示',
            content: `确认要删除该视频吗`,
            onOk: () => {
                fs.unlink(params.row.filePath, err => {
                    if (err) {
                        Notice.showError(this, '删除失败');
                    } else {
                        this.fileList.splice(params.index, 1);
                        Notice.showInfo(this, '删除成功');
                    }
                });
            }
        });
    }

    private openSavePath(params: any) {
        const {shell} = require("electron").remote;
        let path = params.row.filePath;
        if (fs.existsSync(path)) {
            shell.showItemInFolder(path);
        } else {
            Notice.showError(this, "打开文件出错了");
        }
    }
}
