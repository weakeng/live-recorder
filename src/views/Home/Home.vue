<template>
  <div class="home">


    <Table border :columns="liveInfoHeader" :data="liveInfoList" size="large"></Table>
    <div class="btn-add">
      <Button
        type="error"
        size="large"
        shape="circle"
        icon="md-add"
        @click="modal_add_live = true"
      />
    </div>
    <Modal v-model="modal_add_live" title="添加主播" @on-ok="sureAddLive" @on-cancel="cancelAddLive">
      <RadioGroup v-model="addLive_method" size="large">
        <Radio label="输入网址"></Radio>
        <Radio label="输入房间号"></Radio>
      </RadioGroup>
        <Input
          v-model="siteAddress"
          v-show="addLive_method==='输入网址'"
          icon="md-open"
          style="margin-top:20px;"
          placeholder="请输入直播网址"
        >
        </Input>
        <Input
          v-model="roomNumber"
          v-show="addLive_method==='输入房间号'"
          style="margin-top:20px;"
          placeholder="请输入真实房间号码"
        >
            <Select v-model="siteCode" slot="prepend" style="width: 80px">
              <Option
                v-for="(vo,index) in siteNameList"
                :key="index"
                :value="vo['siteCode']"
              >{{vo.siteName}}
              </Option>
            </Select>
        </Input>
    </Modal>
  </div>
</template>
<script lang="ts" src="./Home.ts"></script>
<style src="./Home.scss" lang="scss"></style>