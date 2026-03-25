#!/bin/bash
cd /home/kavia/workspace/code-generation/insurance-fraud-detection-dashboard-330-420/fraud_dashboard_ui
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

