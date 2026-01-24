---
date: 2018-11-27 00:53:00 +0800
title: 像呼吸一样自然：React hooks + RxJS
description: 上个月的 React Conf 上，React 核心团队首次将 hooks 带到的公众们的眼前。起初我看到这样奇怪的东西，对它是很抗拒的。Dan 说 JavaScript 里的 this 太黑了，从其他语言转来写 React 的人会很不适应。然而 hooks 本质上也是一种黑魔法，需要理解它的本质依旧需要对 JS 的各种闭包和作用域的问题搞得很透彻才行。然而后来，跟 hooks 打了几天交道以后，我感觉这个想法还是挺有意思的。
permalink: /posts/rxjs-hooks/
key: 10042
labels: [RxJS, React, react-hooks]
---

上个月的 React Conf 上，React 核心团队首次将 hooks 带到的公众们的眼前。起初我看到这样奇怪的东西，对它是很抗拒的。Dan 说 JavaScript 里的 this 太黑了，从其他语言转来写 React 的人会很不适应。然而 hooks 本质上也是一种黑魔法，需要理解它的本质依旧需要对 JS 的各种闭包和作用域的问题搞得很透彻才行。

然而后来，跟 hooks 打了几天交道以后，我感觉这个想法还是挺有意思的。首先推荐一下 React Conf 上的开篇演讲：[React Today and Tomorrow and 90% Cleaner React With Hooks](https://www.youtube.com/watch?v=dpw9EHDh2bM)，值得一看。

我们团队一直对 RxJS 青睐有加，但一直苦于它和 React 结合起来使用实在是有些繁琐。上周 @太狼 就决定在 hooks api 上试试水。结果那一整天我都听见身边在喊，“真香”。

![真香][1]

## rxjs-hooks

那么用 hooks 写 RxJS 代码究竟有多香呢？让我们一起来看看，这个让妈妈开心，开了又开的开源项目：[LeetCode-OpenSource/rxjs-hooks](https://github.com/LeetCode-OpenSource/rxjs-hooks)

![ben-lesh-twitter][2]

我们有完整的测试用例，测试覆盖率 100%。目前一共只有两个 hooks：`useObservable` 和 `useEventCallback`。还是直接用例子解释来得简单明了，让我们首先回想一下，怎么在 React Component 中创建、订阅，并销毁一个流。大概是这个样子：

{% highlight javascript %}
import React from 'react';
import { interval } from 'rxjs';
import { tap } from 'rxjs/operators';

class Timer extends React.Component {
  state = {
    val: 0,
  };

  subscription = new Subscription();

  componentDidMount() {
    const sub = interval(1000).pipe(
	  tap((val) => this.setState({ val }))
	)
    this.subscription.add(sub)
  }

  componentWillUnmount() {
    this.subscription.unsubscribe()
  }

  render() {
    return <h1>{this.state.val}</h1>
  }
}
{% endhighlight %}

手动订阅，手动管理声明周期，还要通过 React 中的 state 搭建一个与 render 函数 (UI) 之间的桥梁。那么使用 rxjs-hooks 之后呢：

{% highlight javascript %}
import React from 'react';
import { interval } from 'rxjs';
import { useObservable } from 'rxjs-hooks';

function Timer() {
  const val = useObservable(() => interval(1000), 0);

  return <h1>{val}</h1>
}
{% endhighlight %}

没有手动订阅，不需要再理会生命周期的管理。只需要一个[不到 1kb 的依赖](https://bundlephobia.com/result?p=rxjs-hooks@0.2.0)，就能在 React 世界里快乐地拥抱 RxJS 。

### API 详解

本小节中将结合一些例子来简单介绍一下 rxjs-hooks 中的两个 API。详细的类型定义可以 [访问这里](https://github.com/LeetCode-OpenSource/rxjs-hooks#apis) 查看。下面会结合例子进行讲解，这样应该会比较通俗易懂一点。

**注意**

- 以下案例均基于 RxJS 6
- 如果对 React hooks 不够了解，建议先看文首推荐的视频或 [React 官方博客](https://reactjs.org/docs/hooks-intro.html)。

#### useObservable

**案例 1：无默认值，不依赖外部状态**

{% highlight javascript %}
function Timer() {
  const val = useObservable(() => interval(1000));

  return <h1>{val}</h1>
}
{% endhighlight %}

在此案例中，仅传递了第一个参数，它是 Observable 的工厂函数，需要返回一个 Observable，而 useObservable 的返回值永远是流的最新值。首次渲染只有一个内容为空的 `<h1>`；1 秒后，内容变为 `0`；2 秒后，内容变为 `1`...

**案例 2：有默认值**

{% highlight javascript %}
function Timer() {
  const val = useObservable(() => interval(1000), -1);

  return <h1>{val}</h1>
}
{% endhighlight %}

在第二个案例中，我们传递了第二个参数，它就是 `val` 的默认值。所以在这种情况下，首次渲染的内容不再为空，而是 `-1`。

**案例 3：依赖上一次的执行状态**

如果你需要在流中获得上一次输出的结果时，工厂函数会传入一个 `state$` 流来帮助你做到这一点。（此处一定要使用 `withLatestFrom` 来结合这个流，否则会造成无限循环）

{% highlight javascript %}
function Timer() {
  const val = useObservable((state$) => interval(1000).pipe(
	withLatestFrom(state$),
	map(([index, prevVal]) => index + prevVal),
  ), 0);

  // first render:    0
  // 1s later:        1    (1 + 0)
  // 2s later:        3    (2 + 1)  
  // 3s later:        6    (3 + 3)
  // 4s later:       10    (4 + 6)
  return <h1>{val}</h1>
}
{% endhighlight %}

**案例 4：依赖外部状态**

工厂函数可以依赖一些外部传入的状态，通过 useObservable 的第三个参数传入（和 [useEffect](https://reactjs.org/docs/hooks-reference.html#useeffect)，[useMemo](https://reactjs.org/docs/hooks-reference.html#usememo) 的接口类似）

如果传递了第三个参数，那么工厂函数中，就会得到两个流，分别为 `input$` 和 `state$`。在下面的例子中，`input$` 流发出的值总是一个 `[a, b]` 元组。为了使例子比较易于理解，所以我们暂时不使用 `state$` 流。

{% highlight javascript %}
function Timer({ a }) {
  const [b, setB] = useState(0);
  const val = useObservable(
    (inputs$, _state$) => timer(1000).pipe(
      combineLatest(inputs$),
      map(([_, [a, b]]) => a + b),
    ),
    0,
    [a, b],
  );

  return (
    <div>
      <h1>{val}</h1>
      <button onClick={() => setB(b + 10)}>b: +10</button>
    </div>
  )
}

function App() {
  const [a, setA] = useState(100);

  return (
    <div>
      <Timer a={a} />
      <button onClick={() => setA(a + 100)}>a: +100</button>
    </div>
  );
}
{% endhighlight %}

这个例子相对较为复杂，可以结合 [live demo](https://codesandbox.io/s/8y5nx3pyo8) 理解。

#### useEventCallback

我们相信 RxJS 不仅十分擅长处理数据流，同时在处理一些交互逻辑上也有很大的帮助。因此我们设计了第二个 API `useEventCallback`，它接受的三个参数。其中，后两个参数与 `useObservable` 有很大相似之处，因此这边着重介绍第一个形参与返回值。

首先来看看下面的例子 ([live demo](https://codesandbox.io/s/jpjr31qmw))，可以很容易地看出：返回值和 useEventCallback 不一样了，它会返回一个 `[callback, value]` 元组。同时接受的工厂函数，接受一个 `event$` 参数，每当 `callback` 被调用时，`event$` 流总会有一个新的值流出。而 `useEventCallback` 函数的第二个参数依旧是我们熟悉的默认值。

{% highlight javascript %}
function App() {
  const [clickCallback, [description, x, y]] = useEventCallback((event$) =>
    event$.pipe(
      map((event) => [event.target.innerHTML, event.clientX, event.clientY]),
    ),
    ["nothing", 0, 0],
  )

  return (
    <div className="App">
      <h1>click position: {x}, {y}</h1>
      <h1>"{description}" was clicked.</h1>
      <button onClick={clickCallback}>click me</button>
      <button onClick={clickCallback}>click you</button>
      <button onClick={clickCallback}>click him</button>
    </div>
  );
}
{% endhighlight %}

### 更多实际案例

这里附上一些简单的实际案例，可以帮助大家进一步理解 rxjs-hooks 的用法。代码就不贴在正文中啦，有兴趣的小伙伴可以访问下面案例中的在线链接玩一下。

#### 案例 1：Drag me

[live demo](https://codesandbox.io/s/9382vrr4xy)

![drag][3]

#### 案例：两栏 resizable 布局

[live demo](https://codesandbox.io/s/k9609z20w5)

![resizer][4]

#### 案例：尾随队列

[live demo](https://codesandbox.io/s/94qm201pw4)

![drag-list][5]

## 小结

至此 [rxjs-hooks](https://github.com/LeetCode-OpenSource/rxjs-hooks) 就先介绍到这儿。我们的实现不一定是对 hooks 最好的理解，权当抛砖引玉。很期待社区有更多人能参与到这项变革中来，我们也很乐意和大家分享所遇到的各种踩坑之旅。同时，随时欢迎大家给这个项目提 issue 或者 PR。

[1]: {{ site.static_url }}/posts/rxjs-hooks/真香.webp
[2]: {{ site.static_url }}/posts/rxjs-hooks/ben-lesh.jpg
[3]: {{ site.static_url }}/posts/rxjs-hooks/drag.webp
[4]: {{ site.static_url }}/posts/rxjs-hooks/resizer.webp
[5]: {{ site.static_url }}/posts/rxjs-hooks/drag-list.webp
