<template>
    <div class="header">
        <div class="left">
            <Icon type="ios-film" size="25" color="#FFF"></Icon>
            <span class="app-name">直播录制小助手</span>
        </div>
        <div class="right">
            <div class="icon">
                <Icon class='min' type="md-remove" size="18" color="#FFF" @click="minFrame()"></Icon>
                <Icon class='close' type="md-close" size="18" color="#FFF" @click="closeFrame()"></Icon>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
    import Vue from "vue";
    import {remote} from "electron"

    export default Vue.extend({
        methods: {
            minFrame() {
                remote.getCurrentWindow().minimize();
            },
            closeFrame() {
                remote.getCurrentWindow().close();
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