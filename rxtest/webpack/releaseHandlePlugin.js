function ReleaseHandlePlugin(options) {
    this.env = options.env;
}

ReleaseHandlePlugin.prototype.apply = function (complier) {
    complier.plugin('compilation', compilation => {

        compilation.plugin('optimize-modules', modules => {
            modules.forEach(mod => {

                if (this.env === 'test') {
                    mod._source._value = mod._source._value.replace(/api.dianwutong.com/g, 'api.test.dianwutong.com');
                    mod._source._value = mod._source._value.replace(/account.dianwutong.com:(\d+)/g, 'account.test.dianwutong.com');
                } else if (this.env === 'production') {
                    mod._source._value = mod._source._value.replace(/account.dianwutong.com:(\d+)/g, 'account.dianwutong.com');
                }
            });
        });

        compilation.plugin(
            'html-webpack-plugin-before-html-processing',
            (data, cb) => {
                let html = data.html;
                html = html.replace('<script type="text/javascript" src="build/dev/vendor.dll.js"></script>','');

                if(this.env === 'test'){
                    html = html.replace(/account.dianwutong.com:(\d+)/g, 'account.test.dianwutong.com')
                }else if(this.env === 'production'){
                    html = html.replace(/account.dianwutong.com:(\d+)/g, 'account.dianwutong.com')
                }
                
                data.html = html;

                cb(null, data)
            }
        )

    });

}


module.exports = ReleaseHandlePlugin;