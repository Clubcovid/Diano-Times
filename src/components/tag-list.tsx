"use client";

import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from './ui/button';

export function TagList({ tags, activeTag }: { tags: string[], activeTag?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleTagClick = (tag?: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (!tag || tag === activeTag) {
      params.delete('tag');
    } else {
      params.set('tag', tag);
    }
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      <Button
        variant={!activeTag ? 'default' : 'outline'}
        size="sm"
        onClick={() => handleTagClick()}
        className="rounded-full transition-all"
      >
        All Posts
      </Button>
      {tags.map((tag) => (
        <Button
          key={tag}
          variant={activeTag === tag ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleTagClick(tag)}
          className="rounded-full transition-all"
        >
          {tag}
        </Button>
      ))}
    </div>
  );
}
