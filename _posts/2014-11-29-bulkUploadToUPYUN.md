---
date: 2014-11-29 01:25:10 UTC
title: 使用plupload绕过服务器，批量上传图片到又拍云
description: 论坛或者贴吧经常会需要分享很多图片，上传图片比较差的做法是上传到中央服务器上，中央服务器再转发给静态图片服务器。而这篇文章讲介绍如何使用plupload对上传过程进行优化，并绕过服务器直接批量上传图片到又拍云上的方法。
permalink: /posts/bulkUploadToUPYUN/
key: 10020
labels: [批量上传图片, 又拍云, plupload, JavaScript]
---

##综述

论坛或者贴吧经常会需要分享很多图片，上传图片比较差的做法是上传到中央服务器上，中央服务器再转发给静态图片服务器。而这篇文章讲介绍如何使用plupload对上传过程进行优化，并绕过服务器直接批量上传图片到又拍云上的方法。我写了一个Demo，大家可以到[http://zry656565.github.io/bulk-upload-to-UPYUN/](http://zry656565.github.io/bulk-upload-to-UPYUN/)查看，而本文集中会讲到以下几个重点：

- plupload库
- 图片的本地压缩
- 多选图片
- 绕过服务器直接批量上传图片到又拍云
  - 使用又拍的HTTP FORM API
  - plupload的配置

##plupload库

[plupload](http://www.plupload.com/)是一个支持非常丰富的图片上传插件。可以对低版本的浏览器通过**Flash/Silverligh/html4**支持批量上传，而在高版本浏览器中则会优先使用**html5**接口上传，这一切的判定都是自动的，可以说使用起来非常方便！其次plupload还支持在**客户端压缩图片、直接Drag&Drop**来上传等功能，具体大家就可以到它的官网上了解更多的信息。

在这里我们仅使用它的核心API，只需要引入一个文件即可。

{% highlight html %}
<script src="lib/plupload-2.1.2/js/plupload.full.min.js"></script>
{% endhighlight %}

官方给出的核心API例子非常简单，可以直接移步[http://www.plupload.com/examples/core](http://www.plupload.com/examples/core)查看。核心API在理解上不存在什么困难，如果需要帮助可以在本文后面向我提问。

##图片的本地压缩

一般在网页中浏览的图片质量需求不高，记得当初高中上课学PS，老师说网上的图片分辨率设72就好了，打印的图片的话得设300。所以用户在上传一张很大的照片时，比较好的做法是现在用户的客户端本地压缩好这张图片，并把压缩后较小的图片上传，既不影响浏览效果，同时也能加快上传速度，减小服务器的负担。

图片的本地压缩功能在plupload中是支持的，只要在初始化它的时候传入一个`resize`参数就好了。其中，宽度和高度可以根据实际情况设置，而`quality`是比较重要的一个参数，顾名思义，这个值设置得越小，图片越小，但显示的质量也会越差，这个就需要你自己权衡一下啦。

{% highlight json %}
{
    "resize": {
        "width": 200,
        "height": 200,
        "quality": 70
    }
}
{% endhighlight %}

##多选图片

批量上传图片的一个前置条件就是能够多选图片。多选文件是HTML5的一个标准特性，我们可以通过如下方式来开启多选模式：

{% highlight html %}
<form action="xxx">
  Select images: <input type="file" name="img" multiple> <!-- multiple 在这儿是关键！-->
  <input type="submit">
</form>
{% endhighlight %}


根据一个非常优秀的jquery插件jQuery-File-Upload的[浏览器支持](https://github.com/blueimp/jQuery-File-Upload/wiki/Browser-support)中**Multiple File selection**这个小节所写的那样，IE一直发展到`IE10`才刚开始支持这个HTML5的特性，那么我们又不得不借助Flash神奇的力量来对低版本浏览器进行多选图片的支持。幸运的是plupload已经帮我们做到了这一点，而且这一开关是默认开启的。如果你觉得你不需要用到多选图片，你可以设置`multi_selection: false`来关闭这个特性。

##绕过服务器直接批量上传图片到又拍云

又拍云提供了HTTP FORM API。通过这个接口，我们就可以直接从浏览器端发起上传图片的请求，而不需要通过我们自己的服务器进行中转，大大降低了开销。

####使用又拍的HTTP FORM API

使用这个接口，就需要向又拍云发送一个表单。这个表单包含你所要上传的文件，并且还需要包含`policy`和`signature`。Policy用于将上传请求相关的参数，例如保存路径，文件类型，预处理结果等，另外，也包含了上传请求授时间等。而Signature用于安全校验。

为了演示方便，此处直接使用javascript来生成Policy和Signature。**但在实际使用中，为了安全性考虑，请在服务器端完成这个过程。**下面的代码在官方的demo基础上做了些许修改，主要是使用了官方的测试帐号，关于这两个参数的具体生成方法，请参考官方的文档：[http://docs.upyun.com/api/form_api/](http://docs.upyun.com/api/form_api/)。

{% highlight javascript %}
var options = {
    'bucket': 'demonstration',
    'save-key': '/test/filename.txt',
    'expiration': Math.floor(new Date().getTime() / 1000) + 86400
};
// 查看更多参数：http://docs.upyun.com/api/form_api/#表单API接口简介
var policy = window.btoa(JSON.stringify(options));
// 从 UPYUN 用户管理后台获取表单 API
var form_api_secret = '1+JY2ZqD5UVfw6hQ8EesYQO50Wo=';
// 计算签名
var signature = md5(policy + '&' + form_api_secret);
{% endhighlight %}

####plupload的配置

如何使得plupload可以配合又拍云的HTTP FORM API，着实让我头疼了一番。在查看plupload的文档中，无意中的发现却让我看到了曙光，[Upload to Amazon S3](http://www.plupload.com/docs/Upload-to-Amazon-S3)这个链接吸引了我。`Amazon S3`的全称是Amazon Simple Storage Service，它提供的云存储服务多多少少和又拍云有些相似。

于是根据这篇文章中关于浏览器端配置的介绍，我琢磨出了上传到又拍云所需要的配置。其实说起来也很简单，主要就是对`url`和`multipart_params`两个参数进行配置。下面的例子中的`options.bucket`、`policy`和`signature`直接使用上一节计算出来的值。

{% highlight javascript %}
var uploader = new plupload.Uploader({
    ...
    url : 'http://v0.api.upyun.com/' + options.bucket,
    multipart_params: {
        'Filename': '${filename}', // adding this to keep consistency across the runtimes
        'Content-Type': '',
        'policy': policy,
        'signature': signature,
    },
    ...
});
{% endhighlight %}

##总结

如此这般，终于实现了通过plupload绕过服务器，向又拍云批量上传图片了。plupload真是一个很强大的库，不过它对商业使用可以需要收费的哦，具体还是到它的官网上去了解吧！虽然在开头已经提过了，这里还是在唠叨一句：最终的demo效果可以到我创建的项目中看到，丢下链接：[http://zry656565.github.io/bulk-upload-to-UPYUN/](http://zry656565.github.io/bulk-upload-to-UPYUN/)

##参考资料

1. [又拍云文档 － HTTP FORM API](http://docs.upyun.com/api/form_api/)
2. [又拍云官方js调用demo](https://github.com/upyun/js-form-api/blob/master/demo.html)
3. [plupload - Upload to Amazon S3](http://www.plupload.com/docs/Upload-to-Amazon-S3)
4. [plupload - plupload ignores server side error messages](http://www.plupload.com/punbb/viewtopic.php?id=1681)