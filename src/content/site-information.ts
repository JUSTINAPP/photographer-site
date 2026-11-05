export const company = 'Allen Australian Enterprises Pty Ltd';
export const contactEmail = 'hello@fresnelstudio.com';

type InformationPage = {
  title: string;
  summary: string;
  sections: [heading: string, ...paragraphs: string[]][];
};

export const informationPages = {
  notice: {
    title: 'Legal notice',
    summary: 'Who operates Fresnel Studios and how to reach us.',
    sections: [
      ['Publisher', `Fresnel Studios is operated by ${company}, ABN 41 095 793 007.`, 'PO Box 10, Bondi Junction NSW 1355, Australia.'],
      ['Hosting', 'Vercel hosts the website and application. Supabase provides account authentication and database services.'],
      ['Content reports', 'To report suspected copyright infringement or unlawful content, email us with the page URL, a description of the issue, and your contact details. Include your relationship to the work if you are reporting on someone else’s behalf.'],
    ],
  },
  terms: {
    title: 'Terms of service',
    summary: 'Terms for using the Fresnel Studios preview and workspace.',
    sections: [
      ['The service', `Fresnel Studios is a photography workspace operated by ${company}. Public examples and workflow previews are for evaluation. Published plan prices are proposals and subscriptions are not currently offered through the site.`],
      ['Accounts and records', 'Keep your sign-in links private and tell us promptly if you suspect unauthorised access. Check proposals, invoices and newsletter exports before sharing them. You are responsible for the accuracy of your records and for retaining copies of important business documents.'],
      ['Your content', 'You retain any rights you hold in your images and records. You authorise us to process them as needed to provide the features you use. Only import, store or publish material you have permission to use. Respect client confidentiality and obtain any required permissions before exporting a mailing list or sending a campaign.'],
      ['Acceptable use', 'Use the service lawfully. Do not attempt to access another studio’s records, disrupt the service or distribute harmful or infringing material. We may restrict access where reasonably necessary to protect users or address misuse.'],
      ['Applicable law', 'These terms are governed by the laws of New South Wales, Australia. Nothing in these terms excludes, restricts or modifies rights or remedies that cannot lawfully be excluded, including applicable Australian Consumer Law rights.'],
    ],
  },
  privacy: {
    title: 'Privacy notice',
    summary: 'How we handle account information and studio records.',
    sections: [
      ['Information we handle', 'We handle email addresses used for sign-in, information you send us for support, and technical information used to deliver and secure the service. Signed-in studios can store client and crew details, commercial documents, image references and newsletter drafts.'],
      ['Why we use it', 'We use this information to authenticate users, provide the workspace, respond to support requests and investigate security or service issues. Website imports fetch public pages you specify. Publishing a project makes its published details available to site visitors.'],
      ['Providers and retention', 'Vercel and Supabase help deliver the service. Hosting and support infrastructure can involve processing outside Australia, including in the United States. We retain information as needed to operate the service, resolve issues and meet legal obligations.'],
      ['Requests and complaints', 'Email us to request access, correction or deletion, or to raise a privacy complaint. Tell us which account or record is involved. We may verify your identity before responding. For information a studio holds about you, contact that studio first. If you are dissatisfied with our response, you can contact the Office of the Australian Information Commissioner.'],
    ],
  },
  cookies: {
    title: 'Cookies and browser storage',
    summary: 'How sign-in and demo storage work.',
    sections: [
      ['Sign-in cookies', 'Session cookies support account sign-in and keep your session available as you move around the workspace. Blocking them can prevent sign-in.'],
      ['Demo storage', 'The account-free demo stores sample records and edits in browser session storage. Use sample information and clear the site’s browser data if you want to remove your demo edits.'],
    ],
  },
  dpa: {
    title: 'Data processing agreement',
    summary: 'Processing arrangements for studio records.',
    sections: [
      ['Purpose and roles', 'The studio decides which client, crew and business records it adds. Fresnel Studios handles those records to provide the workspace and carry out the studio’s actions, such as saving drafts or publishing a project.'],
      ['Processing terms', 'Contact us if your studio requires a signed data processing agreement. We can discuss the applicable processing instructions, providers, international transfers and arrangements for returning or deleting records.'],
    ],
  },
  subprocessors: {
    title: 'Sub-processors',
    summary: 'Providers supporting the current workspace.',
    sections: [
      ['Vercel', 'Web application hosting and delivery.'],
      ['Supabase', 'Account authentication and storage of private workspace records.'],
    ],
  },
  security: {
    title: 'Security',
    summary: 'How the workspace separates studio records.',
    sections: [
      ['Workspace access', 'Private studio tools require sign-in. Database access rules limit studio records to the workspace owner. Projects you publish are intended for public viewing.'],
      ['Report a problem', 'If you suspect a security issue, email us with the affected page, when it happened and enough detail to reproduce it. Keep sign-in links and private client records out of the report.'],
    ],
  },
  ai: {
    title: 'AI and imagery',
    summary: 'How to interpret concept imagery and moodboard previews.',
    sections: [
      ['Concept imagery', 'Images labelled as AI concepts illustrate the product and example portfolio. They are not presented as commissioned photographs by the featured photographer.'],
      ['Moodboards', 'The moodboard tool assembles layouts using existing reference images. Check the rights and suitability of any image before using the board in client work.'],
    ],
  },
  accessibility: {
    title: 'Accessibility',
    summary: 'Tell us about barriers you encounter while using the site.',
    sections: [
      ['Feedback and assistance', 'If you have difficulty reading a page, navigating with a keyboard or using a studio tool, email us with the page address, what you were trying to do and the format or assistance that would help.'],
    ],
  },
  trust: {
    title: 'Trust centre',
    summary: 'Information about privacy, providers and workspace access.',
    sections: [['Using the preview', 'Explore the demo with sample information. Use a signed-in workspace for private records and review any project before publishing it.']],
  },
  mobile: {
    title: 'Mobile access',
    summary: 'Open Fresnel Studios from your phone or tablet.',
    sections: [['Use your browser', 'Open the Fresnel Studios website in your mobile browser. You can browse the example portfolio, explore the studio demo or sign in to your workspace.']],
  },

  support: {
    title: 'Support',
    summary: 'Contact Allen Australian Enterprises about Fresnel Studios.',
    sections: [['Email support', 'Tell us what you were trying to do, which page you were on, and what happened. Include the wording of any error and remove private information from screenshots.']],
  },
} satisfies Record<string, InformationPage>;

export const legalLinks = ['notice', 'terms', 'privacy', 'cookies', 'dpa', 'subprocessors', 'security', 'ai', 'accessibility'] as const;
