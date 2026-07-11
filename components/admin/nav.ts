export type NavGroup = {
  heading: string | null;
  items: { href: string; label: string; icon: string }[];
};

export const NAV_GROUPS: NavGroup[] = [
  {
    heading: null,
    items: [
      { href: '/admin', label: 'Overview', icon: 'home' },
      { href: '/admin/leads', label: 'Leads', icon: 'leads' },
    ],
  },
  {
    heading: 'Build',
    items: [
      { href: '/admin/build/landing', label: 'Landing Page', icon: 'landing' },
      { href: '/admin/build/questions', label: 'Questions', icon: 'questions' },
      { href: '/admin/build/results', label: 'Result Pages', icon: 'results' },
      { href: '/admin/build/pdf', label: 'PDF Reports', icon: 'pdf' },
    ],
  },
  {
    heading: 'Settings',
    items: [
      { href: '/admin/settings/branding', label: 'Branding', icon: 'branding' },
      { href: '/admin/settings/score-tiers', label: 'Score Tiers', icon: 'tiers' },
      { href: '/admin/settings/lead-form', label: 'Lead Form', icon: 'form' },
    ],
  },
];
