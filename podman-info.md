# podman info

podman exec -it curling /bin/bash

podman build -t curling:latest .

podman run -p 2400:2300 -v ./config:/app/config:Z --user 1000 --userns=keep-id -v ./static/media:/app/static/media:Z --replace --name curling curling:latest

podman run -p 2400:2300 -v ./config:/app/config:Z --name curling curling:latest
