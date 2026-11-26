import StudioShell from '@/components/StudioShell';
import SocialCalendar from '@/components/social-calendar/calendar';
import { socialWorkspace } from '@/lib/social-workspace';
export default async function Social({ searchParams }: { searchParams:Promise<{media?:string;idea?:string;post?:string}> }) {
 const data=await socialWorkspace();
 return <StudioShell active="Social calendar" email={data.user.email}><div className="studio-page-heading"><div><h1>Social calendar</h1><p>Plan your content across Instagram, Facebook, LinkedIn, TikTok, events and articles.</p></div></div><SocialCalendar initial={data.posts} media={data.media} ideas={data.records} prefill={(await searchParams).media} idea={(await searchParams).idea} postId={(await searchParams).post}/></StudioShell>;
}
