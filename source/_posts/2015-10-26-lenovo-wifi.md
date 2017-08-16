---
title: Lenovo G510 WiFi Fix
categories:
    - software
tags: ['Linux','Hardware','Networking']
date: 2015-10-26T12:08:00
disqus:
    identifier: lenovo-wifi
---

Today I spent a few quick moments reformatting my [Lenovo G510][g510] and
installing [Xubuntu 15.10][xubuntu]. I usually do a system clean up every three
months or so, but all my systems are currently way overdue. So this is a start.

<!-- more -->

I ran into a bit of a problem though. I don't recall hitting this issue before,
but I must have, as I don't see a way around it. After installation, the laptop
booted like a champ, nice and quick. I logged in, only to find that WiFi didn't
work out of the box. The solution was quick:

    apt-get install bcmwl-kernel-source

WiFi works no problem now!

[g510]: http://shop.lenovo.com/us/en/laptops/lenovo/g-series/g510/ "Lenovo G510"
[xubuntu]: http://xubuntu.org/ "Xubuntu"