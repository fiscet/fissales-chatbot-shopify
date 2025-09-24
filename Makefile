.PHONY: help docker-build docker-build-verbose docker-run

help: ## Show this help message
	@echo "Available commands:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

dev: ## Run development server
	npm run dev

docker-build: ## Build Docker image
	docker build -t villma-chatbot-shopify .

docker-build-verbose: ## Build Docker image with verbose output
	docker build --no-cache --progress=plain -t villma-chatbot-shopify .

docker-run: ## Run Docker container
	docker run -p 8000:8000 --env-file .env -v ~/.config/gcloud/application_default_credentials.json:/app/gcp-credentials.json:ro villma-chatbot-shopify
