<template>
    <div id="app">
        <Nav></Nav>
        <!-- <div id="nav">
          <router-link to="/">Home</router-link>|
          <router-link to="/about">About</router-link>
        </div>-->
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
    import CCLive from "@/vendor/live/CCLive";


    export default Vue.extend({
        async mounted() {
            let cclive = new CCLive('https://cc.163.com/347831124');
            await cclive.refreshRoomData();
            let list = await cclive.getLiveUrl();
            console.log(cclive, list);
        },
        components: {
            Nav,
            Header,
            Footer
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
