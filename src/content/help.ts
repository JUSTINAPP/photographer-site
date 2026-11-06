export const helpArticles = [
  {
    slug: 'website-design', title: 'Design your website', summary: 'Choose a look, preview it on desktop or mobile, and save your draft.',
    steps: [
      ['Start with Design', 'Open Studio → Edit website → Design. Choose a template, then adjust typography, colours, header and homepage layout where the template offers those controls.'],
      ['Preview at both sizes', 'Use Desktop and Mobile above the preview. Campaign Stories keeps its full-screen layout and white scroll header, with typography and social placement controls.'],
      ['Save or publish', 'Save design keeps your draft. Preview saved draft opens it privately in a new tab. Open Publish, confirm that you have permission to publish the content, and click Publish website. Website live in the sidebar opens the public portfolio.'],
    ], related: ['edit-campaign-pages', 'media-library'],
  },
  {
    slug: 'edit-campaign-pages', title: 'Edit homepage and campaign pages', summary: 'Place images, change frame sizes and set the order of your work.',
    steps: [
      ['Choose a page', 'Open Edit website → Pages. Select Homepage, About + Services or an imported project. On the homepage, tick the projects you want to show and choose a grid or full-width layout.'],
      ['Place your media', 'Choose a homepage cover or showreel, or select a project cover. With Campaign Stories, you can also add gallery photos and enter descriptive alt text.'],
      ['Arrange and review', 'Drag gallery thumbnails or use the arrow buttons. Choose Full screen, Full width or Small grid for each frame. On the Homepage, use the campaign arrows to set the order of the campaign tiles.'],
    ], related: ['website-design', 'media-library'],
  },
  {
    slug: 'media-library', title: 'Use the media library', summary: 'Shortlist website assets, keep originals and export social crops.',
    steps: [
      ['Select for website', 'In Media, tick Select for website on the photos or videos you want in the website picker. The selection is private. To show an asset publicly, place it on a page and publish the site.'],
      ['Work with originals', 'Rename an item for easier searching. Keep private original copies supported media into your private library. Published placements currently use the source URLs.'],
      ['Export a crop', 'Choose a square, portrait or vertical format and export a JPEG. The export leaves the original intact.'],
    ], related: ['import-portfolio', 'edit-campaign-pages'],
  },
  {
    slug: 'import-portfolio', title: 'Import an existing portfolio', summary: 'Find photos, videos and projects on your existing site.',
    steps: [
      ['Enter your site address', 'Open Import website and paste the public HTTPS address of your portfolio. Review the media and project results before saving.'],
      ['Save what you need', 'Select the items you want to bring into Fresnel. Photos and videos go to Media. Review imported projects in Projects.'],
      ['Build your pages', 'Open Website design to place selected media and choose what appears on your homepage. Imported content is ready for your review before publication.'],
    ], related: ['media-library', 'edit-campaign-pages'],
  },
  {
    slug: 'calendar-and-social', title: 'Plan production and social posts', summary: 'Use your calendar for shoots and schedule content alongside them.',
    steps: [
      ['Add production dates', 'Open Calendar, select a date and add a shoot, meeting or delivery. Switch between month, week and list views.'],
      ['Prepare a post', 'Open Social and add a caption, channel and media. Leave it as a draft or set a date and local posting time.'],
      ['Track what went out', 'Publish the post on the social platform, then mark it Posted in Fresnel.'],
    ], related: ['media-library'],
  },
] as const;
