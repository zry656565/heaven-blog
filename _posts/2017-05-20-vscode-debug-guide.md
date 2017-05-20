---
date: 2017-05-20 19:50:00 +0800
title: Visual Studio Code 前端调试不完全指南
description: Visual Studio Code (以下简称 vscode) 如今已经代替 Sublime，成为前端工程师们最喜爱的代码编辑器。它作为一个大型的开源项目，不断推陈出新；社区中涌现出大量优质的插件，以支持我们更加舒服地进行开发工作。在近期的工作中，我尝试通过 vscode 来提升调试代码的幸福度，积累了一点点小心得在此与大家分享一下
permalink: /posts/vscode-debug-guide/
key: 10038
labels: [vscode, debug, JavaScript]
---

**Visual Studio Code** (以下简称 vscode) 如今已经代替 Sublime，成为前端工程师们最喜爱的代码编辑器。它作为一个大型的开源项目，不断推陈出新；社区中涌现出大量优质的插件，以支持我们更加舒服地进行开发工作。在近期的工作中，我尝试通过 vscode 来提升调试代码的幸福度，积累了一点点小心得在此与大家分享一下。

接下来的内容将从以下几方面进行展开：

1. launch / attach
2. 调试前端代码
3. 调试通过 Nodemon 启动的 Node 服务器

## 1. launch / attach

要使用 vscode 的调试功能，首先就得配置 `.vscode/launch.json` 文件。以最简单的 Node 调试配置为例：

{% highlight json %}
{
    "version": "0.2.0",
    "configurations": [
        {
            "type": "node",
            "request": "launch",
            "name": "Launch",
            "program": "${workspaceRoot}/index.js"
        },
        {
            "type": "node",
            "request": "attach",
            "name": "Attach",
            "port": 5858
        }
    ]
}
{% endhighlight %}

其中最重要的参数是 `request` ，它的取值有两种 `launch` 和 `attach`。

- **launch**模式：**由 vscode 来启动**一个独立的具有 debug 模式的程序
- **attach**模式：附加于（也可以说“监听”）一个**已经启动的程序**（必须已经开启 Debug 模式）

这两种截然不同的模式到底有什么具体的应用场景呢？且看后文。

## 2. 调试前端代码

通过 vscode 调试前端代码主要依赖于一个插件：[Debugger for Chrome](https://github.com/Microsoft/vscode-chrome-debug)，该插件主要利用 [Chrome 所开放出来的接口](https://chromedevtools.github.io/devtools-protocol/) 来实现对其渲染的页面进行调试。可以通过 `Shift + Cmd + X` 打开插件中心，搜索对应插件后直接安装。安装完成并重新加载 vscode 后，可以直接点击调试按钮并创建新的启动配置。如果你之前已经创建过启动配置了，就可以直接打开 `.vscode/launch.json` 进行修改。

![vscode-debug-chrome][1]

其中调试 Chrome 页面的配置如下所示：

{% highlight json %}
{
    "version": "0.2.0",
    "configurations": [
        {
            "type": "chrome",
            "request": "launch",
            "name": "启动一个独立的 Chrome 以调试 frontend",
            "url": "http://localhost:8091/frontend",
            "webRoot": "${workspaceRoot}/frontend"
        }
    ]
}
{% endhighlight %}

如之前所述，通过第一个 launch 配置就能启动一个通过 vscode 调试的 Chrome。大家可以直接使用我组织好的项目 [zry656565/vscode-debug-sample](https://github.com/zry656565/vscode-debug-sample) 进行测试，测试方法在该项目的 README 里面写得很清楚了。简要步骤概括为：

1. `npm run frontend`
2. 启动调试配置：“启动一个独立的 Chrome 以调试 frontend”
3. 在 `frontend/index.js` 中加断点
4. 访问 `http://localhost:8091/frontend/`

### 延伸问题

使用 `launch` 模式调试前端代码存在一个问题，就是 vscode 会以新访客的身份打开一个新的 Chrome 进程，也就是说你**之前在 Chrome 上装的插件都没法在这个页面上生效**（如下图所示）。

![vscode-debug-launch][2]

在这种情况下 `attach` 模式就有它存在的意义了：对一个已经启动的 Chrome 进行监听调试。

{% highlight json %}
{
    "version": "0.2.0",
    "configurations": [
        {
            "type": "chrome",
            "request": "attach",
            "name": "监听一个已经启动调试模式的 Chrome",
            "port": 9222,
            "url": "http://localhost:8091/frontend",
            "webRoot": "${workspaceRoot}/frontend"
        }
    ]
}
{% endhighlight %}

其中 9222 是 Chrome 的调试模式推荐的端口，可以根据需要进行修改。不过目前我并没有成功实施这个设想，对此有兴趣的同学可以从下面这两个链接入手去研究一下：
- [Chrome DevTools Protocol Viewer](https://chromedevtools.github.io/devtools-protocol/)
- [Debugger for Chrome / Attach](https://github.com/Microsoft/vscode-chrome-debug/blob/master/README.md#attach)

有一部分遇到的问题可以直接在 Debugger for Chrome 的 FAQ 中得到解答。

## 3. 调试通过 Nodemon 启动的 Node 服务器

如今，使用 Node 服务器开发一些中间层的服务也慢慢纳入了所谓“大前端”的范畴。而在开发 Node 服务时，我们通常要借助类似于 [nodemon](https://github.com/remy/nodemon) 这样的工具来避免频繁手动重启服务器。在这种情况下，我们又如何利用 vscode 来进行断点调试呢？先来看看示例配置文件：

{% highlight json %}
{
    "version": "0.2.0",
    "configurations": [
        {
            "type": "node",
            "request": "attach",
            "name": "附加于已启动的 Node 服务器（debug模式）",
            "port": 5858,
            "restart": true
        },
        {
            "type": "node",
            "request": "attach",
            "name": "附加于已启动的 Node 服务器（inspect模式）",
            "port": 9229,
            "restart": true
        }
    ]
}
{% endhighlight %}

首先，为了配合 nodemon 在监听到文件修改时重启服务器，此处需要添加一个 `restart` 参数。同时大家可能注意到了，这里给出了两种模式，大家可能根据以下区别来选择合适自己的协议：

| Runtime | 'Legacy Protocol' | 'Inspector Protocol' |
| ------ | ------- | ------- |
| io.js | all | no |
| node.js | < 8.x | >= 6.3 (Windows: >= 6.9) |
| Electron | all | not yet |
| Chakra | all | not yet |

通俗来说，旧版 Node (< 6.3) 推荐使用 Legacy Protocol (`--debug`模式，默认 5858 端口)，而新版的 Node (>= 6.3) 推荐使用 Inspector Protocol (`--inspect`模式，默认 9229 端口)。

需要注意的是，在启动 nodemon 程序时，也要添加对应的参数，比如：

{% highlight shell-session %}
nodemon --debug server/app.js
nodemon --inspect server/app.js
{% endhighlight %}

详细的例子同样可以在 [zry656565/vscode-debug-sample](https://github.com/zry656565/vscode-debug-sample) 中找到。

## 参考资料

- [VS Code - Debugger for Chrome - README](https://github.com/Microsoft/vscode-chrome-debug/blob/master/README.md)
- [Debugging in VS Code](https://code.visualstudio.com/docs/editor/debugging)
- [Chrome DevTools Protocol Viewer](https://chromedevtools.github.io/devtools-protocol/)
- [bdspen/nodemon_vscode](https://github.com/bdspen/nodemon_vscode)
- [Node.js Debugging in VS Code](https://code.visualstudio.com/docs/nodejs/nodejs-debugging)

[1]: {{ site.static_url }}/posts/vscode-debug-chrome.png
[2]: {{ site.static_url }}/posts/vscode-debug-launch.png
