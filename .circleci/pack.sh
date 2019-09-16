#!/bin/bash

source .circleci/get_opts.sh

mkdir -p package
zip -r package/$PACKAGE_FILE.zip build
