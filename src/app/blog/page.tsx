"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { BlogPostItem } from "@/types/admin";
import { PageDecorations } from "@/components/PageDecorations";

const defaultBlogPosts = [
  {
    title: "EXTRA-LONG HANDMADE NAIL LUXURY",
    slug: "extra-long-handmade-nail-luxury",
    date: "July 22, 2026",
    image: "/images/IMG_7098.JPG",
  },
  {
    title: "SALON-QUALITY HANDMADE NAILS, REIMAGINED FOR HOME",
    slug: "salon-quality-handmade-nails-reimagined-for-home",
    date: "July 22, 2026",
    image: "/images/IMG_7099.JPG",
  },
  {
    title: "How to Have Beautiful Nails in Less Than 10 Minutes",
    slug: "apply-gripx-nails",
    date: "December 10, 2025",
    image: "/images/IMG_7100.JPG",
  },
  {
    title: "Salon-Quality Beauty, Reimagined for Modern Life",
    slug: "post-1",
    date: "December 10, 2025",
    image: "/images/IMG_7101.JPG",
  },
];

export default function BlogIndexPage() {
  const [posts, setPosts] = useState(defaultBlogPosts);

  useEffect(() => {
    async function fetchDynamicPosts() {
      try {
        const res = await fetch("/api/blog?status=Published");
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data) && json.data.length > 0) {
            const mappedDynamic = json.data.map((b: BlogPostItem) => ({
              title: b.title,
              slug: b.slug,
              date: b.publishedAt || b.createdAt
                ? new Date(b.publishedAt || b.createdAt).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })
                : "Recent",
              image: b.thumbnail || "/images/IMG_7098.JPG",
            }));

            // Merge dynamic posts on top without duplicating existing slugs
            const existingSlugs = new Set(mappedDynamic.map((d: { slug: string }) => d.slug));
            const filteredDefaults = defaultBlogPosts.filter(
              (p) => !existingSlugs.has(p.slug)
            );
            setPosts([...mappedDynamic, ...filteredDefaults]);
          }
        }
      } catch (e) {
        console.error("Error loading blog posts:", e);
      }
    }

    fetchDynamicPosts();
  }, []);

  return (
    <div className="relative bg-white min-h-screen overflow-hidden">
      {/* Background Motifs */}
      <PageDecorations preset="blog" />

      {/* Top Full-width Banner */}
      <div className="w-full overflow-hidden bg-neutral-900 relative z-10">
        <Image
          src="/images/xon_blog_banner.jpg"
          alt="X-ON News & Blog Banner"
          width={1376}
          height={768}
          priority
          className="w-full h-auto block"
          quality={100}
          unoptimized
        />
      </div>

      {/* Main Section */}
      <section className="relative z-10 py-12 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* News Heading */}
        <div className="text-center mb-10">
          <h2 className="text-xl sm:text-2xl font-bold uppercase tracking-wide text-neutral-900">
            News & Editorial
          </h2>
        </div>

        {/* 3-Column Blog Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <article
              key={post.slug}
              className="group flex flex-col bg-white overflow-hidden"
            >
              {/* Square Image Box */}
              <div className="relative aspect-square w-full overflow-hidden bg-neutral-50 rounded-xs">
                <Link href={`/blog/${post.slug}`} className="relative block w-full h-full">
                  <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </Link>
              </div>

              {/* Post Content */}
              <div className="pt-4 pb-2 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-neutral-900 uppercase leading-snug line-clamp-2 group-hover:text-rose-700 transition-colors">
                    <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                  </h3>
                  <div className="text-xs text-neutral-400 mt-1.5 font-normal">
                    {post.date}
                  </div>
                  <div className="w-8 h-0.5 bg-neutral-200 my-3" />
                </div>

                <div className="pt-1">
                  <Link
                    href={`/blog/${post.slug}`}
                    className="inline-block text-xs font-semibold uppercase tracking-wider text-neutral-800 hover:text-black border-b border-black pb-0.5 transition-colors"
                  >
                    Read more
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

