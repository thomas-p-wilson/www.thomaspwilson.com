---
title: Docker TDD
categories:
    - software
tags: ['testing','tdd','docker','python','mamba']
date: 2015-11-09T13:29:00
disqus:
    identifier: docker-tdd
---

Just about every dev has had the misfortune of working for an organization, or
working on a project, that made little to no use of tests and instrumentation.
For the first while, everything seems fine, until the project grows in
complexity and every little change causes breakage somewhere else - or worse:
world breakage.

I've been fortunate lately to be working with an organization that highly values
(A)TDD, and it always makes things a whole lot easier during development. A
comprehensive set of unit/functional/integration/behavioural tests act as a
safety net that can catch a great deal of breakage when you change even the
simplest thing. Given a good set of tests, you shouldn't have to spend any time
worrying about whether you broke something or not, leaving you to focus on
actual development.

There are plenty of difficult-to-find articles about testing docker containers,
but most of them have their tests written in Ruby. This doesn't make sense to
me. If I'm running on Debian/Ubuntu, why would I install Ruby and all of that
bloat, when I already have Python installed by default? I couldn't find a single
doc on testing Docker containers using python. I did find plenty on running
python tests inside docker containers. Not helpful.

So here's what I came up with:

- [Mamba][mamba] for the test runner
- [docker-py][docker-py] to interact wtih the docker daemon
- [sure][sure] for some fancy testing syntax

We want to build a docker image that runs Bind9 for DNS service. Simple right?

## Writing the Test Skeleton ##

We want the test to handle everything, including building and deleting the
image. So let's set that up in a skeleton that we'll later use for our test
cases. We'll call this file `specs.py`:

```
from sure import expect
from docker import Client
from re import search
from sys import exit

cli = Client()

with description('Bind9 Docker image'):

  # Build the image
  with before.all:
    print 'Build image'
    response = cli.build(path='.',tag='thomaspwilson/bind9')
    try:
      output = [line for line in response]
    except Exception as e:
      print 'Failed to build image. Unable to continue.'
      print e
      exit(1)

    expect(output).should_not.be.empty()
    expect(output[-1]).should.contain('Successfully built')
    # Get the image id
    m = search('[a-fA-F0-9]{12}', output[-1])
    self.image_id = m.group(0)
    expect(self.image_id).should_not.be.none
    expect(self.image_id).should.have.length_of(12)

  # Delete the image
  with after.all:
    cli.remove_image(self.image_id)

  with context('As image'):

    with before.all:
      images = cli.images(name='thomaspwilson/bind9')
      expect(images).should.have.length_of(1)
      self.image = images[0]

    with it('image exists'):
      expect(self.image).should_not.be.none
      expect(self.image).should.have.key('Created');
```

This skeleton does a few things for us. The `before.all` bit builds our image
and grabs the image id for later use. If the image can't be built, then it craps
out and keeps the rest of our tests from running. The `after.all` bit removes
the image so that we don't clutter up our local machine with useless docker
images.

We of course create a context for testing our image, which itself has a
`before.all` section that retrieves the image that was built earlier. We then
test to make sure the image exists. Under normal circumstances, our little check
that we perform when actually building the image should fail first, but it
doesn't hurt to have something visibly pass.

At any rate, if you run this now, `mamba specs.py` you'd get the following
error:

    Failed to build image. Unable to continue.
    500 Server Error: Internal Server Error ("Cannot locate specified Dockerfile: Dockerfile")

Makes sense, as we don't have a Dockerfile to define our image yet. Let's create
a basic one:

```
FROM ubuntu:wily
MAINTAINER Thomas Wilson <thomas@thomaspwilson.com>
```

Now we run the test and it should pass:

```
Bind9 Docker image
Build image
  As image
    ✓ it image exists

1 examples ran in 0.1348 seconds
```

## First Test ##

So our single test case confirms that our image is built as expected. It's time
to move on to what makes our image special. This is supposed to be a DNS server,
so let's expose port 53/udp and 53/tcp.

Start by adding a failing test:

```
with it('should expose tcp/udp port 53'):
  info = cli.inspect_image('thomaspwilson/bind9')
  expect(info['ContainerConfig']).should.have.key('ExposedPorts')
  expect(info['ContainerConfig']['ExposedPorts']).should.have.key('53/tcp')
  expect(info['ContainerConfig']['ExposedPorts']).should.have.key('53/udp')
```

The test will fail until we update our dockerfile to:

```
FROM ubuntu:wily
MAINTAINER Thomas Wilson <thomas@thomaspwilson.com>

EXPOSE 53/tcp 53/udp
```

## Testing the Container ##

Now we want to test the container itself, while running, to ensure that it
behaves as we expect it to. So let's set up a new context for testing our
container, and get the context to create and start our container, and tear it
down when we're done testing. And while we're at it, we'll add our querying
test:

```
from dns.resolver import Resolver

with context('Running as container'):
  with before.all:
    # Create the container
    config = cli.create_host_config(port_bindings={
      '53/udp':54721,
      '53/tcp':54721
    })
    result = cli.create_container(detach=True, image='thomaspwilson/bind9:latest', ports=[(53,'udp'),(53,'tcp')], host_config=config)
    expect(result).should.have.key('Id')
    expect(result['Warnings']).should.be.none
    self.container_id = result['Id']

    # Start the container
    before = len(cli.containers())
    cli.start(container=self.container_id)
    expect(len(cli.containers())).should.eql(before+1)
    self.resolver = Resolver(configure=False)
    self.resolver.nameservers = ['127.0.0.1']
    self.resolver.port = 54721

  with after.all:
    cli.stop(self.container_id)
    cli.remove_container(self.container_id)

  with it('Can query server'):
    answer = self.resolver.query('google.com')
    expect(answer).should.have.property('response')
    expect(answer.response).should.have.property('answer')
    expect(answer.response.answer).should.have.length_of(1)
    expect(answer.response.answer[0].to_text()).should.contain('google.com')
```

If you run this now, you should get an error about `result = cli.start(container=self.container_id)`
returning `None`. When all goes according to plan, it won't, but right now the
container doesn't start because we need to add more info to our Dockerfile.

```
FROM ubuntu:wily
MAINTAINER Thomas Wilson <thomas@thomaspwilson.com>

ENV DATA_DIR=/data \
    BIND_USER=bind

RUN rm -rf /etc/apt/apt.conf.d/docker-gzip-indexes \
 && apt-get update \
 && apt-get install -y bind9 openssl

COPY entrypoint.sh /sbin/entrypoint.sh
RUN chmod 755 /sbin/entrypoint.sh

EXPOSE 53/tcp 53/udp
VOLUME ["${DATA_DIR}"]
ENTRYPOINT ["/sbin/entrypoint.sh"]
CMD ["/usr/sbin/named"]
```

In the above Dockerfile, we're setting some environment variables, installing
bind9 and openssl, setting up our entry point, and then running bind9. We have
to create that `entrypoint.sh` script before we run our tests, otherwise Docker
complains that it can't be found.

```
#!/bin/bash
set -e

ROOT_PASSWORD=${ROOT_PASSWORD:-password}

BIND_DATA_DIR=${DATA_DIR}/bind

create_bind_data_dir() {
  mkdir -p ${BIND_DATA_DIR}
  chmod -R 0755 ${BIND_DATA_DIR}
  chown -R root:${BIND_USER} ${BIND_DATA_DIR}

  # populate default bind configuration if it does not exist
  if [ ! -d ${BIND_DATA_DIR}/etc ]; then
    mv /etc/bind ${BIND_DATA_DIR}/etc
  fi
  rm -rf /etc/bind
  ln -sf ${BIND_DATA_DIR}/etc /etc/bind

  if [ ! -d ${BIND_DATA_DIR}/lib ]; then
    mkdir -p ${BIND_DATA_DIR}/lib
    chown root:${BIND_USER} ${BIND_DATA_DIR}/lib
  fi
  rm -rf /var/lib/bind
  ln -sf ${BIND_DATA_DIR}/lib /var/lib/bind
}

set_root_passwd() {
  echo "root:$ROOT_PASSWORD" | chpasswd
}

create_pid_dir() {
  mkdir -m 0775 -p /var/run/named
  chown root:${BIND_USER} /var/run/named
}

create_bind_cache_dir() {
  mkdir -m 0775 -p /var/cache/bind
  chown root:${BIND_USER} /var/cache/bind
}

create_pid_dir
create_bind_data_dir
create_bind_cache_dir

# allow arguments to be passed to named
if [[ ${1:0:1} = '-' ]]; then
  EXTRA_ARGS="$@"
  set --
elif [[ ${1} == named || ${1} == $(which named) ]]; then
  EXTRA_ARGS="${@:2}"
  set --
fi

# default behaviour is to launch named
if [[ -z ${1} ]]; then
  echo "Starting named..."
  exec $(which named) -u ${BIND_USER} -g ${EXTRA_ARGS}
else
  exec "$@"
fi
```

Now we can attempt to run our tests, and when we do, we should end up with three
test cases having passed, comprising our test suite. We now know that our image
operates as expected. Obviously we can go much farther with TDD-based Docker
development, but this is a good start.

Happy testing!