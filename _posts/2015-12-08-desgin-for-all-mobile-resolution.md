---
date: 2015-12-08 13:36:00 UTC
title: 懒人必备的移动端定宽网页适配方案
description: 如今移动设备的分辨率纷繁复杂。以前仅仅是安卓机拥有各种各样的适配问题，如今 iPhone 也拥有了三种主流的分辨率，而未来的 iPhone 7 可能又会玩出什么新花样。如何以不变应万变，用简简单单的几行代码就能支持种类繁多的屏幕分辨率呢？今天就给大家介绍一种懒人必备的移动端定宽网页适配方法。
permalink: /posts/design-for-all-mobile-resolution/
key: 10034
labels: [移动端, viewport]
---

如今移动设备的分辨率纷繁复杂。以前仅仅是安卓机拥有各种各样的适配问题，如今 iPhone 也拥有了三种主流的分辨率，而未来的 iPhone 7 可能又会玩出什么新花样。如何以不变应万变，用简简单单的几行代码就能支持种类繁多的屏幕分辨率呢？今天就给大家介绍一种懒人必备的移动端定宽网页适配方法。

首先看看下面这行代码：

{% highlight html %}
<meta name="viewport" content="width=device-width, user-scalabel=no">
{% endhighlight %}

有过移动端开发经验的同学是不是对上面这句代码非常熟悉？它可能最常见的响应式设计的 `viewport` 设置之一，而我今天介绍的这种方法也是利用了 meta 标签设置 `viewport` 来支持大部分的移动端屏幕分辨率。

## 目标

- 仅仅通过配置 `<meta name="viewport">` 使得移动端网站只需要按照固定的宽度设计并实现，就能在任何主流的移动设备上都能看到符合设计稿的页面，包括 Android 4+、iPhone 4+。

## 测试设备

- 三星 Note II (Android 4.1.2) - 真机
- 三星 Note III (Android 4.4.4 - API 19) - Genymotion 虚拟机
- iPhone 6 (iOS 9.1) - 真机

## iPhone

iPhone 的适配比较简单，只需要设置 `width` 即可。比如：

{% highlight html %}
<!-- for iPhone -->
<meta name="viewport" content="width=320, user-scalable=no" />
{% endhighlight %}

这样你的页面在所有的 iPhone 上，无论是 宽 375 像素的 iPhone 6 还是宽 414 像素的 iPhone 6 plus，都能显示出定宽 320 像素的页面。

## Android

Android 上的适配被戏称为移动端的 IE，确实存在着很多兼容性问题。Android 以 4.4 版本为一个分水岭，首先说一说相对好处理的 Android 4.4+

### Android 4.4+

为了兼容性考虑，Android 4.4 以上抛弃了 `target-densitydpi` 属性，它只会在 Android 设备上生效。如果对这个被废弃的属性感兴趣，可以看看下面这两个链接：

- [Support for target-densitydpi is removed from WebKit][1]
- [Bug 88047 - Remove support for target-densitydpi in the viewport meta tag][2]

我们可以像在 iPhone 上那样设置 `width=320` 以达到我们想要的 320px 定宽的页面设计。

{% highlight html %}
<!-- for Android 4.4+ -->
<meta name="viewport" content="width=320, user-scalable=no" />
{% endhighlight %}

### Android 4.0 ~ 4.3

作为 Android 相对较老的版本，它对 meta 中的 width 属性支持得比较糟糕。以三星 Note II 为例，它的 device-width 是 360px。如果设置 viewport 中的 width (以下简称 `vWidth` ) 为小于等于 360 的值，则不会有任何作用；而设置 `vWidth` 为大于 360 的值，也不会使画面产生缩放，而是出现了横向滚动条。

想要对 Android 4.0 ~ 4.3 进行支持，还是不得不借助于**页面缩放**，以及那个被废除的属性：`target-densitydpi`。

### target-densitydpi

target-densitydpi 一共有四种取值：low-dpi (0.75), medium-dpi (1.0), high-dpi (1.5), device-dpi。在 Android 4.0+ 的设备中，device-dpi 一般都是 2.0。我使用手头上的三星 Note II 设备 (Android 4.1.2) 进行了一系列实验，得到了下面这张表格：


| target-densitydpi | viewport: width | body width | 屏幕可视范围宽度 |
| ----------------- | --------------- | ---------- | -------------- |
| low-dpi (0.75)    | vWidth <= 320    | 270       | 270           |
|                   | vWidth > 320     | vWidth*   | 270           |
| medium-dpi (1.0)  | vWidth <= 360    | 360       | 360           |
|                   | vWidth > 360     | vWidth*   | 360           |
| high-dpi (1.5)    | vWidth <= 320    | 540       | 540           |
|                   | 320 < vWidth <= 540 | vWidth* | vWidth*      |
|                   | vWidth > 540     | vWidth*    | 540          |
| device-dpi (2.0)**  | vWidth <= 320  | 720        | 720          |
|                   | 320 < vWidth <= 720 | vWidth* | vWidth*      |
|                   | vWidth > 720     | vWidth*    | 720          |

- **vWidth***：指的是与 viewport 中设置的 width 的值相同。
- **device-dpi (2.0**)**：在 Android 4.0+ 的设备中，device-dpi 一般都是 2.0。


首先可以看到 **320px** 是个特别诡异的临界值，低于这个临界值后就会发生超出我们预期的事情。综合考虑下来，还是采用 `target-densitydpi = device-dpi` 这一取值。如果你想要以 320px 作为页面的宽度的话，我建议你针对安卓 4.4 以下的版本设置 `width=321`。

如果 body 的宽度超过屏幕可视范围的宽度，就会出现水平的滚动条。这并不是我们期望的结果，所以我们还要用到缩放属性 `initial-scale`。计算公式如下：

**Scale = deviceWidth / vWidth**

这样的计算式不得不使用 JS 来实现，最终我们就能得到适配 **Android 4.0 ~ 4.3** 定宽的代码：

{% highlight javascript %}
var match,
    scale,
    TARGET_WIDTH = 320;

if (match = navigator.userAgent.match(/Android (\d+\.\d+)/)) {
    if (parseFloat(match[1]) < 4.4) {
        if (TARGET_WIDTH == 320) TARGET_WIDTH++;
        var scale = window.screen.width / TARGET_WIDTH;
        document.querySelector('meta[name="viewport"]').setAttribute('content', 'width=' + TARGET_WIDTH + ', initial-scale = ' + scale + ', target-densitydpi=device-dpi');
    }
}
{% endhighlight %}

其中，`TARGET_WIDTH` 就是你所期望的宽度，注意这段代码仅在 **320-720px** 之间有效哦。

## 缩放中的坑

如果是 iPhone 或者 Android 4.4+ 的机器，在使用 scale 相关的属性时要非常谨慎，包括 `initial-scale`, `maximum-scale` 和 `minimum-scale`。
要么保证 **Scale = deviceWidth / vWidth**，要么就尽量不用。来看一个例子：

![Android 4.4+ 和 iPhone 在缩放时的行为不一致][3]

在缩放比不能保证的情况下，即使设置同样的 `width` 和 `initial-scale` 后，两者的表现也是不一致。具体两种机型采用的策略如何我还没有探索出来，有兴趣的同学可以研究看看。最省事的办法就是在 iPhone 和 Android 4.4+ 上不设置 scale 相关的属性。

## 总结

结合上面所有的分析，你可以通过下面这段 JS 代码来对所有 iPhone 和 Android 4+ 的手机屏幕进行适配：

{% highlight javascript %}
var match,
    scale,
    TARGET_WIDTH = 320;

if (match = navigator.userAgent.match(/Android (\d+\.\d+)/)) {
    if (parseFloat(match[1]) < 4.4) {
        if (TARGET_WIDTH == 320) TARGET_WIDTH++;
        var scale = window.screen.width / TARGET_WIDTH;
        document.querySelector('meta[name="viewport"]').setAttribute('content', 'width=' + TARGET_WIDTH + ', initial-scale = ' + scale + ', target-densitydpi=device-dpi');
    }
} else {
    document.querySelector('meta[name="viewport"]').setAttribute('content', 'width=' + TARGET_WIDTH);
}
{% endhighlight %}

如果你不希望你的页面被用户手动缩放，你还可以加上 `user-scalable=no`。不过需要注意的是，这个属性在部分安卓机型上是无效的哦。

## 其他参考资料

1. [Supporting Different Screens in Web Apps - Android Developers][2]
2. [Viewport target-densitydpi support is being deprecated](http://www.petelepage.com/blog/2013/02/viewport-target-densitydpi-support-is-being-deprecated/)

## 附录 - 测试页面

有兴趣的同学可以拿这个测试页面来测测自己的手机，别忘了改 `viewport` 哦。

{% highlight html %}
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=250, initial-scale=1.5, user-scalable=no">
    <title>Document</title>
    <style>
        body {
            margin: 0;
        }

        div {
            background: #000;
            color: #fff;
            font-size: 30px;
            text-align: center;
        }

        .block {
            height: 50px;
            border-bottom: 4px solid #ccc;
        }

        #first  { width: 100px; }
        #second { width: 200px; }
        #third  { width: 300px; }
        #fourth { width: 320px; }
        #log { font-size: 16px; }
    </style>
</head>
<body>
    <div id="first" class="block">100px</div>
    <div id="second" class="block">200px</div>
    <div id="third" class="block">300px</div>
    <div id="fourth" class="block">320px</div>
    <div id="log"></div>
    <script>
        function log(content) {
            var logContainer = document.getElementById('log');
            var p = document.createElement('p');
            p.textContent = content;
            logContainer.appendChild(p);
        }

        log('body width:' + document.body.clientWidth)
        log(document.querySelector('[name="viewport"]').content)
    </script>
</body>
</html>
{% endhighlight %}

[1]: http://stackoverflow.com/questions/11592015/support-for-target-densitydpi-is-removed-from-webkit
[2]: https://bugs.webkit.org/show_bug.cgi?id=88047
[3]: {{ site.static_url }}/posts/viewport.png