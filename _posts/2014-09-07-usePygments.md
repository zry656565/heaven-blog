---
date: 2014-09-07 18:11:53 UTC
title: 使用Pygments来实现代码高亮
description: 今天我尝试更换了我个人博客jerryzou.com中的代码高亮样式，主要使用的就是Pygments。Pygments有许多各式各样的样式可供选择，而在这篇文章中，我将为大家讲解如何安装Pygments、以及如何生成代码高亮所需要的文件。
permalink: /posts/usePygments/
key: 10012
---

今天我尝试更换了我个人博客jerryzou.com中的代码高亮样式，主要使用的就是`Pygments`。`Pygments`有许多各式各样的样式可供选择，而在这篇文章中，我将为大家讲解如何安装`Pygments`、以及如何生成代码高亮所需要的文件。

###安装Pygments

在`OS X`中，因为python是预装的，可以直接运行指令：
{% highlight shell-session %}
easy_install pip
 pip install pygments
{% endhighlight %}

在`Archlinux`上：
{% highlight shell-session %}
sudo pacman -S python-pygments
{% endhighlight %}
或者使用python2版的pygments:
{% highlight shell-session %}
sudo pacman -S python2-pygments
{% endhighlight %}

在`Unbutu`和`Debian`上:
{% highlight shell-session %}
sudo pat-get install python-pygments
{% endhighlight %}

在`Fedora`和`CentOS`上:
{% highlight shell-session %}
sudo yum install python-pygments
{% endhighlight %}

在`Gentoo`上:
{% highlight shell-session %}
sudo emerge -av dev-python/pygments
{% endhighlight %}

###生成所需的html文件
如果你用类似`Jekyll`、`hexo`等静态网站生成工具，你就不需要自己生成html文件，可以直接跳过这一小节。这些工具会帮你自动生成，比如本站就是使用Jekyll生成的。如果你需要自己生成html文件，可以参照以下的步骤：

假设需要高亮的代码为一段js代码，文件名为`test.js`：
{% highlight javascript %}
var testStr = "hello world";
{% endhighlight %}

你需要在终端中输入：
{% highlight shell-session %}
pygmentize -f html -o test.html test.js
{% endhighlight %}

- `-f html`指明需要输出html文件
- `-o test.html`指明输出的文件名
- `test.js`就是输入文件了

最后我们得到的html文件大概是这个样子的：
{% highlight html %}
<div class="highlight"><pre><span class="kd">var</span> <span class="nx">testStr</span> <span class="o">=</span> <span class="s2">&quot;hello world&quot;</span><span class="p">;</span>
</pre></div>
{% endhighlight %}
以上把需要生成的代码按词法分析拆分成多个小部分，接下来的问题是如何给这些分好的块上色呢？于是引出了下一个问题：我们需要生成对应的css文件。

###生成所需的css文件
Pygments提供了十多种高亮样式的方案，所有可用的方案可以用如下方式查看：
{% highlight python %}
>>> from pygments.styles import STYLE_MAP
>>> STYLE_MAP.keys()
{% endhighlight %}
如此就可以得到如下结果：

![请输入图片描述][1]

本博客采用的样式是`tango`，如果你喜欢的话，也可以按这种方案给自己博客的代码如此着色。言归正传，接下来介绍生成css文件的指令：
{% highlight shell-session %}
pygmentize -f html -a .highlight -S default > pygments.css
{% endhighlight %}

- `-a .highlight`指所有css选择器都具有`.highlight`这一祖先选择器
- `-S default`就是指定所需要的样式了，各位可以对各种样式都尝试一下。**在官网上是可以直接尝试的哦！**
- `> pygments.css`将内容输出到pygments.css文件中

最后`pygments.css`文件的内容大概是这样的：
{% highlight css %}
.highlight .hll { background-color: #ffffcc }
.highlight  { background: #f8f8f8; }
.highlight .c { color: #8f5902; font-style: italic } /* Comment */
.highlight .err { color: #a40000; border: 1px solid #ef2929 } /* Error */
.highlight .g { color: #000000 } /* Generic */
.highlight .k { color: #204a87; font-weight: bold } /* Keyword */
.highlight .l { color: #000000 } /* Literal */
.highlight .n { color: #000000 } /* Name */
.highlight .o { color: #ce5c00; font-weight: bold } /* Operator */
.highlight .x { color: #000000 } /* Other */
...
{% endhighlight %}

只要在使用到代码高亮的html文件中，引入这个css样式就大功告成了。

###参考资料：
- [http://pygments.org/](http://pygments.org/)
- [http://segmentfault.com/q/1010000000261050](http://segmentfault.com/q/1010000000261050)
- [http://havee.me/internet/2013-07/jekyll-install.html](http://havee.me/internet/2013-07/jekyll-install.html)

[1]: /images/pygments1.png
