"use client";

export default function Spotlight() {
  return (
    <div className="absolute inset-0 -z-10">
      <div className="absolute left-1/2 top-0 h-[400px] w-[400px] -translate-x-1/2 bg-purple-500 opacity-20 blur-[120px]" />
    </div>
  );
}