---
date: 2014-11-07 20:21:10 UTC
title: 用正则将HTML转为BBCode
description: 为了防止富文本编辑器中用户的输入被不轨的人用于XSS攻击，一般的做法是只接受某种特定语法，比如markdown、BBCode。一般网站运营初始阶段对此考虑都不太周全，都是在网站发展到一定规模以后才会考虑到这个防XSS这个问题，所以就有将以前用户输入的html代码都转换为BBCode这一类的需求。接下来我将介绍一下，如何将已有的html代码通过正则表达式转换为BBCode。
permalink: /posts/htmlToBBCode/
key: 10015
labels: [php, html, BBCode, 正则表达式]
release: false
---

为了防止富文本编辑器中用户的输入被不轨的人用于XSS攻击，一般的做法是只接受某种特定语法，比如markdown、BBCode。一般网站运营初始阶段对此考虑都不太周全，都是在网站发展到一定规模以后才会考虑到这个防XSS这个问题，所以就有将以前用户输入的html代码都转换为BBCode这一类的需求。接下来我将介绍一下，如何将已有的html代码通过正则表达式转换为BBCode。

{% highlight php %}
{% endhighlight %}