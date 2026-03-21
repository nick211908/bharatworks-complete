import { z } from 'zod';

export const createJobSchema = z.object({
    body: z.object({
        title: z.string().min(3, "Title must be at least 3 characters long"),
        count: z.number().int().positive("Count must be a positive integer"),
        wagePerDay: z.number().positive("Wage must be a positive number"),
        lat: z.number().optional(),
        lng: z.number().optional(),
        geohash: z.string().optional(),
        urgent: z.boolean().optional(),
        startTime: z.string().optional(),
        endTime: z.string().optional(),
        slotsTotal: z.number().int().positive().optional(),
    }),
});

export const getNearbyJobsSchema = z.object({
    query: z.object({
        lat: z.string().refine((val) => !isNaN(parseFloat(val)), "Latitude must be a valid number"),
        lng: z.string().refine((val) => !isNaN(parseFloat(val)), "Longitude must be a valid number"),
        radius: z.string().optional().refine((val) => !val || !isNaN(parseFloat(val)), "Radius must be a valid number"),
    }),
});
