---
title: Sculpin Macros
categories:
    - software
tags: ['PHP','Sculpin','Twig']
date: 2015-10-24T14:57:00
disqus:
    identifier: sculpin-macros
---

Today I spent some time wrangling [Sculpin][sculpin] in order to get
[Twig][twig] macros working. It's not been an easy process, and it's something
that I've attempted in the past as well. I found a couple places
[recommending][solution1] [solutions][solution2], but none of those suggestions
worked in *Sculpin 2.0.0*. It's very possible that it worked at some point in
the past, but not now.

<!-- more -->

Ideally, I wanted to import like this:

    {% from 'macros.twig' import tag %}

The *import* statement never seemed to fail, so long as I remembered that
Sculpin requires me to leave off the file extension. The issue, it seemed, was
the calling of the macro itself, where I invariably received the following
message:

    Call to undefined method __TwigTemplate_e4fec526a0192fd2201695c9f117fb116c9eeabba0763692755a11c61b80cc53::gettag()

Twig has no problem with this under normal circumstances. My conclusion was that
Sculpin was somehow screwing things up. I immediately checked the Twig version
to ensure it was at least somewhat up-to-date. Sculpin uses a Twig version
between 1.9.0 and 2.0, and though that's not particularly specific, it was
enough to let me know that macros shouldn't be a problem.

`Dump`ing the current Twig context escaped me to begin with. Unfortunately, it
didn't yield anything particularly useful, other than a whopping 112Mb page.
Dumping the macro did show me that it was `NULL` rather than undefined. Clearly
there was a problem somewhere between the loading/parsing of the macro source,
and the creation of the macro in the Twig context.

I decided, after Google had repeatedly failed me, that I'd hop over to the
[Sculpin repo][repo] and file a [ticket][ticket] to see if anyone else had the
same issue. Shortly after, [Kevin Boyd][beryllium] responded, expressing a
similar issue. It was at this point that I got my toes wet in the source code.
It wasn't long before Kevin reported success, but I wasn't satisfied, mostly
because I seemed unable to replicate the solution. It wasn't long before I
discovered [this][config] configuration class, which had the following snippet:

	$rootNode
	    ->children()
	        ->arrayNode('view_paths')
	            ->prototype('scalar')->end()
	        ->end()
	        ->arrayNode('source_view_paths')
	            ->defaultValue(array('_views', '_layouts', '_includes', '_partials'))
	            ->prototype('scalar')->end()
	        ->end()
	        ->arrayNode('extensions')
	            ->defaultValue(array('', 'twig', 'html', 'html.twig', 'twig.html'))
	            ->prototype('scalar')->end()
	        ->end()
	    ->end();

It was apparent that there were two directories I was overlooking. A quick look
at the docs (at the time) revealed nothing about the `_includes` or `_partials`
directories. Obviously the one I was interested in was the `_includes`
directory. I dropped my `macros` source in there, and bam! It worked.

My conclusion is that Sculpin does something interesting with Twig, that
prevents importing from anywhere other than the `_includes` directory. It is at
this point that my sloth overcame my curiosity and I packed in the
investigation. Lesson learned: when using Sculpin, keep everything in its proper
spot. Second lesson learned: docs aren't always right :)

[sculpin]: https://sculpin.io/ "Sculpin - PHP Static Site Generator"
[twig]: http://twig.sensiolabs.org/documentation "Twig - The flexible, fast, and secure PHP template engine"
[solution1]: http://whateverthing.com/blog/2015/07/21/sculpin-snippets-with-twig-macros/ "HTML Snippets with Twig Macros"
[solution2]: https://github.com/beryllium/icelus#usage "Icelus macro usage in Sculpin"
[repo]: https://github.com/sculpin/sculpin "Sculpin on Github"
[ticket]: https://github.com/sculpin/sculpin/issues/285 "Twig imports broken"
[beryllium]: https://github.com/beryllium "Kevin Boyd"
[config]: https://github.com/sculpin/sculpin/blob/master/src/Sculpin/Bundle/TwigBundle/DependencyInjection/Configuration.php "Configuration.php"