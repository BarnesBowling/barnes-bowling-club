'use client';

import { useState } from 'react';
import { uploadImage } from '@/lib/images';

const SLOTS = [
  { label: 'hero-carousel', title: 'Hero Banner (top of page)', fallback: '/images/Barnes_Bowling_Club_Sep_1_SV_2.JPG' },
  { label: 'whats-happening-1', title: "What's Happening - Card 1", fallback: '/images/gallery1.JPG' },
  { label: 'whats-happening-2', title: "What's Happening - Card 2", fallback: '/images/gallery5.JPG' },
  { label: 'whats-happening-3', title: "What's Happening - Card 3", fallback: '/images/gallery2.JPG' },
  { label: 'featured-banner', title: 'Featured Banner', fallback: '/images/gallery4.JPG' },
  { label: 'activity-1', title: 'Activity Card 1', fallback: '/images/IMG_9105.JPG' },
  { label: 'activity-2', title: 'Activity Card 2', fallback: '/images/gallery6.JPG' },
  { label: 'activity-3', title: 'Activity Card 3', fallback: '/images/gallery7.JPG' },
];

export default function AdminHeroImagesPage() {
  const [uploading, setUploading] = useState(null);
  const [uploaded, setUploaded] = useState({});

  async function handleUpload(label, file) {
    setUploading(label);
    try {
      const img = await uploadImage(file, 'hero', undefined, label);
      setUploaded(prev => ({ ...prev, [label]: img.public_url }));
    } finally {
      setUploading(null);
    }
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <a href="/admin" style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '13px', color: 'var(--green-mid)', textDecoration: 'none' }}>
          Back to Admin
        </a>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '28px', color: 'var(--green-deep)', margin: '0.5rem 0 0.25rem' }}>
          Home Page Images
        </h1>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '14px', color: 'var(--text-muted)', margin: 0 }}>
          Upload a new image for each slot to replace it on the home page.
        </p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {SLOTS.map(slot => (
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
                <span style={{ marginLeft: '0.75rem', fontSize: '12px', color: 'green' }}>Updated</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
