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
    "slug": "website-design",
    "group": "Website and portfolio",
    "title": "Design and publish your website",
    "summary": "Follow the setup journey: import, identity, design, pages, optional video and publishing.",
    "steps": [
      {
        "title": "Bring your work with you",
        "instructions": [
          "Start with Import website. Enter your current address, choose Preview import and review the photographs, videos and project drafts before saving. Your existing site stays as it is.",
          "Starting fresh? Skip importing and add photographs in Media."
        ]
      },
      {
        "title": "Add your name and logo",
        "instructions": [
          "Continue to logo setup. Upload a logo or a cropped screenshot, then check the black, white and browser-icon versions. Alternatively, expand the text-logo option and type your name exactly as you want it shown.",
          "The logo height slider changes the header logo in the preview as you drag. Save draft to keep the size."
        ]
      },
      {
        "title": "Choose a visible starting design",
        "instructions": [
          "Open Design and choose a template under Choose a starting design. Your photographs and pages stay in place while the layout changes.",
          "Expand Fine-tune fonts, colours and layout for more controls. Optional reference sites and a note about what you like can guide supported design changes; review the result rather than expecting an exact copy."
        ]
      },
      {
        "title": "Build your pages and opening",
        "instructions": [
          "Open Pages, select Home page or another page, then add images and choose where each image should link. Check Desktop and Mobile above the preview.",
          "Video is optional. Create a short opening from photographs or original video clips, save it in Media and choose it for your homepage."
        ]
      },
      {
        "title": "Review privately, then publish",
        "instructions": [
          "Save draft keeps your edits private. Save & open draft preview saves first and opens a full-size private preview. Check image links, mobile framing and your contact details.",
          "Open Publish, review the publishing options and required permission confirmation, then publish. Use View published site or Website live to check what visitors see."
        ]
      }
    ],
    "tip": "Moving between editor steps keeps your edits in the current session. Save draft before leaving the editor. Publishing is a separate action.",
    "related": [
      "import-portfolio",
      "name-and-logo",
      "edit-campaign-pages",
      "opening-video"
    ]
  },
  {
    "slug": "name-and-logo",
    "group": "Website and portfolio",
    "title": "Set up your name, logo and browser icon",
    "summary": "Use an uploaded logo or type your name, then see the result in your website header.",
    "steps": [
      {
        "title": "Choose an image logo or a text logo",
        "instructions": [
          "Open Edit website → Logo. Upload logo or screenshot accepts PNG, JPEG or WebP up to 2 MB. Crop a screenshot closely around the mark first.",
          "Prefer a text logo? Expand the text-logo controls, enter a name or word and choose its font and spacing. Keep your preferred capitalisation or use lowercase."
        ]
      },
      {
        "title": "Review the prepared versions",
        "instructions": [
          "Check the black logo on a light background and the white logo on a dark background. Confirm that fine details remain clear before saving the versions.",
          "The tool prepares monochrome versions; a blurry screenshot may still need a sharper original."
        ]
      },
      {
        "title": "Size it in the live preview",
        "instructions": [
          "Drag Logo height and watch the website header on the right. Wide logos also fit within the available header width. Check Desktop and Mobile, then Save draft."
        ]
      },
      {
        "title": "Check the favicon",
        "instructions": [
          "A favicon is the small square icon beside the page title in a browser tab. A simple letter or symbol usually reads better than a full name at this size.",
          "Review the browser-tab example. Choose a separate square icon if the suggested mark is unclear, then save your logo versions and draft."
        ]
      }
    ],
    "tip": "Your logo typeface belongs to your website design. Fresnel’s own controls use a consistent sans serif font.",
    "related": [
      "website-design",
      "import-portfolio"
    ]
  },
  {
    "slug": "edit-campaign-pages",
    "group": "Website and portfolio",
    "title": "Edit the homepage and campaign pages",
    "summary": "Build a path from a homepage photo to a campaign, then guide visitors to related work.",
    "steps": [
      {
        "title": "Choose the page you want to edit",
        "instructions": [
          "Open Edit website → Pages. Home page is the main landing page. Other menu pages and campaign galleries remain separate; use the page search to find them.",
          "Use Add page to create another page, then give it a recognisable name."
        ]
      },
      {
        "title": "Add photographs from Media",
        "instructions": [
          "Find Images on this page and choose Add image. Select photographs in the picker: a tick on the thumbnail marks each selection. Choose Add selected images to place them on the page. Use Cancel / close to dismiss the picker.",
          "Use Add campaign cover when you want a photograph to open a campaign gallery. If you cannot find a photograph, search or load the complete Media library."
        ]
      },
      {
        "title": "Give an image a destination",
        "instructions": [
          "On an added image, use Link to page to choose a campaign or another page. Choose No link to display a still image without a destination.",
          "Use Edit linked page to work on the destination gallery. The cover is the entry point; add the remaining campaign photographs on that page."
        ]
      },
      {
        "title": "Arrange and check your images",
        "instructions": [
          "Use the arrows or available drag controls to change the order. Expand Image size & description to adjust the frame and describe the photograph. Remove image takes the placement off this page.",
          "Check the right-hand preview as you edit. Save & open draft preview to test the full page and follow image links before publishing."
        ]
      },
      {
        "title": "Edit text and review the opening",
        "instructions": [
          "Edit outlined text in the preview or use the corresponding fields. Clear a line to remove its words, or switch off opening text to hide the words over the photograph or video.",
          "Save draft, then publish when the homepage and linked campaign pages are ready."
        ]
      }
    ],
    "tip": "Adding a photograph to Media alone does not place it on a website page. Select it in the page image picker and confirm Add selected images.",
    "related": [
      "website-design",
      "media-library"
    ]
  },
  {
    "slug": "opening-video",
    "group": "Website and portfolio",
    "title": "Create a short homepage opening",
    "summary": "Turn photographs and original clips into a reusable, silent opening video.",
    "steps": [
      {
        "title": "Choose your shots",
        "instructions": [
          "Open Edit website → Video. Select up to eight photographs or original MP4 clips from Media. Selected shots appear in the timeline; remove a shot to take it out of the sequence.",
          "A playable Vimeo link is useful for viewing, but editing a clip requires the original MP4."
        ]
      },
      {
        "title": "Arrange the sequence",
        "instructions": [
          "Reorder shots, choose timing and review crop or movement controls. Keep the sequence within 15 seconds and check both desktop and mobile framing."
        ]
      },
      {
        "title": "Save and choose where to use it",
        "instructions": [
          "Name and save the result to Media. Generating a video alone does not replace your current homepage opening.",
          "Use the option to save and replace the Home opening, or select the saved video in the homepage opening-video control under Pages. Review the preview and save your draft."
        ]
      },
      {
        "title": "Publish the finished opening",
        "instructions": [
          "Check that the photographs, crops and text work together. Opening videos are silent. Publish changes when you want visitors to see the new opening."
        ]
      }
    ],
    "tip": "You can reuse a saved opening rather than rebuilding the sequence each time.",
    "related": [
      "edit-campaign-pages",
      "media-library"
    ]
  },
  {
    "slug": "media-library",
    "group": "Website and portfolio",
    "title": "Organise media and export crops",
    "summary": "Find the right photo, shortlist it for the editor and export a JPEG for social.",
    "steps": [
      {
        "title": "Shortlist the files you want to use",
        "instructions": [
          "Open Media and choose Photos or Videos. Find an asset and tick Select for website to make it easier to find in the editor’s media picker.",
          "To use it publicly, open Edit website → Pages, select a page, and place it as a cover, section image or gallery photo. Then save and publish the site."
        ]
      },
      {
        "title": "Organise files by category or year",
        "instructions": [
          "Use the category tabs and Year filter to narrow the library. The year describes when the work was made. Choose No year set to see files that still need a year.",
          "Open Organise media to add a category. Tick individual files or select the whole page, then add or remove a custom category, or set a year for the selected files. Leave the year blank to clear it.",
          "Collections from a rebuilt site appear after you save the website design. Custom media categories are for organising your library."
        ]
      },
      {
        "title": "Rename a file or keep a private copy",
        "instructions": [
          "Enter a recognisable label in Display name and click Save name. Use names you’ll recognise in the media picker, such as the campaign and frame number.",
          "Use Keep private original to copy a supported file into your studio library. Published placements currently use the original source URL."
        ]
      },
      {
        "title": "Export a crop for a particular format",
        "instructions": [
          "On a photo card, open Crop format and choose Square, Portrait or Reels cover. Click Export JPEG crop. The crop is centred and downloads to your device.",
          "Check the downloaded photo before posting, especially if the subject is near the edge of the original frame."
        ]
      }
    ],
    "tip": "Select for website is a private shortlist. A photo appears publicly when it’s placed on a page and that page is published.",
    "related": [
      "import-portfolio",
      "edit-campaign-pages"
    ]
  },
  {
    "slug": "import-portfolio",
    "group": "Website and portfolio",
    "title": "Import an existing portfolio",
    "summary": "Scan a portfolio URL, review the results and bring the useful projects and assets into your studio.",
    "steps": [
      {
        "title": "Scan your current website",
        "instructions": [
          "Open Import website from the studio sidebar. Enter your website address in Your current website, for example www.yourwebsite.com. Click Preview import.",
          "Wait for Fresnel to scan the homepage, linked pages and any public sitemap. Review any warnings along with the results."
        ]
      },
      {
        "title": "Save photos and videos first",
        "instructions": [
          "In Photos and videos, choose the files you want and click the save button. It shows the number of selected photos and videos. Find them in Media.",
          "To bring over page titles and covers as well, open Project drafts (optional), choose the pages and click Save project drafts. Find them in Projects."
        ]
      },
      {
        "title": "Recover missing Squarespace images",
        "instructions": [
          "Try importing the address of the specific gallery first. Fresnel skips media already in your library.",
          "For photos the scan still misses, open the Assets panel in Squarespace on a computer. Open the image’s three-dot menu, choose File Details, then right-click the preview and save it. Squarespace downloads these images one at a time.",
          "Saving photos and videos to Media keeps source links. Use Keep private original on individual assets to keep private copies. Published pages still need image URLs that remain available after the move."
        ]
      },
      {
        "title": "Continue through logo, design and pages",
        "instructions": [
          "After saving your import, choose Continue to logo setup. Check your identity, choose a visible template in Design, then arrange your Home page and campaign galleries in Pages.",
          "To reuse an existing site structure, look for Match original website in the page controls. Review matched images, covers and any missing items before applying the private draft. Save draft to keep it."
        ]
      }
    ],
    "tip": "Import reads publicly accessible pages. If a page or file is missing, check that it opens in a private browser window before trying the scan again.",
    "related": [
      "name-and-logo",
      "website-design",
      "media-library"
    ]
  },
  {
    "slug": "calendar-and-social",
    "group": "Studio workflows",
    "title": "Plan shoots and social posts",
    "summary": "Keep shoots, deliveries and planned social posts in view while you work.",
    "steps": [
      {
        "title": "Put a production date on the calendar",
        "instructions": [
          "Open Calendar. Use Month for the whole schedule, Week for the days around a shoot, or List to scan the month’s entries.",
          "Choose Add event or click the date in the grid. Enter a title, type, date and any useful notes, then click Save event. Click an existing event to edit it."
        ]
      },
      {
        "title": "Prepare a social post",
        "instructions": [
          "Open Social → New post. Enter a title, choose a channel, write the caption and select media from your library.",
          "Use Draft while preparing it. To add it to the schedule, enter a date and local time, choose Scheduled for manual posting and click Save post."
        ]
      },
      {
        "title": "Record when the post goes out",
        "instructions": [
          "Publish from the social platform at the time you planned. In Fresnel, open that post, change its status to Posted and click Save post."
        ]
      }
    ],
    "tip": "Scheduled for manual posting is a planning status. Fresnel records the intended posting time and you publish from the social platform.",
    "related": [
      "media-library"
    ]
  },
  {
    "slug": "moodboards",
    "group": "Studio workflows",
    "title": "Prepare a moodboard presentation",
    "summary": "Bring a brief, reference images and captions together for a shoot.",
    "steps": [
      {
        "title": "Start with the brief",
        "instructions": [
          "Open Moodboards and create a board. Use the clearly labelled example to see a complete board, or start blank. Give it a title and brief, then describe the light, colour, styling, composition and location."
        ]
      },
      {
        "title": "Add references and captions",
        "instructions": [
          "Choose from Media to add your own photographs. Add a Pinterest Pin, board or other website in Source link, then explain what you like about it. A source link is clickable; add a direct HTTPS image URL separately if you want an image displayed on the board."
        ]
      },
      {
        "title": "Prepare a presentation",
        "instructions": [
          "Label each reference, add a caption and source credit, then use the arrows to arrange the order. Choose an editorial or grid layout and check the live preview. Save the board to your private studio, then use Print / save PDF for your presentation."
        ]
      }
    ],
    "tip": "Moodboards currently support presentation and PDF output. Client commenting and approval workflows are not connected.",
    "related": [
      "calendar-and-social",
      "media-library"
    ]
  }
];
