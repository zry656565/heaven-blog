---
date: 2014-06-02 00:00:00 UTC
title: IEEE论文PDF格式检测中的问题与解决
description: 这两天要发一篇很酱油的论文了，根据格式的模板改了半天终于大功告成。结果发现在IEEE PDF Express网站上说我检验不通过，并给出了以下的错误信息。我瞬间摸不着头脑了，Font Times New Roman is not embedded (583x)到底是什么错啊，还没有行号，这叫我如何定位这个错误！根据官方给出的提示一路顺藤摸瓜，最终发现这一段：...
permalink: /posts/paperFormat/
key: 10009
labels: [IEEE, paper]
---

这两天要发一篇很酱油的论文了，根据格式的模板改了半天终于大功告成。结果发现在[IEEE PDF Express](www.pdf-express.org)网站上说我检验不通过，并给出了以下的错误信息。

![Error and Warnings][1]

我瞬间摸不着头脑了，**Font Times New Roman is not embedded (583x)**到底是什么错啊，还没有行号，这叫我如何定位这个错误！

根据官方给出的提示一路顺藤摸瓜，最终发现这一段：

>Every pdf document with text uses fonts. The pdf format allows to embed fonts within the pdf document. If a font is embedded then the viewer can display and print any text based on this font correctly. If a font is not embedded then the viewer looks for a substitute font on the computer where it is installed that is similar to the original font and uses this. The similarity may not be complete. For this reason publishers of pdf documents that are to be published and distributed electronically often require that all fonts are embedded.
**An exception is sometimes made for the "Base 14" fonts of Adobe because they are considered to be widely available.** These are the fonts Times-Roman, Times-Italic, Times-Bold, Times-BoldItalic, Helvetica, Helvetica-Oblique, Helvetica-Bold, Helvetica-BoldOblique, Courier, Courier-Oblique, Courier-Bold, Courier-BoldOblique, Symbol and ZapfDingbats. Even if these fonts are not available then they can often safely be substituted by similar other fonts.
The pdf test detects all fonts used by the document. Non-embedded fonts that need to be embedded are reported. The report includes the pages on which the fonts are used and also any graphics that use the font. Graphics are identified in the format Graphics4.2, that is, the second graphics on page 4. The ordering on the page is as the test finds the graphics. Note that not all graphics are identified as separate objects. Some graphics are embedded within the text.
Consult the support section on how to make sure that the required fonts are embedded.

真相终于大白，IEEE的论文格式检测需要PDF中嵌入所使用到的字体，可是因为那些像Times-Roman一类的字体实在是太常用了，所以一般在转换PDF的时候不会去嵌入这些字体。因此我们需要在WORD转PDF的时候做一些特殊的设置！

只要以下三步你就可以通过检查啦！

![1,2步][2]

![第3步][3]



  [1]: /images/ieee_1.png
  [2]: /images/ieee_2.png
  [3]: /images/ieee_3.png