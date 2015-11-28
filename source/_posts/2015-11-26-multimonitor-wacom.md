---
title: Wacom Tablets on Multimonitor Systems
categories:
    - hardware
tags: ['ubuntu','multimonitor','tablet']
date: 2015-11-26T10:57:00
disqus:
    identifier: wacom-tablets-on-multimonitor-systems
---

I decided to pull out my Wacom Intuos4 tablet out the other. I'm no artist, but
I do find occasions where having a tablet is really handy. The problem I ran
into was that the tablet surface gets stretched across all three monitors
instead of just a single one. I recall having run into this problem in the past,
but I couldn't immediately recall the solution. I did some digging around though
and found an old script I wrote which fixed things up quite nicely.

This script is extremely simple.

```
##
## Set Wacom tablet to operate on a single screen
##

# Your tablet name may be different. Use `xinput --list` to find your tablet
xinput set-prop "Wacom Intuos4 6x9 Pen stylus" --type=float "Coordinate Transformation Matrix" 0.5 0 0 0 1 0 0 0 1 
xinput set-prop "Wacom Intuos4 6x9 Pen eraser" --type=float "Coordinate Transformation Matrix" 0.5 0 0 0 1 0 0 0 1 
xinput set-prop "Wacom Intuos4 6x9 Pen cursor" --type=float "Coordinate Transformation Matrix" 0.5 0 0 0 1 0 0 0 1 
xinput set-prop "Wacom Intuos4 6x9 Pad pad" --type=float "Coordinate Transformation Matrix" 0.5 0 0 0 1 0 0 0 1 
```

That's all. I'll come back a little later, as I want to update the script a bit
to support cycling through monitors on every execution.