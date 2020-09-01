#!/bin/sh
revision=$(aws ecs describe-task-definition --task-definition jenkins-slave | egrep "revision" | tr "," " " | awk '{print $2}' | sed 's/"$//')
echo $revision
aws ecs update-service --cluster jenkins-demo --service new-service --task-definition "jenkins-slave":"$revision"
