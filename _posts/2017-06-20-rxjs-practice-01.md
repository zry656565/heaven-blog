---
date: 2017-06-20 22:55:00 +0800
title: RxJS 实战篇（一）拖拽
description: 很多人在接触到 RxJS 后会有一个共同的感觉：这个库虽然很强大，但奈何各种各样的 operators 太多了，在实际场景中根本不知道怎么运用！所以本文并不旨在阐释响应式编程的优越性，而是通过循序渐进的实例来展示 RxJS 常用 operators 的使用场景。
permalink: /posts/rxjs-practice-01/
key: 10039
labels: [JavaScript, RxJS, drag]
---

<script async src="https://production-assets.codepen.io/assets/embed/ei.js"></script>

面对交互性很强、数据变化复杂的场景，传统的前端开发方式往往存在一些共有的问题：**1).** UI 状态与数据难以追踪；**2).** 写出的代码可读性很差，逻辑代码分布离散。
相比之下，响应式编程（Reactive Programming）在解决此类问题上有着得天独厚的优势。Vue、Mobx、RxJS 这些库都是响应式编程思想的结晶。

很多人在接触到 RxJS 后会有一个共同的感觉：这个库虽然很强大，但奈何各种各样的 operators 太多了，在实际场景中根本不知道怎么运用！所以本文并不旨在阐释响应式编程的优越性，而是通过循序渐进的实例来展示 RxJS 常用 operators 的使用场景。如果你尚未入门 RxJS，推荐你可以先看看一位来自台湾的前端工程师 Jerry Hong 写的 [30 天精通 RxJS 系列](http://ithelp.ithome.com.tw/articles/10186103)。不要被三十天这个标题给吓到啦，如果你有一些函数式编程的经验的话，周末花一天时间就能看完。当然要加深对 RxJS 的理解还是得多多实战。毕竟实践出真知嘛！

本文不适合 **未入门的新手** 与 **已精通的高手**。如果你觉得你对 RxJS 有了初步的认识，但掌握程度不高，可能这篇文章就比较适合你了。你可以尝试跟着本文的三个实例自己先做做看，再对比一下本文给出的解决方案，相信你能对 RxJS 有更深入的理解。注意，本文给出的解决方案并不一定是最优的解决方案，如果你有什么改进的建议，可以在文末留言，谢谢！

## 1. 简单的拖拽

> **需求**：给定一个小方块，实现简单的拖拽功能，要求鼠标在小方块上按下后能够拖着小方块进行移动；鼠标放开后，则运动停止。

要实现一个简单的拖拽，需要对 `mousedown`, `mousemove`, `mouseup` 等多个事件进行观察，并相应地改变小方块的位置。

首先分析一下，为了相应地移动小方块，我们需要知道的信息有：**1).** 小方块被拖拽时的初始位置；**2).** 小方块在被拖拽着移动时，需要移动到的新位置。通过 Marble Diagram 来描述一下我们的原始流与想要得到的流，其中最下面这个流就是我们想要用于更新小方块位置的流。

{% highlight console %}
mousedown   : --d----------------------d---------
mousemove   : -m--m-m-m--m--m---m-m-------m-m-m--
mouseup     : ---------u---------------------u---

dragUpdate  : ----m-m-m-------------------m-m----
{% endhighlight %}

简而言之，就是在一次 `mousedown` 和 `mouseup` 之间触发 `mousemove` 时，更新小方块的位置。要做到这一点，最重要的操作符是 [**takeUntil**](http://reactivex.io/rxjs/class/es6/Observable.js~Observable.html#instance-method-takeUntil)，相关的伪代码如下：

{% highlight javascript %}
mousedown.switchMap(() => mousemove.takeUntil(mouseup))
{% endhighlight %}

将 **switchMap** 和 **takeUntil** 加入上面的 Marble Diagram：

{% highlight console %}
mousedown  : --d----------------------d---------
mousemove  : -m--m-m-m--m--m---m-m-------m-m-m--
mouseup    : ---------u---------------------u---
     
   stream1$ = mousedown.map(() => mousemove.takeUntil(mouseup))

stream1$   : --d----------------------d---------
                \                      \
                 m-m-m|                 -m-m|
   
   dragUpdate = stream1$.switch()

dragUpdate : ----m-m-m-------------------m-m----
{% endhighlight %}

其实 **switchMap** 就是 **map + switch** 组合的简写形式。当然，我们还需要同时记录一下初始位置并根据鼠标移动的距离来更新小方块的位置，实际的实现代码如下：

{% highlight javascript %}
const box = document.getElementById('box')
const mouseDown$ = Rx.Observable.fromEvent(box, 'mousedown')
const mouseMove$ = Rx.Observable.fromEvent(document, 'mousemove')
const mouseUp$ = Rx.Observable.fromEvent(document, 'mouseup')

mouseDown$.map((event) => ({
  pos: getTranslate(box),
  event,
}))
.switchMap((initialState) => {
  const initialPos = initialState.pos
  const { clientX, clientY } = initialState.event
  return mouseMove$.map((moveEvent) => ({
    x: moveEvent.clientX - clientX + initialPos.x,
    y: moveEvent.clientY - clientY + initialPos.y,
  }))
  .takeUntil(mouseUp$)
})
.subscribe((pos) => {
  setTranslate(box, pos)
})
{% endhighlight %}

其中，`getTranslate` 和 `setTranslate` 主要作用就是获取和更新小方块的位置。具体实现可以参见 [Codepen](https://codepen.io/jerryzou/pen/XgppaN)

<p data-height="260" data-theme-id="0" data-slug-hash="XgppaN" data-default-tab="js,result" data-user="jerryzou" data-embed-version="2" data-pen-title="easy-drag" class="codepen">See the Pen <a href="https://codepen.io/jerryzou/pen/XgppaN/">easy-drag</a> by Jerry Zou (<a href="https://codepen.io/jerryzou">@jerryzou</a>) on <a href="https://codepen.io">CodePen</a>.</p>

## 2. 添加初始延迟

> **需求**：在拖拽的实际应用中，有时会希望有个初始延迟。就像手机屏幕上的诸多 App 图标，在你想要拖拽它们进行排序时，通常需要按住图标一小段时间，比如 **200ms**（如下图所示），这时该如何操作呢？

![iPhone drag][1]

为了演示方便，这里我们先定义一个简单的动画，当用户鼠标按下超过一定时间后，播放一个闪烁动画：

{% highlight css %}
.blink {
  animation: 0.4s linear blinking;
}

@keyframes blinking {
  0% { opacity: 1; }
  50% { opacity: 0; }
  100% { opacity: 1; }
}
{% endhighlight %}

此处我们只做一个简单的实现：在用户鼠标按下时间超过 200ms 且在这 200ms 的时间内没有发生鼠标移动时，认为拖拽开始。伪代码如下：

{% highlight javascript %}
mousedown.switchMap(() => $$.delay(200).takeUntil(mousemove))
{% endhighlight %}

其中，上面的 `$$` 指的是一个新创建的流。为了得到更直观的理解，使用多个 Marble Diagram 来分段理解之前的伪代码：

{% highlight console %}
mousedown   : --d----------------------d---------
mousemove   : -m---m----m--------m-------------m-

   stream1$ = mousedown.map(() => $$.delay(200).takeUntil(mousemove))

stream1$    : --d----------------------d---------
                 \                      \
                  -|                     ----s|

   dragStart = mousedown.switchMap(() => $$.delay(200).takeUntil(mousemove))

dragStart   : -------------------------------s----
{% endhighlight %}

在第一次鼠标按下的 200ms 内，触发了 `mousemove` 事件，所以第一次 `mousedown` 并没有触发一次 **dragStart**，而在第二次鼠标按下的 200ms 内，并没有触发 `mousemove` 事件，所以最后就引起了一次 **dragStart**。

结合之前的简单拖拽的实现，代码如下：

{% highlight javascript %}
mouseDown$.switchMap((event) => {
  return Rx.Observable.of({
    pos: getTranslate(box),
    event,
  })
  .delay(200)
  .takeUntil(mouseMove$)
})
.switchMap((initialState) => {
  const initialPos = initialState.pos
  const { clientX, clientY } = initialState.event
  box.classList.add('blink')
  return mouseMove$.map((moveEvent) => ({
    x: moveEvent.clientX - clientX + initialPos.x,
    y: moveEvent.clientY - clientY + initialPos.y,
  }))
  .takeUntil(mouseUp$.do(() => box.classList.remove('blink')))
})
.subscribe((pos) => {
  setTranslate(box, pos)
})
{% endhighlight %}

其中，多了两句操作 `#box` 的 classname 的代码，主要就是用于触发动画的。完整代码见 [Codepen](https://codepen.io/jerryzou/pen/bRgOdN?editors=0110)

<p data-height="265" data-theme-id="0" data-slug-hash="bRgOdN" data-default-tab="js,result" data-user="jerryzou" data-embed-version="2" data-pen-title="delay-drag" class="codepen">See the Pen <a href="https://codepen.io/jerryzou/pen/bRgOdN/">delay-drag</a> by Jerry Zou (<a href="https://codepen.io/jerryzou">@jerryzou</a>) on <a href="https://codepen.io">CodePen</a>.</p>

## 3. 拖拽接龙

> 需求：给定 n 个小方块，要求拖拽第一个小方块进行移动，后续的小方块能够以间隔 0.1s 的时间跟着之前的小方块进行延迟模仿运动。

![drag list][2]

此例中，我们不再要求“初始延迟”，因此针对正在拖拽着的红色小方块，只要沿用第一个例子中的简单拖拽的方法，即可获取我们需要改变方块位置的事件流：

{% highlight javascript %}
mousedown.switchMap(() => mousemove.takeUntil(mouseup))
{% endhighlight %}

然而我们该如何依次修改多个方块的位置呢？首先，可以先构造一个流来按延迟时间依次取得我们想要改变的小方块：

{% highlight javascript %}
// 获取所有小方块，图示的例子中给出的是 7 个小方块
const boxes = document.getElementsByClassName('box')

// 使用 zip 操作符构造一个由 boxes 组成的流
const boxes$ = Rx.Observable.from([].slice.call(boxes, 0))
const delayBoxes$ = boxes$.zip(Rx.Observable.interval(100).startWith(0), (box) => box)
{% endhighlight %}

假定 7 个 boxes 在 Marble Diagram 中分别表示为 `a`, `b`, `c`, `d`, `e`, `f`, `g`：

{% highlight console %}
boxes$          : (abcdefg)|
interval(100)   : 0---0---1---2---3---4---5---6---7---8---

   delayBoxes$ = boxes$.zip(Rx.Observable.interval(100).startWith(0), (box) => box)

delayBoxes$     : a---b---c---d---e---f---g|
{% endhighlight %}

只要将原本用于修改方块位置的 mousemove 事件流 mergeMap 到上面例子中的 delayBoxes$ 上，即可完成“拖拽接龙”。伪代码如下所示：

{% highlight javascript %}
mousedown.switchMap(() => mousemove.takeUntil(mouseup))
  .mergeMap(() => delayBoxes$.do(() => { /* 此处更新各个小方块的位置 */ }))
{% endhighlight %}

让我们继续着眼于 Marble Diagram：

{% highlight console %}
delayBoxes$     : ---a---b---c---d---e---f---g|
dragUpdate$     : -----m--------m----------m-------

   stream1$ = dragUpdate$.map(() => delayBoxes$)

stream1$        : -----m-------m----------m-------
                        \       \          \
                         \       \          a---b---c---d---e---f---g|
                          \       a---b---c---d---e---f---g|
                           a---b---c---d---e---f---g|

   result$ = dragUpdate$.mergeMap(() => delayBoxes$)

result$         : ---------a---b--ac--bd--cea-dfb-egc-f-d-g-e---f---g|
{% endhighlight %}

正如上面 Marble Diagram 所示，我们可以借助流的力量从容地在合适的时机修改对应的小方块的位置。具体的实现代码如下所示：

{% highlight javascript %}
const headBox = document.getElementById('head')
const boxes = document.getElementsByClassName('box')
const mouseDown$ = Rx.Observable.fromEvent(headBox, 'mousedown')
const mouseMove$ = Rx.Observable.fromEvent(document, 'mousemove')
const mouseUp$ = Rx.Observable.fromEvent(document, 'mouseup')
const delayBoxes$ = Rx.Observable.from([].slice.call(boxes, 0))
  .zip(Rx.Observable.interval(100).startWith(0), (box) => box)

mouseDown$.map((e) => {
  const pos = getTranslate(headBox)
  return {
    pos,
    event: e,
  }
})
.switchMap((initialState) => {
  const initialPos = initialState.pos
  const { clientX, clientY } = initialState.event
  return mouseMove$.map((moveEvent) => ({
    x: moveEvent.clientX - clientX + initialPos.x,
    y: moveEvent.clientY - clientY + initialPos.y,
  }))
  .takeUntil(mouseUp$)
})
.mergeMap((pos) => {
  return delayBoxes$.do((box) => {
    setTranslate(box, pos)
  })
})
.subscribe()
{% endhighlight %}

完整的实现代码见 [Codepen](https://codepen.io/jerryzou/pen/MoJpam?editors=0110)

<p data-height="265" data-theme-id="0" data-slug-hash="MoJpam" data-default-tab="js,result" data-user="jerryzou" data-embed-version="2" data-pen-title="drag-list" class="codepen">See the Pen <a href="https://codepen.io/jerryzou/pen/MoJpam/">drag-list</a> by Jerry Zou (<a href="https://codepen.io/jerryzou">@jerryzou</a>) on <a href="https://codepen.io">CodePen</a>.</p>

## 小结

- 这篇文章介绍了关于拖拽的三个实际场景：
  - 在简单拖拽的实例中，使用到了 `takeUntil`, `switchMap` 操作符；
  - 需要添加初始延迟时，我们额外使用到 `delay` 操作符；
  - 在最后的拖拽接龙实例中，`mergeMap` 操作符和 `zip + interval` 的组合发挥了很大的作用
- 相信看完本文以后，你们能够深刻体会到：结合 **Marble Diagram** 来理解 RxJS 的流是一个非常棒的方法！

最后大家可以思考一下：在第三个例子中，如果把 `mergeMap` 改为 `switchMap` 或者 `concatMap` 会发生什么？这是课后作业。哈哈！

[1]: {{ site.static_url }}/posts/iPhone-drag.gif
[2]: {{ site.static_url }}/posts/drag-list.gif
