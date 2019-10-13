<template>
    <div class="v-setting">
        <Form ref="form" :label-width="120">
            <FormItem label="开启录播通知">
                <i-switch size="large" v-model="setting.notice"></i-switch>
            </FormItem>
            <FormItem label="刷新直播间隔" prop="checkInterval">
                <InputNumber
                        :max="50"
                        :min="5"
                        v-model="setting.refreshTime"
                        :formatter="value => `${value}秒`"
                        :parser="value => value.replace('秒', '')"
                ></InputNumber>
            </FormItem>
            <FormItem label="视频分段时间" prop="segment">
                <InputNumber
                        :max="60"
                        :min="10"
                        v-model="setting.videoTime"
                        :formatter="value => `${value}分钟`"
                        :parser="value => value.replace('分钟', '')"
                ></InputNumber>
            </FormItem>
            <FormItem label="视频保存路径" prop="saveFolder" style="width: 400px">
                <input ref="saveFolder" type="file" webkitdirectory @change="onSaveFolderSelect"/>
                <i-input v-model="setting.savePath" readonly :title="setting.savePath">
                    <Icon type="md-folder" slot="suffix" @click="$refs.saveFolder.click()"></Icon>
                </i-input>
            </FormItem>
            <FormItem class="buttons">
                <Button type="success" @click="confirm" style="margin-right:10px">确认完成设置</Button>
                <Button @click="reset()">恢复默认设置</Button>
            </FormItem>
        </Form>
    </div>
</template>

<script src="./Setting.ts" lang="ts"></script>
<style src="./Setting.scss" lang="scss"></style>