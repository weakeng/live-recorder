<template>
  <div class="header">
    <div class="list">
      <a class="item active">
        <div class="menu-icon">
          <Icon type="md-radio-button-on" size="55" color="#FFF"></Icon>
        </div>
        <div class="menu-title">
          <span class="title">直播录制</span>
        </div>
      </a>
      <a class="item">
        <div class="menu-icon">
          <Icon type="md-videocam" size="55" color="#FFF"></Icon>
        </div>
        <div class="menu-title">
          <span class="title">视频管理</span>
        </div>
      </a>
      <a class="item">
        <div class="menu-icon">
          <Icon type="ios-cut" size="55" color="#FFF"></Icon>
        </div>
        <div class="menu-title">
          <span class="title">视频合成</span>
        </div>
      </a>
      <a class="item">
        <div class="menu-icon">
          <Icon type="md-settings" size="55" color="#FFF"></Icon>
        </div>
        <div class="menu-title">
          <span class="title">软件设置</span>
        </div>
      </a>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({});
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