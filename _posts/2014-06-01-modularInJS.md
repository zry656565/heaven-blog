---
date: 2014-06-01 00:00:00 UTC
title: 深入了解Javascript模块化编程
description: 本文译自Ben Cherry的《JavaScript Module Pattern In-Depth》。虽然个人不太认同js中私有变量存在的必要性，但是本文非常全面地介绍了Javascript中模块化模式地方方面面。我读完之后还是受益匪浅，所以翻译出来希望对各位也有些帮助。
permalink: /posts/jsmodular/
key: 10008
labels: [javascript, 模块化]
---

>本文译自Ben Cherry的《[JavaScript Module Pattern: In-Depth](http://www.adequatelygood.com/JavaScript-Module-Pattern-In-Depth.html)》。虽然个人不太认同js中私有变量存在的必要性，但是本文非常全面地介绍了Javascript中模块化模式地方方面面。我读完之后还是受益匪浅，所以翻译出来希望对各位也有些帮助。

模块化编程是一种非常常见Javascript编程模式。它一般来说可以使得代码更易于理解，但是有许多优秀的实践还没有广为人知。在这篇文章中，我将会回顾一下js模块化编程的基础，并且将会讲到一些真的非常值得一提的进阶话题，包括一个我认为是我自创的模式。
<br/>

#基础

我们首先简单地概述一下，自从三年前Eric Miraglia（YUI的开发者）第一次发表博客描述模块化模式以来的一些模块化模式。如果你已经对于这些模块化模式非常熟悉了，大可以直接跳过本节，从“进阶模式”开始阅读。

###匿名闭包

这是一种让一切变为可能的基本结构，同时它也是Javascript**最棒的特性**。我们将简单地创建一个匿名函数并立即执行它。所有的代码将跑在这个函数内，生存在一个提供**私有化**的闭包中，它足以使得这些闭包中的变量能够贯穿我们的应用的整个生命周期。

{% highlight javascript %}
(function () {
    // ... all vars and functions are in this scope only
    // still maintains access to all globals
}());
{% endhighlight %}

注意这对包裹匿名函数的最外层括号。因为Javascript的语言特性，这对括号是必须的。在js中由关键词function开头的语句总是会被认为是**函数声明式**。把这段代码包裹在括号中就可以让解释器知道这是个**函数表达式**。

###全局变量导入

Javascript有一个特性叫做**隐式全局变量**。无论一个变量名在哪儿被用到了，解释器会根据作用域链来反向找到这个变量的`var`声明语句。如果没有找到`var`声明语句，那么这个变量就会被视为全局变量。如果这个变量用在一句赋值语句中，同时这个变量又不存在时，就会创建出一个全局变量。这意味着在匿名闭包中使用或创建全局变量是很容易的。不幸的是，这会导致写出的代码极难维护，因为对于人的直观感受来说，一眼根本分不清那些是全局的变量。

幸运的是，我们的匿名函数提供了简单的变通方法。只要将全局变量作为参数传递到我们的匿名函数中，就可以得到比隐式全局变量更**清晰**又**快速**的代码了。下面是示例：
{% highlight javascript %}
(function ($, YAHOO) {
    // now have access to globals jQuery (as $) and YAHOO in this code
}(jQuery, YAHOO));
{% endhighlight %}

###模块导出
有时你不仅想要使用全局变量，你还想要声明它们，以供反复使用。我们可以很容易地通过导出它们来做到这一点——通过匿名函数的**返回值**。这样做将会完成一个基本的模块化模式雏形，接下来会是一个完整的例子：
{% highlight javascript %}
var MODULE = (function () {
    var my = {},
        privateVariable = 1;

    function privateMethod() {
        // ...
    }

    my.moduleProperty = 1;
    my.moduleMethod = function () {
        // ...
    };

    return my;
}());
{% endhighlight%}
注意我们已经声明了一个叫做`MODULE`的全局模块，它拥有2个公有的属性：一个叫做`MODULE.moduleMethod`的方法和一个叫做`MODULE.moduleProperty`的变量。另外，它还维护了一个利用匿名函数闭包的、**私有的内置**状态。同时，我们可以很容易地导入需要的全局变量，并像之前我们所学到的那样来使用这个模块化模式。
<br/><br/>

#进阶模式

上面一节所描述的基础已经足以应对许多情况，现在我们可以将这个模块化模式进一步的发展，创建更多强大的、可扩展的结构。让我们从`MODULE`模块开始，一一介绍这些进阶模式。

###放大模式

整个模块必须在一个文件中是模块化模式的一个限制。任何一个参与大型项目的人都会明白将js拆分多个文件的价值。幸运的是，我们拥有一个很棒的实现来**放大模块**。首先，我们导入一个模块，并为它添加属性，最后再导出它。下面是一个例子——从原本的`MODULE`中放大它：
{% highlight javascript %}
var MODULE = (function (my) {
    my.anotherMethod = function () {
        // added method...
    };

    return my;
}(MODULE));
{% endhighlight %}
我们用var关键词来保证一致性，虽然它在此处不是必须的。在这段代码执行完之后，我们的模块就已经拥有了一个新的、叫做`MODULE.anotherMethod`的公有方法。这个放大文件也会维护它自己的私有内置状态和导入的对象。

###宽放大模式

我们的上面例子需要我们的初始化模块最先被执行，然后放大模块才能执行，当然有时这可能也不一定是必需的。Javascript应用可以做到的、用来提升性能的、最棒的事之一就是异步执行脚本。我们可以创建灵活的多部分模块并通过**宽放大模式**使它们可以以任意顺序加载。每一个文件都需要按下面的结构组织：
{% highlight javascript %}
var MODULE = (function (my) {
    // add capabilities...

    return my;
}(MODULE || {}));
{% endhighlight %}
在这个模式中，`var`表达式使必需的。注意如果MODULE还未初始化过，这句导入语句会创建`MODULE`。这意味着你可以用一个像LABjs的工具来并行加载你所有的模块文件，而不会被阻塞。

###紧放大模式
宽放大模式非常不错，但它也会给你的模块带来一些限制。最重要的是，你不能安全地覆盖模块的属性。你也无法在初始化的时候，使用其他文件中的属性（但你可以在运行的时候用）。**紧放大模式**包含了一个加载的顺序序列，并且允许**覆盖属性**。这儿是一个简单的例子（放大我们的原始`MODULE`）：
{% highlight javascript %}
var MODULE = (function (my) {
    var old_moduleMethod = my.moduleMethod;

    my.moduleMethod = function () {
        // method override, has access to old through old_moduleMethod...
    };

    return my;
}(MODULE));
{% endhighlight %}
我们在上面的例子中覆盖了`MODULE.moduleMethod`的实现，但在需要的时候，可以维护一个对原来方法的引用。

###克隆与继承
{% highlight javascript %}
var MODULE_TWO = (function (old) {
    var my = {},
        key;

    for (key in old) {
        if (old.hasOwnProperty(key)) {
            my[key] = old[key];
        }
    }

    var super_moduleMethod = old.moduleMethod;
    my.moduleMethod = function () {
        // override method on the clone, access to super through super_moduleMethod
    };

    return my;
}(MODULE));
{% endhighlight %}
这个模式可能是**最缺乏灵活性**的一种选择了。它确实使得代码显得很整洁，但那是用灵活性的代价换来的。正如我上面写的这段代码，如果某个属性是对象或者函数，它将不会被复制，而是会成为这个对象或函数的第二个引用。修改了其中的某一个就会同时修改另一个（译者注：因为它们根本就是一个啊！）。这可以通过递归克隆过程来解决这个对象克隆问题，但函数克隆可能无法解决，也许用eval可以解决吧。因此，我在这篇文章中讲述这个方法仅仅是考虑到文章的完整性。

###跨文件私有变量
把一个模块分到多个文件中有一个重大的限制：每一个文件都维护了各自的私有变量，并且无法访问到其他文件的私有变量。但这个问题是可以解决的。这里有一个维护跨文件私有变量的、宽放大模块的例子：
{% highlight javascript %}
var MODULE = (function (my) {
    var _private = my._private = my._private || {},
        _seal = my._seal = my._seal || function () {
            delete my._private;
            delete my._seal;
            delete my._unseal;
        },
        _unseal = my._unseal = my._unseal || function () {
            my._private = _private;
            my._seal = _seal;
            my._unseal = _unseal;
        };

    // permanent access to _private, _seal, and _unseal

    return my;
}(MODULE || {}));
{% endhighlight %}
所有文件可以在它们各自的`_private`变量上设置属性，并且它理解可以被其他文件访问。一旦这个模块加载完成，应用程序可以调用`MODULE._seal()`来防止外部对内部`_private`的调用。如果这个模块需要被重新放大，在任何一个文件中的内部方法可以在加载新的文件前调用`_unseal()`，并在新文件执行好以后再次调用`_seal()`。我如今在工作中使用这种模式，而且我在其他地方还没有见过这种方法。我觉得这是一种非常有用的模式，很值得就这个模式本身写一篇文章。

###子模块
我们的最后一种进阶模式是显而易见最简单的。创建子模块有许多优秀的实例。这就像是创建一般的模块一样：

{% highlight javascript %}
MODULE.sub = (function () {
    var my = {};
    // ...

    return my;
}());
{% endhighlight %}
虽然这看上去很简单，但我觉得还是值得在这里提一提。子模块拥有一切一般模块的进阶优势，包括了放大模式和私有化状态。
<br/><br/>

#结论
大多数进阶模式可以结合到一起来创建一个更为有用的模式。如果实在要我推荐一种设计复杂应用程序的模块化模式的化，我会选择结合宽放大模式、私有变量和子模块。

我还未考虑过这些模式的性能问题，但我宁愿把这转化为一个更简单的思考方式：如果一个模块化模式有很好的性能，那么它能够把最小化做的很棒，使得下载这个脚本文件更快。使用宽放大模式可以允许简单的非阻塞并行下载，这就会加快下载速度。初始化时间可能会稍慢于其他方法，但权衡利弊后这还是值得的。只要全局变量导入准确，运行时性能应该会不会受到影响，而且还有可能在子模块中通过用私有变量缩短引用链来得到更快的运行速度。

作为结束，这里是一个子模块动态地把自身加载到它的父模块的例子（如果父模块不存在则创建它）。为了简洁，我把私有变量给去除了，当然加上私有变量也是很简单的啦。这种编程模式允许一整个复杂层级结构代码库通过子模块并行地完成加载。
{% highlight javascript %}
var UTIL = (function (parent, $) {
    var my = parent.ajax = parent.ajax || {};

    my.get = function (url, params, callback) {
        // ok, so I'm cheating a bit :)
        return $.getJSON(url, params, callback);
    };

    // etc...

    return parent;
}(UTIL || {}, jQuery));
{% endhighlight %}
我希望这篇文章对你有帮助，请在文章下面留言分享你的想法。从现在起，就开始写更棒、更模块化的Javascript吧！
