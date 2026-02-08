'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createClaim } from '@/lib/api/claims';
import { useRouter } from 'next/navigation';

const claimSchema = z.object({
  claim: z
    .string()
    .min(10, 'Claim must be at least 10 characters')
    .max(1000, 'Claim must be less than 1000 characters'),
  category: z
    .enum(['politics', 'science', 'health', 'technology', 'economics', 'other'])
    .optional(),
  context: z.string().max(500).optional(),
});

type ClaimFormData = z.infer<typeof claimSchema>;

const categories = [
  { value: 'politics', label: 'Politics' },
  { value: 'science', label: 'Science' },
  { value: 'health', label: 'Health' },
  { value: 'technology', label: 'Technology' },
  { value: 'economics', label: 'Economics' },
  { value: 'other', label: 'Other' },
] as const;

export default function ClaimInput() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ClaimFormData>({
    resolver: zodResolver(claimSchema),
  });

  const claimText = watch('claim', '');
  const characterCount = claimText.length;
  const maxLength = 1000;

  const onSubmit = async (data: ClaimFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await createClaim(data);
      // Redirect to results page
      router.push(`/results/${response.id}`);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          err.message ||
          'Failed to submit claim. Please try again.'
      );
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-4">
      <div>
        <label
          htmlFor="claim"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          Enter a claim to fact-check
        </label>
        <textarea
          id="claim"
          {...register('claim')}
          rows={6}
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white resize-none"
          placeholder="e.g., Climate change is not caused by human activity..."
          disabled={isSubmitting}
        />
        <div className="flex justify-between items-center mt-1">
          {errors.claim && (
            <p className="text-sm text-red-600 dark:text-red-400">
              {errors.claim.message}
            </p>
          )}
          <p
            className={`text-sm ml-auto ${
              characterCount > maxLength * 0.9
                ? 'text-orange-600 dark:text-orange-400'
                : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            {characterCount}/{maxLength}
          </p>
        </div>
      </div>

      <div>
        <label
          htmlFor="category"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          Category (optional)
        </label>
        <select
          id="category"
          {...register('category')}
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
          disabled={isSubmitting}
        >
          <option value="">Select a category</option>
          {categories.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          htmlFor="context"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          Additional Context (optional)
        </label>
        <textarea
          id="context"
          {...register('context')}
          rows={3}
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white resize-none"
          placeholder="Provide any additional context that might help..."
          disabled={isSubmitting}
        />
        {errors.context && (
          <p className="text-sm text-red-600 dark:text-red-400 mt-1">
            {errors.context.message}
          </p>
        )}
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
      >
        {isSubmitting ? 'Submitting...' : 'Fact-Check Claim'}
      </button>
    </form>
  );
}
