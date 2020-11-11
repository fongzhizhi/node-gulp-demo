const {src, dest, parallel, series, watch} = require('gulp')
const _del = require('del')	// 文件移除模块
const { join } = require('path')
const loadPlugins = require('gulp-load-plugins')
const browserSync = require('browser-sync') // 服务器模块

const plugins = loadPlugins(); // 加载所有本地已安装的gulp插件
// 文件配置项(用户自定义)
const default_userConfig = {
	build: { // 构建项目的路径配置
		srcPath: 'src',
		tempPath: 'temp',
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
const userConfig = Object.assign({}, default_userConfig, require('./userConfig'));

const pathBuild = userConfig.build;
const srcPaths = pathBuild.srcPaths;

/** 
 * 样式编译
*/
const style = () => {
	return src(srcPaths.styles, { base: pathBuild.srcPath, cwd:  pathBuild.srcPath})
		.pipe(plugins.sass({ outputStyle: 'expanded' }))
		.pipe(dest(pathBuild.tempPath))
}

/** 
 * 脚本编译
*/
const script = () => {
	return src(srcPaths.scripts, { base: pathBuild.srcPath, cwd:  pathBuild.srcPath})
		.pipe(plugins.babel({ presets: ['@babel/preset-env'] }))
		.pipe(dest(pathBuild.tempPath))
}
const script_ts = () => {
	return src(srcPaths.script_ts, { base: pathBuild.srcPath, cwd:  pathBuild.srcPath})
		.pipe(plugins.typescript( { noImplicitAny: true }))
		.pipe(dest(pathBuild.tempPath))
}

/** 
 * 模板引擎编译
*/
const page = () => {
	return src(srcPaths.pages, { base: pathBuild.srcPath, cwd:  pathBuild.srcPath})
		.pipe(plugins.swig({ data: userConfig.pageDate, cache: false }))
		.pipe(dest(pathBuild.tempPath))
}

/** 
 * 图片压缩
*/
const image = () => {
	return src(srcPaths.images, { base: pathBuild.srcPath, cwd:  pathBuild.srcPath})
    	.pipe(plugins.imagemin())
    	.pipe(dest(pathBuild.distPath))
}
const font = () => {
	return src(srcPaths.fonts, { base: pathBuild.srcPath, cwd:  pathBuild.srcPath})
    	.pipe(plugins.imagemin())
    	.pipe(dest(pathBuild.distPath))
}

/** 
 * 额外的任务：复制一些必要的文件等
*/
const extra = () => {
	return src(srcPaths.public, { base: pathBuild.publicPath, cwd:  pathBuild.publicPath})
    	.pipe(dest(pathBuild.distPath))
}

/**
 * 服务器
 */
const server = () => {
	const bs = browserSync.create();
	const opts = { cwd: pathBuild.srcPath };
	// 编译文件监控
	watch(srcPaths.styles, opts, series(style, bs.reload));
	watch(srcPaths.scripts, opts, series(script, bs.reload));
	watch(srcPaths.script_ts, opts, series(script_ts, bs.reload));
	watch(srcPaths.pages, opts, series(page, bs.reload));
	// 静态资源一般无需重新编译，只需要重启服务器即可
	watch([
		srcPaths.pages,
		srcPaths.fonts,
		srcPaths.public,
	], opts , bs.reload);

	bs.init({
		notify: false,
		open: true,
		port: 3000,
        server: {
			baseDir: [pathBuild.tempPath, pathBuild.srcPath, pathBuild.publicPath], // 依次查找请求资源路径
			routes: { // 路由
				"/node_modules": 'node_modules',
			}
        }
    });
}

/** 
 * 清除目录和文件
*/
const clean = () => {
	return _del([pathBuild.tempPath, pathBuild.distPath])
}

/** 
 * useref:文件引用处理
*/
const useref = () =>{
	return src(join(pathBuild.tempPath, srcPaths.pages), { base: pathBuild.tempPath})
		.pipe(plugins.useref({ searchPath: [pathBuild.tempPath, '.'] }))
		.pipe(plugins.if(/\.js$/, plugins.uglify())) // js压缩
		.pipe(plugins.if(/\.css$/, plugins.cleanCss())) // css压缩
		.pipe(plugins.if(/\.html$/, plugins.htmlmin({ // html压缩
			collapseWhitespace: true,
			minifyCss: true,
			minifyJs: true,
		})))
		.pipe(dest(pathBuild.distPath))
}

// 任务组合
const compile = parallel(style, script, script_ts, page)
const develop = series(clean, compile, server)
const build = series(clean, parallel(compile, image, font, extra), useref)
module.exports = {
	clean,
	dev: develop,
	build,
}