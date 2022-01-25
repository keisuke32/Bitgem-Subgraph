#!/usr/bin/env bash

# reset graph node
pushd graph-node/docker
docker-compose kill
rm -rf ./data
docker-compose up -d
popd
