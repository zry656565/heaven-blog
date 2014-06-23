---
layout: post
date: 2014-02-15 22:18:00 UTC
title: 当多个CSS文件对同一个元素属性进行设置，会发生什么？
description: 多处CSS文件对同一个元素或者类的样式进行修改的情况屡见不鲜，以至于在代码量成几何倍增加时，有时会让人产生迷惑感。本文将解释当多个CSS文件对同一个元素属性进行设置，会发生什么？
footer: true
duoshuo_comment: true
categories: zh posts
---

CSS作为Web前端的三剑客之一，有着极为重要的地位。它使得页面的表现与内容很好地分离开来，如今各大浏览器对它的支持也日趋完善起来。

但是多处CSS文件对同一个元素或者类的样式进行修改的情况屡见不鲜，以至于在代码量成几何倍增加时，有时会让人产生迷惑感。下面举个例子：

{% highlight html %}
<!-- test.html -->
<head>
    ...
    <link href="res/css/test1.css" type="text/css" rel="stylesheet">
    <link href="res/css/test2.css" type="text/css" rel="stylesheet">
</head>
{% endhighlight %}

{% highlight css %}
/* test1.css */
body { background: yellow; }
body { background: blue; }
{% endhighlight %}

{% highlight css %}
/* test2.css */
body { background: black; }
body { background: red; }
{% endhighlight %}

这里有四个地方对body元素的背景进行设置。在实际解析中，哪次设置将会被采用呢？

答案是最后一次，也就是test2.css中值为red的那次设置。因为**在样式中对同一个元素的属性发生重复设置时，后一次会覆盖前一次**。在例子中，如果test1.css的引入顺序在test2.css之后的话，则会发现背景颜色变成蓝色了。
