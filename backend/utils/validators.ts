import { z } from 'zod';

export const goalSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  thrustArea: z.string().min(1, 'Thrust Area is required'),
  uomType: z.enum(['NUMERIC_MIN', 'NUMERIC_MAX', 'PERCENT_MIN', 'PERCENT_MAX', 'TIMELINE', 'ZERO_BASED']),
  target: z.number().min(0, 'Target must be positive'),
  weightage: z.number().min(10, 'Minimum weightage per goal is 10%').max(100)
});

export const goalSubmissionSchema = z.array(goalSchema).min(1).max(8, 'Maximum of 8 goals allowed');

export const validateGoalSubmission = (goals: z.infer<typeof goalSubmissionSchema>) => {
  const result = goalSubmissionSchema.safeParse(goals);
  if (!result.success) {
    throw new Error(result.error.issues[0].message);
  }

  const totalWeightage = goals.reduce((sum, g) => sum + g.weightage, 0);
  if (Math.abs(totalWeightage - 100) > 0.01) {
    throw new Error(`Total weightage must equal exactly 100%. Current total: ${totalWeightage}%`);
  }

  return true;
};
