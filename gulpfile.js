// 实现这个项目的构建任务
const {src,dest,parallel,series,watch} = require("gulp");
const plugins = require('gulp-load-plugins')();
const borwserSync = require('browser-sync') 
const bs = borwserSync.create()//自动打开浏览器 
const cwd = process.cwd();//返回当前工作目录 
let config = {

};
try {
  const loadconfig = require(`${cwd}/pages.config.js`)
  config = Object.assign({},loadconfig)
} catch (error) {
  
}

const style = () =>{
    return src(config.build.path.styles,{base:config.build.src,cwd:config.build.src})
    .pipe(plugins.sass({outputStyle: 'expanded'}))
    .pipe(dest(config.build.temp))
}

const scripts = () =>{
    return src(config.build.path.scripts,{base:config.build.src,cwd:config.build.src})
    .pipe(plugins.babel({presets: [require('@babel/preset-env')]}))
    .pipe(dest(config.build.temp))
}

const page = () =>{
    return src(config.build.path.pages,{base:config.build.src,cwd:config.build.src})
    .pipe(plugins.swig({data:config.data}))
    .pipe(dest(config.build.temp))
}

const img = () =>{
    return src(config.build.path.images,{base:config.build.src,cwd:config.build.src}).pipe(plugins.cache(
        plugins.imagemin({
            progressive : true,//是否渐进的优化
            svgoPlugins : [{removeViewBox:false}],//svgo插件是否删除幻灯片
            interlaced : true //是否各行扫描
        })
    )).pipe(dest(config.build.dist))
}

const font = () => {
    return src(config.build.path.fonts,{base:config.build.src,cwd:config.build.src})
    .pipe(plugins.imagemin())
    .pipe(dest(config.build.dist))
}

const extra = () =>{
    return src('**',{base:config.build.public,cwd:config.build.public})
    .pipe(dest(config.build.dist))
}

const clean = () =>{
    return src([config.build.dist,config.build.temp])
    .pipe(plugins.clean())
}
const useref = () =>{
    return src(config.build.path.pages,{base: config.build.temp,cwd:config.build.temp}).pipe(plugins.useref({searchPath:[config.build.temp,'.'] }))
            .pipe(plugins.if(/\.js$/, plugins.uglify()))
            .pipe(plugins.if(/\.css$/, plugins.cleanCss()))
            .pipe(plugins.if(/\.html$/, plugins.htmlmin({ 
                collapseWhitespace: true,
                minifyCSS: true, //页面里的style和js脚本压缩
                minifyJS: true
            }))) //html    
           .pipe(dest(config.build.dist)) 
}

const serve = () => {  
    watch(config.build.path.styles, {cwd:config.build.src},style)
    watch(config.build.path.scripts,{cwd:config.build.src}, scripts)
    watch(config.build.path.pages,{cwd:config.build.src},  page)
    watch([
        config.build.path.images,
        config.build.path.fonts,
    ], {cwd:config.build.src},bs.reload)
    watch("**", {cwd:config.build.public},bs.reload)    
    bs.init({
      notify: false,
      port: 3000,
      files:'temp/**',//监听dist文件下有改动的时候刷新页面
      server: {
        baseDir: ['temp','src','public'],
        routes: {
          '/node_modules': 'node_modules' //自动映射到项目下的node_modules
        }
      }
    })
}
const compile =  parallel([style,scripts,page]);
// clean, 
const build = series(parallel(series(compile, useref),extra, img, font))

const develop = series(compile,serve)

module.exports = {
    clean,
    build,
    develop,
    style,
    page,
    scripts,
}