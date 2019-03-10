---
date: 2015-08-16 20:16:30 +0800
title: 用 CSS 实现三角形与平行四边形
description: 本文将介绍使用纯 CSS 来构造三角形与平行四边形的两种方法。
permalink: /posts/use-css-to-paint-triangle-and-parallelogram/
key: 10031
labels: [CSS, CSS3]
---

最近在逛某个技术网站的时候，感觉文章关键词上的样式好酷炫啊。于是我将那种写法照搬到了我的博客中，也许最近逛过我博客的小伙伴已经发现了它出现在哪儿了——分页的样式。来张截图：

![分页样式的截图][1]

你在首页的底部也可以看到这样一个分页栏；是不是看上去还不错？下面就来看看这是如何实现的吧~

## 第一种方法：利用`border`

第一种方法是借助`border`属性 hack 出三角形，然后通过一个矩形拼接两个三角形最终制造出一个平行四边形。为什么使用`border`可以产生三角形呢？先来看看一张图片：

![CSS triangle][2]

看了图中的三个小图形的变化过程，你应该已经清楚了一半。其实 hack 出三角形只需要两个条件，第一，元素本身的长宽为0；其次，将不需要的部分通过 border-color 来设置隐藏。通过类似的方法，你还可以创造出梯形，上图中的三个图形的代码如下。（另附 [CodePen 示例](https://codepen.io/jerryzou/pen/mJYJym)）

{% highlight css %}
#first {
  width: 20px;
  height: 20px;
  border-width: 10px;
  border-style: solid;
  border-color: red green blue brown;
}

#second {
  width: 0;
  height: 0;
  border-width: 10px;
  border-style: solid;
  border-color: red green blue brown;
}

#third {
  width: 0;
  height: 0;
  border-width: 10px;
  border-style: solid;
  border-color: red transparent transparent transparent;
}
{% endhighlight %}

接下来就要考虑如何拼接出一个平行四边形了。在`border`法中，它由三部分组成，分别是左三角形、矩形、右三角形。如果每次绘制平行四边形都要创建三个元素显然过于麻烦了，所以在这里`:before`和`:after`伪元素是个不错的选择。下面我们实现一下这样的效果：

![three parallelogram][3]

为了将三角形与矩形无缝拼接到一起，多处属性要保持一致，所以使用类似 Less, Sass, Stylus 等 CSS 预处理器来写这段代码会更容易维护，下面给出 Scss 版本的代码。（另附 [CodePen 链接](https://codepen.io/jerryzou/pen/ZGNGWZ?editors=110)）

{% highlight scss %}
//三角形的宽高
$height: 24px;
$width: 12px;

//对平行四边形三部分的颜色进行赋值
@mixin parallelogram-color($color) {
  background: $color;
  &:before { border-color: transparent $color $color transparent; }
  &:after { border-color: $color transparent transparent $color; }
}

//单个三角形的样式
@mixin triangle() {
  content: '';
  display: block;
  width: 0;
  height: 0;
  position: absolute;
  border-style: solid;
  border-width: $height/2 $width/2;
  top: 0;
}

//平行四边形的样式
.para {
  display: inline-block;
  position: relative;
  padding: 0 10px;
  height: $height;
  line-height: $height;
  margin-left: $width;
  color: #fff;

  &:after {
    @include triangle();
    right: -$width;
  }

  &:before {
    @include triangle();
    left: -$width;
  }

  @include parallelogram-color(red);
}
{% endhighlight %}

需要注意的是，如果通过 `$height`、`$width` 设置的三角形斜率太小或太大都有可能造成渲染出锯齿，所以使用起来要多多测试一下不同的宽高所得到的视觉效果如何。

## 第二种方法：利用`transform`

使用`transform`来实现平行四边形的方法是我在逛[去啊](https://www.alitrip.com/)的时候看到的，效果大概是这个样子：

![去啊中的平行四边形][4]

看到之后觉得好神奇啊，原来还可以只有平行四边形的外轮廓。（因为方法一只能创造填充效果的平行四边形）实现起来非常简单，主要是借助了`transform: skew(...)`，下面就来看看源码吧。

{% highlight html %}
<style>
.city {
  display: inline-block;
  padding: 5px 20px;
  border: 1px solid #44a5fc;
  color: #333;
  transform: skew(-20deg);
}
</style>

<div class="city">上海</div>
{% endhighlight %}

于是我们得到了这样的效果：

![skew shanghai][5]

看到图片的你一定是这样想的：

![坑爹呢这是][6]

别着急嘛，我们的确是把整个 div 进行了歪曲，导致中间的文字也是倾斜的，而这显然不是我们所要的效果。所以我们需要加一个内层元素，并对内层元素做一次逆向的歪曲，从而得到我们想要的效果：

![normal shanghai][7]

实现代码如下，另附 [CodePen 示例](https://codepen.io/jerryzou/pen/BNeNwV?editors=110)

{% highlight html %}
<style>
.city {
  display: inline-block;
  padding: 5px 20px;
  border: 1px solid #44a5fc;
  color: #333;
  transform: skew(-20deg);
}

.city div {
  transform: skew(20deg);
}
</style>

<div class="city">
  <div>上海</div>
</div>
{% endhighlight %}


## 总结

第一种方法使用 `border` 属性 hack 出三角形，并通过对三个元素进行拼接最终实现了平行四边形；而第二种方法则通过 `transform: skew` 来得到平行四边形。总体来说，第二种方法相对于第一种代码量小得多，而且也很好理解。唯一的不足是无法构造像本站的分页中所使用的梯形。希望本文对各位有所帮助。

### UPDATE

#### 2015.8.18

[@前端农民工](https://weibo.com/fouber) 给出了一个 CSS-Tricks 的[链接](https://css-tricks.com/examples/ShapesOfCSS/)，是关于各种用 CSS 绘制几何图形的方法，浅显易懂，推荐大家看看！

#### 2015.9.14

Groune 指出在缩放页面的情况下，本博客的分页均会出现白边。我自己重现了一下这个问题，截图如下。

在 150% 放大倍率下，Safari 8 的显示效果：

![pagination_safari_scale][8]

在 125% 放大倍率下，Chrome 45 的显示效果：

![pagination_chrome_scale][9]

此例暴露出不同浏览器在缩放的情况下对于 **Border Triangle** 的渲染还是有一定差异的（具体是怎样的差异，大家可以在 [CodePen](https://codepen.io/jerryzou/pen/ZGNGWZ?editors=110) 上尝试一下）。目前暂时没有找到解决这一问题的方法。所以还是采用了本文提到的第二种方法重新实现了一下本博客的分页；具体效果还请各位看官返回主页查看咯~


[1]: {{ site.static_url }}/posts/pagination.png!0.5
[2]: {{ site.static_url }}/posts/triangle.png!0.5
[3]: {{ site.static_url }}/posts/parallelogram.png!0.5
[4]: {{ site.static_url }}/posts/qua_parallelogram.png!0.5
[5]: {{ site.static_url }}/posts/shanghai_skew.png!0.5
[6]: {{ site.static_url }}/posts/damn.gif
[7]: {{ site.static_url }}/posts/shanghai_normal.png!0.5
[8]: {{ site.static_url }}/posts/pagination_safari_scale.png
[9]: {{ site.static_url }}/posts/pagination_chrome_scale.png