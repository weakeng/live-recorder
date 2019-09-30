module.exports = {
    pluginOptions: {
        electronBuilder: {
            builderOptions: {
                productName: "直播录制小助手",
                win: {//win相关配置
                    "icon": "./public/app.ico",//图标，当前图标在根目录下，注意这里有两个坑
                    "target": [
                        {
                            "target": "nsis",//利用nsis制作安装程序
                            "arch": [
                                "x64"//64位
                            ]
                        }
                    ],
                    extraFiles: ['./resources/bin/win32']
                },
                linux: {
                    "icon": "./public/app.ico",
                    extraFiles: ['./resources/bin/linux']
                },
                nsis: {
                    "oneClick": false, // 是否一键安装
                    "allowElevation": true, // 允许请求提升。 如果为false，则用户必须使用提升的权限重新启动安装程序。
                    "allowToChangeInstallationDirectory": true, // 允许修改安装目录
                    "installerIcon": "./public/app.ico",// 安装图标
                    "uninstallerIcon": "./public/app.ico",//卸载图标
                    "installerHeaderIcon": "./public/app.ico", // 安装时头部图标
                    "createDesktopShortcut": true, // 创建桌面图标
                    "createStartMenuShortcut": true,// 创建开始菜单图标
                    "shortcutName": "直播录制小助手", // 图标名称
                },
                appId: "com.gsonhub.recorder",
                // extraFiles: ['./resources/bin/']
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
