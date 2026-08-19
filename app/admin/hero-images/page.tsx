'use client';

import { useEffect, useState } from 'react';
import { getHeroImages } from '@/lib/images';

type ImageSlot = {
  label: string;
  title: string;
  fallback: string;
};

const DESKTOP_SLOTS: ImageSlot[] = [
  { label: 'hero-carousel', title: 'Hero Banner (top of page)', fallback: '/images/Barnes_Bowling_Club_Sep_1_SV_2.JPG' },
  { label: 'whats-happening-1', title: "What's Happening - Card 1", fallback: '/images/gallery1.JPG' },
  { label: 'whats-happening-2', title: "What's Happening - Card 2", fallback: '/images/gallery5.JPG' },
  { label: 'whats-happening-3', title: "What's Happening - Card 3", fallback: '/images/gallery2.JPG' },
  { label: 'featured-banner', title: 'Featured Banner', fallback: '/images/gallery4.JPG' },
  { label: 'activity-1', title: 'Activity Card 1', fallback: '/images/IMG_9105.JPG' },
  { label: 'activity-2', title: 'Activity Card 2', fallback: '/images/gallery6.JPG' },
  { label: 'activity-3', title: 'Activity Card 3', fallback: '/images/gallery7.JPG' },
];

const PHONE_SLOTS: ImageSlot[] = [
  { label: 'club-app-hero', title: 'Phone App - Main Hero', fallback: '/images/gallery2.JPG' },
  { label: 'club-app-card-1', title: 'Phone App - Card 1', fallback: '/images/gallery1.JPG' },
  { label: 'club-app-card-2', title: 'Phone App - Card 2', fallback: '/images/gallery5.JPG' },
  { label: 'club-app-card-3', title: 'Phone App - Card 3', fallback: '/images/gallery2.JPG' },
];

export default function AdminHeroImagesPage() {
  const [uploading, setUploading] = useState<string | null>(null);
  const [uploaded, setUploaded] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [justUpdated, setJustUpdated] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getHeroImages()
      .then(images => {
        if (active) setUploaded(images);
      })
      .catch(() => {
        // Fallback thumbnails remain visible if the saved images cannot be loaded.
      });

    return () => {
      active = false;
    };
  }, []);

  async function handleUpload(label: string, file: File) {
    setUploading(label);
    setJustUpdated(null);
    setErrors(prev => ({ ...prev, [label]: '' }));

    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('context', 'hero');
      fd.append('alt_text', label);

      const res = await fetch('/api/admin/gallery-upload', {
        method: 'POST',
        body: fd,
      });

      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(body.error ?? `Upload failed (${res.status})`);
      }

      if (!body.public_url) {
        throw new Error('Upload completed but no image URL was returned.');
      }

      setUploaded(prev => ({ ...prev, [label]: body.public_url }));
      setJustUpdated(label);
    } catch (err) {
      setErrors(prev => ({
        ...prev,
        [label]: err instanceof Error ? err.message : String(err),
      }));
    } finally {
      setUploading(null);
    }
  }

  function renderSlot(slot: ImageSlot) {
    const isUploading = uploading === slot.label;
    const imageUrl = uploaded[slot.label] || slot.fallback;

    return (
      <div
        key={slot.label}
        style={{
          display: 'flex',
          gap: '1.5rem',
          alignItems: 'center',
          padding: '1.25rem',
          border: '1px solid rgba(45,90,61,.15)',
          background: 'white',
          flexWrap: 'wrap',
        }}
      >
        <div
          style={{
            width: '140px',
            height: '90px',
            flexShrink: 0,
            backgroundImage: `url('${imageUrl}')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            border: '1px solid rgba(45,90,61,.12)',
          }}
        />

        <div style={{ flex: '1 1 280px' }}>
          <div
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: '15px',
              color: 'var(--green-deep)',
              marginBottom: '0.5rem',
            }}
          >
            {slot.title}
          </div>

          <input
            type="file"
            accept="image/*"
            disabled={isUploading}
            onChange={async e => {
              const input = e.currentTarget;
              const file = input.files?.[0];
              if (file) await handleUpload(slot.label, file);
              input.value = '';
            }}
            style={{
              display: 'block',
              maxWidth: '100%',
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '13px',
              color: 'var(--green-deep)',
            }}
          />

          <div style={{ marginTop: '0.5rem', minHeight: '18px' }}>
            {isUploading && (
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Uploading…</span>
            )}
            {!isUploading && justUpdated === slot.label && (
              <span style={{ fontSize: '12px', color: '#15803d', fontWeight: 600 }}>Uploaded ✓</span>
            )}
            {!isUploading && justUpdated !== slot.label && uploaded[slot.label] && !errors[slot.label] && (
              <span style={{ fontSize: '12px', color: '#15803d' }}>Current image</span>
            )}
            {errors[slot.label] && (
              <span style={{ fontSize: '12px', color: '#b91c1c' }}>Upload failed: {errors[slot.label]}</span>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <a href="/admin" style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '13px', color: 'var(--green-mid)', textDecoration: 'none' }}>
          ← Back to Admin
        </a>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '28px', color: 'var(--green-deep)', margin: '0.5rem 0 0.25rem' }}>
          Website & Phone App Images
        </h1>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '14px', color: 'var(--text-muted)', margin: 0 }}>
          Phone app and desktop website images are controlled separately. Choose a file and it will upload automatically.
        </p>
      </div>

      <section id="phone-app-images" style={{ padding: '1.5rem', background: 'rgba(201,168,76,.08)', border: '1px solid rgba(201,168,76,.3)' }}>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '24px', color: 'var(--green-deep)', margin: '0 0 0.5rem' }}>
          Phone App Images
        </h2>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '13px', color: 'var(--text-muted)', margin: '0 0 1rem' }}>
          These four images are used only on the members phone app. Changing them will not change the desktop website.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {PHONE_SLOTS.map(renderSlot)}
        </div>
      </section>

      <section style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid rgba(45,90,61,.18)' }}>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '22px', color: 'var(--green-deep)', margin: '0 0 0.5rem' }}>
          Desktop Website Images
        </h2>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '13px', color: 'var(--text-muted)', margin: '0 0 1rem' }}>
          These images are used on the main desktop website.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {DESKTOP_SLOTS.map(renderSlot)}
        </div>
      </section>
    </div>
  );
}
