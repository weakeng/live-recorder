<template>
    <div class="page-resource">
        <Table border :columns="headArr" :data="resourceList"></Table>
        <Modal cancel-text="关闭" v-model="isShowModal" title="探测资源" @on-ok="modalSure" @on-cancel="modalCancel" width="800px">
            <webview  v-if="isShowModal"  ref="webviewRef" id="webview" :src="webViewData.src" style="display: flex;height:380px;width: 100%"
                     :preload="webViewData.preload"></webview>
            <div slot="header">
                <Input search v-model="webViewData.src" enter-button="GO"  @on-search="searchResource"  @on-change="searchResource" placeholder="请输入网址探测资源..." />
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