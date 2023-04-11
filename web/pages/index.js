import { useUser } from '@/context/user';

export default function Home() {
  const { user } = useUser();
  console.log(user);
  return (
    <></>
  )
}