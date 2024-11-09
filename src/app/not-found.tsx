import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default async function NotFound() {
  return (
    <div className="min-h-screen w-full absolute flex flex-col items-center justify-center">
      <h1 className="text-[260px] leading-tight -tracking-[19px] font-bold text-transparent bg-clip-text bg-gradient-to-t from-[#4F9BE8] to-transparent">
        404
      </h1>
      <div className="flex justify-center items-center flex-col relative -top-14">
        <h2 className="text-3xl font-semibold text-muted-foreground">
          Not Found
        </h2>
        <p className="text-lg text-muted-foreground text-center">
          The page you are looking for doesn&apos;t exist or has been moved.
          <br />
          Please go back to the homepage.
        </p>
        <Button variant="teritary" className="mt-3" asChild>
          <Link href="/">Go Back Home</Link>
        </Button>
      </div>
    </div>
  );
}
