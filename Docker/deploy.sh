#!/bin/sh
revision=$(aws ecs describe-task-definition --task-definition jenkinsonforth | egrep "revision" | tr "," " " | awk '{print $2}' | sed 's/"$//')
echo $revision
aws ecs update-service --cluster new-jenkins --service new-service --task-definition "jenkinsonforth":"$revision"
