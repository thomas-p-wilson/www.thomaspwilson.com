---
title: Docker TDD Redux
categories:
    - software
tags: ['testing','tdd','bdd','docker','python','behave']
date: 2015-11-27T16:16:00
disqus:
    identifier: docker-tdd-redux
---

On Monday the 29th, I wrote an article about test-driven development of Docker
containers. I'm passionate about testing and instrumenting everything, and I had
found relatively few containers that were tested before being pushed out. For
the containers I built, I wanted to include testing to ensure that any changes I
made didn't break existing functionality.

I started off with [Mamba][mamba] for testing. I've lately found that as my
tests get more complex, my Mamba tests become nigh unreadable. So I was looking
for a different solution. I've started getting back into Behaviour-Driven
Development and decided to look at the possibility of using [Gherkin][gherkin]
syntax for testing my containers. I think the final result turned out pretty
swell.

So here's what I've got now for the general testing requirements:

- [docker-py][docker-py] >= 0.3.2
- [behave][behave] >= 1.2.4
- [expects][expects] >= 0.4
- [six][six] >= 1.3.0
- [dockerpty][dockerpty]

I think this combination gives me a more expressive testing implementation than
Mamba did. It's nice to be working with Gherkin syntax again, as it makes the
testing so easy to comprehend. My first foray into using Behave to test my
containers was in my [NodeJS container][nodejs-container], and for full details on my
implementation you'll want to look there.


## The Behave File Structure ##

There are some special sources that we need to know about in order to get behave
to perform:

- features/steps/step_definitions.py: This file is where you define your steps,
what they mean, and what they do.
- features/environment.py: This file is where you define your environmental
controls, actions that run before or after certain events during the testing
process.


## Writing the Image-Testing Feature ##

For those not familiar with Gherkin, it allows you to write your tests largely
in plain English. And in TDD you want to write your failing tests first. Here
was a quick feature I wrote to test the state of the image:

```
Feature: As an image
  The image should have specific properties

  Background:
    Given I am using a standard image

  Scenario: Port 3000 is exposed
    Then Port 3000/tcp is exposed
  
  Scenario: Port 35729 is exposed
    Then Port 35729/tcp is exposed
```

It's very short, and I feel like the language is a little awkward, but I'll
probably refine it in the future, and obviously expand it to be more
comprehensive. Anyway, here we're just testing to make sure that ports 3000 and
35729 are exposed.


## Defining the Steps ##

Afterward, I had to create the step definitions of course, otherwise the above
wouldn't mean anything to Behave. 

```
'''
A little bit of sugar, to make the Gherkin scenario sensible
'''
@given('I am using a standard image')
def step_impl(ctx):
  ctx.port_bindings = {}
  ctx.dir_bindings = {}

'''
Ensure that the given port is exposed by the image
'''
@then('Port {port} is exposed')
def step_impl(ctx, port):
  info = ctx.docker.inspect_image(ctx.image_id)
  assert 'ContainerConfig' in info, 'ContainerConfig not present'
  assert 'ExposedPorts' in info['ContainerConfig'], 'ExposedPorts not present'
  assert port in info['ContainerConfig']['ExposedPorts'], 'Port %s not exposed' % port
```

That's simple enough, right? The only issue now is that we don't actually have
an image to work with. We've got to get the test suite to build the image for
us before any of this will actually work. In `environment.py` you can add
something like:


## Defining Environmental Controls ##

```
'''
Set up the docker-py client, build the image, and grab the image id
'''
def before_all(ctx):
  ctx.docker = docker.Client()

  # Build the image
  response = ctx.docker.build(path='.',tag='thomaspwilson/nodejs-bower-grunt',rm=True)
  try:
    output = [line for line in response]
  except Exception as e:
    print('Failed to build image. Unable to continue.')
    print(e)
    exit(1)

  expect(output).should_not.be.empty
  if 'Successfully built' not in output[-1]:
    print('Failed to build image. Unable to continue.')
    for line in output:
      print(line)
    exit(1)
  # Get the image id
  print(output[-1])
  m = search('[a-fA-F0-9]{12}', output[-1])
  ctx.image_id = m.group(0)
  if ctx.image_id is None or len(ctx.image_id) is not 12:
    print('Failed to build image. Unable to continue.')
    print('Could not get image id.')
    exit(1)
```

In a nutshell, that's roughly what I did to get Behave working in the context of
testing Docker containers. Feel free to check out my Github profile for any of
my `docker-*` repos, as they'll more than likely be tested using this method.

[mamba]: https://github.com/nestorsalceda/mamba "Mamba Testing Framework"
[gherkin]: https://github.com/cucumber/cucumber/wiki/Gherkin "Gherkin DSL"
[docker-py]: http://docker-py.readthedocs.org/en/latest/ "Python Docker API"
[behave]: http://pythonhosted.org/behave/ "Python BDD"
[expects]: https://github.com/jaimegildesagredo/expects "Python Assertion Library"
[six]: https://pypi.python.org/pypi/six "Python 2/3 Compat Library"
[dockerpty]: https://github.com/d11wtq/dockerpty "Python Docker TTY Handler"
[nodejs-container]: https://github.com/thomas-p-wilson/docker-nodejs "NodeJS Docker Container"