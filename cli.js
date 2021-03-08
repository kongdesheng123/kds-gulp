#!/usr/bin/env node
// 所以配置#!/usr/bin/env node, 就是解决了不同的用户node路径不同的问题
// 可以让系统动态的去查找node来执行你的脚本文件

// 脚手架的工作过程：
// 1. 通过命令行交互询问用户问题
// 2. 根据用户回答的结果生成文件

const path = require('path')
const inquirer = require('inquirer')
const fs = require('fs')
const ejs = require('ejs')
inquirer.prompt([
    {
        type: 'input',
        name: 'name',
        message: '模板名称',
        validate: function(val) {
            if (!val) {
                return '模板名称不为空'
            } else {
                return true;
            }        
        }
    },
    {
        type: 'input',
        name: 'description',
        message: '模板描述',
        validate: function(val) {
            if (!val) {
                return '模板名称不为空'
            } else {
                return true;
            }        
        }
    },
    {
        type: 'input',
        name: 'npm',
        message: '模板包名称，（ps: 创建项目使用这个npm包）',
        validate: function(val) {
            if (!val) {
                return '模板名称不为空'
            } else {
                return true;
            }        
        }
    }    
]).then(answer=>{
    // 模板目录
    const tmplDir = path.join(__dirname, 'templates')
    // 目标目录
    const destDir = process.cwd()  
    fs.readdir(tmplDir, (err, files) => {
        if (err) {
            throw err;
        }
        files.forEach(file => {
            // console.log(file);
            ejs.renderFile(path.join(tmplDir, file), answer, (err, result) => {
                if (err) {
                    throw err;
                }
                // 将结果写入目标文件路径
                fs.writeFileSync(path.join(destDir, file), result)
            })
        })
    })
})
