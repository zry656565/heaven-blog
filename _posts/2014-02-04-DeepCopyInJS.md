---
date: 2014-02-04 21:33:00 UTC
title: Javascript中的一种深复制实现
description: 本文将给大家详细介绍一种javascript中的深复制实现。
permalink: /posts/deepcopy/
---

要实现深复制有很多办法，比如最简单的办法有：

    var cloneObj = JSON.parse(JSON.stringify(obj));

上面这种方法好处是非常简单易用，但是坏处也显而易见，这会抛弃对象的constructor，也就是深复制之后，无论这个对象原本的构造函数是什么，在深复制之后都会变成Object。另外诸如`RegExp`对象是无法通过这种方式深复制的。

所以这里我将介绍一种，我自认为很优美的深复制方法，当然可能也存在问题。如果你发现了我的实现方法有什么问题，请及时让我知道~

先决条件：
1. 对于任何对象，它可能的类型有`Boolean`, `Number`, `Date`, `String`, `RegExp`, `Array` 以及 `Object`（所有自定义的对象全都继承于`Object`）
2. 我们必须保留对象的构造函数信息（从而使新对象可以使用定义在`prototype`上的函数）

最重要的一个函数：

    Object.prototype.clone = function () {
        var Constructor = this.constructor;
        var obj = new Constructor();

        for (var attr in this) {
            if (this.hasOwnProperty(attr)) {
                if (typeof(this[attr]) !== "function") {
                    if (this[attr] === null) {
                        obj[attr] = null;
                    }
                    else {
                        obj[attr] = this[attr].clone();
                    }
                }
            }
        }
        return obj;
    };

定义在`Object.prototype`上的`clone()`函数是整个方法的核心，对于任意一个非js预定义的对象，都会调用这个函数。而对于所有js预定义的对象，如`Number`,`Array`等，我们就要实现一个**辅助`clone()`函数**来实现完整的克隆过程：

    /* Method of Array*/
    Array.prototype.clone = function () {
        var thisArr = this.valueOf();
        var newArr = [];
        for (var i=0; i<thisArr.length; i++) {
            newArr.push(thisArr[i].clone());
        }
        return newArr;
    };

    /* Method of Boolean, Number, String*/
    Boolean.prototype.clone = function() { return this.valueOf(); };
    Number.prototype.clone = function() { return this.valueOf(); };
    String.prototype.clone = function() { return this.valueOf(); };

    /* Method of Date*/
    Date.prototype.clone = function() { return new Date(this.valueOf()); };

    /* Method of RegExp*/
    RegExp.prototype.clone = function() {
        var pattern = this.valueOf();
        var flags = '';
        flags += pattern.global ? 'g' : '';
        flags += pattern.ignoreCase ? 'i' : '';
        flags += pattern.multiline ? 'm' : '';
        return new RegExp(pattern.source, flags);
    };

可能直接定义在预定义对象的方法上，让人感觉会有些问题。但在我看来这是一种优美的实现方式。

同时我也在开发一个插件，主要的思想也就是扩展预定义对象的方法。
这个插件叫`JustJS`（[Github项目地址](https://github.com/zry656565/JustJS)）
有以下一些特性：
1. 同时支持`Web`前端和`node.js`使用。
2. 直接对预定义对象的方法进行扩展
3. 使用 `J(function(){...})` 语句块，决不污染全局命名空间。
目前只写了一小部分，同时也写了些简单的文档，有兴趣的同学可以看一下，也可以加入我，`Fork`我的项目，喜欢的同学还可以给`Star`！