---
date: 2019-05-31 23:00:00 +0800
title: HitKounter 替换 CDN 服务地址的公告
description: 三年前，我发布了一个用于统计博客访问量的小工具，HitKounter。这些年来不少用户正在使用这个小玩意儿，这让我感到很开心！但是最近出了一些小问题。之前我将 HitKounter JavaScript 脚本直接上传到了又拍云的对象存储中。那时我直接将又拍云提供的测试访问链接开放出来，以供大家使用。
permalink: /posts/hit-kounter-notification/
key: 10043
labels: [博客, HitKounter]
---

三年前，我发布了一个用于统计博客访问量的小工具，HitKounter。这些年来不少用户正在使用这个小玩意儿，这让我感到很开心！

但是最近出了一些小问题。之前我将 HitKounter JavaScript 脚本直接上传到了又拍云的对象存储中。那时我直接将又拍云提供的测试访问链接开放出来，以供大家使用。

由于本站一直使用的是 Github Pages 服务，尚未备案。因此无法享受到又拍云的服务。曾经公布的 CDN 地址不得不作废了，将在 2019 年 6 月 5 日失效。现在大家可以通过以下链接进行访问：

{% highlight html %}
<script src="https://jerryz.sgp1.cdn.digitaloceanspaces.com/lib/hit-kounter/hit-kounter-lc-0.3.0.js"></script>
{% endhighlight %}

感谢大家一如既往的支持。


