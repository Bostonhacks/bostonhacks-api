import { PrismaClient } from "@prisma/client";
import { z } from 'zod';

// Define all the Zod schemas for validations before executing queries
// Enum schemas that match your Prisma enums
const RoleSchema = z.enum(['USER', 'ADMIN']);
const StatusSchema = z.enum(['PENDING', 'ACCEPTED', 'WAITLISTED', 'REJECTED']);
const AuthProviderSchema = z.enum(['EMAIL', 'FACEBOOK', 'GOOGLE']);

// User schema
const userSchema = z.object({
    id: z.string().uuid().optional(), // Optional for creation
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
    id: z.string().uuid().optional(),
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
    userId: z.string().uuid("Must be a valid user ID"),
    status: StatusSchema.default('PENDING'),
});

// Project schema
const projectSchema = z.object({
    id: z.string().uuid().optional(),
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
});

// Update schemas (partial versions for updates)
const userUpdateSchema = userSchema.partial();
const applicationUpdateSchema = applicationSchema.partial();
const projectUpdateSchema = projectSchema.partial();


// Create Prisma client with extensions. This will use zod schemas to validate data before executing queries
const prismaInstance = new PrismaClient().$extends({
  name: 'zodValidation',
  query: {
    user: {
      async create({ args, query }) {

        // Validate the data against the schema
        userSchema.parse(args.data);
        return query(args);

      },
      async update({ args, query }) {

          // Validate the update data against the partial schema
          userUpdateSchema.parse(args.data);
          return query(args);

      },
      async upsert({ args, query }) {

          // Validate both create and update data
          userSchema.parse(args.create);
          userUpdateSchema.parse(args.update);
          return query(args);

      },
    },
    application: {
      async create({ args, query }) {

          // Validate the data against the schema
          applicationSchema.parse(args.data);
          return query(args);

      },
      async update({ args, query }) {

          // Validate the update data against the partial schema
          applicationUpdateSchema.parse(args.data);
          return query(args);

      },
      async upsert({ args, query }) {

          // Validate both create and update data
          applicationSchema.parse(args.create);
          applicationUpdateSchema.parse(args.update);
          return query(args);

      },
    },
    project: {
      async create({ args, query }) {

          // Validate the data against the schema
          projectSchema.parse(args.data);
          return query(args);

      },
      async update({ args, query }) {

          // Validate the update data against the partial schema
          projectUpdateSchema.parse(args.data);
          return query(args);
 
      },
      async upsert({ args, query }) {

          // Validate both create and update data
          projectSchema.parse(args.create);
          projectUpdateSchema.parse(args.update);
          return query(args);

      },
    },
  },
});

export default prismaInstance;
