---
date: 2015-05-15 23:13:35 +0800
title: 为什么不要在 JavaScript 中使用位操作符？
description: 如果你的第一门编程语言不是 JavaScript，而是 C++ 或 Java，那么一开始你大概会看不惯 JavaScript 的数字类型。在 JavaScript 中的数字类型是不区分什么 Int，Float，Double，Decimal 的。咳咳，我说的当然是在 ES6 之前的 JS，在 ES6 的新标准中提出了像 Int8Array 这样新的数据类型。不过这不是本文叙述的重点，暂且就不谈啦。本文将更着重地谈 JS 的数字类型以及作用于它的位操作符...
permalink: /posts/do-you-really-want-use-bit-operators-in-JavaScript/
key: 10026
labels: ["JavaScript", "位操作符"]
---

如果你的第一门编程语言不是 JavaScript，而是 C++ 或 Java，那么一开始你大概会看不惯 JavaScript 的数字类型。在 JavaScript 中的数字类型是不区分什么 Int，Float，Double，Decimal 的。咳咳，我说的当然是在 ES6 之前的 JS，在 ES6 的新标准中提出了像 Int8Array 这样新的数据类型。不过这不是本文叙述的重点，暂且就不谈啦。本文将更着重地谈 JS 的数字类型以及作用于它的位操作符，而关于包装对象 Number 的更多了解可以看拔赤翻译的[《JavaScript设计模式》](https://github.com/lxj/javascript.patterns/blob/master/chapter3.markdown#%E5%8E%9F%E5%A7%8B%E5%80%BC%E7%9A%84%E5%8C%85%E8%A3%85%E5%AF%B9%E8%B1%A1)

## 数字类型的本质

实际上，JavaScript的数字类型的本质就是一个**基于 IEEE 754 标准的双精度 64 位的浮点数**。按照标准，它的数据结构如图示这样：由1位符号位，11位指数部分以及52位尾数部分构成。

![general double float number][1]

在浮点数中，数字通常被表示为：

<pre class="formula">
(-1)<sup>sign</sup> × mantissa × 2<sup>exponent</sup>
</pre>

而为了将尾数规格化，并做到尽量提高精确度，就需要把尾数精确在 `[1,2)` 的区间内，这样便可省去前导的1。比如：

<pre class="formula">
11.101 × 2<sup>3</sup> = 1.1101 × 2<sup>4</sup>
0.1001 × 2<sup>5</sup> = 1.001 × 2<sup>4</sup>
</pre>

并且标准规定指数部分使用 0x3ff 作为偏移量，也就有了双精度浮点数的一般公式：

<pre class="formula">
(-1)<sup>sign</sup> × 1.mantissa × 2<sup>exponent - 0x3ff</sup>
</pre>

举一些例子，应该能帮助你理解这个公式：

{% highlight shell-session %}
3ff0 0000 0000 0000  =  1
c000 0000 0000 0000  =  -2
3fd5 5555 5555 5555  ~  1/3
0000 0000 0000 0000  =  0
8000 0000 0000 0000  =  -0
7ff0 0000 0000 0000  =  无穷大 ( 1/0 )
fff0 0000 0000 0000  =  负无穷大 ( 1/-0 )
7fef ffff ffff ffff  ~  1.7976931348623157 x 10^308 (= Number.MAX_VALUE)
433f ffff ffff ffff  =  2^53 - 1 (= Number.MAX_SAFE_INTEGER)
c33f ffff ffff ffff  =  -2^53 + 1 (= Number.MIN_SAFE_INTEGER)
{% endhighlight %}

得益于尾数省略的一位“1”，使用双精度浮点数来表示的最大安全整数为 -2<sup>53</sup>+1 到 2<sup>53</sup>-1 之间，所以如果你仅仅使用 JavaScript 中的数字类型进行一些整数运算，那么你也可以近似地将这一数字类型理解为 **53** 位整型。

## 让人又爱又恨的位操作符

熟悉 C 或者 C++ 的同学一定对位操作符不陌生。位操作符最主要的应用大概就是作为标志位与掩码。这是一种节省存储空间的高明手段，在曾经内存的大小以 KB 为单位计算时，每多一个变量就是一份额外的开销。而使用位操作符的掩码则在很大程度上缓解了这个问题：

{% highlight c %}
#define LOG_ERRORS            1  // 0001
#define LOG_WARNINGS          2  // 0010
#define LOG_NOTICES           4  // 0100
#define LOG_INCOMING          8  // 1000

unsigned char flags;

flags = LOG_ERRORS;                                 // 0001
flags = LOG_ERRORS | LOG_WARNINGS | LOG_INCOMING;   // 1011
{% endhighlight %}

因为标志位一般只需要 1 bit，就可以保存，并没有必要为每个标志位都定义一个变量。所以按上面这种方式只使用一个变量，却可以保存大量的信息——无符号的 char 可以保存 8 个标志位，而无符号的 int 则可以同时表示 32 个标志位。

可惜位操作符在 JavaScript 中的表现就比较诡异了，因为 JavaScript 没有真正意义上的整型。看看如下代码的运行结果吧：

{% highlight javascript %}
var a, b;

a = 2e9;   // 2000000000
a << 1;    // -294967296

// fxck！我只想装了个逼用左移1位给 a * 2，但是结果是什么鬼！！！

a = parseInt('100000000', 16); // 4294967296
b = parseInt('1111', 2);       // 15
a | b;                         // 15

// 啊啊啊，为毛我的 a 丝毫不起作用，JavaScript真是门吊诡的语言！！！
{% endhighlight %}

好吧，虽然我说过大家可以近似地认为，JS 的数字类型可以表示 53 位的整型。但事实上，位操作符并不是这么认为的。在 [ECMAScript® Language Specification](https://www.ecma-international.org/ecma-262/5.1/#sec-11.10) 中是这样描述位操作符的：

>The production A : A @ B, where @ is one of the bitwise operators in the productions above, is evaluated as follows:
>
>1. Let lref be the result of evaluating A.
>2. Let lval be GetValue(lref).
>3. Let rref be the result of evaluating B.
>4. Let rval be GetValue(rref).
>5. Let lnum be **ToInt32**(lval).
>6. Let rnum be **ToInt32**(rval).
>7. Return the result of applying the bitwise operator @ to lnum and rnum. The result is a signed 32 bit integer.

需要注意的是第5和第6步，按照ES标准，两个需要运算的值会被先转为**有符号的32位整型**。所以超过32位的整数会被截断，而小数部分则会被直接舍弃。

而反过来考虑，我们在什么情况下需要用到位操作符？使用左移来代替 2 的幂的乘法？Naive啊，等遇到像第一个例子的问题，你就要抓狂了。而且对一个浮点数进行左移操作是否比直接乘 2 来得效率高，这也是个值得商榷的问题。

那用来表示标志位呢？首先，现在的内存大小已经不值得我们用精简几个变量来减少存储空间了；其次呢，使用标志位也会使得代码的可读性大大下降。再者，在 JavaScript 中使用位操作符的地方毕竟太少，如果你执意使用位操作符，未来维护这段代码的人又对 JS 中的位操作符的坑不熟悉，这也会造成不利的影响。

所以，我对大家的建议是，尽量在 JavaScript 中别使用位操作符。

## 参考资料

1. [维基百科：双精度浮点数](https://zh.wikipedia.org/wiki/%E9%9B%99%E7%B2%BE%E5%BA%A6%E6%B5%AE%E9%BB%9E%E6%95%B8)
2. [MDN：JavaScript数据结构](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Data_structures)
3. [MDN：按位操作符](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/Bitwise_Operators)
4. [How to use bitmask?](https://stackoverflow.com/questions/18591924/how-to-use-bitmask)
5. [ECMAScript® Language Specification - 11.10 Binary Bitwise Operators](https://www.ecma-international.org/ecma-262/5.1/#sec-11.10)

[1]: {{ site.static_url }}/posts/double_float.png
