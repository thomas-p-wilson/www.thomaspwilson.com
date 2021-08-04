.DEFAULT_GOAL := help

# This is not good Makefile practice! But as we're primarily relying on Makefile
# for helpers, not too concerned about it.
%:
	@:

# Docker Lifecycle
run:
	docker-compose up web

shell:
	docker-compose exec web bash

# Node
lint-css:
	NODE_ENV=test docker-compose run --rm web yarn sass-lint -c .sass-lint.yml -v

lint-js:
	NODE_ENV=test docker-compose run --rm web yarn eslint .

lint:
	make lint-css && make lint-js

test:
	NODE_ENV=test docker-compose run --rm web yarn mocha --compilers js:babel-core/register -r chai/register-expect -R spec ./src/**/*.tests.js

build:
	docker-compose run --rm -e NODE_ENV=production web yarn webpack

publish:
	rsync -avz -e "ssh" --delete --stats --progress dist/ thowil22@www.thomaspwilson.com:/home/thowil22/thomaspwilson.com/

build-and-publish:
	make build && make publish

#~~~~
# Help Docs
#~~~~
help:
	@echo "Thomas's Website Environment Helpers"
	@echo ""
	@echo "Provides a set of helpful commands to perform common actions"
	@echo ""
	@echo "  > help (default)     - Show this help message"
	@echo ""
	@echo "  Docker Lifecycle"
	@echo "    > run              - Run the application in a docker container on port 3000"
	@echo "    > shell            - Gain a shell in the running application container"
	@echo ""
	@echo "  Node"
	@echo "    > lint-css         - Lint all CSS/SASS source files"
	@echo "    > lint-js          - Lint all JS source files, and fix errors where possible"
	@echo "    > lint             - Lint all JS and CSS/SASS source files"
	@echo "    > test             - Run all available tests"
	@echo "    > analyze          - Ask webpack to analyze the production bundle"
	@echo "    > build            - Build the production bundle"
	@echo "    > publish          - Push the new production bundle up to host"
	@echo ""
