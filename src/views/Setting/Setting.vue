<template>
    <div class="v-setting">
        <Form ref="form" :label-width="120">
            <FormItem label="开启录播通知">
                <i-switch size="large" v-model="setting.notice"/>
            </FormItem>
            <FormItem label="刷新直播间隔" prop="checkInterval">
                <InputNumber
                        :max="50"
                        :min="5"
                        v-model="setting.refreshTime"
                        :formatter="value => `${value}秒`"
                        :parser="value => value.replace('秒', '')"
                ></InputNumber>
            </FormItem>
            <FormItem label="视频分段时间" prop="segment">
                <InputNumber
                        :max="60"
                        :min="10"
                        v-model="setting.videoTime"
                        :formatter="value => `${value}分钟`"
                        :parser="value => value.replace('分钟', '')"
                ></InputNumber>
            </FormItem>
            <FormItem label="视频保存路径" prop="saveFolder" style="width: 400px">
                <input ref="saveFolder" type="file" webkitdirectory @change="onSaveFolderSelect"/>
                <i-input v-model="setting.savePath" readonly :title="setting.savePath">
                    <Icon type="md-folder" slot="suffix" @click="$refs.saveFolder.click()"/>
                </i-input>
            </FormItem>
            <FormItem class="buttons">
                <Button type="success" @click="confirm" style="margin-right:10px">确认完成设置</Button>
                <Button @click="reset()">恢复默认设置</Button>
            </FormItem>
        </Form>

        <webview id="webview" src="http://inke.cn/live.html?uid=730199258&id=1569823360634861" style="display:inline-flex; width:100%; height:300px"
                 :preload="preload"></webview>
    </div>
</template>


<script>
    import Vue from "Vue";
    import Cache from "../../vendor/Cache";
    import path from "path";
    import fs from "fs";
    import {settingJson} from "../../vendor/live/Json";
    import Util from "@/vendor/Util";


    export default Vue.extend({
        mounted() {
            let setting = Cache.getConfig();
            this.setting = Object.assign(
                {
                    savePath: path.join(process.cwd(), "resources/video/"),
                    refreshTime: 10,
                    videoTime: 20,
                    notice: true
                },
                setting
            );

            const webview = document.querySelector('webview');
            let webRequest = webview.getWebContents().session.webRequest;
            webRequest.onCompleted((details) => {
                if (/flv/.test(details.url)) console.log(details.url);
            });
            webview.addEventListener('dom-ready', () => {
                // console.log('dom-ready');
            });

            webview.addEventListener("ipc-message", (event) => {
                // console.log("channel: " + event.channel, event)
            })
        },

        beforeUpdate() {

        },
        data() {
            return {
                preload: `file:${path.join(process.cwd(), "resources/preload.js")}`,
                setting: {}
            };
        },
        methods: {
            onSaveFolderSelect(e) {
                let file = e.target.files[0];
                if (!file) return;
                this.setting.savePath = path.join(file.path);
            },
            confirm() {
                this.$Modal.confirm({
                    title: '完成设置',
                    content: `确认无误后点击确定保存设置`,
                    onOk: () => {
                        if (!fs.existsSync(this.setting.savePath)) {
                            this.$Notice.error({
                                title: "信息",
                                desc: "无效的文件路径"
                            });
                            return;
                        }
                        if (this.setting.refreshTime > 50 || this.setting.refreshTime < 5) {
                            this.$Notice.error({
                                title: "信息",
                                desc: "刷新时间可填范围5-50"
                            });
                            return;
                        }
                        if (this.setting.videoTime > 60 || this.setting.videoTime < 10) {
                            this.$Notice.error({
                                title: "信息",
                                desc: "视频分段时间可填范围10-60"
                            });
                            return;
                        }
                        Cache.writeConfig(this.setting);
                        this.$Notice.info({
                            title: "信息",
                            desc: "设置已生效"
                        });
                    }
                });
            },
            reset() {
                this.$Modal.confirm({
                    title: '提示',
                    content: `确认要恢复默认设置吗`,
                    onOk: () => {
                        let setting = {
                            savePath: path.join(process.cwd(), "resources/video/"),
                            refreshTime: 10,
                            videoTime: 20,
                            notice: true
                        };
                        this.setting = setting;
                        Cache.writeConfig(setting);
                        this.$Notice.info({
                            title: "信息",
                            desc: "已恢复默认设置"
                        });
                    }
                });
            }
        }
    });
</script>

<style lang="scss">
    .v-setting {
        padding-top: 20px;

        input[type="file"] {
            display: none;
        }

    }

</style>

