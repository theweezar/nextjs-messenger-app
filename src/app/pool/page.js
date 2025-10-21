"use client";

import PoolList from "./PoolList";
import PoolWrapper from "./PoolWrapper";

export default function Pool() {
  return (
    <PoolWrapper Child={PoolList} />
  );
}
