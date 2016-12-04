---
date: 2015-11-26 00:20:00 +0800
title: 记一次作死 —— 被 Leetcode 封禁
description: 从昨天凌晨四点起，我的 Leetcode 账号就无法提交任何代码了，于是我意识到我的账号大概是被封了……
permalink: /posts/leetcode-benchmark/
key: 10033
labels: [Leetcode, chrome, curl, Nodejs]
---

从昨天凌晨四点起，我的 Leetcode 账号就无法提交任何代码了，于是我意识到我的账号大概是被封了……

## 起因

我和我的同学 [@xidui](http://xidui.github.io/) 正在维护一个项目 [xidui/algorithm-training](https://github.com/xidui/algorithm-training)。其实就是收录一些算法题的解答，目前主要对象就是 Leetcode。我前几天正好做到 [#17 Letter Combinations of a Phone Number](https://leetcode.com/problems/letter-combinations-of-a-phone-number/)。题目也蛮简单的，我写好以后提交了一下，发现跑出来的结果是 152 ms —— **“哇哦，你打败了 2.44% 的提交”**。好差！！我瞬间满脸黑线。而之前提到的项目中正好有另一个同学写的关于这一题的解答，我赶紧去参考了一下，感觉空间复杂度比我小很多，但时间复杂度应该差不多呀，然后注释中有这么一句：

> I think this is an O(n^3) solution, but still runs faster than 100% submissions

不信邪的我把这位同学的代码复制过来提交了一下，得到的结果是 —— 160ms...“哇哦，你打败了 2.44% 的提交哦！” ╮(╯_╰)╭

看了看 Discuss 里的解法，感觉复杂度似乎也差不多，于是我决定研 (Zuo) 究 (Si) 一下 Leetcode OJ 服务的稳定性如何。

## 过程

打开 Chrome 的开发者工具，发现只有 `submit` 和 `check` 两种 ajax 请求，response 内容大概是这样的：

{% highlight javascript %}
// `submit` response
{ "submission_id": 46823974 }

// first `check` response
{ "state": "STARTED" }

// second `check` response
{
  "lang": "javascript",
  "total_testcases": 25,
  "status_code": 10,
  "status_runtime": "152 ms",
  "run_success": true,
  "state": "SUCCESS",
  "total_correct": 25,
  "question_id": "17"
}
{% endhighlight %}

所以只要先模拟一个 `submit` 的 POST 请求，拿到 submission_id 后，再用这个 id 模拟 `check` 的 GET 请求，直到拿到最终的结果。

我直接把之前发送的两个 ajax 请求用 Curl 的形式保存下来：（感谢 Chrome ╰(￣▽￣)╮)

![如何通过chrome开发者工具获取请求的curl形式][1]

然后我写了个 Nodejs 的小程序，每隔**一分钟**调用上面保存的两个脚本来进行一次提交，并把当次的执行速度保存到 Mongodb 中。代码我就不贴啦，有兴趣的话可以到 [zry656565/Leetcode-Benchmark](https://github.com/zry656565/Leetcode-Benchmark) 看看。

## 结果

这个程序大概是在十一点左右的时候开始运行的。本以为一分钟一次的频率并不高，结果第二天起来一看，从凌晨四点多开始就没有数据了，自此我这个账号就提交不了代码了。。

当然啦，采集到了 300 多条数据也不能白费了，画个图出来看看吧。任意一个节点所提交的程序片段都是同一个，大概最终的结果是这样的：

![结果][2]

(⊙o⊙)…本来想着是不是能找到某个 Leetcode 的服务器稍微稳定一点的时刻，不过似乎并不存在这样的时刻呢。呵呵，然并卵。不过好消息是，在事件发生的二十四小时以后，我发现我的账号解禁了，哈哈哈哈。

<h1 style="text-align:center;">完。</h1>

[1]: {{ site.static_url }}/posts/curl.jpg!0.5
[2]: {{ site.static_url }}/posts/leetcode-benchmark.png!0.5