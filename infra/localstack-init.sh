#!/bin/bash

# LocalStack S3 initialization script
# This script runs when LocalStack is ready

echo "Initializing LocalStack S3..."

# Wait for LocalStack to be ready
echo "Waiting for LocalStack to be ready..."
awslocal s3 ls || sleep 5

# Create S3 bucket for documents
echo "Creating S3 bucket: signatrust-documents"
awslocal s3 mb s3://signatrust-documents

# Enable versioning on the bucket
echo "Enabling versioning on bucket"
awslocal s3api put-bucket-versioning \
  --bucket signatrust-documents \
  --versioning-configuration Status=Enabled

# Set bucket lifecycle policy (optional - for cleanup of old versions)
echo "Setting bucket lifecycle policy"
awslocal s3api put-bucket-lifecycle-configuration \
  --bucket signatrust-documents \
  --lifecycle-configuration '{
    "Rules": [
      {
        "Id": "DeleteOldVersions",
        "Status": "Enabled",
        "NoncurrentVersionExpiration": {
          "NoncurrentDays": 90
        }
      }
    ]
  }'

# List buckets to verify
echo "S3 buckets:"
awslocal s3 ls

echo "LocalStack S3 initialization complete!"
