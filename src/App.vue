<template>
    <div id="app">
        <Nav></Nav>
        <Header></Header>
        <div class="main">
            <keep-alive :include="cachedViews">
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
    import LiveFactory from "@/vendor/live/LiveFactory";

    export default Vue.extend({
        data() {
            return {
                cachedViews: ['home','resource']
            }
        },


        async mounted() {
            // let live= LiveFactory.getLive("https://www.huajiao.com/user/184800796");
            // await live.refreshRoomData();
            // console.log(live);
            // let l=await live.getLiveUrl();
            // console.log(live,l);
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
