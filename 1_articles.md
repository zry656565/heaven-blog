---
title: 所有文章
permalink: /articles/
layout: default
nav: true
requireJq: true
---

<!-- Labels -->
<section class="label-section">
  <h6>所有标签</h6>
  <hr/>
</section>
<script type="text/javascript">
(function($){
  // usage: get param from url
  $.urlParam = function(name){
    var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
    if (results==null){
      return null;
    }else{
      return results[1] || 0;
    } 
  }

  var labels = [
    {% for post in site.posts %}
      {% for label in post.labels %}
        "{{ label }}",
      {% endfor %}
    {% endfor %}
  ];
  var tags = {};
  for (var i = 0; i < labels.length; i++) {
    var t = tags[labels[i]];
    tags[labels[i]] = t ? t+1 : 1;
  }
  labels = [];
  for (var tag in tags) {
    labels.push({
      name: tag,
      value: tags[tag]
    })
  };
  labels.sort(function(a, b){
    return b.value - a.value;
  });
  var label = decodeURI($.urlParam("label"));
  for (i = 0; i < labels.length; i++) {
    $('.label-section').append('<a href="{{ site.baseurl }}/articles/?label='+ labels[i].name +'"><span class="post-label'+ (label==labels[i].name?' select':'') +'">'+ labels[i].name +'</span></a>');
  }
})(jQuery);
</script>
<!-- end -->

<section class="articles-section">
<h6>文章列表</h6>
<hr/>
<ul class="articles">
  {% for post in site.posts %}
    <li data-key="{{ post.key }}">
      <p class="article">
        <span class="article-date">{{ post.date | date: "%Y-%m-%d" }}</span>
        <a class="article-title" href="{{ post.url | prepend: site.baseurl }}">{{ post.title }}</a>
      </p>
    </li>
  {% endfor %}
</ul>
</section>

<script type="text/javascript">
(function($){
  var posts = [
    {% for post in site.posts %}
    {
      key: "{{ post.key }}",
      labels: [
      {% for label in post.labels %}
        "{{ label }}",
      {% endfor %}
      ]
    },
    {% endfor %}
  ];
  var label = $.urlParam("label");
  if (label) {
    label = decodeURI(label);
    for (var i = 0; i < posts.length; i++) {
      if (posts[i].labels.indexOf(label) == -1) {
        $('[data-key='+ posts[i].key +']').hide();
      }
    }
  }
})(jQuery);
</script>