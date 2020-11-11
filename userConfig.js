module.exports = {
	build: { // 构建项目的路径配置
		srcPath: 'src',
		tempPath: '.temp',
		distPath: 'dist',
		publicPath: 'public',
		srcPaths: {
			styles: 'assets/styles/*.scss',
			scripts: 'assets/scripts/*.js',
			script_ts: 'assets/scripts/*.ts',
			pages: '*.html',
			images: 'assets/images/**',
			fonts: 'assets/fonts/**',
			public: '**', // cwd: publicPath
		},
	},
	pageDate: {}, // 模板引擎数据
};