import {isDark,themeColours,type SiteTheme} from './website-theme';
export function headerPresentation(theme:SiteTheme,scrolled=false,overImage=false){
 const selected=scrolled?theme.scrolledHeaderLogo:theme.headerLogo;
 const lightLogo=selected==='light'||(selected==='auto'&&(scrolled||!overImage||theme.headerAppearance==='solid'?isDark(theme):theme.headerAppearance==='transparent'));
 const colours=themeColours(theme);
 const background=scrolled||!overImage||theme.headerAppearance==='solid'
  ? (selected==='auto'?colours.site:lightLogo?'#161616':'#f6f3ec')
  :theme.headerAppearance==='transparent'?'transparent':lightLogo?'rgba(18,18,18,.68)':'rgba(246,243,236,.54)';
 return {lightLogo,color:lightLogo?'#ffffff':'#161616',background,borderBottom:theme.headerBorder?'1px solid '+(lightLogo?'#ffffff30':'#16161625'):'none'};
}
