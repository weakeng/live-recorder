module.exports = {
    pluginOptions: {
        electronBuilder: {
            productName: "直播录制小助手",
            removeElectronJunk: false, // True by default
            win: {
                "icon": "./public/favicon.ico"
            },
            "nsis": {
                "oneClick": false,
                "allowToChangeInstallationDirectory": true
            },
            "appId": "com.gsonhub.recorder",
            builderOptions: {
                extraFiles: ['./resources/bin/', './resources/cache/']
            },
            chainWebpackRendererProcess: config => {
                config.plugin('define').tap(args => {
                    args[0]['process.env.FLUENTFFMPEG_COV'] = false
                    return args
                })
            }
        }
    }
}
