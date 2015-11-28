---
title: Spin Casting A Mirror - Research Phase
categories:
    - diy
tags: ['Astronomy','DIY','Optics']
date: 
disqus:
    identifier: new-frontier
---

When building his first reflecting telescope, Sir Isaac Newton constructed a
spherical primary mirror instead of a paraboloidal mirror in order to ease
construction. Spherical mirrors suffer from [spherical aberration][spherical aberration],
an optical defect which results in peripheral rays being reflected either in
front of, or behind, the intended focal point of the mirror. Spherical mirrors
are relatively simple to fashion, as are paraboloidal mirrors.

There is a lot of trial-and-error involved in crafting a mirror by hand,
involving grinding the general shape, followed by progressively finer grit
grinding and polishing. I've seen folks use up to fourteen different grits for
the grinding phase alone. I'm interested in reducing the manual labour required
in producing a paraboloidal mirror. Thus, I intend to attempt [spin casting][spin casting]
a mirror.

Spin casting is a neat process in which a rotating liquid forms a paraboloid by
virtue of the centrifugal force acting on the liquid. The reflective liquid may
be a substance of low melting point, such as mercury, or a substance of high
melting point to which heat is applied. Mercury or low melting alloys of
gallium have been used in [liquid mirror telescopes][lmt].

While the properties of both spin-cast mirrors and mirrors produced by other
means can be described mathematically, the math for spin-casting a mirror can
directly affect the casting process. The [Dobsonian][dobsonian] process of
mirror production involves repeated grinding/polishing and testing phases in
order to remove optical defects and adjust focal length. Math could easily tell
us how to grind our mirror right the first time, but human hands aren't exactly
great at precision work, and telescopic optical components really need to be
precise to about twenty nanometers. Using math to determine the rotation of the
furnace or cast allows us to get very close to the desired mirror shape on the
first go.

To relate the angular velocity of the liquid to the focal length of the
resulting paraboloid, we can use the following formula. We *must* ensure that
the units used are consistent. *g* and *f* must use the same units, be it the
metre, centimetre, inch, barleycorn, etc. So let:

- *r* represent the radius of the rim of the mirror, in centimetres
- *f* represent the focal length of the mirror from the vertex, in centimetres
- *h* represent the height of an imaginary parcel above a zero to be defined in the calculation
- *w* represent the angular velocity of the liquid's rotation, in radians per second
- *g* represent the acceleration due to gravity, in centimetres

\\[
  \begin{align}
    r^2 &= 4fh \\\
        &= 4f\dfrac{1}{2g}w^2r^2 \\\
      1 &= 4f\dfrac{1}{2g}w^2 \\\
     2g &= 4fw^2 \\\
      g &= 2fw^2
  \end{align}
\\]

So for example, if I want to cast a 50cm (~20 inch) mirror with a focal length
of 180cm (~6 feet), we plug in:

- *r* = 25cm
- *f* = 180cm
- *g* ~ 981cm

\\[
  \begin{align}
       g &= 2fw^2 \\\
     981 &= 2\times180w^2 \\\
         &= 360w^2 \\\
     w^2 &= \dfrac{981}{360} \\\
       w &= \sqrt{2.725} \\\
       w &= 1.6507574
  \end{align}
\\]

In order to produce our hypothetical mirror, we would rotate the cylindrical
cast at a rate of 1.6507574 radians per second. Or, for a more easily understood
unit of revolutions per second \\(1.6507574\times0.159155=0.26272629\\) rps or
\\(0.26272629\times60=15.763572\\) rpm.

----------------

Some extra formulas for those of you who, like me, forget their highschool
functions/calculus course entirely.

Let:

* *f* equal the focal length of the mirror, from the vertex of the paraboloid
* *d* equal the depth from vertex to rim
* *r* equal the radius of the rim
* *D* equal the diameter of the entrance pupil (effective aperture)
* *g* represents the acceleration due to gravity
* *w* represents the angular speed of the liquid's rotation, in radians per second
* *m* is the mass of an infinitesimal parcel of liquid material
* *r* is the distance of the parcel from the axis of rotation
* *h* is the height of the parcel above a zero to be defined in the calculation

The formula for a parabola is \\(x^2 = 4fy\\), which also applies to a
paraboloid: \\(r^2 = 4fd\\).

The formula for the volume of a paraboloid is \\(v = \dfrac{1}{2}pr^2d\\).

The formula to determine aperture area is the formula for the area of a circle: \\(a = \pi r^2\\)

The formula to determine the concave surface area is \\(a = \dfrac{\pi r}{6d^2}\times((r^2 + 4d^2)^{3/2}-r^3)\\)

The formula to calculate the depth of the dish is \\(h = \dfrac{1}{2g}w^2r^2\\)

The formula for the [focal ratio][focal ratio] or f-number is \\(N = \dfrac{f}{D}\\)

---------------

It's been so long since I've done any sort of real math, and I wanted to do this
without electronic aids, so now my brain hurts. I'll come back to this later.

[spherical aberration]: https://en.wikipedia.org/wiki/Spherical_aberration "Spherical Aberration"
[spin casting]: https://en.wikipedia.org/wiki/Spin_casting_%28mirrors%29 "Spin Casting"
[lmt]: https://en.wikipedia.org/wiki/Liquid_mirror_telescope "Liquid Mirror Telescopes"
[focal ratio]: https://en.wikipedia.org/wiki/F-number "Focal Ratio"
