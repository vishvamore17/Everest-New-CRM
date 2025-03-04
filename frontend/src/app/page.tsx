import Link from "next/link";
import Login from './login/page'
export default function Home() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      {/* <LoginForm/> */}
      <Login/>
    </div>
  );
}
