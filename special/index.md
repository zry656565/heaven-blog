---
layout: page
title: Special
---

<svg id="clock"></svg>

{% if site.lang == "en" %}
##My Love, Iris Nee
<img src="/res/images/us1.jpg" />

From the first day I fell love with you, it has been:

<p id="dyn_time">
</p>

And I love you not only now, but forever.

{% else if site.lang == "zh" %}
##我的挚爱，倪小欢
<img src="/res/images/us1.jpg" />

从我们在一起的那一天算起，至此时此刻，已经有：

<p id="dyn_time">
</p>

并且我将永远爱你，保护你。

{% endif %}

{% include polarClock.html %}