#!/bin/bash

FILE_NAME='git.log'
git log -1 &> "$FILE_NAME"
SLACK_STR=""
SLACK_STR+=":white_check_mark: Deploy complete \n\n"
SLACK_STR+="*Server URL:* https://dev.api.employee.openwt.vn\n\n"
SLACK_STR+="\`\`\`"
while IFS= read -r line; do
    SLACK_STR+="\n$line"
done < "$FILE_NAME"
SLACK_STR+="\`\`\`"

curl -X POST --silent --data-urlencode \
    "payload={\"channel\": \"C063KGSPBA4\", \"username\": \"Slack Notification\", \"text\": \"$(echo $SLACK_STR | sed "s/\"/'/g")\"}" "https://hooks.slack.com/services/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";

# == Sub channel
# curl -X POST --data-urlencode \
#     "payload={\"channel\": \"C06ETGJA5C2\", \"username\": \"Slack Notify\", \"text\": \"$(echo $ERROR_LOG_MSG | sed "s/\"/'/g")\"}" https://hooks.slack.com/services/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
