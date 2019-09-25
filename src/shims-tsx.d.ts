import Vue, {VNode} from 'vue'
import {LiveInfoJson} from './vendor/live/Json';

declare global {
    namespace JSX {
        // tslint:disable no-empty-interface
        interface Element extends VNode {
        }

        // tslint:disable no-empty-interface
        interface ElementClass extends Vue {
        }

        interface IntrinsicElements {
            [elem: string]: any
        }
    }
}

declare module "vue/types/vue" {
    interface Vue {
        cmdList: any
    }
}
