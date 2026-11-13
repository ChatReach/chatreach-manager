import type { OnboardingAnswers } from '@/api/admin/tenants/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type Question = {
  key: string;
  label: string;
  options?: Record<string, string>;
};

const QUESTIONS: Question[] = [
  {
    key: 'use_case',
    label: 'What will you use ChatReach for?',
    options: {
      online_store: 'Selling more through my online store',
      marketing_funnel: 'Adding WhatsApp to my marketing funnel',
      sales_team: 'Managing leads and sales conversations as a team',
    },
  },
  {
    key: 'monthly_orders',
    label: 'Orders per month',
    options: {
      under_100: 'Under 100',
      '100_1000': '100 - 1,000',
      '1000_10000': '1,000 - 10,000',
      '10000_plus': 'More than 10,000',
    },
  },
  {
    key: 'company_size',
    label: 'Company size',
    options: {
      '1': 'Just me',
      '2_5': '2 - 5 people',
      '6_15': '6 - 15 people',
      '15_49': '15 - 49 people',
      '50_100': '50 - 100 people',
      '100_plus': '100+ people',
    },
  },
  {
    key: 'whatsapp_usage',
    label: 'Already using WhatsApp?',
    options: {
      whatsapp_app: 'Yes, the WhatsApp app',
      whatsapp_business_app: 'Yes, the WhatsApp Business app',
      other_platform: 'Yes, through another platform',
      new_number: 'No, wants to connect a new number',
    },
  },
  {
    key: 'referral_source',
    label: 'Where did you hear about ChatReach?',
    options: {
      google_search: 'Google search',
      ai_assistant: 'ChatGPT / Claude',
      friend_or_colleague: 'Friend or colleague',
      social_media: 'Social media',
      shopify_app_store: 'Shopify App store',
      other: 'Other',
    },
  },
  { key: 'company_type', label: 'Company type' },
  { key: 'contacts_amount', label: 'Contacts amount' },
  { key: 'main_goal_whatsapp', label: 'Main goal with WhatsApp' },
];

export function OnboardingAnswersCard({ answers }: { answers: OnboardingAnswers | null }) {
  const known = new Set(QUESTIONS.map((question) => question.key));
  const extra: Question[] = Object.keys(answers ?? {})
    .filter((key) => !known.has(key))
    .map((key) => ({ key, label: key.replace(/_/g, ' ') }));
  const answered = [...QUESTIONS, ...extra].filter((question) => answers?.[question.key]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Onboarding answers</CardTitle>
      </CardHeader>
      <CardContent>
        {answered.length ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {answered.map(({ key, label, options }) => {
              const value = answers?.[key] as string;
              return (
                <div key={key} className="flex flex-col gap-0.5">
                  <span className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                    {label}
                  </span>
                  <span className="text-sm">{options?.[value] ?? value}</span>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">Not answered yet.</p>
        )}
      </CardContent>
    </Card>
  );
}
