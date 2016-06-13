---
date: 2016-04-24 0:20:00 UTC
title: 访问量统计工具 Hit Kounter v0.2
description: Hit Kounter 是一个简单的访问量统计工具。据我从数据库里的数据目测，现在已经拥有了 9 位用户！不过我要对这九位用户说声抱歉啦。Hit Kounter 原本部署于 SAE 上，而近期 SAE 针对使用 MySQL 的应用开始收费。本项目只是一个本人使用业余时间开发的小工具；它本身包含的功能也很精简，并不适合使用付费服务。所以我已经将 Hit Kounter 服务迁移至 LeanCloud 上。原本部署在 SAE 上的服务预计在五一假期后下线，对已经使用 Hit Kounter 的一些用户，我再次表达我的歉意！使用方式上，目前 v0.2 版本相比于 v0.1 并没有什么改变…
permalink: /posts/introduction-to-hit-kounter-lc/
key: 10037
labels: [博客, JavaScript]
---

**Hit Kounter** 是一个简单的访问量统计工具。据我从数据库里的数据目测，现在已经拥有了 **9 位用户**！不过我要对这九位用户说声抱歉啦。

Hit Kounter 原本部署于 SAE 上，而近期 SAE 针对使用 MySQL 的应用开始收费。本项目只是一个本人使用业余时间开发的小工具；它本身包含的功能也很精简，并不适合使用付费服务。所以我已经将 Hit Kounter 服务迁移至 **LeanCloud** 上。原本部署在 SAE 上的服务预计在 **五一假期** 后下线，对已经使用 Hit Kounter 的一些用户，我再次表达我的歉意！

由于此次改版改动比较大，我是 fork 了一份代码出来进行修改的；**改版后的 Hit Kounter** 在 Github 上仓库地址是 [zry656565/Hit-Kounter-LC](https://github.com/zry656565/Hit-Kounter-LC)，区别于原来的 Hit Kounter PHP 版：[zry656565/Hit-Kounter](https://github.com/zry656565/Hit-Kounter)

使用方式上，目前 **v0.2** 版本相比于 **v0.1** 并没有什么改变，接下来会从以下几个方面介绍一下：

- 如何为你的博客添加访问统计
- Hit Kounter 的 JS 接口
- 如何从 v0.1.1 版本迁移到 v0.2.0
- 小结：Hit Kounter 的未来

如果你是 Hit Kounter v0.1 的用户，可以直接阅读 **如何从 v0.1.1 版本迁移到 v0.2.0**。

## 如何为你的博客添加访问量统计

#### 1. 引入脚本

{% highlight html %}
<script src="https://cdn1.lncld.net/static/js/av-mini-0.6.10.js"></script>
<script src="http://jerry-cdn.b0.upaiyun.com/hit-kounter/hit-kounter-lc-0.2.0.js"></script>
{% endhighlight %}

首先，在你的页面中引入这两个脚本，第一个脚本是 LeanCloud 的库脚本，引入了它我们才能使用 LeanCloud 的服务；由于你可能在每个页面都需要显示访问量，把它加入根模板也许是个不错的选择。

#### 2. 显示当前页面的访问量

{% highlight html %}
<span data-hk-page="current"> - </span>
{% endhighlight %}

你可以在页面的任何地方插入这句 HTML 片段，你之前引入的脚本会自动检查当前页面上带有 `data-hk-*` 属性的元素，并针对你给出的属性值向服务器请求数据，最后把得到的结果替换到上面的标签内。可以参考 [我博客中的例子](https://github.com/zry656565/heaven-blog/blob/5f19693ac0fb5723ef18d69b57106d2f95021400/_layouts/post.html#L9)。

#### 3. 显示指定页面的访问量

如果你希望在文章列表页中显示各个页面的访问量分别是多少，那么你就要使用一个 url 来填充 `data-hk-page` 的属性值，就像这样：

{% highlight html %}
<span data-hk-page="http://jerryzou.com/posts/design-for-all-mobile-resolution/"> - </span>
{% endhighlight %}

那么 Hit Kounter 检测到这个标签以后，就会向服务器请求该地址的具体访问量，并将默认值 ` - ` 替换为实际值。可以参考 [我博客中的例子](https://github.com/zry656565/heaven-blog/blob/5f19693ac0fb5723ef18d69b57106d2f95021400/index.html#L13)。

## Hit Kounter 的 JS 接口

Hit Kounter 会在全局注入 `Icarus` 对象，它是与服务器交互的数据接口。通过它，我们就可以直接向服务器发送请求。先看看下面这个例子：

{% highlight javascript %}
Icarus.request({
  api: 'hk.page.get',
  v: '1.0',
  data: {
    pages: [
      { url: 'http://test.com/1' },
      { url: 'http://test.com/2' },
      { url: 'http://test.com/3' }
    ]
  },
  success: function(results) {
    for (var i = 0; i < results.length; i++) {
      console.log(results[i].domain, results[i].url, results[i].count);
    }
  },
  failure: function(code, err) {
    console.log(code, err);
  }
});
{% endhighlight %}

上面这个例子中，我们主要是获取了三个页面的具体访问量；目前 `Icarus` 支持的接口有四个（具体可以参考 [Hit-Kounter-LC Wiki](https://github.com/zry656565/Hit-Kounter-LC/wiki/Icarus:-APIs)）：

- hk.page.increment
- hk.page.get
- hk.page.getTop
- hk.page.getByDomain

至于如何使用就由你们自由发挥啦。

## 如何从 v0.1.1 版本迁移到 v0.2.0

我已经把迁移的成本降到最低，只要替换引入的文件即可：

{% highlight html %}
<!-- 老版本需要引入的文件 -->
<script src="http://jerry-cdn.b0.upaiyun.com/hit-kounter/hit-kounter-0.1.1.js"></script>

<!-- 新版本需要引入的文件 -->
<script src="https://cdn1.lncld.net/static/js/av-mini-0.6.10.js"></script>
<script src="http://jerry-cdn.b0.upaiyun.com/hit-kounter/hit-kounter-lc-0.2.0.js"></script>
{% endhighlight %}

因为 v0.2 版本基于 LeanCloud 的服务，所以需要额外引入 LeanCloud 的一个库文件。另外需要注意的是，第二个文件除了版本号做了更新，还多了 `-lc` 几个字符哦。

本次更新在将后端服务从 SAE 替换为 LeanCloud 的同时并没有做太多的功能改进。最主要的一点功能改进是引入缓存机制，在数据超过默认的五分钟之前，**Icarus** 不会向服务器发送新的 get 请求。（increment 请求当然还是照发不误的啦）

#### 以下内容请使用了 Icarus 接口的用户注意

**Icarus** 接口所接受的多余的参数现在需要放在 `data` 对象中，注意对你之前的代码做一定修改。直接看例子可能比较直观：

{% highlight javascript %}
/*================
 * 老版本调用方式
 *================*/
Icarus.request({
  api: 'hk.page.get',
  v: '1.0',
  pages: [                          // <---
    { url: 'http://test.com/1' }    // <---
  ],                                // <---
  success: function(results) {},
  failure: function(code, err) {}
});

/*================
 * 新版本调用方式
 *================*/
Icarus.request({
  api: 'hk.page.get',
  v: '1.0',
  data: {                           // <---
    pages: [                        // <---
      { url: 'http://test.com/1' }  // <---
    ]                               // <---
  },                                // <---
  success: function(results) {},
  failure: function(code, err) {}
});
{% endhighlight %}

## 小结：Hit Kounter 的未来

当然，Hit Kounter 未来会加入越来越多的功能，包括但不限于：

- 添加一个能够获得全站的访问总量的 API
- 通过添加 `<div data-hk-top-pages="5">` 这样一个元素，便能够将全站访问量最高的五个页面罗列在 `div` 框内。
- 为用户提供一个很方便的方式来导入初始的访问量数据
- 完善各种可能的错误信息（包括服务端和浏览器端的错误）

TODO List 可以在 [这个 issue](https://github.com/zry656565/Hit-Kounter-LC/issues/1) 中看到，而且因为 [zry656565/Hit-Kounter-LC](https://github.com/zry656565/Hit-Kounter-LC) 是开源项目，也很期待大家能够多吐槽，如果能给 **Hit-Kounter-LC** 贡献代码那就再好不过啦~。