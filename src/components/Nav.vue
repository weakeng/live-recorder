<template>
    <div class="header">
        <div class="left">
            <Icon type="ios-film" size="25" color="#FFF"/>
            <span class="app-name">直播录制小助手</span>
        </div>
        <div class="right">
            <div class="icon">
                <Icon class='min' type="md-remove" size="18" color="#FFF" @click="minFrame()"/>
                <Icon class='close' type="md-close" size="18" color="#FFF" @click="closeFrame()"/>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
    import Vue from "vue";
    import {ipcRenderer, remote} from "electron"
    import Cache from "@/vendor/Cache";
    import Logger from "@/vendor/Logger";
    import Recorder from "@/vendor/Recorder";

    export default Vue.extend({
        methods: {
            minFrame() {
                ipcRenderer.send('min');
            },
            closeFrame() {
                for (let roomUrl in this.cmdList) {
                    if (this.cmdList.roomUrl) {
                        Logger.init().info(`VUE-APP 组件销毁前 自动结束录制进程 ${roomUrl}`);
                        Recorder.stop(this.cmdList.roomUrl);
                    }
                }
                Logger.init().info("VUE-APP beforeDestroy,把所有录制状态设为暂停录制");
                let list = Cache.readRoomList();
                list.forEach((item: any) => {
                    if (item['recordStatus'] == Recorder.STATUS_RECORDING) {
                        item['recordStatus'] = Recorder.STATUS_PAUSE;
                    }
                });
                Cache.writeRoomList(list);
                remote.app.quit();
            }
        }
    });
</script>

<style lang="scss" scoped>
    .header {
        width: 100%;
        height: 35px;
        -webkit-app-region: drag;
        background: #e34a63;
        display: flex;
        flex-direction: row;
        color: #fff;

        .left {
            flex: 1;
            line-height: 35px;

            .app-name {
                padding-left: 10px;
                font-size: 12px;
            }
        }

        .right {
            flex: 1;

            line-height: 35px;

            .icon {
                float: right;
                margin-right: 20px;
                cursor: pointer;

                .min, .close {
                    -webkit-app-region: no-drag;
                    margin: 0 5px;
                }
            }
        }
    }
</style>