"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { usePathname } from "next/navigation";
import {
  Menu,
  ShoppingBag,
  Search,
  User,
  Heart,
  ChevronDown,
} from "lucide-react";

export function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [shopExpanded, setShopExpanded] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);
  const { openCart, totalCount, subtotal } = useCart();

  useEffect(() => {
    const handleScroll = () => {
      // Show sticky header when scrolled past the main top banner (~140px)
      setIsScrolled(window.scrollY > 140);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleLinkClick = () => {
    scrollToTop();
  };

  const handleDrawerLinkClick = () => {
    setMobileOpen(false);
    scrollToTop();
  };

  const renderActions = (showSubtotal = true) => (
    <div className="flex items-center space-x-2 sm:space-x-4 text-gray-800">
      {/* Avatar / User icon -> navigates to Admin / Account Login */}
      <Link
        href="/admin/login"
        className="p-1.5 hover:text-rose-700 transition-colors"
        title="Sign In / Account"
        aria-label="Sign In / Account"
      >
        <User className="w-5 h-5 stroke-[1.5]" />
      </Link>

      <Link
        href="/shop"
        onClick={handleLinkClick}
        className="p-1.5 hover:text-rose-700 transition-colors hidden sm:block"
        title="Wishlist"
      >
        <Heart className="w-5 h-5 stroke-[1.5]" />
      </Link>

      <button
        onClick={() => setSearchOpen(!searchOpen)}
        className="p-1.5 hover:text-rose-700 transition-colors cursor-pointer"
        aria-label="Search"
      >
        <Search className="w-5 h-5 stroke-[1.5]" />
      </button>

      <button
        onClick={openCart}
        className="p-1.5 hover:text-rose-700 transition-colors flex items-center gap-1.5 cursor-pointer"
        aria-label="Cart"
      >
        <div className="relative">
          <ShoppingBag className="w-5 h-5 stroke-[1.5]" />
          {totalCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-black text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
              {totalCount}
            </span>
          )}
        </div>
        {showSubtotal && (
          <span className="hidden md:inline-block text-xs font-semibold text-gray-800">
            ${subtotal.toFixed(2)}
          </span>
        )}
      </button>
    </div>
  );

  const renderNavLinks = () => (
    <ul className="flex items-center gap-3.5 xl:gap-6 2xl:gap-8 text-[12px] xl:text-[13px] font-bold uppercase tracking-[0.1em] xl:tracking-[0.14em] text-neutral-800 whitespace-nowrap shrink-0">
      <li className="shrink-0">
        <Link
          href="/"
          onClick={handleLinkClick}
          className="hover:text-rose-700 transition-colors py-3 whitespace-nowrap block"
        >
          HOME
        </Link>
      </li>

      {/* Shop Mega Menu */}
      <li className="group py-3 shrink-0">
        <Link
          href="/shop"
          onClick={(e) => {
            e.preventDefault();
            window.location.href = "/shop";
          }}
          className="hover:text-rose-700 transition-colors flex items-center gap-1.5 whitespace-nowrap"
        >
          SHOP <ChevronDown className="w-3.5 h-3.5 group-hover:rotate-180 transition-transform duration-200 stroke-[2]" />
        </Link>

        {/* Mega Menu Dropdown */}
        <div className="absolute top-full left-1/2 -translate-x-1/2 w-[860px] max-w-[95vw] bg-white shadow-2xl rounded-2xl border border-gray-100 p-6 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
          <div className="grid grid-cols-4 gap-6">
            {/* Col 1: Product Type */}
            <div className="space-y-2">
              <h4 className="text-[11px] font-bold text-gray-900 uppercase tracking-widest border-b border-gray-100 pb-1.5">
                Product Type
              </h4>
              <ul className="space-y-1.5 text-xs text-gray-600 font-normal">
                <li>
                  <Link
                    href="/product-category/product-type/handmade-grip-x-nails"
                    onClick={handleLinkClick}
                    className="hover:text-rose-700 transition-colors block py-0.5"
                  >
                    Handmade grip-x nails
                  </Link>
                </li>
                <li>
                  <Link
                    href="/product-category/product-type/cold-gel-glue"
                    onClick={handleLinkClick}
                    className="hover:text-rose-700 transition-colors block py-0.5"
                  >
                    Cold Gel Glue
                  </Link>
                </li>
                <li>
                  <Link
                    href="/product-category/product-type/cold-gel-remover"
                    onClick={handleLinkClick}
                    className="hover:text-rose-700 transition-colors block py-0.5"
                  >
                    Cold gel remover
                  </Link>
                </li>
                <li>
                  <Link
                    href="/product-category/product-type/best-seller"
                    onClick={handleLinkClick}
                    className="hover:text-rose-700 transition-colors block py-0.5"
                  >
                    Best seller
                  </Link>
                </li>
                <li>
                  <Link
                    href="/gallery-product"
                    onClick={handleLinkClick}
                    className="hover:text-rose-700 transition-colors block py-0.5"
                  >
                    Product Gallery
                  </Link>
                </li>
              </ul>

              <h4 className="text-[11px] font-bold text-gray-900 uppercase tracking-widest border-b border-gray-100 pb-1.5 pt-3">
                Design Theme
              </h4>
              <ul className="space-y-1.5 text-xs text-gray-600 font-normal">
                <li>
                  <Link
                    href="/product-category/design-theme/3d"
                    onClick={handleLinkClick}
                    className="hover:text-rose-700 block py-0.5"
                  >
                    3D
                  </Link>
                </li>
                <li>
                  <Link
                    href="/product-category/design-theme/flower"
                    onClick={handleLinkClick}
                    className="hover:text-rose-700 block py-0.5"
                  >
                    Flower
                  </Link>
                </li>
                <li>
                  <Link
                    href="/product-category/design-theme/y2k"
                    onClick={handleLinkClick}
                    className="hover:text-rose-700 block py-0.5"
                  >
                    Y2K
                  </Link>
                </li>
              </ul>
            </div>

            {/* Col 2: Card Bundles */}
            <div className="space-y-2">
              <Link
                href="/bundle-and-save"
                onClick={handleLinkClick}
                className="group/card block relative aspect-3/4 rounded-lg overflow-hidden bg-neutral-100"
              >
                <Image
                  src="/images/IMG_7098.JPG"
                  alt="Bundles"
                  fill
                  sizes="250px"
                  className="object-cover group-hover/card:scale-105 transition-transform"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-3">
                  <span className="text-white text-xs font-bold uppercase tracking-wider">
                    Bundles
                  </span>
                </div>
              </Link>
            </div>

            {/* Col 3: Card Y2K */}
            <div className="space-y-2">
              <Link
                href="/product-category/design-theme/y2k"
                onClick={handleLinkClick}
                className="group/card block relative aspect-3/4 rounded-lg overflow-hidden bg-neutral-100"
              >
                <Image
                  src="/images/IMG_7101.JPG"
                  alt="Y2K"
                  fill
                  sizes="250px"
                  className="object-cover group-hover/card:scale-105 transition-transform"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-3">
                  <span className="text-white text-xs font-bold uppercase tracking-wider">
                    Y2K
                  </span>
                </div>
              </Link>
            </div>

            {/* Col 4: Card Best seller */}
            <div className="space-y-2">
              <Link
                href="/product-category/product-type/best-seller"
                onClick={handleLinkClick}
                className="group/card block relative aspect-3/4 rounded-lg overflow-hidden bg-neutral-100"
              >
                <Image
                  src="/images/IMG_7105.JPG"
                  alt="Best seller"
                  fill
                  sizes="250px"
                  className="object-cover group-hover/card:scale-105 transition-transform"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-3">
                  <span className="text-white text-xs font-bold uppercase tracking-wider">
                    Best Seller
                  </span>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </li>

      <li className="shrink-0">
        <Link
          href="/about"
          onClick={handleLinkClick}
          className="hover:text-rose-700 transition-colors py-3 whitespace-nowrap block"
        >
          OUR STORY
        </Link>
      </li>

      <li className="shrink-0">
        <Link
          href="/sizing-chart"
          onClick={handleLinkClick}
          className="hover:text-rose-700 transition-colors py-3 whitespace-nowrap block"
        >
          FIT GUIDE
        </Link>
      </li>

      <li className="shrink-0">
        <Link
          href="/wholesale-signup"
          onClick={handleLinkClick}
          className="hover:text-rose-700 transition-colors py-3 whitespace-nowrap block"
        >
          WHOLESALE
        </Link>
      </li>

      <li className="shrink-0">
        <Link
          href="/blog"
          onClick={handleLinkClick}
          className="hover:text-rose-700 transition-colors py-3 whitespace-nowrap block"
        >
          JOURNAL
        </Link>
      </li>

      <li className="shrink-0">
        <Link
          href="/contact-us"
          onClick={handleLinkClick}
          className="hover:text-rose-700 transition-colors py-3 whitespace-nowrap block"
        >
          CONTACT
        </Link>
      </li>
    </ul>
  );

  return (
    <>
      {/* 1. Main Static Header in natural document flow (Zero layout shift / jump) */}
      <header className="relative w-full bg-white border-b border-gray-100 z-30">
        {/* Top Header Row: Centered 3x Logo on Desktop / Bar on Mobile */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative flex items-center justify-between h-20 sm:h-28 md:h-36 lg:h-52">
            {/* Left: Mobile hamburger */}
            <div className="flex items-center lg:hidden">
              <button
                onClick={() => setMobileOpen(true)}
                className="p-2 text-gray-800 hover:text-black focus:outline-hidden cursor-pointer"
                aria-label="Open menu"
              >
                <Menu className="w-6 h-6 stroke-[1.5]" />
              </button>
            </div>

            {/* Left spacer on desktop */}
            <div className="hidden lg:flex items-center" />

            {/* Center: Main Large Logo */}
            <div className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center pointer-events-none">
              <Link
                href="/"
                onClick={handleLinkClick}
                className="relative block pointer-events-auto transition-transform duration-300 hover:scale-105 h-12 sm:h-20 md:h-28 lg:h-44 w-32 sm:w-56 md:w-[380px] lg:w-[540px]"
              >
                <Image
                  src="/images/logo-xon.png"
                  alt="X-ON Nails"
                  fill
                  priority
                  unoptimized
                  sizes="(max-width: 768px) 320px, 600px"
                  className="object-contain"
                />
              </Link>
            </div>

            {/* Right: Action Icons */}
            {renderActions(true)}
          </div>
        </div>

        {/* Desktop Centered Navigation Bar */}
        <nav className="hidden lg:block bg-white relative">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
            <div className="flex items-center justify-center h-14">
              {renderNavLinks()}
            </div>
          </div>
        </nav>
      </header>

      {/* 2. Floating Sticky Header (Keeps exact centered position, logo shrunk 3x, pure white) */}
      <header
        className={`fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-100 shadow-xs transition-all duration-300 ease-in-out transform ${
          isScrolled
            ? "translate-y-0 opacity-100 pointer-events-auto"
            : "-translate-y-full opacity-0 pointer-events-none"
        }`}
      >
        {/* Top Header Row: Centered 1/3 Logo on Desktop & Mobile */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative flex items-center justify-between h-14 sm:h-16 lg:h-18">
            {/* Left: Mobile hamburger */}
            <div className="flex items-center lg:hidden">
              <button
                onClick={() => setMobileOpen(true)}
                className="p-2 text-gray-800 hover:text-black focus:outline-hidden cursor-pointer"
                aria-label="Open menu"
              >
                <Menu className="w-6 h-6 stroke-[1.5]" />
              </button>
            </div>

            {/* Left spacer on desktop */}
            <div className="hidden lg:flex items-center" />

            {/* Center: Main Logo Shrunk by 3x (Centered in exact same position) */}
            <div className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center pointer-events-none">
              <Link
                href="/"
                onClick={handleLinkClick}
                className="relative block pointer-events-auto transition-transform duration-300 hover:scale-105 h-9 sm:h-11 md:h-12 lg:h-[58px] w-28 sm:w-36 md:w-44 lg:w-[180px]"
              >
                <Image
                  src="/images/logo-xon.png"
                  alt="X-ON Nails"
                  fill
                  priority
                  unoptimized
                  sizes="(max-width: 768px) 150px, 200px"
                  className="object-contain"
                />
              </Link>
            </div>

            {/* Right: Action Icons */}
            {renderActions(true)}
          </div>
        </div>

        {/* Desktop Centered Navigation Bar (Centered below logo on pure white) */}
        <nav className="hidden lg:block bg-white relative">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
            <div className="flex items-center justify-center h-10 lg:h-11">
              {renderNavLinks()}
            </div>
          </div>
        </nav>
      </header>

      {/* Search Bar Dropdown */}
      {searchOpen && (
        <div className="fixed top-14 lg:top-20 left-0 right-0 z-50 py-4 border-b border-gray-100 bg-white/95 backdrop-blur-md shadow-lg transition-all animate-in fade-in duration-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (searchQuery.trim()) {
                window.location.href = `/shop?q=${encodeURIComponent(
                  searchQuery.trim()
                )}`;
              }
            }}
            className="relative max-w-xl mx-auto px-4"
          >
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-md focus:outline-hidden focus:border-black shadow-inner"
              autoFocus
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-7.5 top-3.5" />
          </form>
        </div>
      )}

      {/* Off-Canvas Sidebar / Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50">
          {/* Subtle backdrop overlay */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-[1px] transition-opacity animate-in fade-in duration-200"
            onClick={() => setMobileOpen(false)}
          />

          {/* Drawer container */}
          <div className="fixed inset-y-0 left-0 w-64 sm:w-72 bg-white shadow-2xl z-50 flex flex-col transform transition-transform animate-in slide-in-from-left duration-300 overflow-y-auto no-scrollbar">
            {/* Top Bar with faint hamburger icon */}
            <div className="pt-6 pb-2 px-6">
              <button
                onClick={() => setMobileOpen(false)}
                className="text-neutral-300 hover:text-neutral-700 transition-colors cursor-pointer"
                aria-label="Close menu"
              >
                <Menu className="w-5 h-5 stroke-[1.5]" />
              </button>
            </div>

            {/* Menu Links List */}
            <nav className="flex-1 divide-y divide-neutral-100">
              {/* HOME */}
              <Link
                href="/"
                onClick={handleDrawerLinkClick}
                className={`block py-3.5 px-6 text-[13px] font-bold uppercase tracking-wider transition-colors ${
                  pathname === "/"
                    ? "bg-[#ececec] text-neutral-900"
                    : "text-neutral-600 hover:text-black hover:bg-neutral-50"
                }`}
              >
                HOME
              </Link>

              {/* SHOP */}
              <div>
                <div
                  className={`flex items-center justify-between py-3.5 px-6 text-[13px] font-bold uppercase tracking-wider cursor-pointer transition-colors ${
                    pathname.startsWith("/shop")
                      ? "bg-[#ececec] text-neutral-900"
                      : "text-neutral-600 hover:text-black hover:bg-neutral-50"
                  }`}
                  onClick={() => setShopExpanded(!shopExpanded)}
                >
                  <Link
                    href="/shop"
                    onClick={(e) => {
                      e.preventDefault();
                      setMobileOpen(false);
                      window.location.href = "/shop";
                    }}
                    className="flex-1"
                  >
                    SHOP
                  </Link>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShopExpanded(!shopExpanded);
                    }}
                    className="p-1 -mr-1 text-neutral-500 hover:text-black cursor-pointer"
                    aria-label="Toggle shop sub-menu"
                  >
                    <ChevronDown
                      className={`w-4 h-4 transition-transform duration-200 stroke-[2] ${
                        shopExpanded ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                </div>

                {/* Submenu if expanded */}
                {shopExpanded && (
                  <div className="bg-neutral-50/80 border-t border-neutral-100 divide-y divide-neutral-100/60 text-xs font-semibold text-neutral-600">
                    <Link
                      href="/shop"
                      onClick={handleDrawerLinkClick}
                      className="block py-2.5 pl-9 pr-6 hover:text-black hover:bg-neutral-100 transition-colors"
                    >
                      All Products
                    </Link>
                    <Link
                      href="/shop?theme=3D"
                      onClick={handleDrawerLinkClick}
                      className="block py-2.5 pl-9 pr-6 hover:text-black hover:bg-neutral-100 transition-colors"
                    >
                      3D Design Theme
                    </Link>
                    <Link
                      href="/shop?theme=Flower"
                      onClick={handleDrawerLinkClick}
                      className="block py-2.5 pl-9 pr-6 hover:text-black hover:bg-neutral-100 transition-colors"
                    >
                      Flower Design Theme
                    </Link>
                    <Link
                      href="/shop?theme=Y2K"
                      onClick={handleDrawerLinkClick}
                      className="block py-2.5 pl-9 pr-6 hover:text-black hover:bg-neutral-100 transition-colors"
                    >
                      Y2K Design Theme
                    </Link>
                    <Link
                      href="/gallery-product"
                      onClick={handleDrawerLinkClick}
                      className="block py-2.5 pl-9 pr-6 hover:text-black hover:bg-neutral-100 transition-colors"
                    >
                      Product Gallery
                    </Link>
                    <Link
                      href="/shop?shape=Almond"
                      onClick={handleDrawerLinkClick}
                      className="block py-2.5 pl-9 pr-6 hover:text-black hover:bg-neutral-100 transition-colors"
                    >
                      Almond Shape
                    </Link>
                    <Link
                      href="/shop?shape=Coffin"
                      onClick={handleDrawerLinkClick}
                      className="block py-2.5 pl-9 pr-6 hover:text-black hover:bg-neutral-100 transition-colors"
                    >
                      Coffin Shape
                    </Link>
                  </div>
                )}
              </div>

              {/* ABOUT / OUR STORY */}
              <Link
                href="/about"
                onClick={handleDrawerLinkClick}
                className={`block py-3.5 px-6 text-[13px] font-bold uppercase tracking-wider transition-colors ${
                  pathname === "/about"
                    ? "bg-[#ececec] text-neutral-900"
                    : "text-neutral-600 hover:text-black hover:bg-neutral-50"
                }`}
              >
                OUR STORY
              </Link>

              {/* FIT GUIDE */}
              <Link
                href="/sizing-chart"
                onClick={handleDrawerLinkClick}
                className={`block py-3.5 px-6 text-[13px] font-bold uppercase tracking-wider transition-colors ${
                  pathname === "/sizing-chart"
                    ? "bg-[#ececec] text-neutral-900"
                    : "text-neutral-600 hover:text-black hover:bg-neutral-50"
                }`}
              >
                FIT GUIDE
              </Link>

              {/* WHOLESALE */}
              <Link
                href="/wholesale-signup"
                onClick={handleDrawerLinkClick}
                className={`block py-3.5 px-6 text-[13px] font-bold uppercase tracking-wider transition-colors ${
                  pathname === "/wholesale-signup"
                    ? "bg-[#ececec] text-neutral-900"
                    : "text-neutral-600 hover:text-black hover:bg-neutral-50"
                }`}
              >
                WHOLESALE
              </Link>

              {/* BUNDLE AND SAVE */}
              <Link
                href="/bundle-and-save"
                onClick={handleDrawerLinkClick}
                className={`block py-3.5 px-6 text-[13px] font-bold uppercase tracking-wider transition-colors ${
                  pathname === "/bundle-and-save"
                    ? "bg-[#ececec] text-neutral-900"
                    : "text-neutral-600 hover:text-black hover:bg-neutral-50"
                }`}
              >
                BUNDLE AND SAVE
              </Link>

              {/* JOURNAL / BLOG */}
              <Link
                href="/blog"
                onClick={handleDrawerLinkClick}
                className={`block py-3.5 px-6 text-[13px] font-bold uppercase tracking-wider transition-colors ${
                  pathname.startsWith("/blog")
                    ? "bg-[#ececec] text-neutral-900"
                    : "text-neutral-600 hover:text-black hover:bg-neutral-50"
                }`}
              >
                JOURNAL
              </Link>

              {/* CONTACT */}
              <Link
                href="/contact-us"
                onClick={handleDrawerLinkClick}
                className={`block py-3.5 px-6 text-[13px] font-bold uppercase tracking-wider transition-colors ${
                  pathname === "/contact-us"
                    ? "bg-[#ececec] text-neutral-900"
                    : "text-neutral-600 hover:text-black hover:bg-neutral-50"
                }`}
              >
                CONTACT
              </Link>

              {/* LOGIN */}
              <Link
                href="/admin/login"
                onClick={handleDrawerLinkClick}
                className="block py-3.5 px-6 text-[13px] font-bold uppercase tracking-wider text-neutral-600 hover:text-black hover:bg-neutral-50 transition-colors"
              >
                LOGIN
              </Link>

              {/* WISHLIST HEART ICON */}
              <div className="py-3.5 px-6">
                <Link
                  href="/shop"
                  onClick={handleDrawerLinkClick}
                  className="inline-block text-neutral-400 hover:text-rose-600 transition-colors"
                  aria-label="Wishlist"
                >
                  <Heart className="w-4 h-4 fill-neutral-400 stroke-neutral-400" />
                </Link>
              </div>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
