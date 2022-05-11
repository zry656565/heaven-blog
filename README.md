《咀嚼之味》博客
===========

[![CircleCI](https://circleci.com/gh/zry656565/heaven-blog.svg?style=svg)](https://circleci.com/gh/zry656565/heaven-blog)

本博客遵循MIT开源协议。

## 如何组建出我的博客
- Jekyll: 静态网站模版引擎
- Github Pages: 挂载博客的服务器
- grunt: 用于网站的静态文件自动合并压缩，并部署
- React: 使用React来组织“[所有文章](https://jerryzou.com/all-articles/)”页面

## 安装依赖环境

```bash
# 如果你的系统没有 ruby 环境，请先安装
# 使用 gem 安装主要的依赖
gem install jekyll bundler

# 安装依赖的 gem 包
bundle install

# 安装依赖的 npm 包
yarn install
```

## FAQ

1. 如果你无法在 Mac 上启动 Jekyll 参见[Jekyll on macOS](https://jekyllrb.com/docs/installation/macos/)

## 编译与部署

```bash
yarn grunt build      # 本地编译
yarn grunt debug      # 本地编译并启动测试服务器
yarn grunt release    # 本地编译出线上版本（应用各种优化）
yarn grunt serve      # 本地编译并启动测试服务器（应用各种优化）
yarn grunt deploy     # 将站点发布到 gh-pages 分支下
```
