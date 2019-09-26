<template>
    <div id="app">
        <Nav></Nav>
        <Header></Header>
        <div class="main">
            <keep-alive include="home">
                <router-view></router-view>
            </keep-alive>
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
    // import HuaJiaoLive from "@/vendor/live/HuaJiaoLive";
    export default Vue.extend({
        data() {
            return {
                cachedViews: ['home']
            }
        },
        async mounted() {
            // let cclive = new HuaJiaoLive('https://www.huajiao.com/l/290235086');
            // await cclive.refreshRoomData();
            // let list = await cclive.getLiveUrl();
            // console.log(cclive);
            
        },
        components: {
            Nav,
            Header,
            Footer
        },
        beforeDestroy() {
            const notification = {
                title: `vue beforeDestroy`,
                body: 'vue beforeDestroy',
                icon: 'https://yy.com/favicon.ico',
                silent: true,
                requireInteraction: true,
                sticky: true,
            };
            new Notification(notification.title, notification);
            for (let roomUrl in this.cmdList) {
                if (this.cmdList.roomUrl) {
                    Logger.init().info(`销毁前 自动结束录制进程 ${roomUrl}`);
                    Recorder.stop(this.cmdList.roomUrl);
                }
            }
            Logger.init().info("VUE-APP beforeDestroy,把所有录制状态设为暂停录制");
            let list = Cache.readRoomList();
            list.forEach((item: any) => {
                item['recordStatus'] = Recorder.STATUS_PAUSE;
            });
            Cache.writeRoomList(list);
        },
        destroyed() {
            Logger.init().info("VUE-APP destroyed");
        }

    });
</script>
<style lang="scss">
    html,
    body {
        height: 100%;
        padding: 0;
        margin: 0;
        user-select: none;
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
