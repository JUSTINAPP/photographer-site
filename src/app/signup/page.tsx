import AccountPage from '@/components/AccountPage';
import { cookies } from 'next/headers';
import { websiteStartCookie, websiteStartPath } from '@/lib/website-start';
export default async function Signup(){
 return <AccountPage signup websiteStart={!!websiteStartPath((await cookies()).get(websiteStartCookie)?.value)}/>;
}
