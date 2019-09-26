<template>
    <div class="video">
        <div class="head">
            <Row>
                <Col span="8" style="padding-right:10px">
                    <label>
                        <Select v-model="nickName" filterable placeholder="输入或选择主播名称" @on-change="nickChange()">
                            <Option v-for="(item,index) in nickNameList" :value="item" :key="index">{{item}}</Option>
                        </Select>
                    </label>
                </Col>
                <Col span="6" style="padding-right:10px">
                    <DatePicker  v-model="dateText" @on-clear="clearDate()" @on-change="dateChange()" type="date" placeholder="选择日期"></DatePicker>
                </Col>

                <Col span="6">
                    <Button @click="resetData()">清空搜索</Button>
                </Col>
            </Row>
        </div>
        <div class="content">
            <Table border :columns="headTable" :data="fileList" size="small"></Table>
        </div>
    </div>
</template>
<script src="./Video.ts" lang="ts"></script>
<style src="./Video.scss" lang="scss"></style>