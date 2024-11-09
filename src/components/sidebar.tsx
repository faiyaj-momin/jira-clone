import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import { DottedSeparator } from './dotted-separator';
import Navigation from './navigation';
import { WorkspaceSwitcher } from './workspace-switcher';
import { Projects } from './projects';

const Sidebar = () => {
  return (
    <aside className="w-full h-full p-4 bg-neutral-100">
      <Link href="/">
        <Image src="/logo.svg" alt="logo" width={164} height={48} />
      </Link>
      <DottedSeparator className="my-4" />
      <WorkspaceSwitcher />
      <DottedSeparator className="my-4" />
      <Navigation />
      <DottedSeparator className="my-4" />
      <Projects />
    </aside>
  );
};

export default Sidebar;
