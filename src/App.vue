<template>
    <div id="app">
        <Nav></Nav>
        <Header></Header>
        <div class="main">
            <router-view></router-view>
        </div>
        <Footer></Footer>
    </div>
</template>

<script lang="ts">
    import Vue from "vue";
    import Nav from "@/components/Nav.vue";
    import Header from "@/components/Header.vue";
    import Footer from "@/components/Footer.vue";
    import Logger from "@/vendor/Logger";
    import Recorder from "@/vendor/Recorder";
    import Cache from "@/vendor/Cache";
    import YYLive from "@/vendor/live/YYLive";

    export default Vue.extend({
        async mounted() {
            let cclive = new YYLive('https://www.yy.com/22490906');
            await cclive.refreshRoomData();
            let list = await cclive.getLiveUrl();
            console.log(cclive, list);
        },
        components: {
            Nav,
            Header,
            Footer
        },
        beforeDestroy() {
            Logger.init().info("VUE-APP beforeDestroy");
            if (this.recorder_timer) {
                Logger.init().info(`VUE-APP 组件销毁前 清除定时器`);
                clearInterval(this.recorder_timer);
            }
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
        },
        destroyed() {
            Logger.init().info("VUE-APP 组件销毁了");
            console.log("VUE-APP 组件销毁了");
        }

    });
</script>
<style lang="scss">
    html,
    body {
        height: 100%;
        padding: 0;
        margin: 0;
    }

    #app {
        display: flex;
        height: 100%;
        flex-direction: column;

        nav {
            height: 35px;
        }

        .main {
            flex: 1;
            overflow-y: auto;

            &::-webkit-scrollbar {
                width: 9px;
                height: 9px;
            }

            &::-webkit-scrollbar-track {
                width: 6px;
                background-color: #0d1b20;
                -webkit-border-radius: 2em;
                -moz-border-radius: 2em;
                border-radius: 2em;
            }

            &::-webkit-scrollbar-thumb {
                background-color: #606d71;
                background-clip: padding-box;
                min-height: 28px;
                -webkit-border-radius: 2em;
                -moz-border-radius: 2em;
                border-radius: 2em;
            }

            &::-webkit-scrollbar-thumb:hover {
                background-color: #fff;
            }
        }

        footer {
            height: 35px;
        }
    }
</style>
