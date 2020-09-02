#!/bin/sh
revision=$(aws ecs describe-task-definition --task-definition jenkins-ecs | egrep "revision" | tr "," " " | awk '{print $2}' | sed 's/"$//')
echo $revision
aws ecs update-service --cluster jenkins-demo --service temp-service --task-definition "jenkins-ecs":"$revision"
