import {Vue, Component} from "vue-property-decorator";
import Cache from "../../vendor/Cache";
import path from "path";
import fs from "fs";
import Notice from "@/vendor/Notice";
import {settingJson} from "@/vendor/Json";


@Component({
    name: 'setting'
})
export default class extends Vue {
    public setting: settingJson = Object.assign(
        {
            savePath: path.join(process.cwd(), "resources/video/"),
            refreshTime: 10,
            videoTime: 20,
            notice: true
        },
        Cache.getConfig()
    );

    onSaveFolderSelect(e: any) {
        let file = e.target.files[0];
        if (!file) return;
        this.setting.savePath = path.join(file.path);
    }

    confirm() {
        this.$Modal.confirm({
            title: '完成设置',
            content: `确认无误后点击确定保存设置`,
            onOk: () => {
                if (!fs.existsSync(this.setting.savePath)) {
                    Notice.showError(this, '无效的文件路径');
                } else if (this.setting.refreshTime > 50 || this.setting.refreshTime < 5) {
                    Notice.showError(this, '刷新时间可填范围5-50');
                } else if (this.setting.videoTime > 60 || this.setting.videoTime < 10) {
                    Notice.showError(this, '视频分段时间可填范围10-60');
                } else {
                    Cache.writeConfig(this.setting);
                    Notice.showInfo(this, '设置已生效');
                }
            }
        });
    }

    reset() {
        this.$Modal.confirm({
            title: '提示',
            content: `确认要恢复默认设置吗`,
            onOk: () => {
                let setting: settingJson = {
                    savePath: path.join(process.cwd(), "resources/video/"),
                    refreshTime: 10,
                    videoTime: 20,
                    notice: true
                };
                this.setting = setting;
                Cache.writeConfig(setting);
                Notice.showInfo(this, '已恢复默认设置');
            }
        });
    }
}