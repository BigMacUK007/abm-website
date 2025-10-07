import { getPermalink, getBlogPermalink, getAsset } from './utils/permalinks';

export const headerData = {
  links: [
    {
      text: 'Services',
      links: [
        {
          text: 'Intelligence & Outreach',
          href: getPermalink('/services/intelligence'),
        },
        {
          text: 'Training',
          href: getPermalink('/services/training'),
        },
        {
          text: 'myGTMplan Strategy',
          href: getPermalink('/services/strategy'),
        },
        {
          text: 'AI Transformation',
          href: getPermalink('/services/transformation'),
        },
      ],
    },
    {
      text: 'Resources',
      href: getBlogPermalink(),
    },
    {
      text: 'About',
      href: getPermalink('/about'),
    },
    {
      text: 'Contact',
      href: getPermalink('/contact'),
    },
  ],
  actions: [
    { text: 'Get In Touch', href: getPermalink('/contact') },
  ],
};

export const footerData = {
  links: [
    {
      title: 'Services',
      links: [
        { text: 'AI Intelligence & Outreach', href: getPermalink('/services/intelligence') },
        { text: 'ABM+AI Training', href: getPermalink('/services/training') },
        { text: 'myGTMplan Strategy', href: getPermalink('/services/strategy') },
        { text: 'AI Transformation', href: getPermalink('/services/transformation') },
      ],
    },
    {
      title: 'Resources',
      links: [
        { text: 'ABM+AI Playbook', href: getPermalink('/#resources') },
        { text: 'Tool Templates', href: getPermalink('/#resources') },
        { text: 'Case Studies', href: getPermalink('/#results') },
        { text: 'Blog', href: getBlogPermalink() },
      ],
    },
    {
      title: 'Training',
      links: [
        { text: 'Public Courses', href: getPermalink('/services/training') },
        { text: 'In-House Workshops', href: getPermalink('/services/training') },
        { text: 'Virtual Options', href: getPermalink('/services/training') },
        { text: 'Certification', href: getPermalink('/services/training') },
      ],
    },
    {
      title: 'About',
      links: [
        { text: 'Patrick Rea Bio', href: getPermalink('/about') },
        { text: 'Our Methodology', href: getPermalink('/about') },
        { text: 'Client Success', href: getPermalink('/#results') },
        { text: 'Contact Us', href: getPermalink('/contact') },
      ],
    },
  ],
  secondaryLinks: [
    { text: 'Terms', href: getPermalink('/terms') },
    { text: 'Privacy Policy', href: getPermalink('/privacy') },
  ],
  socialLinks: [
    { ariaLabel: 'X', icon: 'tabler:brand-x', href: '#' },
    { ariaLabel: 'LinkedIn', icon: 'tabler:brand-linkedin', href: '#' },
    { ariaLabel: 'RSS', icon: 'tabler:rss', href: getAsset('/rss.xml') },
  ],
  footNote: `
    Led by Patrick Rea FCIM | CIM ABM Course Director · All rights reserved.
  `,
};
