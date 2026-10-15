#!/usr/bin/env bash
# sha-v1 transport; the restricted remote command must implement the documented contract.
set -Eeuo pipefail
[[ "${DEPLOY_SHA:-}" =~ ^[0-9a-f]{40}$ ]] || { echo 'Invalid deployment SHA' >&2; exit 1; }
receipt="$(ssh \
  -i "$HOME/.ssh/portfolio-deploy" \
  -o BatchMode=yes \
  -o IdentitiesOnly=yes \
  -o StrictHostKeyChecking=yes \
  -o UserKnownHostsFile="$HOME/.ssh/known_hosts" \
  -o ConnectTimeout=15 \
  ubuntu@56.126.148.93 "deploy $DEPLOY_SHA")"
[[ "$receipt" == "DEPLOYED $DEPLOY_SHA" ]] || { echo 'Remote deployment receipt mismatch' >&2; exit 1; }
for attempt in {1..5}; do
  if version="$(curl --fail --silent --show-error --max-time 20 \
      -H 'Cache-Control: no-cache' \
      "https://allfiction.56-126-148-93.sslip.io/deploy-version.txt?sha=$DEPLOY_SHA&attempt=$attempt")" \
      && [[ "$version" == "$DEPLOY_SHA" ]]; then
    echo "Verified public deployment SHA: $DEPLOY_SHA"
    exit 0
  fi
  if (( attempt < 5 )); then sleep 5; fi
done
echo 'Public deployment SHA mismatch or unavailable' >&2
exit 1
