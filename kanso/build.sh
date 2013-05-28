#!/bin/bash

pushd ../
grunt clean buildall
if [ $? -ne 0 ]; then
    echo "Cannot build module"
    popd
    exit 1
fi
cp build/angular.js kanso/
popd
kanso pack