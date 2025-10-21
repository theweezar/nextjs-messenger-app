"use client";

import PoolWrapper from '@/app/pool/PoolWrapper';
import DirectMessage from './DirectMessage';

export default function Page() {
  return (
    <PoolWrapper Child={DirectMessage} />
  );
}
