《咀嚼之味》博客
===========

本博客遵循MIT开源协议。

## 如何组建出我的博客
- Jekyll: 静态网站模版引擎
- Github Pages: 挂载博客的服务器
- UPYUN: 将静态图片都存放于又拍云上
- grunt: 用于网站的静态文件自动合并压缩，并部署
- 加速乐: DNS解析与线路优化
- React: 使用React来组织“[所有文章](http://jerryzou.com/all-articles/)”页面

## 安装依赖环境

```bash
# 如果你的系统没有 ruby 环境，请先安装
# 使用 gem 安装主要的依赖
gem install jekyll bundler

# 安装依赖的 gem 包
bundler install

# 全局安装 grunt
npm install -g grunt
# or
yarn global add grunt

# 安装依赖的 npm 包
npm install
# or
yarn
```

如果使用 yarn 全局安装 grunt 成功后，在 Terminal 中依然无法使用 grunt，请参考 [yarn#1321](https://github.com/yarnpkg/yarn/issues/1321)

## 编译与部署

```bash
grunt build      # 本地编译
grunt debug      # 本地编译并启动测试服务器
grunt release    # 本地编译出线上版本（应用各种优化）
grunt serve      # 本地编译并启动测试服务器（应用各种优化）
grunt deploy     # 将站点发布到 gh-pages 分支下
```
