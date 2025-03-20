const swaggerDefinition ={
    "openapi": "3.0.0",
    "info": {
        "title": "BostonHacks API Documentation",
        "description": "BostonHacks public API used for main website. Many endpoints require token authorization. Obtaining this token is outlined in the Auth section.",
        "version": "1.0.0"
    },
    "failOnErrors": true,
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
                        "type": "string",
                        "description": "User's unique ID",
                        "readOnly": true,
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
                "required": [
                    "gender",
                    "pronous",
                    "age",
                    "ethnicity",
                    "gradYear",
                    "phoneNumber",
                    "school",
                    "city",
                    "state",
                    "country",
                    "educationLevel",
                    "major",
                    "diet",
                    "shirtSize",
                    "whyBostonhacks"
                ],
                "properties": {
                    "id": {
                        "type": "integer",
                        "description": "Application's unique ID",
                        "readOnly": true,
                        "example": 1,
                        "unique": true
                    },
                    "gender": {
                        "type": "string",
                        "description": "Applicant's gender",
                        "example": "Male"
                    },
                    "pronous": {
                        "type": "string",
                        "description": "Applicant's preferred pronouns",
                        "example": "he/him"
                    },
                    "age": {
                        "type": "integer",
                        "description": "Applicant's age",
                        "minimum": 13,
                        "maximum": 100,
                        "example": 20
                    },
                    "ethnicity": {
                        "type": "string",
                        "description": "Applicant's ethnicity",
                        "example": "Asian"
                    },
                    "gradYear": {
                        "type": "integer",
                        "description": "Expected graduation year",
                        "minimum": 2024,
                        "example": 2025
                    },
                    "phoneNumber": {
                        "type": "string",
                        "description": "Contact phone number",
                        "pattern": "^\\+?[\\d\\s-]{10,}$",
                        "example": "+1-555-123-4567",
                        "unique": true
                    },
                    "school": {
                        "type": "string",
                        "description": "Current school/university",
                        "example": "Boston University"
                    },
                    "city": {
                        "type": "string",
                        "description": "City of residence",
                        "example": "Boston"
                    },
                    "state": {
                        "type": "string",
                        "description": "State/province of residence",
                        "example": "Massachusetts"
                    },
                    "country": {
                        "type": "string",
                        "description": "Country of residence",
                        "example": "United States"
                    },
                    "educationLevel": {
                        "type": "string",
                        "description": "Current level of education",
                        "example": "Undergraduate"
                    },
                    "major": {
                        "type": "string",
                        "description": "Field of study",
                        "example": "Computer Science"
                    },
                    "diet": {
                        "type": "string",
                        "description": "Dietary restrictions/preferences",
                        "example": "Vegetarian"
                    },
                    "shirtSize": {
                        "type": "string",
                        "description": "T-shirt size preference",
                        "enum": ["XS", "S", "M", "L", "XL", "XXL"],
                        "example": "M"
                    },
                    "sleep": {
                        "type": "boolean",
                        "description": "Whether overnight accommodation is needed",
                        "example": true
                    },
                    "github": {
                        "type": "string",
                        "format": "uri",
                        "description": "GitHub profile URL",
                        "example": "https://github.com/johndoe"
                    },
                    "linkedin": {
                        "type": "string",
                        "format": "uri",
                        "description": "LinkedIn profile URL",
                        "example": "https://linkedin.com/in/johndoe"
                    },
                    "portfolio": {
                        "type": "string",
                        "format": "uri",
                        "description": "Personal portfolio URL",
                        "example": "https://johndoe.dev"
                    },
                    "whyBostonhacks": {
                        "type": "string",
                        "description": "Motivation for attending BostonHacks",
                        "minLength": 50,
                        "maxLength": 500,
                        "example": "I'm passionate about hackathons and want to collaborate with other developers..."
                    },
                    "applicationYear": {
                        "type": "integer",
                        "description": "Year of application submission",
                        "example": 2025
                    },
                    "userId": {
                        "type": "integer",
                        "description": "ID of the user who submitted the application",
                        "example": 1
                    },
                    "status": {
                        "type": "string",
                        "enum": ["PENDING", "ACCEPTED", "WAITLISTED", "REJECTED"],
                        "default": "PENDING",
                        "description": "Current status of the application",
                        "example": "PENDING"
                    }
                }
            },
            "JudgingCriteria": {
                "type": "object",
                "properties": {
                    "id": {
                        "type": "string",
                        "description": "Judging criteria's unique ID",
                        "readOnly": true,
                        "example": "1245-vxsd-1241-1241",
                    },
                    "year": {
                        "type": "integer",
                        "description": "Year for which the criteria is set",
                        "example": 2025
                    },
                    "event": {
                        "type": "string",
                        "description": "Name of the event",
                        "example": "BostonHacks",
                        "default": "BostonHacks"
                    },
                    "criteriaList": {
                        "type": "JSON",
                        "description": "List of criteria for judging. Variable for each year",
                        "example": JSON.stringify({
                            "innovation": {
                                "description": "How innovative is the project?",
                                "weight": 0.3
                            },
                            "impact": {
                                "description": "What impact will this project have?",
                                "weight": 0.4
                            },
                            "presentation": {
                                "description": "How well was the project presented?",
                                "weight": 0.3
                            }
                        }, undefined, 2)
                    }
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
            },
            "ValidationError": {
                "type": "object",
                "properties": {
                    "message": {
                        "type": "string",
                        "example": "Validation error"
                    },
                    "issues": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                            }
                        }
                    },
                    "name": {
                        "type": "string",
                        "example": "ZodValidationError"
                    }
                }
            }
        },
        "parameters": {
            "access_token": {
                "name": "access_token",
                "in": "cookie",
                "required": true,
                "description": "Login token",
                "schema": {
                    "type": "string"
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
            },
            "400badrequest": {
                "description": "Bad request",
                "content": {
                "application/json": {
                    "schema": {
                    "type": "object",
                    "properties": {
                        "message": {
                        "type": "string",
                        "example": "Bad request"
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
            "url": "https://api.bostonhacks.org",
            "description": "Main API"
        }
    ]

}

export default swaggerDefinition;