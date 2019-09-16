#!/bin/bash

PACKAGE_NAME=$(cat package.json | jq -r ".name")
PACKAGE_VERSION=$(cat package.json | jq -r ".version")
PACKAGE_FILE=$PACKAGE_NAME-$PACKAGE_VERSION
GIT_ORIGIN_URL=`git config --get remote.origin.url`
