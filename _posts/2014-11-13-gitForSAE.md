---
date: 2014-11-13 2:15:10 UTC
title: 极速地将git项目部署到SAE的svn服务器上
description: 我花了一些时间自己写了一个能够极速地将一个git项目部署到SAE的svn服务器上的脚本。代码不是复杂，也没有很深的技术。但确实是个好用的小工具，至少对我来说，不用把我的git项目打包成zip再上传了，确实提高了超多效率！我将首先介绍一下脚本如何使用，再介绍我是如何实现这个shell脚本的。
permalink: /posts/gitForSAE/
key: 10017
labels: [SAE, git, shell, svn]
---

我花了一些时间自己写了一个能够极速地将一个git项目部署到SAE的svn服务器上的脚本。代码不是复杂，也没有很深的技术。但确实是个好用的小工具，至少对我来说，不用把我的git项目打包成zip再上传了，确实提高了超多效率！我将首先介绍一下脚本如何使用，再介绍我是如何实现这个shell脚本的。项目地址：[https://github.com/zry656565/git-for-SAE](https://github.com/zry656565/git-for-SAE)


##功能
- 一个脚本搞定将git项目部署到SAE的svn服务器上
- 可以很方便地管理SAE上的1-10版本
- 自动将缓存文件夹 `.svn` 加入 `.gitignore`

##安装
- 第一步，将本项目clone到本地并checkout到release分支，这么做的话你在想要更新到最新版本时可以随时获得更新。或者你直接[下载zip包](https://github.com/zry656565/git-for-SAE/archive/release.zip)。假设你将项目放到了如`/Users/Jerry/Dev/git-for-SAE/`这样的路径下。
- 第二步，将以下内容添加到`~/.bash_profile`下

{% highlight bash %}
# Git for SAE
export GIT_FOR_SAE_ROOT=/Users/Jerry/Dev/git-for-SAE/ #此处就是你刚刚放置clone下来的项目路径
export PATH=$GIT_FOR_SAE_ROOT:$PATH
{% endhighlight %}

- 第三步，应用新的`.bash_profile`

{% highlight console %}
Terminal$ source ~/.bash_profile
{% endhighlight %}

##如何使用
如果svn服务器是:`https://svn.sinaapp.com/sjtubus/`，那么下面的第一个参数请填写: `sjtubus`
如果通过上面那种方式安装好后，你可以进入你自己项目的根目录，接着这样使用：

{% highlight console %}
#部署
#第一个参数是SAE上的项目名
#第二个数字表示版本号，SAE支持1-10
Terminal$ sae-push.sh sjtubus 1

#清空本地svn缓存
Terminal$ sae-clean.sh
{% endhighlight %}


##成功案例
- 将交大校园巴士时刻表部署到SAE上
- Github: [https://github.com/zry656565/SJTU-Bus](https://github.com/zry656565/SJTU-Bus)
- SAE: [http://sjtubus.sinaapp.com/](http://sjtubus.sinaapp.com/)


##如何实现
简单来说就分为以上四步:
1. checkout SAE上的svn项目
2. 清除svn项目中的文件
3. 将git项目中的文件拷贝到svn项目中
4. 提交至SAE服务器

####1.checkout SAE上的svn项目
首先，我在git项目的根目录下创建`.svn`文件夹用于存放SAE的svn项目，如果识别到已经创建了就跳过这个步骤，否则创建好`.svn` 后，执行 `svn checkout $svn_repo_url` (地址由参数生成)。

####2.清除svn项目中的文件
接着为了防止之前的文件对git项目产生影响，我会将它们全部删除。反正既然采用这种管理手段，代码版本管理都在git项目中，所以应该不会造成不好的影响。但有一点需要注意的是根目录下的`config.yaml`文件是不能删除的，必须保留下来。需要执行的指令如下：

{% highlight bash %}
mv config.yaml ../config.yaml
rm -rf *
mv ../config.yaml config.yaml
svn st | awk '{print $2}' | xargs svn delete
svn commit -m "clean"
{% endhighlight %}

####3.将git项目中的文件拷贝到svn项目中
接着就把git项目中的所有文件拷贝到`.svn`文件夹下的项目中，执行如下指令：

{% highlight bash %}
mv -f .svn ../.svn
cp -rf * "../.svn/$svn_dir_name"
mv -f ../.svn .svn
{% endhighlight %}

####4.提交至SAE服务器
通过`awk`判断svn项目中所有文件的状态，对所有`?`状态的文件，将它们加入到svn的版本管理中，并提交。

{% highlight bash %}
svn st | awk '{if ( $1 == "?") { print $2 }}' | xargs svn add
svn commit -m "modify"
{% endhighlight %}

就这样大功告成啦，总共源码也只有60多行，有兴趣的朋友可以去看看源码，也可以fork[我的项目](https://github.com/zry656565/git-for-SAE)并做一些贡献。
