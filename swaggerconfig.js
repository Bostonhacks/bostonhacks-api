const swaggerDefinition ={
    "openapi": "3.0.0",
    "info": {
        "title": "BostonHacks API Documentation",
        "description": "BostonHacks public API used for main website",
        "version": "1.0.0"
    },

    "servers": [
        {
            "url": "http://localhost:8000",
            "description": "Local server"
        },
        {
            "url": "https://api.example.com"
        }
    ]

}

export default swaggerDefinition;