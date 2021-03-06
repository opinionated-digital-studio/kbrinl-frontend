#!/bin/sh
set -e

echo "Starting a release..."
echo " "
echo "This will:"
echo "- check that you're logged in to npm as the correct user"
echo "- publish the package if it has not been published already"
echo "- check that there is not already a tag published"
echo "- create a new tag"
echo "- push the tag to remote origin"
echo " "

read -r -p "Do you want to continue? [y/N] " continue_prompt

if [[ $continue_prompt != 'y' ]]; then
    echo "Cancelling release, if this was a mistake, try again and use 'y' to continue."
    exit 0
fi

echo  "Checking that you can publish to npm..."

NPM_USER=$(npm whoami)
if ! [ "opinionated-studio" == "$NPM_USER" ]; then
    echo "⚠️ FAILURE: You are not logged in with the correct user."
    exit 1
fi

echo "📦  Publishing package..."

# Try publishing
cd package
npm publish
echo "🗒 Package published!"
cd ..

# Extract tag version from ./package/package.json
ALL_PACKAGE_VERSION=$(node -p "require('./package/package.json').version")
TAG="v$ALL_PACKAGE_VERSION"

if [ $(git tag -l "$TAG") ]; then
    echo "⚠️ Tag $TAG already exists"
    exit 1
else
    echo "🗒 Tagging repo using tag version: $TAG ..."
    git tag $TAG -m "KBRINL Frontend release $TAG"
    git push --tags
    echo "🗒 Tag $TAG created and pushed to remote."
fi
