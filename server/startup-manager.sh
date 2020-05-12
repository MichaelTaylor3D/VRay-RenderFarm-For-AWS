cd /home/ec2-user/render-farm && /usr/bin/git fetch --all && /usr/bin/git reset --hard origin/master
cd /home/ec2-user/render-farm && /usr/bin/npm install
cd /home/ec2-user/render-farm/client && /usr/bin/npm run build

tmux \
    new-session -d -s renderfarm "cd /home/ec2-user/render-farm/service && /usr/bin/node . ; read" \; \
    split-window "cd /home/ec2-user/render-farm/server && /usr/bin/node . ; read" \; \
    split-window \; \
    select-layout even-horizontal