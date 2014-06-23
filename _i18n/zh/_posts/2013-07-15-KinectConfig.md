---
layout: post
date: 2013-07-15 15:37:00 UTC
title: Kinect for Windows SDK的环境配置
description: 本文介绍了Kinect for Windows SDK在Visual Studio 2010中的环境配置（C++版本）的配置方法，所使用的SDK版本为1.7。如果版本不一样可能配置过程有些许差别。
footer: true
duoshuo_comment: true
categories: zh posts
---

首先本文是基于Kinect for Windows SDK已经安装好的情况下配置 visual studio 2010的开发环境。<br/>
我所使用的SDK版本为1.7，如果版本不一样可能配置过程有些许差别。

本文介绍的过程主要配置的是可以运行官方所提供的两个DEMO的运行环境。<br/>
这两个DEMO分别为：ColorBasics-D2D和DepthBasics-D2D

* 具体过程：
    1. 在<解决方案资源管理器>里，右击你的项目名，选择最后一项<属性>
    2. 在跳出的属性页左边栏中选择<VC++目录>
        1. 在右边栏中，选中<包含目录>一行，右边会出现一个小箭头，点击小箭头选择<编辑...>，双击第一个空行，输入：$(KINECTSDK10_DIR)\inc
        2. 同样地，在<库目录>一行，加入：$(KINECTSDK10_DIR)\lib\x86
    3. 在左边栏中选择<链接器>，然后在附加依赖项中加入：

{% highlight javascript %}
kernel32.lib
user32.lib
winspool.lib
comdlg32.lib
advapi32.lib
shell32.lib
ole32.lib
oleaut32.lib
uuid.lib
odbc32.lib
odbccp32.lib
Kinect10.lib
{% endhighlight %}

注意每一个文件为一行，末尾不要加分号。

**说明**:本文原发布于我的CSDN博客[天上之海原](http://blog.csdn.net/zry656565)。