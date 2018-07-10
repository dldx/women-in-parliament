PHONY: aws-sync aws-cache live

aws-sync:
	aws s3 sync public s3://pudding.cool/2018/07/women-in-parliament --delete --cache-control 'max-age=31536000'

aws-cache:
	aws cloudfront create-invalidation --distribution-id E13X38CRR4E04D --paths '/2018/07/women-in-parliament*'	

live: aws-sync aws-cache
