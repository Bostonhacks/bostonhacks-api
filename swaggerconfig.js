const swaggerDefinition ={
    "openapi": "3.0.0",
    "info": {
        "title": "BostonHacks API Documentation",
        "description": "BostonHacks public API used for main website",
        "version": "1.0.0"
    },
    "components": {
        "schemas": {
            "User": {
                "type": "object",
                "required": [
                    "id",
                    "email",
                    "firstName",
                    "lastName"
                ],
                "properties": {
                    "id": {
                        "type": "integer",
                        "description": "User's unique ID",
                        "readOnly": true,
                        "example": 3,
                        "unique": true
                    },
                    "email": {
                        "type": "string",
                        "format": "email",
                        "description": "User's email address",
                        "example": "user@example.com",
                        "unique": true
                    },
                    "firstName": {
                        "type": "string",
                        "description": "User's first name",
                        "example": "John"
                    },
                    "lastName": {
                        "type": "string",
                        "description": "User's last name",
                        "example": "Doe"
                    },
                    "avatar": {
                        "type": "string",
                        "nullable": true,
                        "description": "URL to user's profile picture",
                        "example": "https://example.com/avatar.jpg"
                    },
                    "role": {
                        "type": "string",
                        "enum": ["USER", "ADMIN"],
                        "default": "USER",
                        "description": "User's role in the system",
                        "example": "USER"
                    },
                    "authProvider": {
                        "type": "string",
                        "enum": ["EMAIL", "GOOGLE"],
                        "default": "EMAIL",
                        "description": "Authentication method used",
                        "example": "GOOGLE"
                    },
                    "password": {
                        "type": "string",
                        "nullable": true,
                        "writeOnly": true,
                        "description": "Password (only for EMAIL auth)"
                    },
                    "applications": {
                        "type": "array",
                        "items": {
                            "$ref": "#/components/schemas/Application"
                        }
                    }
                }
            },
            "Application": {
                "type": "object",
                "properties": {
                    "id": {
                        "type": "integer",
                        "description": "Application's unique ID",
                        "readOnly": true,
                        "example": 1,
                        "unique": true
                    },
                    "userId": {
                        "type": "integer",
                        "description": "ID of the user who submitted the application",
                        "example": 3
                    },
                    "status": {
                        "type": "string",
                        "enum": ["PENDING", "ACCEPTED", "REJECTED"],
                        "default": "PENDING",
                        "description": "Application's current status",
                        "example": "PENDING"
                    },
                    // Add other application fields as necessary
                }
            },
            "Error": {
                "type": "object",
                "properties": {
                "message": {
                    "type": "string",
                    "example": "Something went wrong"
                },
                "error": {
                    "type": "object"
                }
                }
            }
        },
        "responses": {
            "500internalservererror": {
                "description": "Something went wrong",
                "content": {
                "application/json": {
                    "schema": {
                    "type": "object",
                    "properties": {
                        "message": {
                        "type": "string",
                        "example": "Something went wrong"
                        },
                        "error": {
                        "type": "object",
                        "example": {
                            "prismaMessage": "Message is here and something went wrong"
                        }
                        }
                    }
                    }
                }
            }
        },
            "403forbidden": {
                "description": "Forbidden request",
                "content": {
                "application/json": {
                    "schema": {
                    "type": "object",
                    "properties": {
                        "message": {
                        "type": "string",
                        "example": "You don't have access to this resource"
                        }
                    }
                    }
                }
                }
            },
            "401unauthorized": {
                "description": "Unauthorized request",
                "content": {
                "application/json": {
                    "schema": {
                    "type": "object",
                    "properties": {
                        "message": {
                        "type": "string",
                        "example": "You don't have access to this resource"
                        }
                    }
                    }
                }
                }
            }
        },
        "securitySchemas": {
            "accessToken": {
                "type": "apiKey",
                "in": "cookie",
                "name": "access_token"
            },
            "bearerAuth": {
                "type": "http",
                "scheme": "bearer",
                "bearerFormat": "JWT"
            }
        }
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