#!/bin/bash

WORKFLOW_NAME="lint.yml"
FILE_NAME="errors.log"
SLACK_CHANNEL_TOKEN="errors.log"
declare -A users
users["nguyenhoanganhtuan1206"]="<@U04M1CV91PH>"
users["hobathanh"]="<@U04MFPGMUTV>"
users["hieuneko"]="<@U04M1B11J95>"
users["tleviet"]="<@U03R587UL6P>"
users["trandiepphuong"]="<@U03S45A7XJS>"

gh auth login --with-token $GH_TOKEN

RUNS=$(
    gh api \
    -H "Accept: application/vnd.github+json" \
    -H "X-GitHub-Api-Version: 2022-11-28" \
    "/repos/OWTVN/owt-employee-app-backend/actions/workflows/${WORKFLOW_NAME}/runs" \
    --paginate \
    --jq '.workflow_runs | select(. != null) | .[] | select(.conclusion != "") | "\(.id) \(.html_url) \(.actor.login) \(.head_branch)"'
)

LATEST_ACTION=`echo "${RUNS}" | head -1`

RUN_ID=`echo ${LATEST_ACTION} | awk '{print $1}'`
RUN_URL=`echo ${LATEST_ACTION} | awk '{print $2}'`
RUN_ACTOR=`echo ${LATEST_ACTION} | awk '{print $3}'`
RUN_BRANCH_NAME=`echo ${LATEST_ACTION} | awk '{print $4}'`

echo "RUN_ID $RUN_ID"
echo "RUN_URL $RUN_URL"
echo "RUN_ACTOR $RUN_ACTOR"
echo "RUN_BRANCH_NAME $RUN_BRANCH_NAME"

PR_NUMBER=$(
    gh api "/repos/OWTVN/owt-employee-app-backend/pulls" \
    --jq ".[] | select(.head.ref == \"$RUN_BRANCH_NAME\") | .number"
)

JOB_ID=$(
    gh api \
    -H "Accept: application/vnd.github+json" \
    -H "X-GitHub-Api-Version: 2022-11-28" \
    "/repos/OWTVN/owt-employee-app-backend/actions/runs/${RUN_ID}/jobs" \
    --paginate \
    --jq '.jobs[] | select(.conclusion != "") | .id'
)

LOGS=$(
    gh api \
    -H "Accept: application/vnd.github+json" \
    -H "X-GitHub-Api-Version: 2022-11-28" \
    "/repos/OWTVN/owt-employee-app-backend/actions/jobs/${JOB_ID}/logs" &> "${FILE_NAME}"
)
echo "JOB_ID $JOB_ID"

ERROR_LOG_MSG=""
ERROR_LOG_MSG+=":x: Pull Request Build Failed!!\n\n"
ERROR_LOG_MSG+="*Actor:* ${RUN_ACTOR}\n\n"
ERROR_LOG_MSG+="*Branch Name:* ${RUN_BRANCH_NAME}\n\n"
ERROR_LOG_MSG+="*Action URL:* ${RUN_URL}\n\n"

ERROR_LOG_MSG+="\`\`\`"
while IFS= read -r line; do
    ERROR_LOG_MSG+="\n$line"
    # if [[ "${line,,}" == *error* || "${line,,}" == *failed* ]]; then
    # fi
done < "${FILE_NAME}"
ERROR_LOG_MSG+="\`\`\`"
ERROR_LOG_MSG+="\n\nPR lỗi rồi cha nội :pray: ${users[$RUN_ACTOR]}"

echo "ERROR_LOG_MSG $ERROR_LOG_MSG"

# curl -X POST --silent --data-urlencode \
#     "payload={\"channel\": \"C063KGSPBA4\", \"username\": \"Slack Notification\", \"text\": \"$(echo $ERROR_LOG_MSG | sed "s/\"/'/g")\"}" "https://hooks.slack.com/services/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";

# == Sub channel
curl -X POST --data-urlencode \
    "payload={\"channel\": \"C06ETGJA5C2\", \"username\": \"Slack Notification\", \"text\": \"$(echo $ERROR_LOG_MSG | sed "s/\"/'/g")\"}" https://hooks.slack.com/services/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
