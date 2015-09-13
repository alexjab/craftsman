test:
	jshint --exclude-path .gitignore .
	mocha

.PHONY: test
