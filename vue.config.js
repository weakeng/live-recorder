module.exports = {
    pluginOptions: {
        electronBuilder: {
            removeElectronJunk: false, // True by default
            builderOptions: {
                extraFiles: ['./resources/']
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
