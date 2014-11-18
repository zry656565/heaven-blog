---
date: 2014-11-18 22:23:10 UTC
title: 来，让我们谈一谈 Normalize.css
description: Normalize.css 只是一个很小的CSS文件，但它在默认的HTML元素样式上提供了跨浏览器的高度一致性。相比于传统的CSS reset，Normalize.css 是一种现代的、为HTML5准备的优质替代方案。Normalize.css 现在已经被用于Twitter Bootstrap、HTML5 Boilerplate、GOV.UK、Rdio、CSS Tricks以及许许多多其他框架、工具和网站上。
permalink: /posts/aboutNormalizeCss/
key: 10019
labels: [normalize.css, css]
---

> 本文译自Normalize.css官网: [http://nicolasgallagher.com/about-normalize-css/](http://nicolasgallagher.com/about-normalize-css/)

[Normalize.css](http://necolas.github.io/normalize.css/) 只是一个很小的CSS文件，但它在默认的HTML元素样式上提供了跨浏览器的高度一致性。相比于传统的`CSS reset`，`Normalize.css`是一种现代的、为HTML5准备的优质替代方案。`Normalize.css`现在已经被用于[Twitter Bootstrap](http://getbootstrap.com/)、[HTML5 Boilerplate](http://html5boilerplate.com/)、[GOV.UK](http://www.gov.uk/)、[Rdio](http://www.rdio.com/)、[CSS Tricks](http://css-tricks.com/) 以及许许多多其他框架、工具和网站上。

- [Normalize.css 项目地址](http://necolas.github.io/normalize.css/)
- [Normalize.css 在GitHub上的源码](https://github.com/necolas/normalize.css)

##综述

`Normalize.css`是一种`CSS reset`的替代方案。经过[@necolas](https://twitter.com/necolas)和[@jon_neal](https://twitter.com/jon_neal)花了几百个小时来努力研究不同浏览器的默认样式的差异，这个项目终于变成了现在这样。

我们创造`normalize.css`有下面这几个目的：

- **保护有用的浏览器默认样式**而不是完全去掉它们
- **一般化的样式**：为大部分HTML元素提供
- **修复浏览器自身的bug**并保证各浏览器的一致性
- **优化CSS可用性**：用一些小技巧
- **解释代码**：用注释和详细的文档来

`Normalize.css`支持包括手机浏览器在内的超多浏览器，同时对HTML5元素、排版、列表、嵌入的内容、表单和表格都进行了一般化。尽管这个项目基于一般化的原则，但我们还是在合适的地方使用了更实用的默认值。

##Normalize vs Reset

知道`Normalize.css`和传统`Reset`的区别是非常有价值的。

#####1. Normalize.css 保护了有价值的默认值

`Reset`通过为几乎所有的元素施加默认样式，强行使得元素有相同的视觉效果。相比之下，`Normalize.css`保持了许多默认的浏览器样式。这就意味着你不用再为所有公共的排版元素重新设置样式。当一个元素在不同的浏览器中有不同的默认值时，`Normalize.css`会力求让这些样式保持一致并尽可能与现代标准相符合。

#####2. Normalize.css 修复了浏览器的bug

它修复了常见的桌面端和移动端浏览器的bug。这往往超出了`Reset`所能做到的范畴。关于这一点，`Normalize.css`修复的问题包含了HTML5元素的显示设置、预格式化文字的`font-size`问题、在IE9中SVG的溢出、许多出现在各浏览器和操作系统中的与表单相关的bug。

可以看以下这个例子，看看对于HTML5中新出现的`input`类型`search`，`Normalize.css`是如何保证跨浏览器的一致性的。

{% highlight css %}
/**
 * 1. Addresses appearance set to searchfield in S5, Chrome
 * 2. Addresses box-sizing set to border-box in S5, Chrome (include -moz to future-proof)
 */

input[type="search"] {
  -webkit-appearance: textfield; /* 1 */
  -moz-box-sizing: content-box;
  -webkit-box-sizing: content-box; /* 2 */
  box-sizing: content-box;
}

/**
 * Removes inner padding and search cancel button in S5, Chrome on OS X
 */

input[type="search"]::-webkit-search-decoration,
input[type="search"]::-webkit-search-cancel-button {
  -webkit-appearance: none;
}
{% endhighlight %}

#####3. Normalize.css 不会让你的调试工具变的杂乱

使用Reset最让人困扰的地方莫过于在浏览器调试工具中大段大段的继承链，如下图所示。在`Normalize.css`中就不会有这样的问题，因为在我们的准则中对多选择器的使用时非常谨慎的，我们仅会有目的地对目标元素设置样式。

![A common sight in browser debugging tools when using a CSS reset][1]

#####4. Normalize.css 是模块化的

这个项目已经被拆分为多个相关却又独立的部分，这使得你能够很容易也很清楚地知道哪些元素被设置了特定的值。因此这能让你自己选择性地移除掉某些永远不会用到部分（比如表单的一般化）。

#####5. Normalize.css 拥有详细的文档

Normalize.css的代码基于详细而全面的跨浏览器研究与测试。这个文件中拥有详细的代码说明并在[Github Wiki](https://github.com/necolas/normalize.css/wiki)中有进一步的说明。这意味着你可以找到每一行代码具体完成了什么工作、为什么要写这句代码、浏览器之间的差异，并且你可以更容易地进行自己的测试。

这个项目的目标是帮助人们了解浏览器默认是如何渲染元素的，同时也让人们很容易地明白如何改进浏览器渲染。

##如何使用 normalize.css

首先，安装或从Github[下载Normalize.css](http://necolas.github.com/normalize.css/)，接下来有两种主要途径去使用它。

- 策略一：将`normalize.css`作为你自己项目的基础CSS，自定义样式值以满足设计师的需求。
- 策略二：引入`normalize.css`源码并在此基础上构建，在必要的时候用你自己写的CSS覆盖默认值。

##结语

无论从适用范畴还是实施上，`Normalize.css`与`Reset`都有极大的不同。尝试一下这两种方法并看看到底哪种更适合你的开发偏好是非常值得的。这个项目在Github上以开源的形式开发。任何人都能够提交问题报告或者提交补丁。整个项目发展的过程对所有人都是可见的，而每一次改动的原因也都写在commit信息中，这些都是有迹可循的。

##相关阅读

关于更多默认UA样式的详细信息：

- [WHATWG suggestions for rendering HTML documents](http://www.whatwg.org/specs/web-apps/current-work/multipage/rendering.html#the-css-user-agent-style-sheet-and-presentational-hints)
- [Internet Explorer User Agent Style Sheets](http://iecss.com/)
- [CSS2.1 User Agent Style Sheet Defaults](http://css-class.com/test/css/defaults/UA-style-sheet-defaults.htm)

[1]: {{ site.static_url }}/css-reset-debugging.png