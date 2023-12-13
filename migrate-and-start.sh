#!/bin/bash

# Development setup
./node_modules/.bin/prisma generate
./node_modules/.bin/prisma db push
yarn dev

# Project setup
# npx prisma generate
# npx prisma db push
# node server.js
