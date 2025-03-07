import { PrismaClient } from "@prisma/client";
import e from "express";
import { connect } from "http2";
import { z } from 'zod';

/**
 * This file contains the Prisma client with Zod schema validation extensions.
 * Whenever you change the Prisma schema, you should update the Zod schemas here to
 * match the validations you want. Ensure that certain fields such as id are immutable.
 * You can do this by adding it to the omit() method in the schema. Not all fields
 * present in Prisma schema are in the zod schema since those fields are not validated.
 * 
 * The Prisma client is extended with a new name 'zodValidation' and the query methods
 * are overridden to validate the data before executing the query. 
 */


// Define all the Zod schemas for validations before executing queries
// Enum schemas that match your Prisma enums
const RoleSchema = z.enum(['USER', 'ADMIN']);
const StatusSchema = z.enum(['PENDING', 'ACCEPTED', 'WAITLISTED', 'REJECTED']);
const AuthProviderSchema = z.enum(['EMAIL', 'FACEBOOK', 'GOOGLE']);

/**
 * ------------ Main base schemas ------------
 */ 
// User schema
const userSchema = z.object({
    id: z.string().uuid().optional().readonly(),
    email: z.string().email(),
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    avatar: z.string().url().nullable().optional(),
    role: RoleSchema.default('USER'),
    authProvider: AuthProviderSchema.default('EMAIL'),
    password: z.string().min(6, "Password must be at least 6 characters").nullable().optional(),
});

// Application schema with detailed validation
const applicationSchema = z.object({
    id: z.string().uuid().optional().readonly(),
    gender: z.string().min(1, "Gender is required"),
    pronous: z.string().min(1, "Pronouns are required"),
    age: z.number().int().positive("Age must be a positive number"),
    ethnicity: z.string().min(1, "Ethnicity is required"),
    gradYear: z.number().int().min(new Date().getFullYear(), "Graduation year must be current year or later"),
    phoneNumber: z.string().regex(/^\+?[0-9]{10,15}$/, "Phone number must be valid"),
    school: z.string().min(1, "School name is required"),
    city: z.string().min(1, "City is required"),
    state: z.string().min(1, "State is required"),
    country: z.string().min(1, "Country is required"),
    educationLevel: z.string().min(1, "Education level is required"),
    major: z.string().min(1, "Major is required"),
    diet: z.string().min(1, "Dietary requirements are required"),
    shirtSize: z.string().min(1, "Shirt size is required"),
    sleep: z.boolean(),
    github: z.string().url("GitHub URL must be valid"),
    linkedin: z.string().url("LinkedIn URL must be valid"),
    portfolio: z.string().url("Portfolio URL must be valid"),
    whyBostonhacks: z.string().min(10, "Please provide a more detailed response"),
    applicationYear: z.number().int().min(2023).max(new Date().getFullYear() + 1),
    userId: z.string().uuid("Must be a valid user ID").readonly(),
    status: StatusSchema.default('PENDING').readonly(),
});

// Score schema
const scoreSchema = z.object({
    id: z.string().uuid().optional().readonly(),
    projectId: z.string().uuid().optional().readonly(),
    judgeId: z.string().uuid().optional().readonly(),
    scoreData: z.object({}),
    comments: z.string().nullable().optional(),

});

// Project schema
const projectSchema = z.object({
    id: z.string().uuid().optional().readonly(),
    name: z.string().min(1, "Project name is required"),
    description: z.string().min(10, "Please provide a more detailed description"),
    repositoryUrl: z.string().url("Repository URL must be valid"),
    technologies: z.array(z.string()).min(1, "At least one technology must be specified"),
    year: z.number().int().min(2023).max(new Date().getFullYear() + 1),
    track: z.string().nullable().optional(),
    demoUrl: z.string().url("Demo URL must be valid").nullable().optional(),
    devpostUrl: z.string().url("Devpost URL must be valid").nullable().optional(),
    teamName: z.string().min(1, "Team name is required"),
    isWinner: z.boolean().default(false),
    prizeWon: z.string().nullable().optional(),
    placement: z.number().int().positive().nullable().optional(),
    members: z.object({
        connect: z.array(z.object({ id: z.string().uuid() }))
    }),
    scores: z.array(scoreSchema)
});

// Judge schema. Connects one-to-one with a user. Judge objects are used for judging but are kept separate from users
const judgeSchema = z.object({
    id: z.string().uuid().optional().readonly(),
    userId: z.string().uuid().optional().readonly(),
    tracks: z.array(z.string()).nullable().optional(),
    accessCode: z.string().min(1, "Access code is required").readonly(),
    user: z.union([
        userSchema,
        z.object({
            connect: z.object({ id: z.string().uuid() })
        }),
        z.object({
            create: z.any()
        })
    ]).optional()
});



/**
 * -------------- Schemas for creation ---------------
 * Omit fields that should not be set by the client. Some fields can be set by the client,
 * but will need additional controller validation (i.e. year or members)
 * Strict() means that unknown fields will throw an error instead of being ignored
 */
const userCreateSchema = userSchema.omit({
    id: true,
    role: true
}).strict();
const applicationCreateSchema = applicationSchema.omit({
    id: true,
    status: true
}).strict();
const projectCreateSchema = projectSchema.omit({
    id: true,
    isWinner: true,
    scores: true,
    placement: true,
    prizeWon: true,
}).strict();

const judgeCreateSchema = judgeSchema.omit({
    id: true,
    accessCode: true,
    // user: true
}).strict();

const scoreCreateSchema = scoreSchema.omit({
    id: true,
    createdAt: true,
    updatedAt: true,
}).strict();


/**
 * -------------- Schemas for updating ---------------
 */
const userUpdateSchema = userSchema.omit({
    email: true,
    password: true,
    authProvider: true,
    id: true
}).partial().strict();
const applicationUpdateSchema = applicationSchema.omit({
    userId: true,
    applicationYear: true,
    id: true,
    status: true
}).partial().strict();
const projectUpdateSchema = projectSchema.omit({
    id: true,
    year: true,
    isWinner: true,
    scores: true,
    placement: true,
    prizeWon: true,
}).partial().strict();

const judgeUpdateSchema = judgeSchema.omit({
    id: true,
    // userId: true,
    accessCode: true,
    createdAt: true,
    updatedAt: true,
    tracks: true,
    // user: true
}).partial().strict();


/**
 * -------------- Schemas for admin ---------------
 */
const adminJudgeCreateSchema = judgeSchema.omit({
    id: true
}).strict();
const adminJudgeUpdateSchema = judgeSchema.partial().strict();

// Create Prisma client with extensions. This will use zod schemas to validate data before executing queries
const prismaInstance = new PrismaClient({
    omit: {
        user: {
            password: true
        }
    }
}).$extends({
  name: 'zodValidation',
  query: {
    user: {
      async create({ args, query }) {
        const role = args.userRole || 'USER';

        delete args.userRole;

        // Validate the data against the schema
        args.data = userCreateSchema.parse(args.data);
        return query(args);

      },
      async update({ args, query }) {
        const role = args.userRole || 'USER';

        delete args.userRole;
          // Validate the update data against the partial schema
          args.data = userUpdateSchema.parse(args.data);
          return query(args);

      },
      async upsert({ args, query }) {
        const role = args.userRole || 'USER';

        delete args.userRole;

          // Validate both create and update data
          args.create = userCreateSchema.parse(args.create);
          args.update = userUpdateSchema.parse(args.update);
          return query(args);

      },
    },

    application: {
      async create({ args, query }) {
        const role = args.userRole || 'USER';

        delete args.userRole;


          // Validate the data against the schema
          args.data = applicationCreateSchema.parse(args.data);
          return query(args);

      },
      async update({ args, query }) {
        const role = args.userRole || 'USER';

        delete args.userRole;

          // Validate the update data against the partial schema
          args.data = applicationUpdateSchema.parse(args.data);
          return query(args);

      },
      async upsert({ args, query }) {
        const role = args.userRole || 'USER';

        delete args.userRole;
          // Validate both create and update data
          args.create = applicationCreateSchema.parse(args.create);
          args.update = applicationUpdateSchema.parse(args.update);
          return query(args);

      },
    },
    project: {
      async create({ args, query }) {
        const role = args.userRole || 'USER';

        delete args.userRole;
          // Validate the data against the schema
          args.data = projectCreateSchema.parse(args.data);
          return query(args);

      },
      async update({ args, query }) {
        const role = args.userRole || 'USER';

        delete args.userRole;
          // Validate the update data against the partial schema
          args.data = projectUpdateSchema.parse(args.data);
          return query(args);
 
      },
      async upsert({ args, query }) {
        const role = args.userRole || 'USER';

        delete args.userRole;
          // Validate both create and update data
          args.create = projectCreateSchema.parse(args.create);
          args.update = projectUpdateSchema.parse(args.update);
          return query(args);

      },
    },

    judge: {
        async create({ args, query }) {
            const role = args.userRole || 'USER';
    
            delete args.userRole;
            // Validate the data against the schema
            if (role === 'ADMIN') {
                args.data = adminJudgeCreateSchema.parse(args.data);
            } else {
                args.data = judgeCreateSchema.parse(args.data);
            }
            return query(args);
    
        },
        async update({ args, query }) {
            const role = args.userRole || 'USER';
    
            delete args.userRole;
            // Validate the update data against the partial schema
            if (role === 'ADMIN') {
                args.data = adminJudgeUpdateSchema.parse(args.data);
            } else {
                args.data = judgeUpdateSchema.parse(args.data);
            }
            return query(args);
    
        },
        async upsert({ args, query }) {
            const role = args.userRole || 'USER';
    
            delete args.userRole;

            if (role === 'ADMIN') {
                // Validate both create and update data
                args.create = adminJudgeCreateSchema.parse(args.create);
                args.update = adminJudgeUpdateSchema.parse(args.update);
            } else {
                // Validate both create and update data
                args.create = judgeCreateSchema.parse(args.create);
                args.update = judgeUpdateSchema.parse(args.update);
            }
            return query(args);
    
        }
    },

    score: {
        async create({ args, query }) {
            const role = args.userRole || 'USER';
    
            delete args.userRole;
            // Validate the data against the schema
            args.data = scoreCreateSchema.parse(args.data);
            return query(args);
    
        },
        async update({ args, query }) {
            const role = args.userRole || 'USER';
    
            delete args.userRole;
            // Validate the update data against the partial schema
            args.data = scoreUpdateSchema.parse(args.data);
            return query(args);
    
        },
        async upsert({ args, query }) {
            const role = args.userRole || 'USER';
    
            delete args.userRole;
            // Validate both create and update data
            args.create = scoreCreateSchema.parse(args.create);
            args.update = scoreUpdateSchema.parse(args.update);
            return query(args);
    
        },
    }


  },
});

export default prismaInstance;
