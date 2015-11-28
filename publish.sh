#!/bin/bash

# Replace "sculpin generate" with "php sculpin.phar generate" if sculpin.phar
# was downloaded and placed in this directory instead of sculpin having been
# installed globally.

sculpin generate --env=prod
if [ $? -ne 0 ]; then echo "Could not generate the site"; exit 1; fi

# Copy hidden files
cp source/.htaccess output_prod/.htaccess

# Add --delete right before "output_prod" to have rsync remove files that are
# deleted locally from the destination too. See README.md for an example.
rsync -avze 'ssh -p 22' --delete output_prod/ thowil22@www.thomaspwilson.com:/home/thowil22/thomaspwilson.com/
if [ $? -ne 0 ]; then echo "Could not publish the site"; exit 1; fi
