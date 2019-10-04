<template>
    <div class="page-resource">
        <Table border :columns="headArr" :data="resourceList"></Table>
        <Modal cancel-text="关闭" v-model="modal_get_resource" title="探测资源" @on-ok="modal_ok" @on-cancel="modal_cancel" width="800px">
            <webview :useragent="userAgent" v-if="modal_get_resource"  ref="webview" id="webview" :src="websrc" style="display: flex;height:380px;width: 100%"
                     :preload="preload"></webview>
            <div slot="header">
                <Input search v-model="websrc" enter-button="GO"  @on-search="search_resource"  @on-change="search_resource" placeholder="请输入网址探测资源..." />
            </div>
        </Modal>
        <div class="btn-add">
            <Button
                    type="error"
                    size="large"
                    shape="circle"
                    icon="md-add"
                    @click="openModal()"
            />
        </div>
    </div>
</template>

<script src="./Resource.ts" lang="ts"></script>
<style src="./Resource.scss" lang="scss"></style>