# Production CORS Configuration
# Update these domains based on your deployment URLs

# For production, update cors.php with your actual domains:
# 'allowed_origins' => [
#     'https://yourdomain.com',
#     'https://www.yourdomain.com',
#     'https://your-frontend-domain.com',
# ],

# Or use environment variables:
CORS_ALLOWED_ORIGINS="https://frontend.cashwave.my.id"


# Sanctum Configuration
SANCTUM_STATEFUL_DOMAINS="localhost:3000,localhost:8080,localhost:8081,127.0.0.1:3000,127.0.0.1:8080,127.0.0.1:8081"

# For production:
# SANCTUM_STATEFUL_DOMAINS="yourdomain.com,www.yourdomain.com"
