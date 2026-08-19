'use client';

import { useEffect, useState } from 'react';
import { getHeroImages, uploadImage } from '@/lib/images';

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

  useEffect(() => {
    let active = true;
    getHeroImages()
      .then(images => {
        if (active) setUploaded(images);
      })
      .catch(() => {
        // Fallback thumbnails remain visible if the existing images cannot be loaded.
      });

    return () => {
      active = false;
    };
  }, []);

  async function handleUpload(label: string, file: File) {
    setUploading(label);
    try {
      const img = await uploadImage(file, 'hero', undefined, label);
      setUploaded(prev => ({ ...prev, [label]: img.public_url }));
    } finally {
      setUploading(null);
    }
  }

  function renderSlot(slot: ImageSlot) {
    return (
      <div key={slot.label} style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', padding: '1.25rem', border: '1px solid rgba(45,90,61,.15)', background: 'white' }}>
        <div style={{ width: '140px', height: '90px', flexShrink: 0, backgroundImage: 'url(' + (uploaded[slot.label] || slot.fallback) + ')', backgroundSize: 'cover', backgroundPosition: 'center' }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '15px', color: 'var(--green-deep)', marginBottom: '0.25rem' }}>
            {slot.title}
          </div>
          <label style={{ display: 'inline-block', padding: '0.45rem 1rem', background: uploading === slot.label ? 'rgba(45,90,61,.4)' : 'var(--green-deep)', color: 'white', fontFamily: "'DM Sans', sans-serif", fontSize: '13px', cursor: 'pointer' }}>
            {uploading === slot.label ? 'Uploading...' : uploaded[slot.label] ? 'Replace Image' : 'Upload Image'}
            <input type="file" accept="image/*" style={{ display: 'none' }}
              onChange={e => { const file = e.target.files && e.target.files[0]; if (file) handleUpload(slot.label, file); }} />
          </label>
          {uploaded[slot.label] && (
            <span style={{ marginLeft: '0.75rem', fontSize: '12px', color: 'green' }}>Current image</span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <a href="/admin" style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '13px', color: 'var(--green-mid)', textDecoration: 'none' }}>
          Back to Admin
        </a>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '28px', color: 'var(--green-deep)', margin: '0.5rem 0 0.25rem' }}>
          Website & Phone App Images
        </h1>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '14px', color: 'var(--text-muted)', margin: 0 }}>
          Phone app and desktop website images are controlled separately.
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
