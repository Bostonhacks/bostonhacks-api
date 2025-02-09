
// All Schemas used for Open API


/**
 * @openapi
 * components:
 *  schemas:
 *      User:
 *          type: object
 *          required:
 *              - id
 *              - email
 *              - firstName
 *              - lastName
 *          properties:
 *              id:
 *                  type: integer
 *                  description: User's unique ID
 *                  readOnly: true
 *                  example: 3
 *                  unique: true
 *              email:
 *                  type: string
 *                  format: email
 *                  description: User's email address
 *                  example: "user@example.com"
 *                  unique: true
 *              firstName:
 *                  type: string
 *                  description: User's first name
 *                  example: "John"
 *              lastName:
 *                  type: string
 *                  description: User's last name
 *                  example: "Doe"
 *              avatar:
 *                  type: string
 *                  nullable: true
 *                  description: URL to user's profile picture
 *                  example: "https://example.com/avatar.jpg"
 *              role:
 *                  type: string
 *                  enum: [USER, ADMIN]
 *                  default: USER
 *                  description: User's role in the system
 *                  example: "USER"
 *              authProvider:
 *                  type: string
 *                  enum: [EMAIL, GOOGLE]
 *                  default: EMAIL
 *                  description: Authentication method used
 *                  example: "GOOGLE"
 *              password:
 *                  type: string
 *                  nullable: true
 *                  writeOnly: true
 *                  description: Password (only for EMAIL auth)
 * 
 *      InternalServerError:
 *          type: object
 *          properties:
 *              message:
 *                  type: string
 *                  example: Something went wrong
 *              error:
 *                  type: object
*/

/*
add to user schema later
*              applications:
 *                  type: array
 *                  items:
 *                      $ref: '#/components/schemas/Application'
 *                  description: User's submitted applications
 *                  readOnly: true
*/
