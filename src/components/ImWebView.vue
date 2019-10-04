<template>
    <webview id="webview" :src="src" v-bind:style="mapStyle" :preload="preload"></webview>
</template>

<script>
    import path from "path";
    import Vue from "Vue";

    //./aria2c.exe 'https://ip177746452.cdn.qooqlevideo.com/key=HEhPMprog4fiuAb8itbIgA,s=,end=1569854434,limit=2/data=1569854434/state=OvkX/referer=force,.avgle.com/reftag=56109644/media=hlsA/ssd7/177/7/56558017.m3u8' --user-agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.131 Safari/537.36" --referer='https://avgle.com'
    // ./aria2c.exe -i "56558017.m3u8" -d .tmp-5655807 --user-agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.131 Safari/537.36" --referer='https://avgle.com'
    //ffmpeg -y -f concat -safe -1 -i "56558017.m3u8" -c copy -bsf:a aac_adtstoasc ./56558017.mp4
    export default Vue.extend({
        name: "ImWebView",
        data() {
            return {
                mapStyle: {
                    'display': 'inline-flex',
                    'width': this.width,
                    'height': this.height,
                }
            }
        },
        props: {
            src: {
                type: String,
            },
            width: {
                type: String,
                default: '100%'
            },
            height: {
                type: String,
                default: '100%'
            },
            suffreg: {
                type: String,
                default: 'm3u8'
            },
            preload: {
                type: String,
                default: `file:${path.join(process.cwd(), "resources/preload.js")}`,
            }
        },
        mounted() {
            const webview = document.querySelector('webview');
            let wq = webview.getWebContents().session.webRequest;
            let str = `${this.suffreg}`;
            let reg = new RegExp(str);
            wq.onResponseStarted((details) => {
                if (reg.test(details.url)) {
                    this.$emit('getWebviewUrl', details.url)
                }
            });
            // wq.onCompleted((details) => {
            //     if (/flv/.test(details.url)) console.log(details);
            // });

            // webview.addEventListener('dom-ready', () => {
            //     // console.log('dom-ready');
            // });
            //
            // webview.addEventListener("ipc-message", (event) => {
            //     // console.log("channel: " + event.channel, event)
            // })
        }
    });
</script>

<style scoped>

</style>


<!--
            webview.addEventListener('dom-ready', () => {
                // @ts-ignore

            });-->
