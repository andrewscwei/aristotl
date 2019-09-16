#!/bin/bash

source .circleci/get_opts.sh

NETLIFY_API=https://api.netlify.com/api/v1
SITE_ID=""

if [ -f .circleci/netlify ]; then
  SITE_ID=$(cat .circleci/netlify)

  echo "Existing site ID ($SITE_ID) found in repo, verifying that site exists..."
  echo

  RESULT=$(curl -H "User-Agent: $CIRCLE_PROJECT_USERNAME ($CIRCLE_PROJECT_USERNAME@users.noreply.github.com)" $NETLIFY_API/sites/$SITE_ID?access_token=$NETLIFY_KEY)

  echo
  echo $RESULT
  echo

  RESPONSE_CODE=$(echo $RESULT | jq -r ".code")

  # Site not found.
  if [[ $RESPONSE_CODE == "404" ]]; then
    SITE_ID=""
  fi
fi

if [[ $SITE_ID == "" ]]; then
  echo "No netlify file detected or site is not found, creating a new site on Netlify..."
  echo

  RESULT=$(curl -H "Content-Type: application/zip" -H "Authorization: Bearer $NETLIFY_KEY" --data-binary "@package/$PACKAGE_FILE.zip" $NETLIFY_API/sites)
  SITE_ID=$(echo $RESULT | jq -r ".id")
  SITE_NAME=$(echo $RESULT | jq -r ".subdomain")
  SITE_URL=https://$SITE_NAME.netlify.com

  echo "$SITE_ID" > .circleci/netlify

  git config user.name "$CIRCLE_PROJECT_USERNAME"
  git config user.email "$CIRCLE_PROJECT_USERNAME@users.noreply.github.com"
  git add ./.circleci/netlify
  git commit -m "[Skip CI] Adding generated netlify file"
  git push -f $GIT_ORIGIN_URL HEAD:master

  echo
  echo "Done! Your site URL is:"
  echo $SITE_URL
else
  echo "Deploying to site ${SITE_ID}..."
  echo

  RESULT=$(curl -H "Content-Type: application/zip" -H "Authorization: Bearer $NETLIFY_KEY" --data-binary "@package/$PACKAGE_FILE.zip" $NETLIFY_API/sites/$SITE_ID/deploys)
  SITE_URL=$(echo $RESULT | jq -r ".url")

  echo
  echo $RESULT
  echo
  echo "Done! Your site URL is:"
  echo $SITE_URL
fi
