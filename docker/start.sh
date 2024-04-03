#!/bin/bash

source docker.creds

docker login -u "${USERNAME}" -p "${PASSWORD}"

docker-compose pull crafter

docker-compose up -d