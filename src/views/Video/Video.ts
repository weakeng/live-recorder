import Vue from "Vue";
import fs from 'fs';
import path from "path";

export default Vue.extend({
    mounted: function () {
        let savePath = path.join(process.cwd(), "resources/video", '虎牙直播', 'QL-安妮','2019-9-25');
        let res=fs.readdirSync(savePath);
        console.log(res);
    }
});