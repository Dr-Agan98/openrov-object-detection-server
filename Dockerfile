FROM ubuntu:18.04

RUN \
 apt-get update && \
 apt-get install -y make && \
 apt-get install -y git && \
 apt-get install -y g++ && \
 apt-get install -y gcc && \
 apt-get install -y python && \
 apt-get install -y cmake libjpeg8-dev && \
 apt-get install -y ca-certificates wget && \
 update-ca-certificates && \
 wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.37.2/install.sh | bash

WORKDIR /project

RUN \
 export NVM_DIR="$HOME/.nvm" && \
 [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" && \
 [ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion" && \
 nvm install 14.16.1 && \
 ln -s "$(which node)" /usr/bin/node && \
 git clone https://github.com/Dr-Agan98/openrov-object-recognition-server.git && \
 wget https://raw.githubusercontent.com/pjreddie/darknet/master/cfg/yolov3.cfg && \
 wget https://raw.githubusercontent.com/pjreddie/darknet/master/cfg/yolov3-tiny.cfg && \
 wget https://pjreddie.com/media/files/yolov3-tiny.weights && \
 wget https://pjreddie.com/media/files/yolov3.weights && \
 mkdir data && \
 cd data && \
 wget https://raw.githubusercontent.com/pjreddie/darknet/master/data/coco.names

WORKDIR /project/openrov-object-recognition-server

RUN \
 npm install darknet

ENTRYPOINT ["./start_server.sh"]