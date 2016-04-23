---
date: 2016-03-21 23:20:00 UTC
title: Kinect 数据录制与回放
description: 最近在实验室用深度相机做一些三维重建的研究，主要的实验场景在宝山区的仓库。学校到仓库的来回车程大概有三四个小时，如果每次都要到实际场景中来测试算法，这真是着实令人头疼。所以我想着，如果能用 Kinect 把仓库中的场景录制下来，回来直接用录好的数据来测试算法，那不就不用来回跑了吗？
permalink: /posts/record-and-playback-for-kinect/
key: 10036
labels: [Kinect, C#, 图像处理]
---

最近在实验室用深度相机做一些三维重建的研究，主要的实验场景在宝山区的仓库。学校到仓库的来回车程大概有三四个小时，如果每次都要到实际场景中来测试算法，这真是着实令人头疼。所以我想着，如果能用 Kinect 把仓库中的场景录制下来，回来直接用录好的数据来测试算法，那不就不用来回跑了吗？接下来就来讲讲如何完成这件事。

首先，我的实验环境是：

- 操作系统：Windows 10
- IDE：Visual Studio 2013 community 版本
- Kinect 版本：2.0
- 编程语言：C#

## 录制

录制数据相对来说比较简单，我们只需要借助 Kinect for Windows SDK 自带的 **Kinect Studio** 就可以达成这一目的。

你可以依照下图的三个小步骤来录制你想要的场景数据；等录制完毕以后，你可以在 `C:\Users\${你的用户名}\Documents\Kinect Studio\Repository` 下找到你录制好的 xef 文件，比如我刚刚录制的 `20160317_111153_00.xef`

![Kinect Studio Sample][1]

## 回放

**实现回放的原理：** 我们在正常使用 Kinect 的过程中，每当 Kinect 采集到一帧画面，就会触发一下 `FrameArrived` 事件。而我们写的程序总是会通过一个 `FrameReader` 来响应每一帧画面所触发的事件。所以只要通过读取 **xef** 文件中的数据，模拟触发 `FrameArrived` 事件；从而做到几乎不修改原本的代码，就能在原来程序中回放录制的场景。

正常来说，**xef** 文件只能在 Kinect Studio 中播放出来。不过 Kinect 开发小组的成员 Carmine 在 MSDN 上发布了一些能够读取 `xef` 的示例代码。接下来我就来讲解一下具体的步骤：

1. 将项目的编译版本修改为 **x64** (否则你会得到 BadImageFormatException 错误)
2. 找到 Kinect Studio 的安装目录 (e.g. C:\Program Files\Microsoft SDKs\Kinect\v2.0_1409\Tools\KinectStudio)
3. 将 **Microsoft.Kinect.Tools.dll** 引入你的项目 (见下图)
4. 将 **KStudioService.dll** 复制到你的 Debug / Release 文件夹

![add References to your project][2]

接下来，你需要编写一些代码来调用回放的功能。以官方的例子 **DepthBasics-WPF** 为例，首先你需要定义一个新的类，并在这个类中定义一个静态方法，如下所示：

{% highlight csharp %}
/******
 * PlaybackClip.cs
 */

using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Kinect.Tools;

namespace Microsoft.Samples.Kinect.DepthBasics
{
    class PlaybackHelper
    {
        public static void PlaybackClip(string filePath, uint loopCount)
        {
            using (KStudioClient client = KStudio.CreateClient())
            {
               client.ConnectToService();
               
               using (KStudioPlayback playback = client.CreatePlayback(filePath))
               {
                   playback.LoopCount = loopCount;
                   playback.Start();
        
                   while (playback.State == KStudioPlaybackState.Playing)
                   {
                       Thread.Sleep(500);
                   }
        
                   if (playback.State == KStudioPlaybackState.Error)
                   {
                       throw new InvalidOperationException("Error: Playback failed!");
                   }
               }
        
               client.DisconnectFromService();
            }
        }
    }
}
{% endhighlight %}

最后，你需要在现有的代码中使用 `PlaybackHelper.PlaybackClip` 方法来帮助你回放之前的数据。此处的示例代码在检测不到 Kinect 设备时会 **启用一个新线程** 来回放指定的数据，并指定循环回放 10 次，你可以根据需要进行修改。

{% highlight csharp %}
/***
 * MainWindow.xaml.cs
 */
 
namespace Microsoft.Samples.Kinect.DepthBasics
{
    public partial class MainWindow : Window, INotifyPropertyChanged
    {
        // ... 此处省略若干示例中的代码
		public MainWindow()
        {
            // ... 此处省略若干示例中的代码

            // 此处为需要添加的代码
            //#begin
            if (!this.kinectSensor.IsAvailable)
            {
                Thread playbackThread = new Thread(startPlayback);
                playbackThread.Start();
            }
            //#end
        }

        // 此处为需要添加的代码
        //#begin
        public static void startPlayback()
        {
            PlaybackHelper.PlaybackClip("${此处填写 xef 的路径}", 10);
        }
        //#end
        
        // ... 此处省略若干示例中的代码
    }
}
{% endhighlight %}

完成了以上这些以后，拔掉你的 Kinect 并重启你的程序。如果程序依然能够很顺利的执行，**那么恭喜你，你成功啦**！

![Sample Result][3]


## 参考文献

- [Stackoverflow - Kinect v2, read out data from .xef files](http://stackoverflow.com/questions/27280689/kinect-v2-read-out-data-from-xef-files)
- [MSDN - Sample codes from Carmine](https://social.msdn.microsoft.com/Forums/en-US/59c97d1e-79f6-4dd0-8fae-73080a2c7b18/documentation-for-microsoftkinecttools-api?forum=kinectv2sdk&prof=required)

[1]: {{ site.static_url }}/posts/kinect-studio.png
[2]: {{ site.static_url }}/posts/vs-reference.png
[3]: {{ site.static_url }}/posts/kinect-result.jpg!0.5