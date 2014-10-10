---
title: 所有文章
permalink: /articles/
layout: default
nav: true
sidePart: true
---

<div class="home">
  <ul class="posts">
    {% for post in site.posts %}
      <li>
        <a class="post-link" href="{{ post.url | prepend: site.baseurl }}">{{ post.title }}</a>
        <span class="post-date">Posted on {{ post.date | date: "%b %-d, %Y" }}</span>
      </li>
    {% endfor %}
  </ul>

</div>