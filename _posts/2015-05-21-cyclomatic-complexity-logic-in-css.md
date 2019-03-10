---
date: 2015-05-21 08:55:25 +0800
title: 论 CSS 中的逻辑
description: 在过去的很长一段时间中，我们都说 CSS 是不带有任何逻辑的，意思是在 CSS 中没有控制流，也没有某种类似于其他编程语言的方式来组织 CSS。CSS 天生缺乏逻辑性的问题导致了预处理器的出现。然而业界却对 CSS 预处理器褒贬不一，支持预处理器的人认为这弥补了 CSS 缺失的特性；而反对预处理器的人则认为 CSS 的设计初衷就不应该带有逻辑性，他们认为根本不应该引入预处理器这个概念...
permalink: /posts/cyclomatic-complexity-logic-in-css/
key: 10027
labels: ["CSS", "选择器"]
---

> 本文在征得原作者 [@csswizardry](https://twitter.com/csswizardry) 同意的情况下，翻译自他博客中的文章：[Cyclomatic Complexity: Logic in CSS](https://csswizardry.com/2015/04/cyclomatic-complexity-logic-in-css/)

在过去的很长一段时间中，我们都说 CSS 是不带有任何逻辑的，意思是在 CSS 中没有控制流，也没有某种类似于其他编程语言的方式来组织 CSS。CSS 天生缺乏逻辑性的问题导致了预处理器的出现。然而业界却对 CSS 预处理器褒贬不一，支持预处理器的人认为这弥补了 CSS 缺失的特性；而反对预处理器的人则认为 CSS 的设计初衷就不应该带有逻辑性，他们认为根本不应该引入预处理器这个概念。

然而，一种独特的思考方法最近突然蹦入了我的脑袋。它让我感到 CSS 确实拥有逻辑性！很少有人真正那么想过，这大概也是我们一直认为 CSS 的逻辑性匮乏的最大原因吧。

我发现我们可以将复合选择器理解为：主体部分 + **条件部分**。首先来看一个例子：

{% highlight css %}
div.sidebar .login-box a.btn span {
    /*...*/
}
{% endhighlight %}

在这个复合选择器由主体部分是 `span`，而条件部分是 `IF (inside .btn) AND IF (on a) AND IF (inside .login-box) AND IF (inside .sidebar) AND IF (on div)`。

也就是说，一个选择器的每一部分都是一个 `if` 语句，需要在解析选择器时被满足（或者不满足）。有了这种微妙的而又全新的认识，如今我们回头再看看自己曾经写出的 CSS 代码，我们将会意识到选择器写的好或者坏，会对效率产生直接的影响。我们真的会写出下面这段逻辑吗？（伪代码）：

{% highlight shell-session %}
@if exists(span) {
  @if is-inside(.btn) {
    @if is-on(a) {
      @if is-inside(.login-box) {
        @if is-inside(.sidebar) {
          @if is-on(div) {
            # Do this.
          }
        }
      }
    }
  }
}
{% endhighlight %}

也许不会。这看上去太不直接，也太啰嗦了。我们也许只需要这么写：

{% highlight shell-session %}
@if exists(.btn-text) {

  # Do this.

}
{% endhighlight %}

每当为选择器添加一层限制，其实我们也就是添加了额外的一个 `if` 语句。这会导致圈复杂度问题(Cyclomatic Complexity)。

## 圈复杂度

在软件工程中，[圈复杂度](https://en.wikipedia.org/wiki/Cyclomatic_complexity)是一种程序复杂性的一种度量标准，它一般计算程序中的控制流的数量（如 `if`, `else`, `while` 等）。程序中存在越多的控制流，则圈复杂度就越高。我们自然想要保证圈复杂度能够尽量地低，因为圈复杂度越高：

- 代码就越难推导
- 更多潜藏着的、可能会导致失败的问题
- 代码更难以修改、维护以及复用
- 你需要考虑更多代码执行的结果与其副作用
- 编写测试代码的难度也会更高

从圈复杂度的角度来思考 CSS 的解析过程，我们可以看到浏览器在渲染样式之前需要做许多的决定。我们写的选择器中的 `if` 语句越多，这个选择器的**圈复杂度就越高**，这也意味着我们写的选择器越糟糕，为了使得这一条选择器规则满足，就有需要匹配更多的条件。同时，我们写的选择器也会**缺乏清晰度和复用性**，因为引入了过多不必要的 `if` 语句会导致不准确的匹配(false positive)。

相比于将 `span` 嵌套于 `.btn` 内部并写一大堆限制条件，更好地做法应该是创建一个新的类 `.btn-text` 来描述这个 `span`。这样做更加直截了当，同时也更为简洁和健壮（越多的 `@if` 语句导致选择器规则越不容易被满足）。

值得注意的是浏览器解析你写的选择器的方式：从右向左。如果你在写你的选择器时，第一个想到的问题是：“这是一个 `span` 元素吗？” 那你通常就会把选择器写的过于冗繁。你应该从另一个角度思考，写出清晰准确的选择器规则，彻底摒弃那些冗余的条件语句。

**请不要写过于宽泛的规则，导致你写的选择器在匹配开始时就选中大量的 DOM 元素——然后不得不逐步通过更多的条件语句来删减匹配的对象。从选择器的规则解析的一开始就匹配尽量少的元素才是一种更棒的方法。**

圈复杂度对于 CSS 来说可能是一种比较高阶的原则，但如果我们通过它来考量那些蕴含在我们写的选择器中的逻辑性，那我们也许就能写出更加优秀的代码。

一些易于遵守的小规则，

- **让你的选择器最简化**：每一次你想要为选择器添加规则时，你都在添加额外的 `if` 语句。将这些 `if` 语句大声地读出来，仔细考虑它们是否有添加的必要。你需要时刻保持你写的选择器足够合理与简洁。
- **保证圈复杂度最小化**: 使用像 [Parker](https://github.com/katiefenn/parker) 这样的工具来测试你写的选择器的圈复杂度（参考文档：[Identifiers Per Selector](https://github.com/katiefenn/parker/tree/master/docs/metrics#identifiers-per-selector)）
- **如果你不需要这个检验条件，那就不要把它放进选择器**: 有时在 CSS 中使用嵌套结构是有必要的，可在大多数时候并不是，你甚至不能完全相信[Inception Rule](http://thesassway.com/beginner/the-inception-rule)。
- **从右边考虑选择器如何编写**: 从需要匹配的那类元素开始，写尽量少的额外的 CSS 代码来完成一次正确的匹配。
- **写选择器时拥有[明确的目的性](https://csswizardry.com/2012/07/shoot-to-kill-css-selector-intent/)**: 确保你写的选择器确实是你想要的，而不是那些碰巧能使得页面正常显示的代码。

你的选择器是你的 CSS 结构最基本的组成部分，一定要确保你写的代码足够合理而简练。

