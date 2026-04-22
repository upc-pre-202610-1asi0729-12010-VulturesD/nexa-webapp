#!/bin/sh
json-server --watch db.json --routes routes.json --host 0.0.0.0 --port ${PORT:-3000}
