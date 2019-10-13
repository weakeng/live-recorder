<template>
    <div class="header">
        <div class="list">
            <a class="item" :class="{'active':0===activeIndex}" @click="selectMenu(0)">
                <div class="menu-icon">
                    <Icon type="md-radio-button-on" size="55" color="#FFF"></Icon>
                </div>
                <div class="menu-title">
                    <span class="title">直播录制</span>
                </div>
            </a>
            <a class="item" :class="{'active':1===activeIndex}" @click="selectMenu(1)">
                <div class="menu-icon">
                    <Icon type="md-videocam" size="55" color="#FFF"></Icon>
                </div>
                <div class="menu-title">
                    <span class="title">视频管理</span>
                </div>
            </a>
            <a class="item" :class="{'active':2===activeIndex}" @click="selectMenu(2)">
                <div class="menu-icon">
                    <Icon type="md-settings" size="55" color="#FFF"></Icon>
                </div>
                <div class="menu-title">
                    <span class="title">软件设置</span>
                </div>
            </a>
            <a class="item" :class="{'active':3===activeIndex}" @click="selectMenu(3)">
                <div class="menu-icon">
                    <Icon type="md-eye" size="55" color="#FFF"></Icon>
                </div>
                <div class="menu-title">
                    <span class="title">资源探测</span>
                </div>
            </a>
        </div>
    </div>
</template>

<script lang="ts">
    import {Vue,Component} from "vue-property-decorator"

    @Component
    export default class extends Vue {
        private activeIndex = 0;

        selectMenu(index: number) {
            if (this.activeIndex === index) return;
            this.activeIndex = index;
            switch (index) {
                case 0:
                    this.$router.push({name: 'home'});
                    break;
                case 1:
                    this.$router.push({name: 'video'});
                    break;
                case 2:
                    this.$router.push({name: 'setting'});
                    break;
                case 3:
                    this.$router.push({name: 'resource'});
                    break;
            }
        }
    }

</script>

<style lang="scss" scoped>
    .header {
        width: 100%;
        height: 95px;
        -webkit-app-region: drag;
        background: rgb(227, 74, 99);

        .list {
            display: flex;
            flex-direction: row;
            padding-left: 20px;
            height: 100%;

            a.item {
                display: block;
                width: 100px;
                height: 100%;
                -webkit-app-region: no-drag;

                &.active {
                    background: -webkit-linear-gradient(
                                    rgba(218, 60, 86, 0),
                                    rgba(218, 60, 86, 1)
                    );
                }

                &:hover {
                    cursor: pointer;
                }

                .menu-icon {
                    width: 55px;
                    margin: 10px auto;

                    Icon {
                        text-align: center;
                    }
                }

                .menu-title {
                    text-align: center;

                    .title {
                        color: #fff;
                    }
                }
            }
        }
    }
</style>