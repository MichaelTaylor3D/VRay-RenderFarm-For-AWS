cd /home/ec2-user/oonix-render-farm && /usr/bin/git fetch --all && /usr/bin/git reset --hard origin/master
cd /home/ec2-user/oonix-render-farm && /usr/bin/npm install

tmux \
    new-session -d -s renderfarm "cd /home/ec2-user/oonix-render-farm/service/render-node && /usr/bin/node . ; read" \; \
    split-window \; \
    select-layout even-horizontal