---
date: 2015-10-25 22:19:00 UTC
title: Webhook 实践 —— 自动部署
description: 我目前正好面临了这样一个问题 —— 麻烦的人肉部署。也许有人看过我之前的一篇博文《解决 Github Pages 禁止百度爬虫的方法与可行性分析》。为了解决文章中的这个问题，我最后建立了一个只服务于百度爬虫的一个备份服务器。但是随之而来的问题是，每次我的博客有些更新，都不得不 ssh 到那台服务器上把代码 pull 下来。如此做了两三次以后，我觉得我不能再这么堕落下去，于是还是决定尝试一下 Webhook。
permalink: /posts/webhook-practice/
key: 10032
labels: [Webhook, Nodejs, JavaScript]
---

[Webhook](https://developer.github.com/webhooks/)，也就是人们常说的钩子，是一个很有用的工具。你可以通过定制 Webhook 来监测你在 Github.com 上的各种事件，最常见的莫过于 **push** 事件。如果你设置了一个监测 push 事件的 Webhook，那么每当你的这个项目有了任何提交，这个 Webhook 都会被触发，这时 Github 就会发送一个 HTTP POST 请求到你配置好的地址。

如此一来，你就可以通过这种方式去自动完成一些重复性工作；比如，你可以用 Webhook 来自动触发一些持续集成（CI）工具的运作，比如 Travis CI；又或者是通过 Webhook 去部署你的线上服务器。

Github 开发者平台的文档中对 Webhook 的所能做的事是这样描述的：

> You’re only limited by your imagination.

## 面临的问题

我目前正好面临了这样一个问题 —— 麻烦的人肉部署。也许有人看过我之前的一篇博文《[解决 Github Pages 禁止百度爬虫的方法与可行性分析](http://jerryzou.com/posts/feasibility-of-allowing-baiduSpider-for-Github-Pages/)》。为了解决文章中的这个问题，我最后建立了一个只服务于百度爬虫的一个备份服务器。但是随之而来的问题是，每次我的博客有些更新，都不得不 ssh 到那台服务器上把代码 pull 下来。如此做了两三次以后，我觉得我不能再这么堕落下去，于是还是决定尝试一下 Webhook。

于是我要完成的事情便是完成一个能够将我最新版本的博客，随时同步到备份服务器的 Webhook。简单分析一下我需要什么：

1. 一台外网可以访问的主机
2. 一个能够响应 Webhook 的服务器
3. 配置 Webhook

## 1. 一台外网可访问的主机

什么叫外网可访问的主机？像阿里云的试用版就不行，它不提供外网 IP。而我使用的是 DigitalOcean 的云主机，主要的作用是架梯子，现在也顺便用来做备份服务器。当然你们也可以用类似 SAE 的服务，虽然没有 IP，但有独立的外网访问地址。

## 2. 响应 Webhook 的服务器

为了响应 Webhook 所发出的请求，从而做一些我们想做的事情，我们得先实现一个响应服务器。本文采用 Node 来实现一个原型，你当然也可以用 PHP，python 等，全凭个人喜好啦。代码很短，就直接陈列在下方了：

{% highlight javascript %}
var http = require('http')
  , exec = require('exec')

const PORT = 9988
  , PATH = '../html'

var deployServer = http.createServer(function(request, response) {
  if (request.url.search(/deploy\/?$/i) > 0) {

    var commands = [
      'cd ' + PATH,
      'git pull'
    ].join(' && ')

    exec(commands, function(err, out, code) {
      if (err instanceof Error) {
        response.writeHead(500)
        response.end('Server Internal Error.')
        throw err
      }
      process.stderr.write(err)
      process.stdout.write(out)
      response.writeHead(200)
      response.end('Deploy Done.')

    })

  } else {

    response.writeHead(404)
    response.end('Not Found.')

  }
})

deployServer.listen(PORT)
{% endhighlight %}

如果还需要实现更多，更复杂的功能，直接在 `commands` 数组中添加便是。此处我的博客根目录 `html` 与部署服务器根目录同属一个目录，所以配置常量 `PATH = '../html'`。只要启动了服务器，那么 Webhook 就可以通过类似于 **http://104.236.xxx.xxx:9988/deploy/** 的路径来部署我的博客备份啦。

{% highlight shell-session %}
# 在后台启动部署服务器
$ node server.js &
{% endhighlight %}

我以为服务器部署到这儿就完了，其实并没有，我遇到了一些麻烦。

### Run Node Server Forever
 
我在实际使用的时候发现，我的 Node 服务器时不时会自动停掉，具体原因我暂时还没有弄清楚。不过似乎很多人都遇到了这样的困扰，要解决这个问题，[forever](https://github.com/foreverjs/forever) 是个不错的选择。借助 forever 这个库，它可以保证 Node 持续运行下去，一旦服务器挂了，它都会重启服务器。

安装 forever：

{% highlight shell-session %}
$ [sudo] npm install -g forever
{% endhighlight %}

运行：

{% highlight shell-session %}
$ cd { 部署服务器的根目录 }
$ forever start server.js
{% endhighlight %}

我在 DigitalOcean 上的服务器安装的是 **Ubuntu** 系统，而 Ubuntu 中原本就有一个叫 node 的包。为了避免冲突，在 Ubuntu 上安装或使用 Node 得用 nodejs 这个名字。而 forever 默认是使用 node 作为执行脚本的程序名。所以为了处理 Ubuntu 存在的这种特殊情况，在启动 forever 时得另外添加一个参数：

{% highlight shell-session %}
$ forever start server.js -c nodejs
{% endhighlight %}

## 3. 配置 Webhook

如果像是本文这种最简易的应用，Webhook 的配置是十分简单的。首先进入你的 repo 主页，通过点击页面上的按钮 **[settings]** -> **[Webhooks & service]** 进入 Webhooks 配置主页面。也可以通过下面这个链接直接进入配置页面：

{% highlight shell-session %}
https://github.com/[ 用户名 ]/[ 仓库名称 ]/settings/hooks
{% endhighlight %}

此处只需要配置 Webhook 所发出的 POST 请求发往何处即可，于是我们就配置我们所需要的路径： **http://104.236.xxx.xxx:9988/deploy/**。这个地址指向的就是那个能够响应 Webhook 所发出请求的服务器。

![webhooks configuration][1]

配置好 Webhook 后，Github 会发送一个 ping 来测试这个地址。如果成功了，那么这个 Webhook 前就会加上一个绿色的勾；如果你得到的是一个红色的叉，那就好好检查一下哪儿出问题了吧！ 


[1]: {{ site.static_url }}/posts/webhooks-config.png