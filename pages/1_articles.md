---
title: 所有文章
permalink: /articles/
layout: default
nav: true
requireJq: true
---

<script src="/assets/js/lib/react/react.js"></script>
<script src="/assets/js/lib/react/JSXTransformer.js"></script>

<script type="text/javascript">
// prepare data from jekyll
var $J = {
  baseUrl: "{{ site.baseurl }}/articles/?label=",
  labels: [
    "显示全部",
    {% for post in site.posts %}
      {% if post.release %}
        {% for label in post.labels %}
          "{{ label }}",
        {% endfor %}
      {% endif %}
    {% endfor %}
  ],
  posts: [
    {% for post in site.posts %}
      {% if post.release %}
      {
        title: "{{ post.title }}",
        date: "{{ post.date | date: "%Y-%m-%d" }}",
        link: "{{ post.url | prepend: site.baseurl }}",
        labels: [
        {% for label in post.labels %}
          "{{ label }}",
        {% endfor %}
        ]
      },
      {% endif %}
    {% endfor %}
  ]
};
</script>

<script type="text/jsx" src="/pages/articles.jsx"></script>

<section class="label-section">
  <h2>标签列表</h2>
  <hr/>
  <div id="label-list"></div>
</section>

<section class="articles-section">
  <h2>文章列表</h2>
  <input class="search-box" type="text" placeholder="搜索包含在标题中的关键词" />
  <div class="search-icon">
    <img src="{{ site.static_url }}/search_icon.png"/>
  </div>
  <hr/>
  <div id="articles-list"></div>
</section>