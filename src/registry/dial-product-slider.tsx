"use client";

/**
 * Dial Product Slider - a product reel driven by a single round controller.
 * The arrows step the reel, which keeps a fixed buffer of items either side of
 * center and recycles the far ones, so the catalogue loops without cloning.
 * Pressing the middle of the dial turns it inside out: the outer ring closes to
 * a point, the inner disc opens into a close button, the flanking products fan
 * further out and fade, the background fills with the product shot, and a
 * detail card slides up into the middle.
 *
 * Self-contained: it fills its own box, no page scroll required.
 *
 * BLANK - aryank.space
 */

import gsap from "gsap";
import { useEffect, useRef } from "react";

const ASSET_BASE = "https://ui.aryank.space/assets/dial-product-slider";

export interface DialProduct {
  name: string;
  img: string;
  price: number;
  tag: string;
  url: string;
}

export interface DialProductSliderProps {
  brand?: string;
  products?: DialProduct[];
  menuLabel?: string;
  detailLabel?: string;
}

const DEFAULT_PRODUCTS: DialProduct[] = [
  {
    name: "Obsidian Puffer",
    img: `${ASSET_BASE}/product-1.png`,
    price: 240,
    tag: "Outerwear",
    url: "https://store.example.com/obsidian-puffer",
  },
  {
    name: "Slate Joggers",
    img: `${ASSET_BASE}/product-2.png`,
    price: 160,
    tag: "Essentials",
    url: "https://store.example.com/slate-joggers",
  },
  {
    name: "Noir Shirt",
    img: `${ASSET_BASE}/product-3.png`,
    price: 190,
    tag: "Classic",
    url: "https://store.example.com/noir-shirt",
  },
  {
    name: "Ash Knit",
    img: `${ASSET_BASE}/product-4.png`,
    price: 220,
    tag: "Core Piece",
    url: "https://store.example.com/ash-knit",
  },
  {
    name: "Form Jacket",
    img: `${ASSET_BASE}/product-5.png`,
    price: 280,
    tag: "Minimal",
    url: "https://store.example.com/form-jacket",
  },
  {
    name: "Carbon Trousers",
    img: `${ASSET_BASE}/product-6.png`,
    price: 210,
    tag: "Tailored",
    url: "https://store.example.com/carbon-trousers",
  },
  {
    name: "Edge Vest",
    img: `${ASSET_BASE}/product-7.png`,
    price: 150,
    tag: "Layer",
    url: "https://store.example.com/edge-vest",
  },
  {
    name: "Grain Tee",
    img: `${ASSET_BASE}/product-8.png`,
    price: 130,
    tag: "Everyday",
    url: "https://store.example.com/grain-tee",
  },
  {
    name: "Stone Cap",
    img: `${ASSET_BASE}/product-9.png`,
    price: 95,
    tag: "Accessory",
    url: "https://store.example.com/stone-cap",
  },
  {
    name: "Void Coat",
    img: `${ASSET_BASE}/product-10.png`,
    price: 310,
    tag: "Statement",
    url: "https://store.example.com/void-coat",
  },
];

const BUFFER_SIZE = 5;
const SPACING = 0.375;
const SLIDE_WIDTH = SPACING * 1000;

export default function DialProductSlider({
  brand = "BLANK / Exp 0493",
  products = DEFAULT_PRODUCTS,
  menuLabel = "Menu",
  detailLabel = "View Details",
}: DialProductSliderProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (!products.length) return;

    const productsContainer = root.querySelector<HTMLElement>(".dam-products");
    const productName = root.querySelector<HTMLElement>(".dam-product-name p");
    const productPreview = root.querySelector<HTMLElement>(
      ".dam-product-preview",
    );
    const previewName = root.querySelector<HTMLElement>(
      ".dam-product-preview-name p",
    );
    const previewImg = root.querySelector<HTMLImageElement>(
      ".dam-product-preview-img img",
    );
    const previewTag = root.querySelector<HTMLElement>(
      ".dam-product-preview-tag p",
    );
    const previewUrl = root.querySelector<HTMLAnchorElement>(
      ".dam-product-url .dam-btn a",
    );
    const productBanner = root.querySelector<HTMLElement>(
      ".dam-product-banner",
    );
    const bannerImg = root.querySelector<HTMLImageElement>(
      ".dam-product-banner img",
    );
    const controllerInner = root.querySelector<HTMLElement>(
      ".dam-controller-inner",
    );
    const controllerOuter = root.querySelector<HTMLElement>(
      ".dam-controller-outer",
    );
    const prevBtn = root.querySelector<HTMLElement>(".dam-nav-btn.dam-prev");
    const nextBtn = root.querySelector<HTMLElement>(".dam-nav-btn.dam-next");
    if (
      !productsContainer ||
      !productName ||
      !productPreview ||
      !previewName ||
      !previewImg ||
      !previewTag ||
      !previewUrl ||
      !productBanner ||
      !bannerImg ||
      !controllerInner ||
      !controllerOuter ||
      !prevBtn ||
      !nextBtn
    ) {
      return;
    }

    const closeIconSpans = gsap.utils.toArray<HTMLElement>(
      root.querySelectorAll(".dam-close-icon span"),
    );
    const navEls = gsap.utils.toArray<HTMLElement>(
      root.querySelectorAll(".dam-controller-label p, .dam-nav-btn"),
    );

    let currentProductIndex = 0;
    let slideItems: { element: HTMLElement; relativeIndex: number }[] = [];
    let isPreviewAnimating = false;
    let isPreviewOpen = false;
    let previewTimer = 0;

    const addSlideItem = (relativeIndex: number) => {
      const productIndex =
        (((currentProductIndex + relativeIndex) % products.length) +
          products.length) %
        products.length;
      const product = products[productIndex];

      const li = document.createElement("li");
      const img = document.createElement("img");
      img.src = product.img;
      img.alt = product.name;
      li.appendChild(img);
      li.dataset.relativeIndex = `${relativeIndex}`;

      gsap.set(li, {
        x: relativeIndex * SLIDE_WIDTH,
        scale: relativeIndex === 0 ? 1.25 : 0.75,
        zIndex: relativeIndex === 0 ? 100 : 1,
      });

      productsContainer.appendChild(li);
      slideItems.push({ element: li, relativeIndex });
    };

    const removeSlideItem = (relativeIndex: number) => {
      const itemIndex = slideItems.findIndex(
        (item) => item.relativeIndex === relativeIndex,
      );
      if (itemIndex !== -1) {
        slideItems[itemIndex].element.remove();
        slideItems.splice(itemIndex, 1);
      }
    };

    const updateSliderPosition = () => {
      for (const item of slideItems) {
        const isActive = item.relativeIndex === 0;
        gsap.to(item.element, {
          x: item.relativeIndex * SLIDE_WIDTH,
          scale: isActive ? 1.25 : 0.75,
          zIndex: isActive ? 100 : 1,
          duration: 0.75,
          ease: "power3.out",
        });
      }
    };

    const activeProduct = () => {
      const actualIndex =
        ((currentProductIndex % products.length) + products.length) %
        products.length;
      return products[actualIndex];
    };

    const updateProductName = () => {
      productName.textContent = activeProduct().name;
    };

    const updatePreviewContent = () => {
      const currentProduct = activeProduct();
      previewName.textContent = currentProduct.name;
      previewImg.src = currentProduct.img;
      previewImg.alt = currentProduct.name;
      previewTag.textContent = currentProduct.tag;
      previewUrl.href = currentProduct.url;
      bannerImg.src = currentProduct.img;
      bannerImg.alt = currentProduct.name;
    };

    const moveNext = () => {
      if (isPreviewAnimating || isPreviewOpen) return;

      currentProductIndex++;
      removeSlideItem(-BUFFER_SIZE);
      for (const item of slideItems) {
        item.relativeIndex--;
        item.element.dataset.relativeIndex = `${item.relativeIndex}`;
      }
      addSlideItem(BUFFER_SIZE);
      updateSliderPosition();
      updateProductName();
      updatePreviewContent();
    };

    const movePrev = () => {
      if (isPreviewAnimating || isPreviewOpen) return;

      currentProductIndex--;
      removeSlideItem(BUFFER_SIZE);
      for (const item of slideItems) {
        item.relativeIndex++;
        item.element.dataset.relativeIndex = `${item.relativeIndex}`;
      }
      addSlideItem(-BUFFER_SIZE);
      updateSliderPosition();
      updateProductName();
      updatePreviewContent();
    };

    const updateButtonStates = () => {
      if (isPreviewAnimating || isPreviewOpen) {
        prevBtn.classList.add("dam-disabled");
        nextBtn.classList.add("dam-disabled");
      } else {
        prevBtn.classList.remove("dam-disabled");
        nextBtn.classList.remove("dam-disabled");
      }
    };

    const animateSideItems = (hide = false) => {
      const activeSlide = slideItems.find((item) => item.relativeIndex === 0);

      for (const item of slideItems) {
        const absIndex = Math.abs(item.relativeIndex);
        if (absIndex === 1 || absIndex === 2) {
          gsap.to(item.element, {
            x: hide
              ? item.relativeIndex * SLIDE_WIDTH * 1.5
              : item.relativeIndex * SLIDE_WIDTH,
            opacity: hide ? 0 : 1,
            duration: 0.75,
            ease: "power3.inOut",
          });
        }
      }

      if (activeSlide) {
        gsap.to(activeSlide.element, {
          scale: hide ? 0.75 : 1.25,
          opacity: hide ? 0 : 1,
          duration: 0.75,
          ease: "power3.inOut",
        });
      }
    };

    const animateControllerTransition = (opening = false) => {
      gsap.to(navEls, {
        opacity: opening ? 0 : 1,
        duration: 0.2,
        ease: "power3.out",
        delay: opening ? 0 : 0.4,
      });

      gsap.to(controllerOuter, {
        clipPath: opening ? "circle(0% at 50% 50%)" : "circle(50% at 50% 50%)",
        duration: 0.75,
        ease: "power3.inOut",
      });

      gsap.to(controllerInner, {
        clipPath: opening ? "circle(50% at 50% 50%)" : "circle(40% at 50% 50%)",
        duration: 0.75,
        ease: "power3.inOut",
      });

      gsap.to(closeIconSpans, {
        width: opening ? "20px" : "0px",
        duration: opening ? 0.4 : 0.3,
        ease: opening ? "power3.out" : "power3.in",
        stagger: opening ? 0.1 : 0.05,
        delay: opening ? 0.2 : 0,
      });
    };

    const togglePreview = () => {
      if (isPreviewAnimating) return;

      isPreviewAnimating = true;
      updateButtonStates();

      if (!isPreviewOpen) updatePreviewContent();

      gsap.to(productPreview, {
        y: isPreviewOpen ? "100%" : "-50%",
        duration: 0.75,
        ease: "power3.inOut",
      });
      gsap.to(productBanner, {
        opacity: isPreviewOpen ? 0 : 1,
        duration: 0.4,
        delay: isPreviewOpen ? 0 : 0.25,
        ease: "power3.inOut",
      });

      animateSideItems(!isPreviewOpen);
      animateControllerTransition(!isPreviewOpen);

      previewTimer = window.setTimeout(() => {
        isPreviewAnimating = false;
        isPreviewOpen = !isPreviewOpen;
        updateButtonStates();
      }, 600);
    };

    for (let i = -BUFFER_SIZE; i <= BUFFER_SIZE; i++) addSlideItem(i);
    updateSliderPosition();
    updateProductName();
    updatePreviewContent();
    updateButtonStates();

    prevBtn.addEventListener("click", movePrev);
    nextBtn.addEventListener("click", moveNext);
    controllerInner.addEventListener("click", togglePreview);

    return () => {
      clearTimeout(previewTimer);
      prevBtn.removeEventListener("click", movePrev);
      nextBtn.removeEventListener("click", moveNext);
      controllerInner.removeEventListener("click", togglePreview);
      for (const item of slideItems) item.element.remove();
      slideItems = [];
    };
  }, [products]);

  return (
    <div className="dam-root" ref={rootRef}>
      <style>{styles}</style>
      <div className="dam-container">
        <div className="dam-nav">
          <div className="dam-logo">
            <p>{brand}</p>
          </div>
          <div className="dam-product-name">
            <p>{products[0]?.name}</p>
          </div>
        </div>

        <div className="dam-gallery">
          <ul className="dam-products" />

          <div className="dam-controller">
            <div className="dam-controller-inner">
              <div className="dam-close-icon">
                <span />
                <span />
              </div>
            </div>

            <div className="dam-controller-outer">
              <div className="dam-controller-label">
                <p>{menuLabel}</p>
              </div>

              <div className="dam-nav-btn dam-prev">
                <svg viewBox="0 0 512 512" fill="currentColor" aria-hidden>
                  <path d="M448 71.9v368.2c0 12.4-15.2 18.9-24.7 10.6L207.2 261.1c-6.9-6-6.9-16.8 0-22.8L423.3 61.3C432.8 53 448 59.5 448 71.9zM240.7 71.9v368.2c0 12.4-15.2 18.9-24.7 10.6L0 261.1c-6.9-6-6.9-16.8 0-22.8L216 61.3c9.5-8.3 24.7-1.8 24.7 10.6z" />
                </svg>
              </div>
              <div className="dam-nav-btn dam-next">
                <svg viewBox="0 0 512 512" fill="currentColor" aria-hidden>
                  <path d="M64 440.1V71.9c0-12.4 15.2-18.9 24.7-10.6l216.1 177c6.9 6 6.9 16.8 0 22.8L88.7 450.7C79.2 459 64 452.5 64 440.1zM271.3 440.1V71.9c0-12.4 15.2-18.9 24.7-10.6l216 177c6.9 6 6.9 16.8 0 22.8L296 450.7c-9.5 8.3-24.7 1.8-24.7-10.6z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="dam-product-banner">
          <img src={products[0]?.img} alt="" />
        </div>

        <div className="dam-product-preview">
          <div className="dam-product-preview-info">
            <div className="dam-product-preview-name">
              <p>{products[0]?.name}</p>
            </div>
            <div className="dam-product-preview-tag">
              <p>{products[0]?.tag}</p>
            </div>
          </div>

          <div className="dam-product-preview-img">
            <img src={products[0]?.img} alt="" />
          </div>

          <div className="dam-product-url">
            <div className="dam-btn">
              <a href={products[0]?.url}>{detailLabel}</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = `
@import url("https://fonts.googleapis.com/css2?family=DM+Mono:ital,wght@0,300;0,400;0,500;1,300;1,400;1,500&family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&display=swap");

.dam-root {
  --base-100: #fff;
  --base-200: #999;
  --base-300: #343434;
  --base-400: #212121;
  --base-500: #000;
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  font-family: "DM Sans", sans-serif;
  background: var(--base-100);
  container-type: inline-size;
}
.dam-root * { margin: 0; padding: 0; box-sizing: border-box; }
.dam-root p { font-size: 0.85rem; font-weight: 500; line-height: 1; }
.dam-container {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}
.dam-nav {
  position: absolute;
  top: 0;
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 2rem;
  z-index: 2;
}
.dam-nav p {
  text-transform: uppercase;
  font-family: "DM Mono", monospace;
}
.dam-product-name { color: var(--base-200); }
.dam-gallery {
  position: absolute;
  width: 100%;
  height: 100%;
  overflow: hidden;
}
.dam-products {
  position: absolute;
  width: 300px;
  height: 300px;
  top: 45%;
  left: 50%;
  transform: translate(-50%, -50%);
  list-style: none;
}
.dam-products li {
  position: absolute;
  width: 300px;
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  will-change: transform;
}
.dam-products li img { width: 250px; height: 250px; }
.dam-controller {
  position: absolute;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  width: 11rem;
  height: 11rem;
  user-select: none;
  cursor: pointer;
  z-index: 10;
}
.dam-controller-inner {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 5rem;
  height: 5rem;
  background: var(--base-300);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  clip-path: circle(40% at 50% 50%);
  will-change: clip-path;
  cursor: pointer;
  z-index: 1;
}
.dam-close-icon { position: relative; width: 20px; height: 20px; }
.dam-close-icon span {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 2px;
  background: var(--base-100);
  transform-origin: center;
}
.dam-close-icon span:first-child {
  transform: translate(-50%, -50%) rotate(45deg);
}
.dam-close-icon span:last-child {
  transform: translate(-50%, -50%) rotate(-45deg);
}
.dam-controller-outer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: var(--base-400);
  border-radius: 50%;
  clip-path: circle(50% at 50% 50%);
  will-change: clip-path;
  z-index: 0;
}
.dam-controller-label p {
  position: absolute;
  top: 1rem;
  left: 50%;
  transform: translateX(-50%);
  text-transform: uppercase;
  font-family: "DM Mono", monospace;
  color: var(--base-100);
  will-change: opacity;
}
.dam-nav-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 1.125rem;
  height: 1.125rem;
  color: var(--base-100);
  will-change: opacity;
  cursor: pointer;
}
.dam-nav-btn svg { width: 100%; height: 100%; display: block; }
.dam-nav-btn.dam-prev { left: 1rem; }
.dam-nav-btn.dam-next { right: 1rem; }
.dam-nav-btn.dam-disabled { opacity: 0.25; pointer-events: none; }
.dam-product-banner {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  opacity: 0;
  will-change: opacity;
}
.dam-product-banner img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transform: scale(1.25);
}
.dam-product-preview {
  position: absolute;
  top: 47.5%;
  left: 50%;
  transform: translate(-50%, 100%);
  width: 30%;
  height: 75%;
  padding: 2rem 1rem;
  border-radius: 0.5rem;
  background-color: rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(20px);
  display: flex;
  flex-direction: column;
  gap: 2rem;
  z-index: 2;
}
.dam-product-preview-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.dam-product-preview-name p { font-size: 0.95rem; }
.dam-product-preview-tag {
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  background-color: var(--base-500);
  color: var(--base-100);
}
.dam-product-preview-tag p {
  text-transform: uppercase;
  font-family: "DM Mono", monospace;
  font-size: 0.75rem;
}
.dam-product-preview-img {
  width: 100%;
  aspect-ratio: 1;
  border-radius: 0.25rem;
  background-color: var(--base-100);
  overflow: hidden;
}
.dam-product-preview-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.dam-product-url .dam-btn {
  background-color: var(--base-500);
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 0.25rem;
}
.dam-product-url .dam-btn a {
  display: block;
  padding: 1rem 0;
  text-decoration: none;
  color: var(--base-100);
}

@media (max-width: 1000px) {
  .dam-product-preview { width: calc(100% - 2rem); }
}
`;
