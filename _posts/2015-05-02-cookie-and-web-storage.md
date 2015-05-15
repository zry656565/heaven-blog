---
date: 2015-05-02 22:28:35 UTC
title: 详说 Cookie, LocalStorage 与 SessionStorage
description: 最近在找暑期实习，其中百度、网易游戏、阿里的面试都问到一些关于HTML5的东西，问题大多是这样开头的：“你用过什么HTML5的技术呀？” 而后，每次都能扯到 Cookie 和 localStorage 有啥差别。这篇文章就旨在详细地阐述这部分内容。
permalink: /posts/cookie-and-web-storage/
key: 10025
labels: ["Cookie", "SessionStorage", "LocalStorage", "HTML5"]
---

最近在找暑期实习，其中百度、网易游戏、阿里的面试都问到一些关于HTML5的东西，问题大多是这样开头的：“你用过什么HTML5的技术呀？” 而后，每次都能扯到 Cookie 和 localStorage 有啥差别。这篇文章就旨在详细地阐述这部分内容，而具体 Web Storage API 的使用可以参考[MDN的文档](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API)，就不在这篇文章中赘述了。

##基本概念

####Cookie

Cookie 是小甜饼的意思。顾名思义，cookie 确实非常小，它的大小限制为4KB左右，是网景公司的前雇员 Lou Montulli 在1993年3月的发明。它的主要用途有保存登录信息，比如你登录某个网站市场可以看到“记住密码”，这通常就是通过在 Cookie 中存入一段辨别用户身份的数据来实现的。

####localStorage

localStorage 是 HTML5 标准中新加入的技术，它并不是什么划时代的新东西。早在 IE 6 时代，就有一个叫 userData 的东西用于本地存储，而当时考虑到浏览器兼容性，更通用的方案是使用 Flash。而如今，localStorage 被大多数浏览器所支持，如果你的网站需要支持 IE6+，那以 userData 作为你的 polyfill 的方案是种不错的选择。

| 特性 | Chrome | Firefox (Gecko) | Internet Explorer | Opera | Safari (WebKit) |
| -- | -- | -- | -- | -- | -- |
| localStorage | 4 | 3.5 | 8 | 10.50 | 4 |
| sessionStorage | 5 | 2 | 8 | 10.50 | 4 |

####sessionStorage

sessionStorage 与 localStorage 的接口类似，但保存数据的生命周期与 localStorage 不同。做过后端开发的同学应该知道 Session 这个词的意思，直译过来是“会话”。而 sessionStorage 是一个前端的概念，它只是可以将一部分数据在当前会话中保存下来，刷新页面数据依旧存在。但当页面关闭后，sessionStorage 中的数据就会被清空。

##三者的异同

<table>
	<thead>
		<tr>
			<th>特性</th>
			<th>Cookie</th>
			<th>localStorage</th>
			<th>sessionStorage</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td>数据的生命期</td>
			<td>一般由服务器生成，可设置失效时间。如果在浏览器端生成Cookie，默认是关闭浏览器后失效</td>
			<td>除非被清除，否则永久保存</td>
			<td>仅在当前会话下有效，关闭页面或浏览器后被清除</td>
		</tr>
		<tr>
			<td>存放数据大小</td>
			<td>4K左右</td>
			<td colspan="2">一般为5MB</td>
		</tr>
		<tr>
			<td>与服务器端通信</td>
			<td>每次都会携带在HTTP头中，如果使用cookie保存过多数据会带来性能问题</td>
			<td colspan="2">仅在客户端（即浏览器）中保存，不参与和服务器的通信</td>
		</tr>
		<tr>
			<td>易用性</td>
			<td>需要程序员自己封装，源生的Cookie接口不友好</td>
			<td colspan="2">源生接口可以接受，亦可再次封装来对Object和Array有更好的支持</td>
		</tr>
	</tbody>
</table>

####应用场景

有了对上面这些差别的直观理解，我们就可以讨论三者的应用场景了。

因为考虑到每个 HTTP 请求都会带着 Cookie 的信息，所以 Cookie 当然是能精简就精简啦，比较常用的一个应用场景就是判断用户是否登录。针对登录过的用户，服务器端会在他登录时往 Cookie 中插入一段加密过的唯一辨识单一用户的辨识码，下次只要读取这个值就可以判断当前用户是否登录啦。曾经还使用 Cookie 来保存用户在电商网站的购物车信息，如今有了 localStorage，似乎在这个方面也可以给 Cookie 放个假了~

而另一方面 localStorage 接替了 Cookie 管理购物车的工作，同时也能胜任其他一些工作。比如HTML5游戏通常会产生一些本地数据，localStorage 也是非常适用的。如果遇到一些内容特别多的表单，为了优化用户体验，我们可能要把表单页面拆分成多个子页面，然后按步骤引导用户填写。这时候 sessionStorage 的作用就发挥出来了。

##安全性的考虑

需要注意的是，不是什么数据都适合放在 Cookie、localStorage 和 sessionStorage 中的。使用它们的时候，需要时刻注意是否有代码存在 XSS 注入的风险。因为只要打开控制台，你就随意修改它们的值，也就是说如果你的网站中有 XSS 的风险，它们就能对你的 localStorage 肆意妄为。所以千万不要用它们存储你系统中的敏感数据。

##参考资料
- [what is the difference between localStorage, sessionStorage, session and cookie?](http://stackoverflow.com/questions/19867599/what-is-the-difference-between-localstorage-sessionstorage-session-and-cookie)
- [HTML5 localStorage security](http://stackoverflow.com/questions/3718349/html5-localstorage-security)
- [维基百科 - Cookie](http://zh.wikipedia.org/wiki/Cookie)
- [Web Storage API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API)
- [浏览器本地数据（sessionStorage、localStorage、cookie）与server端数据](http://han.guokai.blog.163.com/blog/static/13671827120112694851799/)
- [HTMl5的sessionStorage和localStorage](http://www.cnblogs.com/yuzhongwusan/archive/2011/12/19/2293347.html)
- [HTML5 LocalStorage 本地存储](http://www.cnblogs.com/xiaowei0705/archive/2011/04/19/2021372.html)