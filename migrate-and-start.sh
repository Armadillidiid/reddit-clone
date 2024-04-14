#!/bin/bash

pnpm exec prisma generate
pnpm exec prisma db push

if [ "$NODE_ENV" = "development" ]; then
	# Dev setup
	pnpm dev
elif [ "$NODE_ENV" = "production" ]; then
	# Prod setup
	node server.js
fi
