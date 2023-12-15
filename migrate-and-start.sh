#!/bin/bash

if [ "$NODE_ENV" = "development" ]; then
	# Development setup
	./node_modules/.bin/prisma generate
	./node_modules/.bin/prisma db push
	yarn dev
elif [ "$NODE_ENV" = "production" ]; then
	# Project setup
	npx prisma generate
	npx prisma db push
	node server.js
fi
