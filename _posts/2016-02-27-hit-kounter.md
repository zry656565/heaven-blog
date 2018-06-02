---
date: 2016-02-27 13:20:00 +0800
title: 为你的博客添加访问量统计
description: 相信很多程序员朋友们都拥有了自己的技术博客。像 Hexo, Jekyll 这样的静态网站生成器甚是好用，而对于相对动态的内容，比如评论框，也有诸如多说和 Disqus 的工具可以使用。但是针对博客的访问量统计，却没有什么可用的工具。很多同学在我的博客中留言问我，我的博文中显示的访问量是怎么做到的？我曾经尝试依靠百度统计是不是能解决这个问题，然而我失败了。于是我自己用 PHP 写了一个很简单的服务来完成这件事，经过一次重构，我把它命名为 Hit Kounter。
permalink: /posts/introduction-to-hit-kounter/
key: 10035
labels: [博客, JavaScript, PHP]
---

> **2016.04.23 通告：** Hit Kounter 原本部署于 SAE 上，而近期 SAE 针对使用 MySQL 的应用开始收费。本项目只是一个本人使用业余时间开发的小工具；它本身包含的功能也很精简，并不适合使用付费服务。所以我已经将 Hit Kounter 服务迁移至 **LeanCloud** 上，有兴趣的同学请移步最新的一篇博文 [博客访问量统计工具 Hit Kounter v0.3](/posts/introduction-to-hit-kounter-lc) 查看最新版本的使用方法。原本部署在 SAE 上的服务预计在 **五一假期** 后下线，对已经使用 Hit Kounter 的一些用户，我深感抱歉！


相信很多程序员朋友们都拥有了自己的技术博客。像 Hexo, Jekyll 这样的静态网站生成器甚是好用，而对于相对动态的内容，比如评论框，也有诸如多说和 Disqus 的工具可以使用。

但是针对博客的访问量统计，却没有什么可用的工具。很多同学在我的博客中留言问我，我的博文中显示的访问量是怎么做到的？我曾经尝试依靠百度统计是不是能解决这个问题，然而我失败了。于是我自己用 PHP 写了一个很简单的服务来完成这件事，经过一次重构，我把它命名为 [Hit Kounter](https://github.com/zry656565/Hit-Kounter)。

接下来会从以下几个方面介绍一下：

- 如何为你的博客添加访问统计
- Hit Kounter 的 JS 接口
- 小结：Hit Kounter 的未来

## 如何为你的博客添加访问量统计

#### 1. 引入脚本

{% highlight html %}
<script src="http://jerry-cdn.b0.upaiyun.com/hit-kounter/hit-kounter-0.1.1.js"></script>
{% endhighlight %}

首先，在你的页面中引入这个脚本；由于你可能在每个页面都需要显示访问量，把它加入根模板也许是个不错的选择。

#### 2. 显示当前页面的访问量

{% highlight html %}
<span data-hk-page="current"> - </span>
{% endhighlight %}

你可以在页面的任何地方插入这句 HTML 片段，你之前引入的脚本会自动检查当前页面上带有 `data-hk-*` 属性的元素，并针对你给出的属性值向服务器请求数据，最后把得到的结果替换到上面的标签内。可以参考[我博客中的例子](https://github.com/zry656565/heaven-blog/blob/5f19693ac0fb5723ef18d69b57106d2f95021400/_layouts/post.html#L9)。

#### 3. 显示指定页面的访问量

如果你希望在文章列表页中显示各个页面的访问量分别是多少，那么你就要使用一个 url 来填充 `data-hk-page` 的属性值，就像这样：

{% highlight html %}
<span data-hk-page="http://jerryzou.com/posts/design-for-all-mobile-resolution/"> - </span>
{% endhighlight %}

那么 Hit Kounter 检测到这个标签以后，就会向服务器请求该地址的具体访问量，并最终将默认值 ` - ` 替换为实际值。可以参考[我博客中的例子](https://github.com/zry656565/heaven-blog/blob/5f19693ac0fb5723ef18d69b57106d2f95021400/index.html#L13)。

## Hit Kounter 的 JS 接口

Hit Kounter 会在全局注入 `Icarus` 对象，它是与服务器交互的数据接口。通过它，我们就可以直接向服务器发送请求。先看看下面这个例子：

{% highlight javascript %}
Icarus.request({
  api: 'hk.page.get',
  v: '1.0',
  pages: [
    { url: 'http://test.com/1' },
    { url: 'http://test.com/2' },
    { url: 'http://test.com/3' }
  ],
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

上面这个例子中，我们主要是获取了三个页面的具体访问量；目前 `Icarus` 支持的接口有四个（具体可以参考 [Hit Kounter Wiki](https://github.com/zry656565/Hit-Kounter/wiki/Icarus:-APIs)）：

- hk.page.increment
- hk.page.get
- hk.page.getTop
- hk.page.getByDomain

至于如何使用就由你们自由发挥啦。

## 小结：Hit Kounter 的未来

当然，Hit Kounter 的功能不至于此啦，由于作者我还是个读研狗，最近得发论文了，所以更新进度暂且比较慢；目前 Hit Kounter 是 0.1 Beta版，未来会加入越来越多的功能，包括但不限于：

- 添加一个能够获得全站的访问总量的 API
- 通过添加 `<div data-hk-top-pages="5">` 这样一个元素，便能够将全站访问量最高的五个页面罗列在 `div` 框内。
- 为用户提供一个很方便的方式来导入初始的访问量数据
- 完善各种可能的错误信息（包括服务端和浏览器端的错误）

TODO List 可以在 [这个 issue](https://github.com/zry656565/Hit-Kounter/issues/1) 中看到，而且因为 [Hit Kounter](https://github.com/zry656565/Hit-Kounter) 是开源项目，也很期待大家能够多吐槽，如果能给 Hit Kounter 贡献代码那就再好不过啦~。