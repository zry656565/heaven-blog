---
date: 2014-05-06 00:00:00 UTC
title: 一款在线Javascript正则表达式测试器
description: 昨天在看《正则表达式30分钟入门教程》的时候，看到博主自己实现了一个C#写的正则测试器，看上去挺方便的样子。但是我自己又不太喜欢乱装东西，所以寻思着能不能自己实现一个javascript正则表达式测试器。于是几十行代码实现了这样一个正则测试器。
permalink: /posts/jreparser/
key: 10007
labels: [javascript, 正则表达式]
---

昨天在看《[正则表达式30分钟入门教程](http://deerchao.net/tutorials/regex/regex.htm)》的时候，看到博主自己实现了一个C#写的正则测试器，看上去挺方便的样子。但是我自己又不太喜欢乱装东西，所以寻思着能不能自己实现一个javascript正则表达式测试器。于是几十行代码实现了这样一个正则测试器。

先展示一下0.1版本的效果图吧~

<img src="{{ site.static_url }}/jre-parser.png" width="700">

页面还比较简单，但是基本功能算是有了。可以正常使用~。

关于怎么从用户的输入中提取正则表达式的过程多亏segmentfault的依云提点（[传送门](http://segmentfault.com/q/1010000000494735)），有了如下的解决办法：

{% highlight javascript %}
//r是用户输入的字符串
var JTester = function (r) {
    var begin = r.indexOf('/');
    var end = r.lastIndexOf('/');
    var flags = r.match(/\/([igm]{0,3})$/i)[1];
    this.r = new RegExp(r.substring(begin + 1, end), flags);
};
{% endhighlight %}

如果有什么更好的想法也可以随时和我说，或者干脆Fork我在Github上创建的repo，给我pull request~。（[Github上项目的传送门](https://github.com/zry656565/JRE-Parser)）

最后附上这款测试工具的地址：[http://zry656565.github.io/JRE-Parser/](http://zry656565.github.io/JRE-Parser/)