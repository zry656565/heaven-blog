---
layout: post
date: 2014-02-04 21:33:00 UTC
title: Javascript中的一种深复制实现
description: 本文将给大家详细介绍一种javascript中的深复制实现。
footer: true
duoshuo_comment: true
categories: zh posts
---

在javascript中，所有的object变量之间的赋值都是传地址的，可能有同学会问哪些是object对象。举例子来说明可能会比较好：

{% highlight javascript %}
typeof(true)    //"boolean"
typeof(1)       //"number"
typeof("1")     //"string"
typeof({})      //"object"
typeof([])      //"object"
typeof(null)    //"object"
typeof(function(){})  //"function"
{% endhighlight %}

所以其实我们深复制主要需要处理的对象就是object对象，非object对象只要直接正常的赋值就好。我实现js深复制的思路就是：

- 遍历所有该对象的属性，
- 如果该属性是"object"则需要特殊处理，
  - 如果这个object对象比较特殊，是一个数组，那就创建一个新的数组并深复制数组里的元素
  - 如果这个object对象是个非数组对象，那直接再对它递归调用深复制方法即可。
- 如果不是"object"，则直接正常复制就行。

下面就是我的实现了：

{% highlight javascript %}
Object.prototype.DeepCopy = function () {
  var obj, i;
  obj = {};

  for (attr in this) {
    if (this.hasOwnProperty(attr)) {
      if (typeof(this[attr]) === "object") {
        if (this[attr] === null) {
          obj[attr] = null;
        }
        else if (Object.prototype.toString.call(this[attr]) === '[object Array]') {
          obj[attr] = [];
          for (i=0; i<this[attr].length; i++) {
            obj[attr].push(this[attr][i].DeepCopy());
          }
        } else {
          obj[attr] = this[attr].DeepCopy();
        }
      } else {
        obj[attr] = this[attr];
      }
    }
  }
  return obj;
};
{% endhighlight %}

如果浏览器支持**ECMAScript 5**的话，为了深复制对象属性的所有特性，可以使用
{% highlight javascript %}
Object.defineProperty(obj, attr, Object.getOwnPropertyDescriptor(this, attr));
{% endhighlight %}
来替代
{% highlight javascript %}
obj[attr] = this[attr];
{% endhighlight %}

<br/>
直接在Object.prototype上实现该方法的好处是，所有对象都会继承该方法。坏处是某些库也会改写Object对象，所以有时会发生冲突。这是需要注意的。具体使用方法如下：

{% highlight javascript %}
Object.prototype.DeepCopy = function () { ... }
var a = { x:1 };
var b = a;
var c = a.DeepCopy();
a.x = 2;
b.x = 3;
console.log(a.x);   //3
console.log(b.x);   //3
console.log(c.x);   //1
{% endhighlight %}
