#!/bin/bash
singleRun=0

if [ $# -gt 0 ]; then
    while getopts "bsp:a:t:cm:" arg; do
      case $arg in
        b)
            docker-compose build
            ;;
        s)
            singleRun=1
            echo "debugMode is set"
            ;;
        p)
            package=$OPTARG
            ;;
        a)
            appCommand=$OPTARG
            ;;
        t)
            testCommand=$OPTARG
            ;;
        c)
            useCache=1
            ;;
        m)
            appImage=$OPTARG
            ;;
        *)
            echo "Invalid option specified"
            echo "Usage: LaunchAgent.sh -b"
            exit 1
            ;;
      esac
    done
fi

if [ -e ./temp-plot.0.html ]
then
    rm ./temp-plot.*.html
fi

awk -v APPCOMMAND="$appCommand" '{
    sub(/appCommand/, APPCOMMAND);
    print;
}' dockerfiles/Dockerfile.client.gcc > dockerfiles/Dockerfile.client.1.gcc

awk -v TESTCOMMAND="$testCommand" '{
    sub(/testCommand/, TESTCOMMAND);
    print;
}' dockerfiles/Dockerfile.client.1.gcc > dockerfiles/Dockerfile.client.0.gcc

awk -v PACKAGE="$package" '{
    sub(/package/, PACKAGE);
    print;
}' dockerfiles/Dockerfile.agent.gcc > dockerfiles/Dockerfile.agent.0.gcc

awk -v APPIMAGE="$appImage" '{
    sub(/appImage/, APPIMAGE);
    print;
}' docker-compose.yml > docker-compose.0.yml

if [ -z "$useCache" ]; then
    sed s/agentCpuSet/0/ < docker-compose.0.yml > docker-compose.1.yml
    docker-compose -f docker-compose.1.yml build
fi

numCores=`cat /proc/cpuinfo | grep processor | wc -l`
if [ $numCores == 8 ]; then
    CPUSET="0 0-1 0-3 0-7"
elif [ $numCores == 4 ]; then
    CPUSET="0 0-1 0-2 0-3"
elif [ $numCores == 1 ]; then
    CPUSET="0 0 0 0"
fi

if [ $singleRun == 1 ]; then
    sed s/agentCpuSet/0/ < docker-compose.0.yml > docker-compose.1.yml
    docker-compose -f docker-compose.1.yml up
else
    runId=1
    for cpuSet in $CPUSET
    do
        sed s/agentCpuSet/$cpuSet/ < docker-compose.0.yml > docker-compose.1.yml
        docker-compose -f docker-compose.1.yml up -d
        # Wait for agent container to exit, and then graph the performance stats
        while true; do
            echo -n "."

            appContainer="sampleagent_application-$appImage""_1"
            appFilter="name=$appContainer"

            agentId=`docker ps -a --filter "status=exited" --filter $appFilter -q`
            if  [ -n "$agentId" ]; then
                echo
                docker cp $appContainer:/usr/src/app/temp-plot.html ./temp-plot.$runId.html
                break
            fi
            sleep 1
        done
        runId=$(expr $runId + 1)
    done
fi    

rm docker-compose.0.yml docker-compose.1.yml
rm dockerfiles/Dockerfile.client.0.gcc dockerfiles/Dockerfile.agent.0.gcc
rm dockerfiles/Dockerfile.client.1.gcc
rm -rf Downloads/*.tar.* Downloads/*.xz Downloads/package/*

docker ps -a -q | xargs docker stop
docker ps -a -q | xargs docker rm
orphans=`docker images | grep none | awk '{ print $3 }' | xargs`
if [ -n "$orphans" ]; then
	docker rmi $orphans;
fi
