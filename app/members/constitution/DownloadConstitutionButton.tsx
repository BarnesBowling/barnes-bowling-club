'use client';

import { useState } from 'react';
import { SECTIONS, GROUND_RULES_DOC, type Block } from './constitutionData';

const BBC_GREEN: [number, number, number] = [45, 90, 61];
const DARK:      [number, number, number] = [40, 40, 40];
const MUTED:     [number, number, number] = [120, 120, 120];
const GOLD:      [number, number, number] = [180, 145, 65];

export function DownloadConstitutionButton() {
  const [busy, setBusy] = useState(false);

  async function handleDownload() {
    setBusy(true);
    try {
      const { jsPDF } = await import('jspdf');

      const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });

      const PAGE_W = 210;
      const PAGE_H = 297;
      const ML = 20;   // left margin
      const MR = 20;   // right margin
      const MT = 22;   // top margin
      const MB = 22;   // bottom margin (page numbers sit in last 12mm)
      const W  = PAGE_W - ML - MR; // 170mm content width

      let y = MT;
      let currentPage = 1;

      function newPage() {
        doc.addPage();
        currentPage++;
        y = MT;
      }

      function checkBreak(needed: number) {
        if (y + needed > PAGE_H - MB) newPage();
      }

      // 1pt = 0.3528mm; line height = fontSize * 0.3528 * lineSpacingFactor
      const BODY_LH   = 11 * 0.3528 * 1.55; // ~6.02mm
      const SMALL_LH  = 10 * 0.3528 * 1.4;  // ~4.94mm

      function setColor(rgb: [number, number, number]) {
        doc.setTextColor(rgb[0], rgb[1], rgb[2]);
      }

      // Render paragraph text, wrapping and paginating automatically.
      function para(text: string, x: number, maxW: number) {
        doc.setFont('times', 'normal');
        doc.setFontSize(11);
        setColor(DARK);
        for (const line of doc.splitTextToSize(text, maxW) as string[]) {
          checkBreak(BODY_LH);
          doc.text(line, x, y);
          y += BODY_LH;
        }
        y += 1.2; // paragraph spacing
      }

      // Render bullet list item, wrapping continuation lines.
      function bullet(item: string, x: number, maxW: number) {
        doc.setFont('times', 'normal');
        doc.setFontSize(11);
        setColor(DARK);
        const lines = doc.splitTextToSize(item, maxW - 5) as string[];
        checkBreak(BODY_LH);
        doc.text('•', x + 1, y);
        doc.text(lines[0], x + 6, y);
        y += BODY_LH;
        for (let i = 1; i < lines.length; i++) {
          checkBreak(BODY_LH);
          doc.text(lines[i], x + 6, y);
          y += BODY_LH;
        }
      }

      function renderBlocks(blocks: Block[], x: number, w: number) {
        for (const block of blocks) {
          if (block.kind === 'para') {
            para(block.text, x, w);

          } else if (block.kind === 'bullets') {
            for (const item of block.items) bullet(item, x, w);
            y += 0.8;

          } else if (block.kind === 'sub') {
            if (block.title) {
              if (block.num) {
                // Named sub-section with number (e.g. "2.1 Full and Probationary Membership")
                checkBreak(14);
                y += 2;
                doc.setFont('times', 'bold');
                doc.setFontSize(12);
                setColor(BBC_GREEN);
                doc.text(`${block.num}  ${block.title}`, x, y);
                y += 6.5;
                renderBlocks(block.blocks, x + 5, w - 5);
              } else {
                // Label-only divider (no clause number, just a heading label)
                if (!block.title) return;
                checkBreak(8);
                y += 1.5;
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(9);
                setColor(MUTED);
                doc.text(block.title.toUpperCase(), x, y);
                y += 5;
                if (block.blocks.length > 0) renderBlocks(block.blocks, x, w);
              }
            } else {
              // Numbered clause without a section title (e.g. "4.1", "4.2")
              const NUM_COL = 12;
              const textX   = x + NUM_COL + 2;
              const textW   = w - NUM_COL - 2;

              // Draw the clause number at current y on the current page, then
              // render the clause body at the same baseline (indented).
              if (block.num) {
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(10);
                setColor(MUTED);
                doc.text(block.num, x + NUM_COL, y, { align: 'right' });
              }
              renderBlocks(block.blocks, textX, textW);
            }
          }
        }
      }

      // ── Title block ──────────────────────────────────────────────────────────
      doc.setFont('times', 'bold');
      doc.setFontSize(22);
      setColor(BBC_GREEN);
      doc.text('Barnes Bowling Club', ML, y);
      y += 10;

      doc.setFontSize(15);
      doc.text('Constitution', ML, y);
      y += 7;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      setColor(MUTED);
      doc.text('Adopted November 2021  ·  Updated November 2025', ML, y);
      y += 6;

      doc.setDrawColor(BBC_GREEN[0], BBC_GREEN[1], BBC_GREEN[2]);
      doc.setLineWidth(0.5);
      doc.line(ML, y, PAGE_W - MR, y);
      y += 10;

      // ── Constitution sections ─────────────────────────────────────────────
      for (const section of SECTIONS) {
        checkBreak(22);
        y += 3;

        // Section heading line
        doc.setDrawColor(GOLD[0], GOLD[1], GOLD[2]);
        doc.setLineWidth(0.3);

        doc.setFont('times', 'bold');
        doc.setFontSize(14);
        setColor(BBC_GREEN);
        const numStr = String(section.num).padStart(2, '0');
        doc.text(`${numStr}  ${section.title}`, ML, y);
        y += 8;

        renderBlocks(section.blocks, ML + 12, W - 12);
        y += 2;
      }

      // Date of adoption
      checkBreak(12);
      y += 4;
      doc.setFont('times', 'italic');
      doc.setFontSize(10);
      setColor(MUTED);
      doc.text('Revised following AGM — 27 November 2025.', ML, y);

      // ── Ground Rules (new page) ──────────────────────────────────────────
      doc.addPage();
      currentPage++;
      y = MT;

      doc.setFont('times', 'bold');
      doc.setFontSize(22);
      setColor(BBC_GREEN);
      doc.text('Playing & Ground Rules', ML, y);
      y += 7;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      setColor(MUTED);
      doc.text('Playing and Ground Rules 2025  ·  Amended at AGM November 27th 2025', ML, y);
      y += 6;

      doc.setDrawColor(BBC_GREEN[0], BBC_GREEN[1], BBC_GREEN[2]);
      doc.setLineWidth(0.5);
      doc.line(ML, y, PAGE_W - MR, y);
      y += 10;

      const NUM_COL = 12;
      const ruleTextX = ML + NUM_COL + 2;
      const ruleTextW = W  - NUM_COL - 2;

      for (const ruleSection of GROUND_RULES_DOC) {
        checkBreak(18);
        y += 4;

        doc.setFont('times', 'bold');
        doc.setFontSize(13);
        setColor(BBC_GREEN);
        doc.text(ruleSection.heading, ML, y);
        y += 2.5;

        doc.setDrawColor(GOLD[0], GOLD[1], GOLD[2]);
        doc.setLineWidth(0.3);
        doc.line(ML, y, PAGE_W - MR, y);
        y += 6;

        for (const item of ruleSection.items) {
          // Render item number at current y (same baseline as first text line)
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(10);
          setColor(MUTED);
          doc.text(`${item.num}.`, ML + NUM_COL, y, { align: 'right' });

          renderBlocks(item.blocks, ruleTextX, ruleTextW);
          y += 0.5;
        }

        y += 3;
      }

      // ── Page numbers ─────────────────────────────────────────────────────
      const total = doc.getNumberOfPages();
      for (let p = 1; p <= total; p++) {
        doc.setPage(p);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        setColor(MUTED);
        doc.text(
          `Barnes Bowling Club  ·  Constitution 2025  ·  Page ${p} of ${total}`,
          PAGE_W / 2,
          PAGE_H - 10,
          { align: 'center' },
        );
      }

      doc.save('BBC-Constitution-2025.pdf');
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      onClick={handleDownload}
      disabled={busy}
      style={{
        background: 'none',
        border: 'none',
        padding: 0,
        fontFamily: "'DM Sans', sans-serif",
        fontSize: '12px',
        color: 'var(--green-mid)',
        cursor: busy ? 'wait' : 'pointer',
        letterSpacing: '.05em',
        opacity: busy ? 0.55 : 1,
      }}
    >
      {busy ? 'Generating PDF…' : 'Download Constitution PDF ↓'}
    </button>
  );
}
