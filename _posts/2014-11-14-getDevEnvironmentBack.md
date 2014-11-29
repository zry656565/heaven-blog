---
date: 2014-11-14 22:12:10 UTC
title: 发生在升级OS X Yosemite后：修复各种开发环境
description: 终于还是忍不住升级了，促使我升级的原动力居然是Alfred的Yosemite theme居然比初始theme好看很多！在升级前就预想到我的开发环境是一定会被破坏的，所以升级好系统以后还是赶快看下发生了什么吧！
permalink: /posts/getDevEnvironmentBack/
key: 10018
labels: [Mac, Yosemite, phpstorm, brew]
---

终于还是忍不住升级了，促使我升级的原动力居然是`Alfred`的Yosemite theme居然比初始theme好看很多！在升级前就预想到我的开发环境是一定会被破坏的，所以升级好系统以后还是赶快看下发生了什么吧！

##问题

一进新系统就发现`phpstorm`跪了，提示要装`jre6`才能用。好吧，然后陆陆续续逐渐发现好多东西都跪了。只能一个一个慢慢修复啦。目前可见的发生错误的环境有：

1. PhpStorm
2. Homebrew
3. node.js
4. Apache
5. MySQL

##逐个击破

###1. PhpStorm

升级了Yosemite以后，按一般的尿性，苹果肯定会升级所有运行环境的版本的，其中少不了Java，因此PhpStorm躺枪。肯定有同学要问啊，为什么`JetBrains`这种被誉为史上最屌霸天的IDE厂商所使用的jdk版本这么低！

`JetBrains`如是说：

> Current JDK 1.7 and 1.8 versions have several critical issues. We can’t default to the new JDK version until these issues are resolved.

好了，解决方法就是下个jre6嘛！结果我在oracle的网站上找了半天却只能找到提供给OS X的jre7和jre8。好吧，其实直接在苹果官网上就可以找到下载链接：[http://support.apple.com/kb/DL1572](http://support.apple.com/kb/DL1572)

###2. Homebrew

Homebrew的运行离不开Ruby，升级后运行不了的原因其实也就是内置于Yosemite的Ruby版本更新啦：`1.8 => 2.0`。想要运行brew就会得到如下错误信息：

{% highlight shell-session %}
/usr/local/Library/brew.rb: /System/Library/Frameworks/Ruby.framework/Versions/1.8/usr/bin/ruby: bad interpreter: No such file or directory
{% endhighlight %}

然后在网上找到解决办法如下：

#####2.1 更新`brew`脚本
用你喜欢的编辑器打开`/usr/local/bin/brew`，然后将`brew`检测系统的一段代码注释掉，具体如下所示：

{% highlight ruby %}
#BREW_SYSTEM=$(uname -s | tr "[:upper:]" "[:lower:]")
#if [ "$BREW_SYSTEM" = "darwin" ]
#then
#    exec "$BREW_LIBRARY_DIRECTORY/brew.rb" "$@"
#else
    exec ruby -W0 "$BREW_LIBRARY_DIRECTORY/brew.rb" "$@"
#fi
{% endhighlight %}

#####2.2 创建软链接

Homebrew会通过`Ruby 1.8`的路径去找Ruby的运行环境，可惜在Yosemite里它再也找不到了。所以在Homebrew做出一定的改变以前，我们需要骗骗它，建立一个假的`Ruby 1.8`的地址，其实指向系统的`Ruby 2.0`运行环境。

{% highlight shell-session %}
sudo mkdir -p /System/Library/Frameworks/Ruby.framework/Versions/1.8/usr/bin
sudo ln -s /usr/bin/ruby /System/Library/Frameworks/Ruby.framework/Versions/1.8/usr/bin/ruby
{% endhighlight %}

###3. node.js

好吧，其实写这篇博客的时候只发现前面两个问题。可是当我用`grunt`来自动生成我的博客时，却收到了`env: node: No such file or directory`这样的错误信息。看来node也在这次升级中惨烈牺牲了啊。

在`/usr/local/bin/`下已经找到`node`和`npm`却发现是无法打开的，依旧会提示`No such file or directory`。目前还是不太清楚是什么原因造成的，最后解决的办法也比较暴力：直接到node官网上下了个最新的pkg直接重新安装一下就好了。

###4. Apache

要本地调试代码的时候发现`Apache`也不能幸免地跪了。执行`apachectl -v`发现Apache已经更新到`2.4.9`版本了。一定又是因为版本更新出了什么差错。

#####4.1 修改httpd.conf

首先打开`/private/etc/apache2/httpd.conf`发现似乎恢复默认的设置了。重新将以下两行代码解注：

{% highlight shell-session %}
Include /private/etc/apache2/extra/httpd-vhosts.conf
...
LoadModule php5_module libexec/apache2/libphp5.so
{% endhighlight %}

#####4.2 修改httpd-vhosts.conf

打开`private/etc/apache2/extra/httpd-vhosts.conf`发现之前设好的虚拟主机似乎没有被修改掉嘛！但因为升级到`Apache 2.4`以上设置需要一定的调整，不然就会得到`403 Forbidden You don't have permission to access / on this server`错误啦。

将原本的
{% highlight xml %}
<VirtualHost *:80>
    ServerAdmin zry656565@gmail.com
    DocumentRoot "/Users/Jerry/Dev/apache/php_tester"
    ServerName php_tester
    ErrorLog "/Users/Jerry/Dev/apache/php_tester/log/sites-error_log"
    CustomLog "/Users/Jerry/Dev/apache/php_tester/log/sites-access_log" common
    <Directory />
        Options Indexes FollowSymLinks Includes ExecCGI
        AllowOverride None
        Order deny,allow
        Allow from all
    </Directory>
</VirtualHost>
{% endhighlight %}
改成
{% highlight xml %}
<VirtualHost *:80>
    ServerAdmin zry656565@gmail.com
    DocumentRoot "/Users/Jerry/Dev/apache/php_tester"
    ServerName php_tester
    ErrorLog "/Users/Jerry/Dev/apache/php_tester/log/sites-error_log"
    CustomLog "/Users/Jerry/Dev/apache/php_tester/log/sites-access_log" common
    <Directory />
        Options Indexes FollowSymLinks Includes ExecCGI
        AllowOverride None
        Require all granted
    </Directory>
</VirtualHost>
{% endhighlight %}
其实就是将`Order deny,allow, Allow from all`改成`Require all granted`。

###5. MySQL

MySQL目前还没有正式支持OS X Yosemite，所以在升级系统后会发现，MySQL的服务居然没有在后台启动。要解决这个问题只有手动启动MySQL的服务，建议在`~/.bash_profile`中加入如下脚本，然后用`source ~/.bash_profile`启用脚本。

{% highlight bash %}
export MYSQL_HOME=/usr/local/mysql/bin
alias start_mysql='sudo $MYSQL_HOME/mysqld_safe &'
alias stop_mysql='sudo $MYSQL_HOME/mysqladmin shutdown'
{% endhighlight %}

接下来，你只需要使用`start_mysql`和`stop_mysql`指令就可以开关mysql服务啦！

##结语

其实本来还会发上第六条的：git。因为我发现我想把这篇博文发到github的博客上去却失败了！找了半天原因却摸不着头脑。后来突发奇想在gitcafe上创建了个项目居然push成功了，说明不是本地的git的问题，而是github的问题。过了一天才成功发上来还真是蛋疼！

以上这些解决方案在我本地都能够解决问题，如果你还有什么疑问，可以在博文下留言，说不定能帮到你。


##参考资料

1. [Homebrew, Ruby, and Rails on OS X 10.10](http://www.tuicool.com/articles/iIvy2e)
2. [Fix the PhpStorm Java Error with Yosemite](http://laravel-news.com/2014/10/fix-phpstorm-java-error-yosemite/)
3. [Error message “Forbidden You don't have permission to access / on this server”](http://stackoverflow.com/questions/10873295/error-message-forbidden-you-dont-have-permission-to-access-on-this-server#)
4. [start mySQL server from command line on Mac OS Lion](http://stackoverflow.com/questions/7927854/start-mysql-server-from-command-line-on-mac-os-lion)

##更新

- 2014.11.16 添加apache、mysql的恢复