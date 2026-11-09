type Screenshot = { file: string; width: number; height: number };

type Step = {
  title: string;
  instructions: string[];
  shot?: Screenshot;
  caption?: string;
};

type HelpArticle = {
  slug: string;
  group: 'Website and portfolio' | 'Studio workflows';
  title: string;
  summary: string;
  steps: Step[];
  tip: string;
  related: string[];
};

export const helpArticles: HelpArticle[] = [
  {
    slug: 'website-design', group: 'Website and portfolio', title: 'Design and publish your website',
    summary: 'Choose a template, check the layout at two screen sizes, then preview or publish your portfolio.',
    steps: [
      {
        title: 'Choose a starting template',
        instructions: [
          'From the studio sidebar, open Website design and select Design. Under Start from a look, click a template card. The preview updates immediately.',
          'Adjust Typography, then look for Colours, Header and Top of the homepage. These controls vary by template. Campaign Stories uses full-screen media and a white header that appears as visitors scroll.',
        ],
        shot: { file: 'choose-template.webp', width: 802, height: 1152 }, caption: 'Choose a template under Start from a look.',
      },
      {
        title: 'Check desktop and mobile',
        instructions: [
          'Use Desktop and Mobile above the preview. On mobile, check that titles fit and important parts of each cover photo stay in frame.',
          'Click Save design, then Open saved draft for a private preview in a separate tab. Use Back to editor to return to your work.',
        ],
        shot: { file: 'preview-size.webp', width: 942, height: 68 }, caption: 'The preview toolbar has Desktop, Mobile and Open saved draft.',
      },
      {
        title: 'Publish when the draft is ready',
        instructions: [
          'Open Publish. Confirm that you have permission to publish the content, then choose Publish website. For an already published site, choose Publish changes.',
          'Wait for publishing to finish, then open the public link from the editor or Website live in the sidebar. Check the homepage and click through to your campaigns.',
        ],
        shot: { file: 'publish-website.webp', width: 802, height: 338 }, caption: 'The permission checkbox enables the Publish website button.',
      },
    ],
    tip: 'Save design updates the private draft. Publish changes updates what visitors see.',
    related: ['edit-campaign-pages', 'media-library'],
  },
  {
    slug: 'edit-campaign-pages', group: 'Website and portfolio', title: 'Edit the homepage and campaign pages',
    summary: 'Build a path from a homepage photo to a campaign, then guide visitors to related work.',
    steps: [
      {
        title: 'Create or select a page',
        instructions: [
          'Open Website design → Pages. Choose Homepage, About + Services, or a campaign from the page list.',
          'Click Add campaign page to start a new campaign. Enter a name, category and short introduction, then click Create campaign. The editor opens that page as a private draft.',
        ],
        shot: { file: 'new-campaign.webp', width: 742, height: 672 }, caption: 'The Add campaign page form sits above the page list.',
      },
      {
        title: 'Build the campaign with sections and photos',
        instructions: [
          'Use Choose photo under Project cover for the opening image. Under Page sections, choose Full screen for a large image, Split image + text for a photo and a description side by side, or Text only for an introduction or credits.',
          'In Project gallery, click Add photos from Media. Set each frame to Grid, Full width or Full screen. Drag the thumbnails or use the up and down arrows to arrange them. Add alt text that describes what is in each photo.',
        ],
        shot: { file: 'page-sections.webp', width: 742, height: 390 }, caption: 'Choose a section layout to add an image, text, or both.',
      },
      {
        title: 'Link a homepage photo to the campaign',
        instructions: [
          'Switch back to Homepage and find Homepage photo gallery. Open Link photo to a campaign on the frame you want visitors to click, then choose the campaign.',
          'For an image added under Page sections, use Link to a campaign on that section instead. Save the design before opening the private preview to check the link.',
        ],
        shot: { file: 'gallery-frame.webp', width: 742, height: 534 }, caption: 'A gallery frame has its own size, alt text, campaign link and reorder controls.',
      },
      {
        title: 'Choose and order the campaign tiles',
        instructions: [
          'On Homepage, scroll to Projects on the homepage. Tick the projects you want to show, then use the arrows to arrange them. Choose Grid or the full-width option under What appears on the homepage.',
          'Click a project title in the list to edit its cover or gallery. A campaign linked from a photo can be published without also appearing as a separate homepage tile.',
        ],
        shot: { file: 'homepage-projects.webp', width: 742, height: 288 }, caption: 'Tick a project to include it and use the arrows to change its position.',
      },
      {
        title: 'Add More work at the end of a campaign',
        instructions: [
          'Open the campaign page and scroll to More work. Tick the campaigns in the order you want their squares to appear. To change the order, untick and tick them again in the new sequence.',
          'Save the design and preview the whole journey, starting on the homepage and following a campaign through to its More work links.',
        ],
        shot: { file: 'more-work.webp', width: 742, height: 366 }, caption: 'More work controls the campaign links at the bottom of the current page.',
      },
    ],
    tip: 'If the media picker looks empty, turn on Show all library items. For imported work, Restore pages and photo order can match photos already in Media to their order on the source site.',
    related: ['website-design', 'media-library'],
  },
  {
    slug: 'media-library', group: 'Website and portfolio', title: 'Organise media and export crops',
    summary: 'Find the right photo, shortlist it for the editor and export a JPEG for social.',
    steps: [
      {
        title: 'Shortlist the files you want to use',
        instructions: [
          'Open Media and choose Photos or Videos. Find an asset and tick Select for website to make it easier to find in the editor’s media picker.',
          'To use it publicly, open Website design → Pages, select a page, and place it as a cover, section image or gallery photo. Then save and publish the site.',
        ],
        shot: { file: 'media-card.webp', width: 700, height: 1262 }, caption: 'Each media card has a website selection checkbox, a display name and file actions.',
      },
      {
        title: 'Rename a file or keep a private copy',
        instructions: [
          'Enter a recognisable label in Display name and click Save name. Use names you’ll recognise in the media picker, such as the campaign and frame number.',
          'Use Keep private original to copy a supported file into your studio library. Published placements currently use the original source URL.',
        ],
      },
      {
        title: 'Export a crop for a particular format',
        instructions: [
          'On a photo card, open Crop format and choose Square, Portrait or Reels cover. Click Export JPEG crop. The crop is centred and downloads to your device.',
          'Check the downloaded photo before posting, especially if the subject is near the edge of the original frame.',
        ],
      },
    ],
    tip: 'Select for website is a private shortlist. A photo appears publicly when it’s placed on a page and that page is published.',
    related: ['import-portfolio', 'edit-campaign-pages'],
  },
  {
    slug: 'import-portfolio', group: 'Website and portfolio', title: 'Import an existing portfolio',
    summary: 'Scan a portfolio URL, review the results and bring the useful projects and assets into your studio.',
    steps: [
      {
        title: 'Scan your current website',
        instructions: [
          'Open Import website from the studio sidebar. Enter your website address in Your current website, for example www.yourwebsite.com. Click Preview import.',
          'Wait for Fresnel to scan the homepage, linked pages and any public sitemap. Review any warnings along with the results.',
        ],
        shot: { file: 'import-address.webp', width: 1430, height: 194 }, caption: 'Paste the source address here and select Preview import. The screenshot uses the sample importer.',
      },
      {
        title: 'Save the projects and media you want',
        instructions: [
          'Review the project titles and thumbnails. Untick any pages you don’t want, then click Save privately. Find the saved work in Projects.',
          'Review the photos and videos separately, untick unwanted files, then click Save media to library. Find the saved files under Photos or Videos in Media.',
        ],
        shot: { file: 'import-projects.webp', width: 1430, height: 728 }, caption: 'The import preview lets you review project titles and thumbnails before saving.',
      },
      {
        title: 'Recover missing Squarespace images',
        instructions: [
          'Try importing the address of the specific gallery first. Fresnel skips media already in your library.',
          'For photos the scan still misses, open the Assets panel in Squarespace on a computer. Open the image’s three-dot menu, choose File Details, then right-click the preview and save it. Squarespace downloads these images one at a time.',
          'Save media to library keeps source links. Use Keep private original on individual assets to keep private copies. Published pages still need image URLs that remain available after the move.',
        ],
      },
      {
        title: 'Arrange the imported work in the editor',
        instructions: [
          'Open Website design → Pages and choose an imported campaign. Confirm its cover and gallery order, and choose which projects you want on the homepage.',
          'If the files are in Media but the order needs restoring, open Restore pages and photo order from a website and scan the source again. Review the result in the editor before saving.',
        ],
      },
    ],
    tip: 'Import reads publicly accessible pages. If a page or file is missing, check that it opens in a private browser window before trying the scan again.',
    related: ['media-library', 'edit-campaign-pages'],
  },
  {
    slug: 'calendar-and-social', group: 'Studio workflows', title: 'Plan shoots and social posts',
    summary: 'Keep shoots, deliveries and planned social posts in view while you work.',
    steps: [
      {
        title: 'Put a production date on the calendar',
        instructions: [
          'Open Calendar. Use Month for the whole schedule, Week for the days around a shoot, or List to scan the month’s entries.',
          'Choose Add event or click the date in the grid. Enter a title, type, date and any useful notes, then click Save event. Click an existing event to edit it.',
        ],
        shot: { file: 'calendar-views.webp', width: 1100, height: 68 }, caption: 'Switch calendar views or move between dates using the toolbar.',
      },
      {
        title: 'Prepare a social post',
        instructions: [
          'Open Social → New post. Enter a title, choose a channel, write the caption and select media from your library.',
          'Use Draft while preparing it. To add it to the schedule, enter a date and local time, choose Scheduled for manual posting and click Save post.',
        ],
        shot: { file: 'social-post.webp', width: 1300, height: 1370 }, caption: 'The Social form keeps caption, media, timing and status together.',
      },
      {
        title: 'Record when the post goes out',
        instructions: [
          'Publish from the social platform at the time you planned. In Fresnel, open that post, change its status to Posted and click Save post.',
        ],
      },
    ],
    tip: 'Scheduled for manual posting is a planning status. Fresnel records the intended posting time and you publish from the social platform.',
    related: ['media-library'],
  },
];
